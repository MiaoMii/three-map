// 地图上的光柱
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
const texture = new THREE.TextureLoader();
import { projection } from "../../utils/map";

export const random = function (min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 创建标记点
export const createPointMesh = () => {
  const lightPoint = new THREE.MeshBasicMaterial({
    map: texture.load("/src/assets/images/light/lightPoint.png"),
    color: "#00ffff",
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false, // 禁止写入深度缓冲区数据
  });

  // 标记点：几何体，材质，
  const geometry = new THREE.PlaneGeometry(1.5, 1.5);
  let mesh = new THREE.Mesh(geometry, lightPoint) as any;
  mesh.renderOrder = 97;
  // colorName 用于标记模型的颜色名称
  mesh.colorName = "light";
  mesh.disabled = true;
  // 缩放
  const scale = 0.15;
  mesh.scale.set(scale, scale, scale);
  return mesh;
};
/**
 * 创建光圈
 */
export const createLightHalo = () => {
  const lightHalo = new THREE.MeshBasicMaterial({
    map: texture.load("/src/assets/images/light/lightHalo.png"),
    color: "#00ffff",
    side: THREE.DoubleSide,
    opacity: 0,
    transparent: true,
    depthWrite: false, // 禁止写入深度缓冲区数据
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), lightHalo) as any;
  mesh.renderOrder = 98;
  mesh.colorName = "light";
  // 缩放
  // const scale = 10;
  // mesh.scale.set(scale, scale, scale);
  // mesh.disabled = true;
  // // 动画延迟时间
  // const delay = random(0, 2000);
  // // 动画：透明度缩放动画
  // mesh.tween1 = new TWEEN.Tween({ scale: scale, opacity: 0 })
  //   .to({ scale: scale * 1.5, opacity: 1 }, 1000)
  //   .delay(delay)
  //   .onUpdate((params) => {
  //     let { scale, opacity } = params;
  //     mesh.scale.set(scale, scale, scale);
  //     mesh.material.opacity = opacity;
  //   });
  // mesh.tween2 = new TWEEN.Tween({ scale: scale * 1.5, opacity: 1 })
  //   .to({ scale: scale * 2, opacity: 0 }, 1000)
  //   .onUpdate((params) => {
  //     let { scale, opacity } = params;
  //     mesh.scale.set(scale, scale, scale);
  //     mesh.material.opacity = opacity;
  //   });
  // mesh.tween1.chain(mesh.tween2);
  // mesh.tween2.chain(mesh.tween1);
  // mesh.tween1.start();
  return mesh;
};

/**
 * 创建光柱
 */
export const createLightPillar = () => {
  const lightPillar = new THREE.MeshBasicMaterial({
    map: texture.load("/src/assets/images/light/lightPillar.png"),
    color: "#00ffff",
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const height = 0.4 + random(1, 5) / 5;
  // 柱体的geo,6.19=柱体图片高度/宽度的倍数
  const geometry = new THREE.PlaneGeometry(height / 6.219, height);
  // 柱体旋转90度，垂直于Y轴
  geometry.rotateX(Math.PI / 2);
  // 柱体的z轴移动高度一半对齐中心点
  geometry.translate(0, 0, height / 2);
  // 光柱01
  let light01 = new THREE.Mesh(geometry, lightPillar) as any;
  light01.renderOrder = 99;
  light01.disabled = true;
  light01.name = "createLightPillar01";
  light01.colorName = "light";
  // 光柱02：复制光柱01
  let light02 = light01.clone();
  light02.name = "createLightPillar02";
  // 光柱02，旋转90°，跟 光柱01交叉
  light02.rotateZ(Math.PI / 2);
  // 将光柱和标点添加到组里
  return [light01, light02];
};

// 创建光柱
export const createLightPoint = (province: any) => {
  if (!province.properties.centroid) return;
  const [x, y] = projection(province.properties.centroid) as any;
  const lights = new THREE.Group();
  const max = 1000;

  // 创建光柱
  const lightPillar = createLightPillar();
  // 创建底部标点
  const bottomMesh = createPointMesh();
  // 创建光圈
  const lightHalo = createLightHalo();
  // 将光柱和标点添加到组里
  lights.add(bottomMesh, lightHalo, ...lightPillar);
  // 设置位置
  lights.position.set(x, -y, 100 + 0.1);
  lights.scale.set(max / 10, max / 10, max / 10);
  lights.name = "lightPoint";
  return lights;
};
