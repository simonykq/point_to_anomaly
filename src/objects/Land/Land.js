import { Group, ObjectLoader } from 'three';
// import { LegacyJSONLoader } from 'three/examples/jsm/loaders/deprecated/LegacyJSONLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import MODEL from './land.json';
import DOG from './dog/scene.gltf';

export default class Land extends Group {
  constructor() {
    const loader = new ObjectLoader();
    
    super();

    this.name = 'land';

    // loader.load(MODEL, (mesh)=>{
    //   this.add(mesh);
    // });

    loader.load(MODEL, (mesh)=>{
      this.add(mesh);
    });
  }
}
