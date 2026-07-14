import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  // The site uses no PostCSS plugins. Declaring that inline stops Vite from
  // walking up to the repo root and loading the app's postcss.config.js,
  // which needs Tailwind — installed for the app, not for the site (broke CI).
  css: {
    postcss: { plugins: [] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
