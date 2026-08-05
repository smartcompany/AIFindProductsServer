import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Items API',
};

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Find Items API</h1>
      <p>
        POST <code>/api/photos/tag</code> with JSON{' '}
        <code>
          {'{ imageBase64, mimeType, contentLanguage? }'}
        </code>
      </p>
    </main>
  );
}
