import * as THREE from "three";

// 创建飞线
export function createFlyingLine(
  startPoint: THREE.Vector3,
  endPoint: THREE.Vector3,
  color: number = 0xff0000,
  height: number = 50,
) {
  const group = new THREE.Group();

  // 1. 创建曲线
  // 计算控制点，使曲线向上弯曲
  const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
  midPoint.z += height; // 控制点的高度，可以调整这个值来改变曲线的弯曲程度

  const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);

  const points = curve.getPoints(50); // 分段数量，越多曲线越平滑
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // 2. 创建材质 (基础线条材质)
  //   const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });

  // 为了实现流动效果，我们通常使用 ShaderMaterial 或者 PointsMaterial 配合纹理
  // 这里我们先用一个简单的 LineDashedMaterial 来示意，后续可以替换为更复杂的 ShaderMaterial

  const material = new THREE.LineDashedMaterial({
    color: color,
    linewidth: 1, // 注意：linewidth 在 WebGL 线条渲染中可能不会按预期工作，通常为1
    scale: 1,
    dashSize: 0.5, // 短划线的大小
    gapSize: 0.2, // 间隙的大小
    transparent: true,
    opacity: 0.8,
  }) as any;

  const line = new THREE.Line(geometry, material);
  line.computeLineDistances(); // 计算线条距离，LineDashedMaterial 需要

  group.add(line);

  // 动画属性
  (group as any).isFlyingLine = true;
  (group as any).animationOffset = 0; // 用于控制 dashOffset 的动画

  // 添加一个更新函数用于动画
  (group as any).animate = () => {
    (group as any).animationOffset -= 0.01; // 调整速度
    if ((group as any).animationOffset < -1000) {
      // 重置，避免数值过大
      (group as any).animationOffset = 0;
    }
    material.dashOffset = (group as any).animationOffset;
    material.needsUpdate = true; // 更新材质
  };

  group.name = "flyingLine";
  return group;
}

// 更高级的飞线可以使用 ShaderMaterial 实现，例如：
export function createAdvancedFlyingLine(
  startPoint: THREE.Vector3,
  endPoint: THREE.Vector3,
  color: number = 0x00ffff,
  height: number = 30,
) {
  const curve = new THREE.QuadraticBezierCurve3(
    startPoint,
    new THREE.Vector3(
      (startPoint.x + endPoint.x) / 2,
      (startPoint.y + endPoint.y) / 2,
      Math.max(startPoint.z, endPoint.z) + height,
    ),
    endPoint,
  );

  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // 创建一个自定义的 ShaderMaterial
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      color: { value: new THREE.Color(color) },
      lineWidth: { value: 2.0 }, // 线宽，在shader中控制
      dashSize: { value: 0.1 }, // 虚线段长度 (0.0 to 1.0)
      gapSize: { value: 0.05 }, // 间隙长度 (0.0 to 1.0)
      opacity: { value: 1.0 },
    },
    vertexShader: `
            attribute float lineDistance;
            varying float vLineDistance;
            uniform float time;
            uniform float lineWidth; // Not directly used by gl_PointSize here, but can be used for other effects

            void main() {
                vLineDistance = lineDistance;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform vec3 color;
            uniform float time;
            uniform float dashSize;
            uniform float gapSize;
            uniform float opacity;
            varying float vLineDistance;

            void main() {
                float totalSize = dashSize + gapSize;
                float currentPos = fract(vLineDistance * 0.1 - time * 0.5); // 0.1 and 0.5 are speed factors

                if (currentPos > gapSize / totalSize) {
                    gl_FragColor = vec4(color, opacity);
                } else {
                    discard; // 或者 gl_FragColor = vec4(color, 0.0);
                }
            }
        `,
    transparent: true,
    // depthWrite: false, // 根据需要调整
    // blending: THREE.AdditiveBlending, // 可选，用于发光效果
  });

  // 为ShaderMaterial计算lineDistance (如果直接用Line，它会自动计算)
  // 对于自定义几何体，我们需要手动添加这个属性
  const lineDistances = [];
  lineDistances.push(0);
  for (let i = 1; i < points.length; i++) {
    lineDistances.push(lineDistances[i - 1] + points[i - 1].distanceTo(points[i]));
  }
  geometry.setAttribute("lineDistance", new THREE.Float32BufferAttribute(lineDistances, 1));

  const line = new THREE.Line(geometry, material);

  const group = new THREE.Group();
  group.add(line);
  group.name = "advancedFlyingLine";

  (group as any).isFlyingLine = true;
  (group as any).animate = () => {
    material.uniforms.time.value += 0.02; // 控制动画速度
    if (material.uniforms.time.value > 100) material.uniforms.time.value = 0; // 重置时间
  };

  return group;
}
