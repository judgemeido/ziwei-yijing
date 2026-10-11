import { defineConfig } from "vite";

export default defineConfig({
  root: import.meta.dirname,
  base: "./",
  cacheDir: import.meta.dirname + "/.vite",
  server: { port: 5174, open: false },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 700,
  },
});
