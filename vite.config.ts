import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import raw from "vite-raw-plugin";
import UnoCSS from "unocss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    raw({
      fileRegex: /\.md$/,
    }),
    UnoCSS(),
  ],
});
