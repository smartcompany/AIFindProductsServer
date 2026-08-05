import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['nextjs-share-lib'],
  async headers() {
    return [
      {
        source: '/api/photos/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
