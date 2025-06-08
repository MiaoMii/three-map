import * as THREE from "three";
import * as d3 from "d3";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//  相机
let camera: THREE.Camera;
export function createCamera({ width, height }: Record<string, number>) {
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  return camera;
}
// d3-geo墨卡托坐标转化
export const projection = d3
  .geoMercator()
  .center([108.923611, 34.540833]) // 中国地图中心点
  .scale(1000) // 缩放比例
  .translate([0, 0]); // 将地图原点放在Three.js场景的原点

//  渲染器
let renderer: THREE.WebGLRenderer;
export const createRenderer = (el: HTMLElement, { width, height }: Record<string, number>) => {
  renderer = new THREE.WebGLRenderer({
    antialias: true, // 开启优化锯齿
  });
  renderer.setPixelRatio(window.devicePixelRatio); // 防止输出模糊
  renderer.setSize(width, height); // 设置画布
  renderer.setClearColor("#ffffff", 1); // 设置背景颜色和透明度
  el.appendChild(renderer.domElement);
  return renderer;
};

// 场景
let scene: THREE.Scene;
export const createScene = () => {
  scene = new THREE.Scene();
  return scene;
};

// 初始化Three
export const initThree = (el: HTMLElement, { width, height }: Record<string, number>) => {
  createCamera({ width, height });
  createRenderer(el, { width, height });
  createScene();
  createControls(camera, renderer);
  return {
    camera,
    renderer,
    scene,
    controls,
  };
};

// 轨道控制器
// 轨道控制器可以使得相机围绕目标进行轨道运动。
let controls: any = null;
export function createControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update(); // update()函数内会执行camera.lookAt(controls.target)
  return controls;
}

// 包围盒Box3
export function box3(mesh: any) {
  // 包围盒计算模型对象的大小和位置
  const box3 = new THREE.Box3();
  box3.expandByObject(mesh); // 计算模型包围盒
  const size = new THREE.Vector3();
  box3.getSize(size); // 计算包围盒尺寸
  const center = new THREE.Vector3();
  box3.getCenter(center); // 计算包围盒中心坐标
  return { size, center };
}

export function getDepth(size: any) {
  const max = Math.max(...size);
  const depth = max / 16;
  return { depth, max };
}

// 坐标矫正
export const setCenter = (map: THREE.Mesh) => {
  // map.rotation.x = -Math.PI / 2;
  // 创建一个Box3对象，并通过调用setFromObject(map)方法，将map的包围盒信息存储在box变量中
  // box变量现在包含了map对象的边界范围
  const box = new THREE.Box3().setFromObject(map);
  // box.getCenter 获取包围盒的中心点坐标
  const center = box.getCenter(new THREE.Vector3());
  const offset = [0, 0];
  // 相对中心的位置
  map.position.x = map.position.x - center.x - offset[0];
  map.position.z = map.position.z - center.z - offset[1];
};

// 重置地图的尺寸
export function setScale(group: any, size: any) {
  const { depth } = getDepth(size);
  // 根据最大边长设置缩放倍数，尽量全屏显示
  // 过大会超出屏幕范围，过小全屏效果不明显
  // Math.max(...size) 计算包围盒的最大边长
  const S = 1 / depth;
  // 对模型进行缩放操作，实现全屏效果
  group.scale.set(S, S, S);
  const box = box3(group);
  // 重新设置模型的位置，使模型居中
  group.position.x = group.position.x - box.center.x;
  // group.position.y = group.position.y - box.center.y;
  group.position.y = 0;
  group.position.z = group.position.z - box.center.z;

  // 根据地图大小控制地图显示高度
  const map3D = group.children[0];
  map3D.traverse((obj: any) => {
    // 找到组成地图块的模型
    if (obj.colorName == "mapMesh") {
      // 设置当前地图的高度
      const shapes = obj.geometry.parameters.shapes;
      const shapeGeometry = new THREE.ExtrudeGeometry(shapes, {
        depth: depth,
        bevelEnabled: false,
      });
      obj.geometry = shapeGeometry;
    }
    // 找到组成地图描边的模型
    if (obj.isUpLine) obj.position.z = depth + 0.0001;
  });
}
