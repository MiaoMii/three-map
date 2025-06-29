import * as THREE from "three";
import * as d3 from "d3";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
//  相机
let camera: THREE.Camera;
export function createCamera({ width, height }: Record<string, number>) {
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.position.set(0, 0, 0);
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
  // renderer.setClearColor("#ffffff", 1); // 设置背景颜色和透明度
  el.appendChild(renderer.domElement);
  return renderer;
};

let css2Renderer: any;
export const creatCSS2DRenderer = (el: HTMLElement, { width, height }: Record<string, number>) => {
  // 2d渲染器
  css2Renderer = new CSS2DRenderer();
  css2Renderer.setSize(width, height);
  css2Renderer.domElement.style.position = "absolute";
  css2Renderer.domElement.style.top = "0px";
  css2Renderer.domElement.style.left = "0px";
  css2Renderer.domElement.style.pointerEvents = "none";
  el.appendChild(css2Renderer.domElement);
  return css2Renderer;
};

// 场景
let scene: THREE.Scene;
export const createScene = () => {
  scene = new THREE.Scene();
  return scene;
};

// 初始化Three
export const initThree = (el: HTMLElement, [w, h]: number[]) => {
  const [width, height] = [w, h];
  createCamera({ width, height });
  createRenderer(el, { width, height });
  createScene();
  creatCSS2DRenderer(el, { width, height });
  createControls(camera, renderer);
  return {
    camera,
    renderer,
    scene,
    controls,
    css2Renderer,
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

//  根据起点和终点获取曲线的坐标点
export const getCurvePoint = (coord: any, divisions: number = 1000) => {
  const { x0, y0, x1, y1 } = coord;
  // 凸起高度 也就是飞线的高度
  const convexZ = 100;
  // 起点坐标
  const v0 = new THREE.Vector3(x0, y0, 0);
  // 控制点1坐标
  const v1 = new THREE.Vector3(
    x0 + (x1 - x0) / 4, // 在起点的基础上，控制点1的坐标为起点的1/4
    y0 + (y1 - y0) / 4, // 在起点的基础上，控制点1的坐标为起点的1/4
    convexZ,
  );
  // 控制点2坐标
  const v2 = new THREE.Vector3(
    x0 + ((x1 - x0) * 3) / 4, // 在起点的基础上，控制点2的坐标为起点的3/4
    y0 + ((y1 - y0) * 3) / 4, // 在起点的基础上，控制点2的坐标为起点的3/4
    convexZ,
  );
  // 终点坐标
  const v3 = new THREE.Vector3(x1, y1, 0);
  // 使用3次贝塞尔曲线来绘制曲线
  const lineCurve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
  // 获取曲线上的点 暂时定为获取1000个点 后续绘制流线动画的时候更好的计算
  return lineCurve.getPoints(divisions);
};
