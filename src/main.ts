import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { setupStore } from "./store";
import { setupPlugins } from "./plugins";
import { setupRouter } from "./router";
// import "swiper/scss";
// import "swiper/scss/navigation";
// import "swiper/scss/pagination";
function setupApp() {
  const app = createApp(App);

  setupStore(app);

  setupRouter(app);

  setupPlugins(app);

  app.mount("#app");
}

setupApp();
