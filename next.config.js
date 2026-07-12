/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit for App Router API routes so larger PDFs
  // can be uploaded. Adjust as needed.
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

module.exports = nextConfig;
