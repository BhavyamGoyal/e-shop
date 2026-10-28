import type { NextConfig } from "next";

const NO_INDEX_HEADERS = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/admin/:path*", headers: NO_INDEX_HEADERS },
      { source: "/api/:path*", headers: NO_INDEX_HEADERS },
      { source: "/login", headers: NO_INDEX_HEADERS },
      { source: "/register", headers: NO_INDEX_HEADERS },
    ];
  },
};

export default nextConfig;
