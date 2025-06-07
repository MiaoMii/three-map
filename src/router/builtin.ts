import fileRouter from "./createRouterByFile";
export const ROOT_ROUTE: any = {
  name: "root",
  path: "/",
  redirect: "/map/Map",
  meta: {
    title: "root",
    constant: true,
  },
};

export function createBuiltinVueRoutes() {
  console.log([ROOT_ROUTE, ...fileRouter]);
  return [ROOT_ROUTE, ...fileRouter];
}
