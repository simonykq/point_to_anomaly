import { Group } from "three";
import Land from "./Land/Land.js";
import BasicLights from "./Lights.js";
import * as CANNON from "cannon";
import * as THREE from "three";
import DATA from "../data/data";

export default class SeedScene extends Group {
  constructor() {
    super();

    this.G = 300;
    this.mod = 17;
    this.N = 100;

    this.graph = [];
    this.sos = [];

    // To be synced
    this.meshes = [];
    this.bodies = [];

    this.world = undefined;
    this.dt = 1 / 60;
    this.f = 10000;
    this.entitySize = 0.2;
    this.spawn = new CANNON.Vec3(-100, 5, 0);
    this.start = new CANNON.Vec3(20, 0, 20);
    this.mass = 5;
    this.radius = 1.3;
    this.boxShape = new CANNON.Sphere(this.radius);
    this.progress = 0;
    this.progressMax = -30;
    this.spinMove = 0;
    this.inputStop = false;
    this.spun = false;
    this.done = false;

    this.land = new Land();

    this.land.position.copy(new CANNON.Vec3(40, 0, 40));
    // const flower = new Flower();
    this.lights = new BasicLights();

    this.add(this.lights);

    // this.initGraph();
    this.initSos();
    this.initCannon();
    this.init();
  }

  updateGraph(data) {
    for (var i = 0; i !== data.length; i++) {
      var done = this.progress < this.progressMax;

      var percentDone = Math.min(this.progress / this.progressMax, 0.99);
      var percentOfGroup = (this.G - i) / this.G;

      // var opacity = percentOfGroup < percentDone ? 1 : 0;
      var opacity = done ? 1 : 1 - percentOfGroup / percentDone;
      data[i].material.opacity = opacity;

      var mod = i % this.mod;

      if (mod != 0 && !done) {
        var pos = data[i].mesh.position;

        var center = data[i - mod].mesh.position;
        var jitter = data[i].jitter;
        var jitterPos = new CANNON.Vec3(
          jitter.x + center.x,
          jitter.y + center.y,
          jitter.z + center.z
        );

        //linear interpolation
        // var progress = i / this.G;
        var progress =
          this.progress /
          (this.progressMax * percentOfGroup * (1 - percentDone) * 10);
        progress *= 0.005;
        // console.log(1.0 - progress);
        var px = (1.0 - progress) * pos.x + progress * jitterPos.x;
        var py = (1.0 - progress) * pos.y + progress * jitterPos.y;
        var pz = (1.0 - progress) * pos.z + progress * jitterPos.z;
        var place = new CANNON.Vec3(px, py, pz);

        data[i].mesh.position.copy(place);
      }

      // data[i].mesh.position.copy(position);
      // var opacity = mod == 0 ? 1 : 0;

      //put the clusters at mod(i)X == 0
      //group mod!=0 around mod0 point
      //transition from helix to graph slowly by moving from helix point to graph * param
    }
  }

  updatePhysics() {
    this.world.step(this.dt);
    this.progress += -this.dt;
    for (var i = 0; i !== this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);

      if (this.bodies[i].position.x > this.progress) {
        this.world.remove(this.bodies[i]);
        this.bodies[i] = this.ball();
        this.world.addBody(this.bodies[i]);
      }

      if (this.inputStop) {
        this.meshes[i].material.opacity = 0;
      }
    }
  }

  update(timeStamp) {
    if (this.done) {
      return;
    }
    if (this.spun) {
      this.progress += this.dt;
      if (this.progress > 0) {
        this.done = true;
      }
    } else {
      this.progress -= this.dt;
    }

    this.updatePhysics();
    this.updateGraph(this.graph);
    // this.updateGraph(this.sos);

    if (this.spun) {
      this.land.position.x += this.dt;
      if (this.done) {
        var rotation = this.land.quaternion.clone();
        rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
        this.land.quaternion.copy(rotation);
      }
    } else {
      this.land.position.x -= this.dt;
    }
    if (this.progress < this.progressMax) {
      // this.land.visible = false;
      var rotation = this.land.quaternion.clone();

      if (this.spinMove <= 0) {
        this.inputStop = true;
        this.spinMove -= this.dt;
        rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 1), this.spinMove);
        // this.land.position.y += this.dt;
      }

      if (this.spinMove < -6.28) {
        this.spinMove = 0.01;
        this.spun = true;
        rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      }
      this.land.quaternion.copy(rotation);
    }
    // this.rotation.y = timeStamp / 10000;
  }

  ball() {
    var boxBody = new CANNON.Body({
      mass: this.mass,
    });
    boxBody.addShape(this.boxShape);
    var jitterSpace = 2;
    var jitter = new CANNON.Vec3(
      Math.random() * jitterSpace,
      Math.random() * jitterSpace,
      Math.random() * jitterSpace
    );

    boxBody.position.set(
      this.spawn.x + jitter.x,
      this.spawn.y + jitter.y,
      this.spawn.z + jitter.z
    );

    var worldPoint = new CANNON.Vec3(0, 0, 0);
    var force = this.f * this.dt;
    var impulse = new CANNON.Vec3(force, 0, 0.25 * force);
    boxBody.applyImpulse(impulse, worldPoint);

    return boxBody;
  }

  initCannon() {
    // Setup our world
    this.world = new CANNON.World();
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;

    this.world.gravity.set(0, -5, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    // Create boxes

    // var boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));

    for (var i = 0; i < this.N; i++) {
      var body = this.ball();
      this.world.addBody(body);
      this.bodies.push(body);
    }

    // Create a plane
    // var groundShape = new CANNON.Plane();
    // var groundBody = new CANNON.Body({ mass: 0 });
    // groundBody.addShape(groundShape);
    // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    // this.world.addBody(groundBody);

    // Joint body
    // var shape = new CANNON.Sphere(this.entitySize);
    // var jointBody = new CANNON.Body({ mass: 0 });
    // jointBody.addShape(shape);
    // jointBody.collisionFilterGroup = 0;
    // jointBody.collisionFilterMask = 0;
    // this.world.addBody(jointBody)
  }

  initGraph() {
    var cubeGeo = new THREE.SphereBufferGeometry(this.entitySize);
    // var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

    for (var i = 0; i < this.G; i++) {
      var mod = i % this.mod;
      var color = mod == 0 ? 0xff0000 : 0x888888;

      var cubeMaterial = new THREE.MeshPhongMaterial({ color: color });
      var cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
      var scale = (this.G - i) * 0.2;
      var start = this.start;
      var x = -scale * 0.2 * Math.cos(scale);
      var y = -scale * 0.2 * Math.sin(scale);
      var z = 0.5 * -scale;

      var helix = new CANNON.Vec3(z, y, x);
      var pos = new CANNON.Vec3(
        start.x + helix.x,
        start.y + helix.y,
        start.z + helix.z
      );
      cubeMesh.position.copy(pos);
      cubeMesh.castShadow = true;

      cubeMaterial.transparent = true;

      var mod = i % this.mod;
      var flip = i % 2 == 0 ? 1 : -1;
      var jitterSpace = 1;
      var jitter = new CANNON.Vec3(
        Math.random() * jitterSpace,
        Math.random() * jitterSpace,
        Math.random() * jitterSpace
      );
      var jitterPos = new CANNON.Vec3(
        flip * jitter.x,
        flip * jitter.y,
        flip * jitter.z
      );

      this.graph.push({
        mesh: cubeMesh,
        material: cubeMaterial,
        jitter: jitterPos,
      });
      this.add(cubeMesh);
    }
  }

  initSos() {
    for (var i = 0; i < DATA.length; i++) {
      var mod = i % this.mod;
      var color = mod == 0 ? 0xff0000 : 0x888888;

      var cubeGeo = new THREE.SphereBufferGeometry(
        DATA[i][0],
        DATA[i][1],
        DATA[i][2]
      );

      var cubeMaterial = new THREE.MeshPhongMaterial({ color: color });
      var cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
      var scale = (DATA.length - i) * 0.2;
      var start = this.start;
      var x = DATA[i][0] * scale;
      var y = DATA[i][1] * scale;
      var z = DATA[i][2] * scale;

      var helix = new CANNON.Vec3(z, y, x);
      var pos = new CANNON.Vec3(helix.x, helix.y, helix.z);
      cubeMesh.position.copy(pos);
      cubeMesh.castShadow = true;
      // cubeMaterial.transparent = true;

      var mod = i % this.mod;
      var flip = i % 2 == 0 ? 1 : -1;
      var jitterSpace = 1;
      var jitter = new CANNON.Vec3(
        Math.random() * jitterSpace,
        Math.random() * jitterSpace,
        Math.random() * jitterSpace
      );
      var jitterPos = new CANNON.Vec3(
        flip * jitter.x,
        flip * jitter.y,
        flip * jitter.z
      );

      this.sos.push({
        mesh: cubeMesh,
        material: cubeMaterial,
        jitter: jitterPos,
      });
      this.add(cubeMesh);
    }
  }

  init() {
    var cubeGeo = new THREE.SphereGeometry(this.entitySize);
    // var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    for (var i = 0; i < this.N; i++) {
      var cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
      cubeMesh.castShadow = true;
      this.meshes.push(cubeMesh);
      this.add(cubeMesh);
    }
  }
}
