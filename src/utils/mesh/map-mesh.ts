import * as THREE from "three";
import * as d3 from "d3";


const MAP_DEPTH = 1; // 地图块的深度
let provinceMeshList = [] as any
// d3-geo墨卡托坐标转化
const projection = d3
    .geoMercator()
    .center([108.923611, 34.540833]) // 中国地图中心点
    .scale(1000) // 缩放比例
    .translate([0, 0]); // 将地图原点放在Three.js场景的原点

// 创建地图
export const createMap = (data: any) => {
    const map = new THREE.Object3D();
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
      // const label = drawLabelText(feature);
      // labelList.push({ name: feature.properties.name, label });
      // label && province.add(label);
      map.add(province);
    });
    // map.rotation.x = -Math.PI / 2;
    return map;
};




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
    const {min, max} = geometry.boundingBox as any;

    // 自定义UV坐标，让材质完整覆盖形状
    const uvAttribute = geometry.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
        const x = geometry.attributes.position.getX(i);
        const y = geometry.attributes.position.getY(i);

        // 将顶点位置映射到UV空间 (0-1范围)
        uvAttribute.setXY(
            i,
            (x - min.x) / (max.x - min.x),
            (y - min.y) / (max.y - min.y),
        );
    }

          // 使用多材质数组  
          const topFaceMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('/src/assets/images/mesh/gz-map.jpg'),
          });
    
          const sideMaterial = new THREE.MeshBasicMaterial({
            color: "#3480C4",
            transparent: true,
            opacity: 0.8,
          });

    const mesh = new THREE.Mesh(geometry, [topFaceMaterial, sideMaterial]); // 顶部材质和流光材质
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
