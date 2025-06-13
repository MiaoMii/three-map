import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { projection } from "../../utils/map";
import { createBar } from "../../utils/mesh/bar-mesh";
import { createLightPoint } from "../../utils/mesh/light-mesh";

// const MAP_DEPTH = 1; // 地图块的深度
let provinceMeshList = [] as any;
let topFaceMaterial: any;
let sideMaterial: any;
// 标签列表
let labelList = [];

// 创建地图
export const createMap = (data: any) => {
  // 地图顶部和侧边材质
  setTextture();

  const map = new THREE.Object3D();
  map.name = "mapObject3D";
  // geo信息
  const features = data.features;
  features.forEach((feature: any) => {
    // 单个省份 对象
    const province = new THREE.Object3D() as any;
    // 地址
    province.properties = feature.properties.name;
    province.isHover = false;
    // 多个情况
    if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((coordinate: any) => {
        coordinate.forEach((rows: any) => {
          const line = drawBoundary(rows);
          const mesh = drawExtrudeMesh(rows); // drawExtrudeMesh 内部需要应用材质
          province.add(line);
          province.add(mesh);
          provinceMeshList.push(mesh);
        });
      });
    }

    // 单个情况
    if (feature.geometry.type === "Polygon") {
      feature.geometry.coordinates.forEach((coordinate: any) => {
        const line = drawBoundary(coordinate);
        const mesh = drawExtrudeMesh(coordinate); // drawExtrudeMesh 内部需要应用材质

        province.add(line);
        province.add(mesh);
        provinceMeshList.push(mesh);
      });
    }

    // 创建标签
    const label = drawLabelText(feature);
    label && province.add(label);

    // 创建柱状图
    const bar = createBar(feature);
    bar && province.add(bar);

    // 创建光柱
    const light = createLightPoint(feature);
    light && province.add(light);

    province.feature = feature;

    map.add(province);
  });

  (map as any).provinceMeshList = provinceMeshList;
  // map.rotation.x = -Math.PI / 2;
  map.renderOrder = 1;
  return map;
};

const setTextture = () => {
  // // 使用多材质数组
  topFaceMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("/src/assets/images/mesh/gz-map.jpg"),
    color: "#b4eeea",
    combine: THREE.MultiplyOperation,
    transparent: true,
    opacity: 1,
  });

  sideMaterial = new THREE.MeshBasicMaterial({
    color: "#123024",
    transparent: true,
    opacity: 0.8,
  });
};

/**/

/**
 * 绘制挤出网格（地图块）
 * @param {*} polygon 区域坐标点数组
 * @returns 挤出网格
 */
function drawExtrudeMesh(polygon: any) {
  const shape = new THREE.Shape();
  polygon.forEach((row: any, i: number) => {
    const [x, y] = projection(row) as any;
    if (i === 0) {
      shape.moveTo(x, -y);
    } else {
      shape.lineTo(x, -y);
    }
  });
  const extrudeSettings = {
    depth: 100, // 挤出深度
    bevelEnabled: false, // 无斜角
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // 计算形状的边界框
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox as any;

  // 自定义UV坐标，让材质完整覆盖形状
  const uvAttribute = geometry.attributes.uv;
  for (let i = 0; i < uvAttribute.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);

    // 将顶点位置映射到UV空间 (0-1范围)
    uvAttribute.setXY(i, (x - min.x) / (max.x - min.x), (y - min.y) / (max.y - min.y));
  }

  const mesh = new THREE.Mesh(geometry, [topFaceMaterial, sideMaterial]); // 顶部材质和流光材质
  // mesh.name = "mapMesh";
  return mesh;
}

/**
 * 画区域分界线
 * @param {*} polygon 区域坐标点数组
 * @returns 区域分界线
 */
function drawBoundary(polygon: any) {
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

/**
 * 绘制2d省份标签
 * @param {*} province 省份
 * @returns 省份标签
 */
function drawLabelText(province: any) {
  if (!province.properties.centroid) return;
  const [x, y] = projection(province.properties.centroid) as any;

  // const pos3 = new THREE.Vector3(x, y, 0); // Z = 0

  const div = document.createElement("div");
  div.innerHTML = province.properties.name;
  // div.style.padding = "4px 10px";
  div.style.color = "#B4EEEA";
  div.style.fontSize = "16px";
  // div.style.position = "absolute"; // Keep this for CSS2DRenderer to manage
  // div.style.backgroundColor = "rgba(25,25,25,0.5)";
  // div.style.borderRadius = "5px";
  // div.style.pointerEvents = "none";
  // Add transform to center the div
  // div.style.transform = "translate(-50%, -50%)";
  // div.style.left = "50%";
  // div.style.top = "50%";
  const label = new CSS2DObject(div);
  // label.scale.set(0.01, 0.01, 0.01);
  // Use -y for the y-coordinate to match geometry
  // label.position.x = pos3.x;
  label.position.set(x, -y, 100 + 0.05);
  // label.position.set(0, 0, 0);

  labelList.push({ name: province.properties.name, label });

  return label;
}
