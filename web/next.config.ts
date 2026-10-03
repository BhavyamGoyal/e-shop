import type { NextConfig } from "next";

const NO_INDEX_HEADERS = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/admin/:path*", headers: NO_INDEX_HEADERS },
      { source: "/api/:path*", headers: NO_INDEX_HEADERS },
      { source: "/login", headers: NO_INDEX_HEADERS },
      { source: "/register", headers: NO_INDEX_HEADERS },
    ];
  },
};

export default nextConfig;
