import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const guiParams = {
  particleCount: 5000,
  particleSize: 0.005,
  branches: 3,
  radius: 2,
  spin: 1,
  randomness: 1,
  randomnessPower: 3,
};

gui
  .add(guiParams, "particleCount")
  .min(100)
  .max(300000)
  .step(100)
  .onFinishChange(generateGalaxy);

gui
  .add(guiParams, "particleSize")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(guiParams, "branches")
  .min(3)
  .max(30)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(guiParams, "radius")
  .min(0.1)
  .max(100)
  .step(0.1)
  .onFinishChange(generateGalaxy);

gui
  .add(guiParams, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(guiParams, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(guiParams, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

guiParams.insideColor = "#ff6030";
guiParams.outsideColor = "#1b3984";

gui.addColor(guiParams, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(guiParams, "outsideColor").onFinishChange(generateGalaxy);

let geometry = null;
let material = null;
let points = null;

function generateGalaxy() {
  // Clean-up
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  // Geometry
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(guiParams.particleCount * 3);
  const colors = new Float32Array(guiParams.particleCount * 3);

  const insideColor = new THREE.Color(guiParams.insideColor);
  const outsideColor = new THREE.Color(guiParams.outsideColor);

  for (let i = 0; i < guiParams.particleCount; i++) {
    const step = i * 3;

    const branchAngle =
      (2 * Math.PI * (i % guiParams.branches)) / guiParams.branches;
    const radius = guiParams.radius * Math.random();
    const spinAngle = guiParams.spin * radius;

    // add randomness among the branches
    const randomX =
      Math.pow(Math.random(), guiParams.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      guiParams.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), guiParams.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      guiParams.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), guiParams.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      guiParams.randomness *
      radius;

    positions[step] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[step + 1] = randomY;
    positions[step + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / guiParams.radius);

    colors[step] = mixedColor.r;
    colors[step + 1] = mixedColor.g;
    colors[step + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Material
  material = new THREE.PointsMaterial({
    size: guiParams.particleSize,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);
}

generateGalaxy();

// const ambientLight = new THREE.AmbientLight(0xfff, 3);
// scene.add(ambientLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
