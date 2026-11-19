import { resolve } from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  outputFileTracingRoot: resolve(import.meta.dirname, "../.."),
  outputFileTracingIncludes: {
    "/api/lottie/*": ["../../packages/ui/assets/lottie/*"],
  },
}

export default nextConfig
