import { App } from "vue";
import { setupElComponent } from "./ElComponent";
export const setupPlugins = (app: App) => {
  setupElComponent(app);
};
