import { NextRequest } from 'next/server';
import { z } from 'zod';

import {
  clientMessageForGeminiError,
  httpStatusForGeminiError,
} from '@/lib/gemini-errors';
import { jsonResponse, optionsResponse } from '@/lib/http';
import { detectPhotoTags } from '@/lib/photo-tag-generator';

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const bodySchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1).max(64),
  contentLanguage: z
    .enum(['en', 'ko', 'ja', 'zh-cn', 'zh-tw'])
    .optional(),
});

function clientErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return 'Invalid tag response from AI';
  }
  return clientMessageForGeminiError(error);
}

function responseStatus(error: unknown): number {
  if (error instanceof z.ZodError) {
    return 502;
  }
  return httpStatusForGeminiError(error);
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(request);
}

export async function POST(request: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(
        request,
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 },
      );
    }
    return jsonResponse(request, { error: 'Invalid request body' }, {
      status: 400,
    });
  }

  try {
    const raw = body.imageBase64.replace(/\s/g, '');
    const byteLength = Buffer.byteLength(raw, 'base64');
    if (byteLength > MAX_IMAGE_BYTES) {
      return jsonResponse(
        request,
        { error: 'Image is too large. Use a smaller photo.' },
        { status: 413 },
      );
    }

    const tags = await detectPhotoTags({
      imageBase64: raw,
      mimeType: body.mimeType,
      contentLanguage: body.contentLanguage,
    });

    return jsonResponse(request, { tags });
  } catch (error) {
    const message = clientErrorMessage(error);
    console.error('[POST /api/photos/tag] client error:', message);
    return jsonResponse(
      request,
      {
        error: message,
        ...(error instanceof z.ZodError
          ? { details: error.flatten() }
          : {}),
      },
      { status: responseStatus(error) },
    );
  }
}
