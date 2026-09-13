/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_E2E === "1" ? ".next-e2e" : ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  experimental: { useTypeScriptCli: false },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
