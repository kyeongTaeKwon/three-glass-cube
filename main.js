import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

const scene = new THREE.Scene();
scene.background == new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(1, 2, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
(scene.background = new THREE.Color("#0a3cce")),
  document.body.appendChild(renderer.domElement);

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper(size, divisions);
const axesHelper = new THREE.AxesHelper(1);

axesHelper.setColors("red", "green", "blue");

scene.add(axesHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0;
controls.maxDistance = 200;
controls.enableDamping = true;
controls.enableZoom = true;

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
renderer.render(scene, camera);

const pmrmGenerator = new THREE.PMREMGenerator(renderer);
let envMap;

const exrLoader = new EXRLoader();

const glassBackMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#0a3cce"),
  metalness: 1,
  roughness: 0,
  opacity: 0.5,
  side: THREE.BackSide,
  transparent: true,
  envMapIntensity: 5,
  premultipliedAlpha: true,
  reflectivity: 1,
});

const glassFrontMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#0a3cce"),
  metalness: 1,
  roughness: 0,
  opacity: 0.2,
  side: THREE.FrontSide,

  transparent: true,
  envMapIntensity: 10,
  premultipliedAlpha: true,
  reflectivity: 1,
});
const gltfLoader = new GLTFLoader();

const objects = [];
gltfLoader.load("models/glass-cube.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.name === "Cube") {
        child.material = glassBackMaterial;
        const second = child.clone();
        second.material = glassFrontMaterial;

        const parent = new THREE.Group();
        parent.add(second);
        parent.add(child);

        scene.add(parent);

        objects.push(parent);
      }
    } else {
      scene.add(child);
    }
  });
});

exrLoader.load("/texture/studio_small_09_4k.exr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  glassFrontMaterial.envMap = glassBackMaterial.envMap =
    pmrmGenerator.fromEquirectangular(texture).texture;
  glassFrontMaterial.needsUpdate = glassBackMaterial.needsUpdate = true;
});

function animate() {
  requestAnimationFrame(animate);

  render();
}

const render = () => {
  if (glassBackMaterial !== undefined && glassFrontMaterial !== undefined) {
    let newColor = glassBackMaterial.color;
  }

  renderer.toneMappingExposure = 0.6;
  camera.lookAt(scene.position);

  for (let i = 0, l = objects.length; i < l; i++) {
    const object = objects[i];

    object.rotation.y += 0.02;
  }
  renderer.render(scene, camera);
};

pmrmGenerator.compileEquirectangularShader();

animate();
