<script setup lang="ts">
  import * as THREE from "three";
  import { nextTick } from "vue";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { getMapData } from "../../api/map";
  import { createMap } from "../../utils/mesh/map-mesh.ts";
  import { creatFloor } from "../../utils/mesh/bg-mesh.ts";
  import { createAdvancedFlyingLine } from "../../utils/mesh/line-mesh.ts"; // 导入飞线函数
  import gsap from "gsap";
  import { initThree, projection } from "../../utils/map.ts"; // 假设 projection 在这里
  import popBox from "../../components/Pop-box.vue";
  import { createMarkBox } from "../../utils/mesh/pop-mesh.ts";
  import chinaJson from "../../assets/china.json";
  let flyingLines: any;
  let map: any;
  let node: any;
  let renderer: THREE.WebGLRenderer;
  let css2Renderer: any;
  let camera: THREE.Camera;
  let controls: OrbitControls;
  let scene: THREE.Scene;
  const raycaster = new THREE.Raycaster();
  // let selectedObject: any;
  nextTick(() => {
    node = document.getElementsByClassName("map")[0] as HTMLElement;
    ({ camera, renderer, scene, controls, css2Renderer } = initThree(node, [window.innerWidth, window.innerHeight]));
    controls.update;
    // controls.minDistance = 50;
    // controls.maxDistance = 1000;
    // controls.maxPolarAngle = Math.PI / 2 - 0.1;
    // // 创建坐标系辅助器，显示 X, Y, Z 轴
    // var axesHelper = new THREE.AxesHelper(1000); // 参数表示坐标轴的长度
    // scene.add(axesHelper);

    // 创建一个网格辅助器（GridHelper）
    const size = 1000; // 网格的大小
    const divisions = 10; // 网格的划分数
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    // 限制垂直旋转角度（俯仰角），这里限制在45度到135度之间
    controls.minPolarAngle = Math.PI / 4; // 45度
    controls.maxPolarAngle = (Math.PI * 3) / 4; // 135度

    // 限制水平旋转角度（偏航角），这里限制在-90度到90度之间
    controls.minAzimuthAngle = -Math.PI / 4; // -90度
    controls.maxAzimuthAngle = Math.PI / 4; // 90度

    // gsap.to(camera.position, {
    //   x: 0,
    //   y: -800,
    //   z: 1000,
    //   duration: 1,
    //   ease: "power1.inOut",
    // });

    //  初始化地图
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
      // const provinceMeshList = scene.getObjectByName("mapMesh") as any;

      // 检查交叉对象（你可以指定目标组）
      let intersects = raycaster.intersectObjects(map.provinceMeshList || [], false);
      if (intersects && intersects.length > 0) {
        // 创建详情弹窗
        console.log();
        const tempFeature = intersects[0].object.parent?.feature;
        if (tempFeature) {
          createMarkBox(tempFeature);
        }
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

      if (intersects && intersects?.length) {
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
  // const registerClick = () => {};
  const delta = new THREE.Clock().getDelta();
  // 创建动画循环
  const animate = () => {
    requestAnimationFrame(animate);

    // 清除深度缓存，让下一个渲染不受深度测试影响
    renderer.clearDepth();

    // 遍历场景中所有对象
    scene.traverse((obj: any) => {
      if (typeof obj.animate === "function") {
        obj.animate(obj, delta);
      }
    });

    // 更新飞线动画 (如果飞线自身的animate方法不够用，或者有统一管理的需求)
    // flyingLines.forEach(lineGroup => {
    //   if (lineGroup && typeof (lineGroup as any).animate === 'function') {
    //     (lineGroup as any).animate();
    //   }
    // });

    // 渲染场景
    renderer.render(scene, camera);

    // 渲染 CSS2D 标签
    css2Renderer.render(scene, camera);

    // TWEEN.update();
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
    loadFloor();
    // 初始化光源
    initLight();
    // 渲染地图
    loadMapData(100000);
  };

  // 背景图
  const loadFloor = () => {
    if (!scene) return;
    const bgMesh = creatFloor();
    scene.add(bgMesh);
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

  const loadMapData = (code: number) => {
    map = createMap(chinaJson) as any;

    // 计算场景的边界
    var box = new THREE.Box3().setFromObject(map); // 使用立方体作为参考
    var center = box.getCenter(new THREE.Vector3()); // 获取场景中心
    var size = box.getSize(new THREE.Vector3()); // 获取场景大小

    // 根据场景的大小来调整相机的远近
    var maxDim = Math.max(size.x, size.y, size.z);
    var cameraDistance = maxDim * 1.5; // 给定相机距离为最大维度的1.5倍

    // 设置相机的位置
    camera.position.set(center.x, 1000, cameraDistance);

    // 让相机始终朝向场景中心
    camera.lookAt(center);

    // camera.position.set(0, 0, 5);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(map);

    // 地图加载完毕后，可以根据地图数据添加飞线
    addFlyingLinesFromMapData(chinaJson);
  };

  // 根据地图数据添加飞线 (示例)
  const addFlyingLinesFromMapData = (geoJsonData: any) => {
    // 假设 geoJsonData.features 包含各个省份的信息，并且有 centroid
    if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 1) {
      // 例如，从第一个省份的中心点到第二个省份的中心点
      const feature1 = geoJsonData.features[0];
      const feature2 = geoJsonData.features[19];

      if (feature1.properties && feature1.properties.centroid && feature2.properties && feature2.properties.centroid) {
        const [x1, y1] = projection(feature1.properties.centroid) as [number, number];
        const start = new THREE.Vector3(x1, -y1, 100); // Z轴设为10，确保在地图上方

        const [x2, y2] = projection(feature2.properties.centroid) as [number, number];
        const end = new THREE.Vector3(x2, -y2, 100);

        const flyLine = createAdvancedFlyingLine(start, end, 0x2a669d, 200);
        scene.add(flyLine);
        flyingLines?.push(flyLine);
      }
    }
  };
</script>
<template>
  <div class="w-[100vw] h-[100vh] map" ref="mapRef"></div>
  <popBox />
</template>
<style scoped></style>
