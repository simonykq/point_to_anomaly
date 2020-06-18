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
import CORGI from "./corgi/dog_corgi_animated/scene.gltf"; 
import tex1 from "./corgi/dog_corgi_animated/textures/dog_diffuse_diffuse.png";
import sbin from "./corgi/dog_corgi_animated/scene.bin";
import bg from './bg.png';

const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});
const seedScene = new SeedScene();

var controls = new OrbitControls( camera, renderer.domElement );

console.log(CORGI.images);
var loader = new GLTFLoader();
loader.load(CORGI, (gltf) => {
  // console.log(gltf.scene.scale);
  gltf.scene.scale.copy({x : 10, y: 10, z: 10});
  gltf.scene.rotateY(-90);
  gltf.scene.position.copy(new CANNON.Vec3(20, -15, 20));
  seedScene.add(gltf.scene);
  seedScene.land = gltf.scene;
})


// scene
scene.add(seedScene);


const texloader = new THREE.TextureLoader();
const bgTexture = texloader.load(bg);
bgTexture.repeat.x = 2;
bgTexture.repeat.y = 2;
scene.background = bgTexture;

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

