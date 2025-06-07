import { log } from "console";
import type { RouteRecordRaw } from "vue-router";
const fileRouter: RouteRecordRaw[] = [];
// import _ from "lodash"; // Lodash is no longer needed for this part
// 使用 import.meta.glob 动态导入 views 目录下的所有 Vue 组件文件
const viewFiles = import.meta.glob("../views/**/*.vue");
// 遍历导入的文件,生成路由配置
Object.keys(viewFiles).forEach((path: string) => {
  // 修改 routePath 的生成逻辑
  // 例如: ../views/user/Login.vue -> /user/Login
  // 例如: ../views/home.vue -> /home
  const routePath = path
    .replace("../views", "")
    .replace(".vue", "");

  const route = {
    path: routePath, // 使用处理后的路径，确保它是以 / 开头
    component: viewFiles[path], // 直接使用 viewFiles[path] 作为组件
  };
  fileRouter.push(route);
});
console.log(fileRouter)
export default fileRouter;
