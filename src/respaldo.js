import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIGURACIÓN PREVIA (Igual a tu código) ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050b14, 0.05);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(3, 5, 3);
mainLight.castShadow = true;
scene.add(mainLight);

const rimLight = new THREE.PointLight(0x00d2ff, 3, 10);
rimLight.position.set(0, 0.2, 0);
scene.add(rimLight);

// Escenario
const platformGeo = new THREE.CylinderGeometry(2, 2.2, 0.2, 64);
const platformMat = new THREE.MeshStandardMaterial({ color: 0x101b2b, roughness: 0.3, metalness: 0.8 });
const platform = new THREE.Mesh(platformGeo, platformMat);
platform.position.y = -0.1;
platform.receiveShadow = true;
scene.add(platform);

// Variables para Animaciones y Modelo
let mixer;
const actions = {};
let activeAction;

function fadeToAction(name, duration = 0.5) {
  const previousAction = activeAction;
  activeAction = actions[name];

  if (previousAction && previousAction !== activeAction) {
    previousAction.fadeOut(duration);
  }

  if (activeAction) {
    activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();
  }
}

// 5. Carga Paralela del Modelo y Animaciones Independientes
const loader = new GLTFLoader();

// Promesas para cargar todos los archivos .glb en paralelo
Promise.all([
  loader.loadAsync('/models/avatar.glb'),
  loader.loadAsync('/models/reposo.glb'),
  loader.loadAsync('/models/platicar.glb'),
  loader.loadAsync('/models/correr.glb')
]).then(([avatarGltf, reposoGltf, platicarGltf, correrGltf]) => {

  // A. Añadir el Avatar a la escena
  const model = avatarGltf.scene;
  model.traverse((node) => {
    if (node.isMesh) node.castShadow = true;
  });
  scene.add(model);

  // B. Inicializar el Mezclador de Animaciones en el Avatar
  mixer = new THREE.AnimationMixer(model);

  // C. Vincular las animaciones de los archivos externos al avatar
  if (reposoGltf.animations.length > 0) {
    actions['reposo'] = mixer.clipAction(reposoGltf.animations[0]);
  }
  
  if (platicarGltf.animations.length > 0) {
    actions['platicar'] = mixer.clipAction(platicarGltf.animations[0]);
  }
  
  if (correrGltf.animations.length > 0) {
    actions['correr'] = mixer.clipAction(correrGltf.animations[0]);
  }

  // D. Iniciar con la animación de Reposo
  if (actions['reposo']) {
    fadeToAction('reposo', 0);
  }

}).catch((error) => {
  console.error('Error al cargar uno o más archivos .glb:', error);
});

// 6. Listeners para los Botones
document.getElementById('btn-reposo').addEventListener('click', () => fadeToAction('reposo'));
document.getElementById('btn-platicar').addEventListener('click', () => fadeToAction('platicar'));
document.getElementById('btn-correr').addEventListener('click', () => fadeToAction('correr'));

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

});

// 7. Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

animate();