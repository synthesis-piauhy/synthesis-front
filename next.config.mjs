/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  distDir: process.env.NEXT_E2E === "1" ? ".next-e2e" : process.env.SYNTHESIS_SHARE_BUILD === "1" ? ".next-preview" : ".next",
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  output: process.env.SYNTHESIS_SHARE_BUILD === "1" ? undefined : "standalone",
  allowedDevOrigins: process.env.SYNTHESIS_PREVIEW_ORIGIN
    ? [new URL(process.env.SYNTHESIS_PREVIEW_ORIGIN).hostname]
    : [],
  experimental: { useTypeScriptCli: false },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  async rewrites() {
    const target = process.env.NEXT_API_PROXY_TARGET?.replace(/\/$/, "");
    return target ? [{ source: "/api/:path*", destination: `${target}/api/:path*` }] : [];
  },
};

export default nextConfig;
