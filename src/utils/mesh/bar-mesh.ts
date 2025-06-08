import * as THREE from "three";
import { projection } from "../../utils/map";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { find } from "lodash-es";

const barData = [
  {
    name: "北京市",
    value: 800,
    total: 1000,
  },
  {
    name: "青海省",
    value: 200,
    total: 1000,
  },
  {
    name: "贵州省",
    value: 500,
    total: 1000,
  },
];

// 创建柱状图, height圆柱高度
export const createBar = (province: any) => {
  //   const bar = self.bar
  const bar = find(barData, (item) => item.name === province.properties.name);
  if (!bar) return;
  const [x, y] = projection(province.properties.centroid) as any;
  const height = (bar.value / bar.total) * 20;
  const group = new THREE.Group();
  // 1. 柱状图
  const barMesh = createBarMesh(height);
  // 2. 标签
  //   const tagMesh = createTag(bar, [x, y]);
  // 3. 数字
  const numberMesh = createNumber(bar.value + "");
  numberMesh.position.z = height + 1;
  group.add(barMesh, numberMesh);
  group.position.set(x + 0.5, -y, 100 + 0.2);
  group.scale.set(100 / 8, 100 / 8, 100 / 8);
  group.name = "bar";
  return group;
};

export function createBarMesh(height: number) {
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, height, 100);
  cylinderGeometry.translate(0, height / 2, 0); // 将原点置于底部

  // 柱体材质
  const barMaterial = new THREE.MeshStandardMaterial({
    emissive: "#2a669d",
    // roughness: 0.45, // 粗糙度
    // metalness: 0.8, // 金属度
    transparent: true, // 使用背景透明的png贴图，注意开启透明计算
    side: THREE.DoubleSide, // 两面可见
    color: "#2a669d",
    opacity: 1,
  });

  const barMesh = new THREE.Mesh(cylinderGeometry, barMaterial) as any;
  barMesh.colorName = "bar";
  barMesh.name = "bar";
  barMesh.rotateX(Math.PI / 2);
  return barMesh;
}

// export const createTag = (self) => {
//   const div = document.createElement("div");
//   div.style.color = "#f4ef99";
//   div.style.width = "25px";
//   div.style.height = "25px";
//   div.style.lineHeight = "25px";
//   div.style.textAlign = "center";
//   div.style.fontSize = "14px";
//   div.style.fontWeight = "700";
//   // div.style.textShadow = "1px 1px 2px #000000";
//   div.style.borderRadius = "50%";
//   div.style.border = "2px solid #818f97";
//   div.style.backgroundColor = "rgba($color: #000000, $alpha: 0.8)";
//   div.textContent = 1;
//   const tag = new CSS2DObject(div);
//   tag.position.z = self.value;
//   return tag;
// };

export const createNumber = (value: string) => {
  const div = document.createElement("div");
  div.style.color = "#fff";
  div.style.fontSize = "14px";
  div.style.fontWeight = "700";
  div.style.textShadow = "1px 1px 2px #000000";
  div.textContent = value;
  const tag = new CSS2DObject(div);
  return tag;
};
