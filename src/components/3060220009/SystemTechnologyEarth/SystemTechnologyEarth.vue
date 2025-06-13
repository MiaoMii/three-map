<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import Earth from "./Earth";
  import Data from "./Data";
  import { propsNew } from "@/interfaces";
  import { Resources } from "@/components/SystemComponents/30602/3060220009/SystemTechnologyEarth/Resources";
  const props = defineProps(propsNew);
  const threeContainer = ref();
  let scene = null,
    camera = null,
    controls = null,
    earth = null,
    resources = null;
  const renderer = new THREE.WebGLRenderer({
    alpha: true, // 透明
    antialias: true, // 抗锯齿
  });
  //创建渲染器
  const addRenderer = () => {
    // 创建渲染器
    renderer.setSize(props.item.width, props.item.height);
    renderer.setPixelRatio(Number(props.scale));
    threeContainer.value?.appendChild(renderer.domElement);
  };
  const addCamera = () => {
    camera = new THREE.PerspectiveCamera(45, props.item.width / props.item.height, 1, 100000);
    camera.position.set(0, 30, -250);
  };
  const addControls = () => {
    // 鼠标控制      相机，渲染dom
    controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotateSpeed = 3;
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
    controls.dampingFactor = 0.05;
    // 是否可以缩放
    controls.enableZoom = true;
    // 设置相机距离原点的最远距离
    controls.minDistance = 100;
    // 设置相机距离原点的最远距离
    controls.maxDistance = 300;
    // 是否开启右键拖拽
    controls.enablePan = false;
  };
  const initScene = () => {
    scene = new THREE.Scene();
    addCamera();
    renderer.dispose();
    addRenderer();
  };

  const createEarth = async () => {
    earth = new Earth({
      data: Data,
      dom: threeContainer.value,
      textures: resources.textures,
      earth: {
        radius: 50,
        rotateSpeed: 0.002,
        isRotation: true,
      },
      satellite: {
        show: true,
        rotateSpeed: -0.01,
        size: 1,
        number: 2,
      },
      punctuation: {
        circleColor: 0x3892ff,
        lightColumn: {
          startColor: 0xe4007f, // 起点颜色
          endColor: 0xffffff, // 终点颜色
        },
      },
      flyLine: {
        color: 0xf3ae76, // 飞线的颜色
        flyLineColor: 0xff7714, // 飞行线的颜色
        speed: 0.004, // 拖尾飞线的速度
      },
    });

    scene.add(earth.group);

    await earth.init();
  };
  const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
    earth.render();
  };
  const initEarth = async () => {
    resources = new Resources(async () => {
      await createEarth();
      render();
    });
  };

  onMounted(() => {
    initScene();
    addControls();
    initEarth();
  });

  const resizeScene = () => {
    renderer.setSize(Number(props.item.width), Number(props.item.height));
    camera.aspect = Number(props.item.width / props.item.height);
    camera.updateProjectionMatrix();
  };

  watch(
    () => [props.item.width, props.item.height],
    () => {
      resizeScene();
    },
  );
</script>

<template>
  <div id="html2canvas" class="css3d-wapper">
    <div class="fire-div"></div>
  </div>
  <div ref="threeContainer" id="earth-canvas"> </div>
</template>
<style lang="scss">
  .css3d-wapper {
    pointer-events: none;
    color: #fff;
  }

  .css3d-wapper .fire-div {
    font-size: 20px;
    font-weight: 600;
    border-top: 3px solid #0cd1eb;
    padding: 6px 8px;
    min-width: 50px;
    background: rgba(40, 108, 181, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "PingFang-SC-Bold", serif;
  }
</style>
<style scoped lang="scss">
  #html2canvas {
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0);
  }
  #earth-canvas {
    height: 100%;
    width: 100%;
    background: #010826;
  }
</style>
