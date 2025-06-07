<script setup lang="ts">
import * as THREE from "three";
import {nextTick} from "vue";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {getMapData} from "../../api/map";
import {createMap} from "../../utils/mesh/map-mesh.ts";
import {box3, setCenter, setScale, getDepth} from '../../utils/map.ts'

let map = null
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let scene: THREE.Scene;
nextTick(() => {
  // 创建场景
  scene = new THREE.Scene();
  const node = document.getElementsByClassName("map")[0] as HTMLElement;
  const {width, height} = node.getBoundingClientRect();
  console.log(width, height)
  // 创建相机
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);


  // 创建渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  node.appendChild(renderer.domElement);

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement);


   // 创建坐标系辅助器，显示 X, Y, Z 轴
  var axesHelper = new THREE.AxesHelper(1000);  // 参数表示坐标轴的长度
  scene.add(axesHelper);

  initMap()




})

  // 创建动画循环
  var animate = function () {
    requestAnimationFrame(animate);

    console.log(camera)
    controls.update();
    // 渲染场景
    renderer.render(scene, camera);
  };

// import {
//   initThree, box3, setCenter
//   , setScale
// } from "../../utils/map";
// import {getMapData} from "../../api/map";
// import {createMap} from "../../utils/mesh/map-mesh.ts";

// const mapRef = ref<HTMLInputElement | null>(null);
// let camera: THREE.Camera
// let renderer: THREE.WebGLRenderer
// let controls: any
// let scene: THREE.Scene
// let map = null
// let bgMesh: any = null
// nextTick(() => {
//   const node = document.getElementsByClassName("map")[0] as HTMLElement;
//   if (node) {
//     const {width, height} = node.getBoundingClientRect();
//     const {camera: c, renderer: r, scene: s, controls: con} = initThree(node, {width, height});
//     camera = c
//     renderer = r
//     scene = s
//     controls = con
//     controls.update
//     initMap()
//   }
// });


const initMap = () => {
  // 创建背景
  // creatFloor()

  // 初始化光源
  initLight()
  // 渲染地图
  loadMapData(100000)

  // 渲染
  animate()
}


/**
 * @description 初始化光
 */
function initLight() {
  if (!scene) return;
  const ambientLight = new THREE.AmbientLight(0xcccccc, 1.1);
  scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(1, 0.1, 0).normalize();
  var directionalLight2 = new THREE.DirectionalLight(0xff2ffff, 0.2);
  directionalLight2.position.set(1, 0.1, 0.1).normalize();
  scene.add(directionalLight);
  scene.add(directionalLight2);
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
  hemiLight.position.set(0, 1, 0);
  scene.add(hemiLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 500, -20);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 18;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.camera.left = -52;
  directionalLight.shadow.camera.right = 12;
  scene.add(directionalLight);
}

// // 创建地板
// const creatFloor = () => {
//   const group = new THREE.Group()
//   group.name = '背景'

//   // 底部光圈
//   bgMesh = new THREE.MeshPhongMaterial({
//     map: new THREE.TextureLoader().load("/src/assets/images/floor/circle-point.png"),
//     transparent: true,
//     color: '0x00ffff',
//     opacity: 1,
//     depthTest: true,
//     side: THREE.DoubleSide, // 两面可见
//   })

//   const plane = new THREE.PlaneGeometry(40, 40)
//   const mesh = new THREE.Mesh(plane, bgMesh)
//   mesh.position.z = -0.1
//   scene.add(mesh)
// }


const loadMapData = (code: number) => {
  getMapData(code).then(res => {
    map = createMap(res) as any;


    // 计算场景的边界
    var box = new THREE.Box3().setFromObject(map);  // 使用立方体作为参考
    var center = box.getCenter(new THREE.Vector3()); // 获取场景中心
    var size = box.getSize(new THREE.Vector3()); // 获取场景大小

// 根据场景的大小来调整相机的远近
    var maxDim = Math.max(size.x, size.y, size.z);
    var cameraDistance = maxDim * 1.5;  // 给定相机距离为最大维度的1.5倍

// 设置相机的位置
    camera.position.set(center.x, -1000, cameraDistance);

// 让相机始终朝向场景中心
    camera.lookAt(center);

    // camera.position.set(0, 0, 5);
// camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(map);
  })
}



</script>
<template>
  <div class="w-[100vw] h-[100vh] map" ref="mapRef"></div>
</template>
<style scoped></style>
