import { NextConfig } from 'next';

const config: NextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default config;
