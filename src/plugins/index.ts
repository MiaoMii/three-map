import { App } from "vue";
import { setupElComponent } from "./ElComponent";
import { setupNComponent } from "./NComponent";
export const setupPlugins = (app: App) => {
  setupElComponent(app);
  setupNComponent(app);
};
