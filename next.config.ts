import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Parent Fiverr folder has another lockfile; pin root to this app.
    root: path.join(__dirname),
  },
};

export default nextConfig;
