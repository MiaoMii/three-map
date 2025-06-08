import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        "vue",
        {
          "naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"],
        },
      ],
    }),
    Components({
      resolvers: [ElementPlusResolver(), NaiveUiResolver()],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 全局变量
        additionalData: `@import "./src/styles/mixin.scss";`,
      },
    },
  },
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    // ↓路径别名，主要是这部分
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
