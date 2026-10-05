import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Article covers + body images live on R2 — first remote use in the app.
      // R2_PUBLIC_URL may move to a custom domain later; add it alongside.
      { protocol: 'https', hostname: 'pub-1fd4265ddcd040d1bc4642a79a91c8e9.r2.dev' },
    ],
  },
};

export default nextConfig;
