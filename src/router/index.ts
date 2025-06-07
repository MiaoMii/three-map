import { App } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createBuiltinVueRoutes } from "./builtin.ts";

export const router = createRouter({
  history: createWebHistory(),
  routes: createBuiltinVueRoutes(),
});
export const setupRouter = (app: App) => {
  app.use(router);
};
