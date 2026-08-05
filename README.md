# Find Items server

Next.js API for online photo tagging with **Gemini 3.5 Flash** (vision via `nextjs-share-lib` + `GEMINI_API_KEY`).

## Setup

```bash
cd server
cp .env.example .env.local
# set GEMINI_API_KEY
npm install
npm run dev
```

## API

`POST /api/photos/tag`

```json
{
  "imageBase64": "...",
  "mimeType": "image/jpeg",
  "contentLanguage": "ko"
}
```

Response: `{ "tags": ["컵", "마우스"] }`

Errors: `{ "error": "message" }`
# AIFindProductsServer
