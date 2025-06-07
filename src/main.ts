import { createApp } from "vue";
import "./styles/index.css";
import App from "./App.vue";
import { setupStore } from "./store";
import { setupPlugins } from "./plugins";
import { setupRouter } from "./router";
function setupApp() {
  const app = createApp(App);

  setupStore(app);

  setupRouter(app);

  setupPlugins(app);

  app.mount("#app");
}

setupApp();
