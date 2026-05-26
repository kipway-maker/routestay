import type { NextConfig } from "next";

// Fix: the Claude Code preview environment injects a partial localStorage object
// into the Node.js global scope (via --localstorage-file flag) that has no methods.
// This causes Next.js SSR to crash. Patch it before anything else runs.
if (typeof globalThis.localStorage !== "undefined" && typeof (globalThis.localStorage as Storage).getItem !== "function") {
  // Replace the broken stub with a no-op implementation
  (globalThis as unknown as Record<string, unknown>).localStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  };
}

const nextConfig: NextConfig = {
  transpilePackages: ["@routestay/ui", "@routestay/core"],
};

export default nextConfig;
