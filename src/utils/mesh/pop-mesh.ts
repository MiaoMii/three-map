// import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { projection } from "../../utils/map";
// 点击标记点显示的弹框
export function createMarkBox(province: any) {
  // 获取并复制元素
  const divMark = document.getElementById("markBox");
  if (divMark) {
    // 在divMark中查找ID为"name"的div元素
    const divName = divMark.querySelector("#markBox-name");
    divName!.textContent = "测试";
    const divContent = divMark.querySelector("#markBox-content");
    divContent!.textContent = "测试内容";
    divMark.style.display = "block";
    divMark.style.top = "-124px";
    divMark.style.left = "-100px";
    // HTML元素转化为threejs的CSS2模型对象
    const label = new CSS2DObject(divMark);
    const [x, y] = projection(province.properties.centroid) as any;
    console.log([x, y]);
    console.log(province.properties.centroid);
    // const { depth } = getDepth(size);
    // label.position.x = x;
    label.position.set(x, -y, 100 * 3);
    label.name = "markBox";
    return label;
  }
}
