import { z } from 'zod';

import { geminiAi } from '@/lib/ai-client';
import { isRetryableGeminiError } from '@/lib/gemini-errors';

const GEMINI_PRESET = 'default_lite' as const;
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

function toDataUrl(imageBase64: string, mimeType: string): string {
  // Gemini provider expects `data:<mime>;base64,<base64>`
  return `data:${mimeType};base64,${imageBase64}`;
}

/**
 * Vision tagging via nextjs-share-lib Gemini client (data URL image parts).
 */
async function generateTagsWithInlineImage(
  apiKey: string,
  input: {
    imageBase64: string;
    mimeType: string;
    contentLanguage: z.infer<typeof contentLanguageSchema>;
  },
): Promise<string[]> {
  // apiKey is already configured inside geminiAi; keep param for now.
  void apiKey;

  const dataUrl = toDataUrl(input.imageBase64, input.mimeType);

  const response = await geminiAi.createChatCompletion({
    preset: GEMINI_PRESET,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: buildSystemInstruction(input.contentLanguage),
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: dataUrl, detail: 'auto' },
          },
          { type: 'text', text: buildUserText() },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
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
