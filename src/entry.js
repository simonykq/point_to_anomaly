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
import CORGI from "./corgi/scene.gltf"; 
import tex1 from "./corgi/textures/dog_diffuse_diffuse.png";
import sbin from "./corgi/scene.bin";

import bg from './bg.png';

const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});
const seedScene = new SeedScene();

var controls = new OrbitControls( camera, renderer.domElement );

var mixer;
var clock = new THREE.Clock();

var playing = undefined;
var jump = undefined;
var sit = undefined;
var run = undefined;

var loader = new GLTFLoader();
loader.load(CORGI, (gltf) => {
  // console.log(gltf.scene.scale);
  gltf.scene.scale.copy({x : 5, y: 5, z: 5});
  gltf.scene.rotateY(-90);
  gltf.scene.position.copy(new CANNON.Vec3(20, -15, 20));
  seedScene.add(gltf.scene);
  seedScene.land = gltf.scene;

  mixer = new THREE.AnimationMixer(gltf.scene);

  jump = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, "Jump"));
  sit = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, "Sitting"));
  run = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, "Run"));

  playing = "importing";
  jump.play();
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
  var stage = seedScene.getStage();
  

  seedScene.update && seedScene.update(timeStamp);

  if (mixer) {

    if (stage === 'processing' && playing !== 'processing') {
      playing = 'processing'
      jump.stop();
      run.play();
    }
    if (stage === 'backflip' && playing !== 'backflip') {
      playing = 'backflip'
      run.stop();
      sit.play();
    }
    if (stage === 'analysis' && playing !== 'analysis') {
      playing = 'analysis'
      sit.stop()
      jump.play();
    }
    if (stage === 'results' && playing !== 'results') {
      playing = 'results'
      jump.stop();
      sit.play();
      run.stop();
    }

    var delta = clock.getDelta();
    mixer.update(delta);
  }

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

