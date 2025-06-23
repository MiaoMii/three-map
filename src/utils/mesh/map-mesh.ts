import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { projection } from "../../utils/map";
import { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import { createBar } from "../../utils/mesh/bar-mesh";
import { createLightPoint } from "../../utils/mesh/light-mesh";

// const MAP_DEPTH = 1; // 地图块的深度
let provinceMeshList = [] as any;
let topFaceMaterial: any;
let sideMaterial: any;
let mapMaterial: any;
let options: any;
// 标签列表
let labelList = [];
let map: THREE.Object3D;

// 创建地图
export const createMap = (data: FeatureCollection<Polygon | MultiPolygon>, config: any) => {
  options = config;
  // 创建材质
  mapMaterial = createExtrudeMaterial();
  map = new THREE.Object3D();

  // geojson处理
  geojsonHanle(data, [creatBoundaryLightLine]);

  // 添加动画更新函数到map对象
  (map as any).updateGlow = (time: number) => {
    map.traverse((child) => {
      if (child.userData && child.userData.update) {
        child.userData.update(time);
      }
    });
  };

  return map;
};

const geojsonHanle = (data: FeatureCollection<Polygon | MultiPolygon>, fn: Function[]) => {
  const features = data.features;
  features.forEach((feature) => {
    // 单个省份 对象
    const province = new THREE.Object3D();
    // 地址
    province.userData.properties = feature.properties!.name;
    province.userData.isHover = false;
    // 多个情况
    if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          // fn.map((item) => {
          //   const mesh = item(rows);
          //   province.add(mesh);
          // });
          // 添加奥省份对象
          const mesh = creatBoundaryLightLine(rows);
          province.add(mesh);
        });
      });
    }
    // 单个情况
    if (feature.geometry.type === "Polygon") {
      feature.geometry.coordinates.forEach((coordinate) => {
        fn.map((item) => {
          const mesh = item(coordinate);
          province.add(mesh);
        });
      });
    }
    map.add(province);
  });

  (map as any).provinceMeshList = provinceMeshList;
  map.rotation.x = -Math.PI / 2;
  map.renderOrder = 1;
  return map;
};

/**
 * 创建区域材质
 * @returns THREE.Material
 */
const createExtrudeMaterial = () => {
  const topFaceMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("/src/assets/images/mesh/gz-map.jpg"),
    color: "#b4eeea",
    combine: THREE.MultiplyOperation,
    transparent: true,
    opacity: 1,
  });

  const sideMaterial = new THREE.MeshBasicMaterial({
    color: "#123024",
    transparent: true,
    opacity: 0.8,
  });

  return [topFaceMaterial, sideMaterial];
};

/**
 * 绘制挤出网格（地图块）
 * @param {*} polygon 区域坐标点数组
 * @returns 挤出网格
 */
function drawExtrudeMesh(polygon: any) {
  const shape = createShape(polygon);
  const extrudeSettings = {
    depth: 100, // 挤出深度
    bevelEnabled: false, // 无斜角
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const mesh = new THREE.Mesh(geometry, mapMaterial); // 顶部材质和流光材质
  // mesh.name = "mapMesh";
  return mesh;
}

// /**
//  * 画区域分界线
//  * @param {*} polygon 区域坐标点数组
//  * @returns 区域分界线
//  */
function creatBoundaryLine(polygon: any) {
  const points = [];
  for (let i = 0; i < polygon.length; i++) {
    const [x, y] = projection(polygon[i]) as any;
    points.push(new THREE.Vector3(x, -y, 0));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
    transparent: true,
    depthTest: false,
  });
  const line = new THREE.Line(lineGeometry, lineMaterial);

  line.translateZ(100 + 0.001);
  return line;
}

//

const creatBoundaryLightLine = (polygon: any) => {
  const points = [];
  for (let i = 0; i < polygon.length; i++) {
    const [x, y] = projection(polygon[i]) as any;
    points.push(new THREE.Vector3(x, -y, 0));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  // 创建发光组合
  const glowGroup = new THREE.Group();

  // 主线条 - 使用基础材质
  const mainMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 1.0,
    linewidth: 1,
  });
  const mainLine = new THREE.Line(lineGeometry.clone(), mainMaterial);

  // 创建泛光效果的Shader材质
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(0x00ffff) },
      intensity: { value: 1.5 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 glowColor;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // 计算距离中心的距离来创建泛光效果
        float dist = length(vUv - 0.5);
        
        // 创建脉动效果
        float pulse = sin(time * 2.0) * 0.3 + 0.7;
        
        // 泛光强度计算
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 2.0) * intensity * pulse;
        
        // 输出颜色
        gl_FragColor = vec4(glowColor * glow, glow * 0.8);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // 为了创建泛光效果，我们需要创建一个稍微粗一点的线条
  const glowGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    points.length,
    1, // 半径
    8, // 径向分段
    false,
  );

  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

  // 添加到组中
  glowGroup.add(glowMesh);
  glowGroup.add(mainLine);

  // 设置位置和渲染顺序
  glowGroup.translateZ(100 + 0.5);
  glowGroup.renderOrder = 2;

  // 添加动画更新函数
  glowGroup.userData.update = (time: number) => {
    if (glowMaterial.uniforms.time) {
      glowMaterial.uniforms.time.value = time;
    }
  };

  return glowGroup;
};

// /**
//  * 绘制2d省份标签
//  * @param {*} province 省份
//  * @returns 省份标签
//  */
// function drawLabelText(province: any) {
//   if (!province.properties.centroid) return;
//   const [x, y] = projection(province.properties.centroid) as any;

//   // const pos3 = new THREE.Vector3(x, y, 0); // Z = 0

//   const div = document.createElement("div");
//   div.innerHTML = province.properties.name;
//   // div.style.padding = "4px 10px";
//   div.style.color = "#B4EEEA";
//   div.style.fontSize = "16px";
//   // div.style.position = "absolute"; // Keep this for CSS2DRenderer to manage
//   // div.style.backgroundColor = "rgba(25,25,25,0.5)";
//   // div.style.borderRadius = "5px";
//   // div.style.pointerEvents = "none";
//   // Add transform to center the div
//   // div.style.transform = "translate(-50%, -50%)";
//   // div.style.left = "50%";
//   // div.style.top = "50%";
//   const label = new CSS2DObject(div);
//   // label.scale.set(0.01, 0.01, 0.01);
//   // Use -y for the y-coordinate to match geometry
//   // label.position.x = pos3.x;
//   label.position.set(x, -y, 100 + 0.05);
//   // label.position.set(0, 0, 0);

//   labelList.push({ name: province.properties.name, label });

//   return label;
// }
