/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cmsmu/sdk", "@cmsmu/schema-sdui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
