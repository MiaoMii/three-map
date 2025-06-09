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
  const barMesh = createBarMesh(height, 0xffffff, 0x337ec0); // 顶部红色，底部蓝色
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

export function createBarMesh(height: number, topColorHex: number, bottomColorHex: number) {
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, height, 100);
  cylinderGeometry.translate(0, height / 2, 0); // 将原点置于底部

  // 柱体材质
  const barMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, // 两面可见
    vertexColors: true, // 允许顶点颜色
    transparent: true, // 如果需要透明效果，请设置为true
    uniforms: {
      topColor: { value: new THREE.Color(topColorHex) },
      bottomColor: { value: new THREE.Color(bottomColorHex) },
      barHeight: { value: height }, // 将实际高度传递给shader
    },
    vertexShader: `
      varying vec3 vPosition;
      // varying float vWorldY; // 或者使用世界坐标的Y值

      void main() {
        vPosition = position;
        // vWorldY = (modelMatrix * vec4(position, 1.0)).y; // 如果使用世界Y坐标
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      // varying float vWorldY;
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float barHeight;

      void main() {
        // 使用局部坐标的Y值进行插值
        // 注意：cylinderGeometry.translate(0, height / 2, 0)后，局部Y的范围是 [0, height]
        float percent = vPosition.y / barHeight;
        
        // 如果使用世界坐标的Y值，需要根据实际情况调整插值范围
        // float t = smoothstep(worldYBottom, worldYTop, vWorldY); // worldYBottom 和 worldYTop 需要计算或传入

        vec3 color = mix(bottomColor, topColor, percent);
        gl_FragColor = vec4(color, 1.0); // 设置当前像素点的颜色，如果需要透明，可以调整alpha值
      }
    `,
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
