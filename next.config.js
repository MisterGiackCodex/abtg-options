/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.DEMO_BUILD === "true" ? { output: "export" } : {}),
};
module.exports = nextConfig;
