/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from 'three';
import SeedScene from './objects/Scene.js';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// import { LegacyJSONLoader } from 'three/examples/jsm/loaders/deprecated/LegacyJSONLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon';
import DOG from './dog/scene.gltf';
import tex1 from './dog/textures/Material_32_diffuse.jpeg';
import tex2 from './dog/textures/Material_32_specularGlossiness.png';
import sbin from './dog/scene.bin';

const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});
const seedScene = new SeedScene();

var controls = new OrbitControls( camera, renderer.domElement );

console.log(DOG.images);
var loader = new GLTFLoader();
loader.load(DOG, (gltf) => {
  console.log(gltf.scene.scale);
  gltf.scene.scale.copy({x : 0.2, y: 0.2, z: 0.2});
  gltf.scene.position.copy(new CANNON.Vec3(20,-15,20));
  seedScene.add(gltf.scene);
  seedScene.land = gltf.scene;
})


// scene
scene.add(seedScene);

// camera
camera.position.set(15,3,-20);
camera.lookAt(new Vector3(0,0,0));

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x7ec0ee, 1);

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  renderer.render(scene, camera);
  seedScene.update && seedScene.update(timeStamp);
  window.requestAnimationFrame(onAnimationFrameHandler);
}
window.requestAnimationFrame(onAnimationFrameHandler);

// resize
const windowResizeHanlder = () => { 
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);

// dom
document.body.style.margin = 0;
document.body.appendChild( renderer.domElement );

