import * as THREE from "three";
// import gsap from "gsap";

export const creatFloor = (config: any) => {
  const group = new THREE.Group();

  const gridBg = createGrid();
  const lightHalo = createLightHalo();
  const lightHalo1 = createLightHalo2();
  // const particl = createParticle(config.size, config.cneter);

  console.log(lightHalo1, lightHalo1);
  // console.log(particl, particl);

  group.add(gridBg);
  group.add(lightHalo);
  group.add(lightHalo1);
  // group.add(...particl);
  // group.rotation.x = -Math.PI / 2;
  return group;
};

// 创建网格
export const createGrid = () => {
  return creatBgMesh("/src/assets/images/floor/circle-point.png") as any;
};

// 创建光圈1
export const createLightHalo = () => {
  const mesh = creatBgMesh("/src/assets/images/floor/rotating-point2.png", [1800, 1800]) as any;

  mesh.userData.animate = (cube: THREE.Mesh) => {
    cube.rotation.z += 0.002;
  };
  return mesh;
};

// 创建光圈2
export const createLightHalo2 = () => {
  const mesh = creatBgMesh("/src/assets/images/floor/rotatingAperture.png") as any;
  mesh.userData.animate = (cube: THREE.Mesh) => {
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
    color: "#b4eeea",
    transparent: true,
    depthWrite: false, // 关闭写入深度缓冲
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load(url),
  });
  const plane = new THREE.Mesh(geometry, material);
  return plane;
};

export function createParticle(size: any, center: any) {
  // let { max } = getDepth(size);
  let max = 10;
  // 构建范围，中间地图的2倍
  let minX = center.x - size.x;
  let maxX = center.x + size.x;
  let minY = center.y - size.y;
  let maxY = center.y + size.y;
  let minZ = -max;
  let maxZ = max;
  let particleArr = [];
  const group = new THREE.Group();
  // 配置
  const pTexture = new THREE.TextureLoader().load("/src/assets/images/floor/particle.png");
  const options = { frame: 9, column: 9, row: 1, speed: 0.5 };
  for (let i = 0; i < 16; i++) {
    // 创建粒子模型
    const particleTexture = pTexture;
    // particleTexture.wrapS = THREE.RepeatWrapping;
    particleTexture.repeat.set(1 / options.column, 1 / options.row); // 从图像上截图第一帧
    const particleMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 1,
      depthTest: true,
      side: THREE.DoubleSide, // 两面可见
    });
    particleMaterial.map = particleTexture;
    const particle = new THREE.Mesh(new THREE.PlaneGeometry(max * 20, max * 20), particleMaterial);
    let particleScale = random(5, 10) / 1000;
    particle.scale.set(particleScale, particleScale, particleScale);
    particle.rotation.x = Math.PI / 2;
    let x = random(minX, maxX);
    let y = random(minY, maxY);
    let z = random(minZ, maxZ);
    particle.position.set(x, y, z);
    // particle.colorName = "bg";

    particle.userData.particleTexture = particleTexture;
    particle.userData.options = options;
    particle.userData.num = 0;
    particle.userData.animate = (cube: THREE.Mesh, t: any) => {
      cube.userData.num += cube.userData.options.speed;
      if (cube.userData.num > options.frame) cube.userData.num = 0;
      cube.userData.particleTexture.offset.x =
        (cube.userData.options.column - Math.floor(cube.userData.num % cube.userData.options.column) - 1) /
        cube.userData.options.column; // 动态更新纹理偏移 播放关键帧动画
      cube.userData.particleTexture.offset.y =
        Math.floor((cube.userData.num / cube.userData.options.column) % cube.userData.options.row) /
        cube.userData.options.row; // 动态更新纹理偏移 播放关键帧动画
      // y坐标每次加t * 1
      cube.position.z += t * 0.03 * max;
      if (cube.position.z > max) {
        cube.position.z = z;
      }
    };
    particleArr.push(particle);
    group.add(particle);
  }
  return [group];
}

// 随机数
export const random = function (min: any, max: any) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
