/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: '',
  },
  // If you need to serve your app from a subdirectory, uncomment and modify this:
  // basePath: '/your-base-path',
};

module.exports = nextConfig; 