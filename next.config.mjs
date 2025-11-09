/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "agentic-41873b76.vercel.app"]
    }
  }
};

export default nextConfig;
