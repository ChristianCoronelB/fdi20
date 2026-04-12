import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview
  allowedDevOrigins: [
    'preview-chat-409376e6-5382-4495-8016-25ea7ddad690.space.z.ai',
    '.space.z.ai',
    'localhost',
  ],
};

export default nextConfig;
