<script setup lang="ts">
  import * as THREE from "three";
  import { nextTick } from "vue";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { getMapData } from "../../api/map";
  import { createMap } from "../../utils/mesh/map-mesh.ts";
  import gsap from "gsap";
  import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
  // import { box3, setCenter, setScale, getDepth } from "../../utils/map.ts";

  let map: any;
  let node: any;
  let renderer: THREE.WebGLRenderer;
  let css2Renderer: any;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let scene: THREE.Scene;
  const raycaster = new THREE.Raycaster();
  let selectedObject: any;
  nextTick(() => {
    // 创建场景
    scene = new THREE.Scene();
    node = document.getElementsByClassName("map")[0] as HTMLElement;
    // const { width, height } = node.getBoundingClientRect();
    // 创建相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    node.appendChild(renderer.domElement);

    // 2d 渲染器
    // 2d渲染器
    css2Renderer = new CSS2DRenderer();
    css2Renderer.setSize(window.innerWidth, window.innerHeight);
    css2Renderer.domElement.style.position = "absolute";
    css2Renderer.domElement.style.top = "0px";
    css2Renderer.domElement.style.left = "0px";
    css2Renderer.domElement.style.pointerEvents = "none";
    node.appendChild(css2Renderer.domElement);

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    // 创建坐标系辅助器，显示 X, Y, Z 轴
    var axesHelper = new THREE.AxesHelper(1000); // 参数表示坐标轴的长度
    scene.add(axesHelper);

    initMap();

    // 渲染
    animate();

    // 注册事件
    setClickEvent();
    setMouseOverEvent();
  });

  // 鼠标事件
  const setClickEvent = () => {
    const mouse = new THREE.Vector2();
    // 点击事件
    window.addEventListener("click", (event) => {
      // 将鼠标坐标归一化到 -1 ~ +1
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 发射射线
      raycaster.setFromCamera(mouse, camera);

      // 获取地图的mesh
      const provinceMeshList = scene.getObjectByName("mapMesh") as any;

      // 检查交叉对象（你可以指定目标组）
      let intersects = raycaster.intersectObjects(provinceMeshList, false);
      if (intersects?.length > 0) {
        // const firstHit = intersects[0].object as any;
        // // 查找顶级 Object3D
        // const targetRoot = firstHit.parent; // 或使用递归向上找特定组
        // // 取消前一个高亮
        // if (selectedObject) {
        //   unhighlightObject3D(selectedObject);
        // }
        // // 应用高亮（例如用 emissive 增亮）
        // highlightObject3D(targetRoot);
        // selectedObject = targetRoot;
      }
    });
  };

  const handleEvent = (e: MouseEvent) => {
    if (map) {
      let mouse = new THREE.Vector2();
      let getBoundingClientRect = node.getBoundingClientRect();
      let x = ((e.clientX - getBoundingClientRect.left) / getBoundingClientRect.width) * 2 - 1;
      let y = -((e.clientY - getBoundingClientRect.top) / getBoundingClientRect.height) * 2 + 1;
      mouse.x = x;
      mouse.y = y;

      raycaster.setFromCamera(mouse, camera);
      // 获取地图的mesh
      // const provinceMeshList = scene.getObjectByName("mapObject3D").children as any;
      let intersects = raycaster.intersectObjects(map.provinceMeshList, false);

      console.log(intersects, "intersects");

      if (intersects.length) {
        let temp = intersects[0].object;
        animation(temp.parent);
      } else {
        animation();
      }
    }
  };
  const setMouseOverEvent = () => {
    node.addEventListener("mousemove", handleEvent);
  };

  function animation(province?: any) {
    if (province) {
      if (!province.isHover) {
        province.isHover = true;
        map.children.forEach((item: any) => {
          if (item.properties === province.properties) {
            gsap.to(province.position, {
              z: 100,
              duration: 0.6,
            });
          } else {
            resetAnimation(item);
          }
        });
      }
    } else {
      resetAllAnimation();
    }
  }

  function resetAnimation(province: any) {
    gsap.to(province.position, {
      z: 0,
      duration: 0.6,
      onComplete: () => {
        province.isHover = false;
      },
    });
  }

  function resetAllAnimation() {
    map.children.forEach((item: any) => {
      resetAnimation(item);
    });
  }

  // 注册 click
  const registerClick = () => {};

  // 创建动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    // 渲染场景
    renderer.render(scene, camera);

    // 渲染 CSS2D 标签
    css2Renderer.render(scene, camera);
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
    initLight();
    // 渲染地图
    loadMapData(100000);
  };

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
    getMapData(code).then((res) => {
      map = createMap(res) as any;

      // 计算场景的边界
      var box = new THREE.Box3().setFromObject(map); // 使用立方体作为参考
      var center = box.getCenter(new THREE.Vector3()); // 获取场景中心
      var size = box.getSize(new THREE.Vector3()); // 获取场景大小

      // 根据场景的大小来调整相机的远近
      var maxDim = Math.max(size.x, size.y, size.z);
      var cameraDistance = maxDim * 1.5; // 给定相机距离为最大维度的1.5倍

      // 设置相机的位置
      camera.position.set(center.x, -1000, cameraDistance);

      // 让相机始终朝向场景中心
      camera.lookAt(center);

      // camera.position.set(0, 0, 5);
      // camera.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(map);
    });
  };
</script>
<template>
  <div class="w-[100vw] h-[100vh] map" ref="mapRef"></div>
</template>
<style scoped></style>
