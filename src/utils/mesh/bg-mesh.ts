import * as THREE from "three";
// import gsap from "gsap";

export const creatFloor = () => {
  const group = new THREE.Group();

  const gridBg = createGrid();
  const lightHalo = createLightHalo();
  const lightHalo1 = createLightHalo2();

  group.add(gridBg);
  group.add(lightHalo);
  group.add(lightHalo1);
  return group;
};

// 创建网格
export const createGrid = () => {
  return creatBgMesh("/src/assets/images/floor/circle-point.png") as any;
};

// 创建光圈1
export const createLightHalo = () => {
  const mesh = creatBgMesh("/src/assets/images/floor/rotating-point2.png", [1800, 1800]) as any;

  mesh.animate = (cube: THREE.Mesh) => {
    cube.rotation.z += 0.002;
  };
  return mesh;
};

// 创建光圈2
export const createLightHalo2 = () => {
  const mesh = creatBgMesh("/src/assets/images/floor/rotatingAperture.png") as any;
  mesh.animate = (cube: THREE.Mesh) => {
    cube.rotation.z -= 0.002;
  };
  return mesh;
};

// scenebg
export const createScenebg = () => {
  return creatBgMesh("/src/assets/images/floor/scene-bg2.png");
};

const creatBgMesh = (url: string, size: number[] = [2000, 2000]) => {
  const geometry = new THREE.PlaneGeometry(size[0], size[1]);
  const material = new THREE.MeshBasicMaterial({
    // color: 0xffff00,
    transparent: true,
    depthWrite: false, // 关闭写入深度缓冲
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load(url),
  });
  const plane = new THREE.Mesh(geometry, material);
  return plane;
};
