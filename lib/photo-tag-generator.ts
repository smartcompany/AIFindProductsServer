import { z } from 'zod';

import { isRetryableGeminiError } from '@/lib/gemini-errors';

// Note: gemini-2.5-flash-lite was reported as unavailable for new users.
// Fallback to the standard Flash model.
const MODEL = 'gemini-2.5-flash';
const MAX_OUTPUT_TOKENS = 2000;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_BASE_MS = 800;

const contentLanguageSchema = z.enum(['en', 'ko', 'ja', 'zh-cn', 'zh-tw']);

export type PhotoTagInput = {
  imageBase64: string;
  mimeType: string;
  contentLanguage?: string;
};

const tagsResponseSchema = z.object({
  tags: z.array(z.string().min(1).max(80)).max(40),
});

function resolveContentLanguage(value: string | undefined): z.infer<
  typeof contentLanguageSchema
> {
  const normalized = (value ?? 'en').trim().toLowerCase();
  const parsed = contentLanguageSchema.safeParse(normalized);
  if (parsed.success) {
    return parsed.data;
  }
  return 'en';
}

function languageLabel(code: z.infer<typeof contentLanguageSchema>): string {
  switch (code) {
    case 'ko':
      return 'Korean';
    case 'ja':
      return 'Japanese';
    case 'zh-cn':
      return 'Simplified Chinese';
    case 'zh-tw':
      return 'Traditional Chinese';
    default:
      return 'English';
  }
}

function buildSystemInstruction(language: z.infer<typeof contentLanguageSchema>) {
  const label = languageLabel(language);
  return [
    'You help users remember where household items are stored.',
    'Look at the photo and list distinct physical items that are clearly visible.',
    'Use short common nouns (one or two words). No brand names unless obvious.',
    'Skip room names, colors, materials, and vague scene labels unless they are the item itself.',
    `Write every tag in ${label}.`,
    'Respond with JSON only: {"tags":["item1","item2"]}.',
    'If nothing identifiable, return {"tags":[]}.',
  ].join('\n');
}

function buildUserText(): string {
  return 'List the visible household or personal items in this photo as tags.';
}

function parseJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenceMatch ? fenceMatch[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
};

/**
 * Vision tagging via Gemini REST (inline image bytes).
 * nextjs-share-lib Gemini provider does not support image_url yet.
 */
async function generateTagsWithInlineImage(
  apiKey: string,
  input: {
    imageBase64: string;
    mimeType: string;
    contentLanguage: z.infer<typeof contentLanguageSchema>;
  },
): Promise<string[]> {
  const preset = { max_completion_tokens: MAX_OUTPUT_TOKENS };

  const body = {
    systemInstruction: {
      parts: [{ text: buildSystemInstruction(input.contentLanguage) }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: input.mimeType,
              data: input.imageBase64,
            },
          },
          { text: buildUserText() },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: preset.max_completion_tokens,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(
    `${GEMINI_API_BASE}/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    },
  );

  const payload = (await response.json()) as GeminiGenerateContentResponse;

  if (!response.ok) {
    const message =
      payload.error?.message ??
      JSON.stringify(payload).slice(0, 500) ??
      response.statusText;
    throw new Error(`Gemini API error (${response.status}): ${message}`);
  }

  const text =
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() ?? '';

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = parseJsonFromModelText(text);
  const validated = tagsResponseSchema.parse(parsed);

  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of validated.tags) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.add(key)) {
      tags.push(tag);
    }
  }
  return tags;
}

export async function detectPhotoTags(input: PhotoTagInput): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const imageBase64 = input.imageBase64.trim();
  if (!imageBase64) {
    throw new Error('imageBase64 is required');
  }

  const mimeType = input.mimeType.trim().toLowerCase();
  if (!mimeType.startsWith('image/')) {
    throw new Error('mimeType must be an image type');
  }

  const contentLanguage = resolveContentLanguage(input.contentLanguage);

  let lastError: unknown;
  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      return await generateTagsWithInlineImage(apiKey, {
        imageBase64,
        mimeType,
        contentLanguage,
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableGeminiError(error) || attempt === GEMINI_MAX_ATTEMPTS) {
        throw error;
      }
      const delayMs = GEMINI_RETRY_BASE_MS * 2 ** (attempt - 1);
      console.warn('[photo-tag] Gemini retryable error; retrying', {
        attempt,
        delayMs,
        message: error instanceof Error ? error.message : String(error),
      });
      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Gemini tagging failed');
}
