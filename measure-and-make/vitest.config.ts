import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolvePath = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  // The content layer is server-only by design; see tests/server-only-stub.ts
  // for why that import is aliased here.
  resolve: {
    alias: {
      "@": resolvePath("./src"),
      "server-only": resolvePath("./tests/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
