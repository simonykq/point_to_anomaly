import { Group } from "three";
import Land from "./Land/Land.js";
import BasicLights from "./Lights.js";
import * as CANNON from "cannon";
import * as THREE from "three";
import * as FONT from "./helvetiker_regular.typeface.json";
import DATA from "../data/data_normalized";

const OUTLIER_INDICES = [
         23,   42,   53,   54,   55,   57,   58,   59,   60,   63,   70,
         71,   73,   75,   83,   86,   90,   96,  158,  165,  166,  167,
        169,  170,  171,  174,  176,  185,  202,  208,  211,  219,  227,
        248,  249,  254,  322,  332,  341,  342,  352,  371,  377,  378,
        391,  393,  396,  399,  402,  404,  417,  420,  423,  466,  469,
        470,  471,  472,  473,  474,  475,  486,  500,  504,  505,  507,
        519,  524,  528,  562,  563,  589,  598,  601,  608,  619,  629,
        642,  646,  647,  649,  673,  678,  696,  708,  764,  781,  785,
        837,  847,  867,  881,  892,  893,  894,  895,  896,  897,  898,
        899,  900,  901,  903,  917,  944,  956,  958,  970,  972,  973,
        985,  997, 1005, 1007, 1011, 1020, 1029, 1080, 1094, 1096, 1103,
       1112, 1114, 1118, 1131, 1138, 1158, 1160, 1172, 1177, 1181, 1195,
       1215, 1228, 1232, 1270, 1279, 1281, 1282, 1284, 1300, 1302, 1306,
       1316, 1318, 1323, 1344, 1351, 1386, 1393, 1399, 1404, 1411, 1423,
       1431, 1433, 1437, 1450, 1466, 1476, 1510, 1524, 1537, 1552, 1562,
       1575, 1593, 1596, 1649, 1650, 1652, 1653, 1655, 1657, 1658, 1664,
       1676, 1690, 1691, 1692, 1696, 1709, 1717, 1764, 1787, 1788, 1798,
       1801, 1848, 1853, 1855, 1856, 1858, 1860, 1869, 1870, 1890, 1911,
       1918, 1965, 1978, 1979, 1981, 1982, 1983, 1986, 1989, 1993, 1996,
       1998, 2014, 2018, 2019, 2020, 2085, 2090, 2091, 2093, 2094, 2095,
       2098, 2121, 2124, 2126, 2128, 2131, 2134, 2135, 2151, 2155, 2187,
       2205, 2216, 2238, 2245, 2256, 2289, 2301, 2302, 2315, 2322, 2325,
       2326, 2328, 2340, 2341, 2346, 2347, 2390, 2393, 2394, 2395, 2396,
       2401, 2409, 2411, 2418, 2431, 2438, 2451, 2452, 2456, 2465, 2469,
       2494, 2503, 2532, 2542, 2580, 2592, 2597, 2611, 2620, 2678, 2691,
       2696, 2708, 2709, 2714, 2753, 2760, 2776, 2780, 2781, 2783, 2795,
       2800, 2815, 2816, 2817, 2818, 2819, 2820, 2821, 2822, 2823, 2824,
       2825, 2826, 2827, 2832, 2867, 2871, 2879, 2881, 2888, 2904, 2916,
       2938, 2952, 2965, 2971, 2996, 3003, 3008, 3014, 3025, 3026, 3032,
       3045, 3047, 3051, 3062, 3072, 3091, 3104, 3105, 3110, 3131, 3138,
       3143, 3151, 3193, 3197, 3213, 3214, 3220, 3275, 3287, 3317, 3328,
       3342, 3355, 3364, 3366, 3370, 3379, 3382, 3389, 3400, 3409, 3428,
       3433, 3434, 3439, 3475, 3516, 3517, 3572, 3573, 3574, 3576, 3578,
       3579, 3581, 3613, 3614, 3615, 3638, 3641, 3665, 3687, 3711, 3718,
       3723, 3745, 3776, 3777, 3779, 3781, 3782, 3793, 3795, 3841, 3842
]

export default class SeedScene extends Group {
  constructor() {
    super();

    this.G = DATA.length;
    this.mod = 17;
    this.N = 100;

    this.graph = [];
    this.sos = [];

    this.clusterPos = [];
    this.helixPos = [];
    this.sosPos = [];

    // To be synced

    this.meshes = [];
    this.bodies = [];

    this.state = "importing";
    this.fontMessages = {
      importing: {
        text: "Importing ...",
        mesh: undefined,
        material: undefined,
        hidePos: undefined,
      },
      processing: {
        text: "Processing ...",
        mesh: undefined,
        material: undefined,
        hidePos: undefined,
      },
      backflip: {
        text: "Backflip!",
        mesh: undefined,
        material: undefined,
        hidePos: undefined,
      },
      analysis: {
        text: "Analysis ...",
        mesh: undefined,
        material: undefined,
        hidePos: undefined,
      },
      results: {
        text: "View Results",
        mesh: undefined,
        material: undefined,
        hidePos: undefined,
      },
    };

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

    this.initGraph();
    this.initSos();
    this.initCannon();
    this.init();
    this.initText(this);
  }

  updateStage() {
    if (this.done) {
      this.stage = "results";
    } else if (this.spun) {
      this.stage = "analysis";
    } else if (this.spinMove < 0) {
      this.stage = "backflip";
    } else {
      if (this.progress < this.progressMax / 2) {
        this.stage = "processing";
      } else {
        this.stage = "importing";
      }
    }
  }

  updateText() {
    for (var stage in this.fontMessages) {
      if (this.fontMessages[stage].material) {
        if (stage === this.stage) {
          this.fontMessages[stage].material.opacity = 1;
          this.fontMessages[stage].mesh.position.copy(
            this.fontMessages[stage].showPos
          );
        } else {
          this.fontMessages[stage].material.opacity = 0;
          this.fontMessages[stage].mesh.position.copy(
            this.fontMessages[stage].hidePos
          );
        }
      }
    }
  }

  updateGraph(data) {
    var percentDone = Math.min(this.progress / this.progressMax, 0.99);

    for (var i = 0; i !== data.length; i++) {


      if (this.stage === 'results') {
        var sos = this.sosPos[i];
        data[i].mesh.position.copy(sos);
      }
      else if (this.stage === 'analysis') {
        var pos = this.clusterPos[i];
        var sos = this.sosPos[i]; 

        var progress = 1 - percentDone;
        // progress *= 0.005;
        // // console.log(1.0 - progress);
        var px = (1.0 - progress) * pos.x + progress * sos.x;
        var py = (1.0 - progress) * pos.y + progress * sos.y;
        var pz = (1.0 - progress) * pos.z + progress * sos.z;
        var place = new CANNON.Vec3(px, py, pz);

        data[i].mesh.position.copy(place);
      }
      else {

        var done = this.progress < this.progressMax;

        var percentOfGroup = (this.G - i) / this.G;

        // var opacity = percentOfGroup < percentDone ? 1 : 0;
        var opacity = done ? 1 : 1 - percentOfGroup / percentDone;
        data[i].material.opacity = opacity;

        var mod = i % this.mod;

        if (mod != 0 && !done) {
          var helix = this.helixPos[i];
          var cluster = this.clusterPos[i];
          
          //linear interpolation
          // var progress = i / this.G;
          var progress = percentDone;//this.progress / (this.progressMax * percentOfGroup * (1 - percentDone) * 10);
          // progress *= 0.005;
          // console.log(1.0 - progress);
          var px = ((1.0 - progress) * helix.x) + (progress * cluster.x);
          var py = ((1.0 - progress) * helix.y) + (progress * cluster.y);
          var pz = ((1.0 - progress) * helix.z) + (progress * cluster.z);
          var place = new CANNON.Vec3(px, py, pz);

          data[i].mesh.position.copy(place);
        }
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

    this.updateStage();
    this.updateText();
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
      var scale = (this.G - i) * 0.03 + 2;
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

      this.helixPos.push(pos);
      if (mod != 0) {
        var center = this.graph[i - mod].mesh.position;
        var jitterPos = new CANNON.Vec3(
          jitter.x + center.x,
          jitter.y + center.y,
          jitter.z + center.z
        );
        this.clusterPos.push(jitterPos);
      }
      else {
        this.clusterPos.push(pos);
      }
      

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
      var scale = 10;
      var x = DATA[i]['0.391'] * scale;
      var y = DATA[i]['0.916'] * scale;
      var z = DATA[i]['-0.087'] * scale;
      var spos = new CANNON.Vec3(x,y,z);
      this.sosPos.push(spos);


      var color = OUTLIER_INDICES.includes(i) ? 0xff0000 : 0x00ff00;      
    }
  }

  init() {
    var cubeGeo = new THREE.SphereBufferGeometry(this.entitySize);
    // var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    cubeMaterial.transparent = true;
    for (var i = 0; i < this.N; i++) {
      var cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
      cubeMesh.castShadow = true;
      this.meshes.push(cubeMesh);
      this.add(cubeMesh);
    }
  }

  initText(self) {
    var loader = new THREE.FontLoader();

    loader.load(FONT, function (font) {
      var i = 2;
      for (var stage in self.fontMessages) {
        var message = self.fontMessages[stage].text;

        i++;

        var fontMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        fontMaterial.transparent = true;

        var fontGeometry = new THREE.TextGeometry(message, {
          font: font,
          size: 80,
          height: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 10,
          bevelSize: 8,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        var fontMesh = new THREE.Mesh(fontGeometry, fontMaterial);
        self.fontMessages[stage].mesh = fontMesh;
        self.fontMessages[stage].material = fontMaterial;
        self.fontMessages[stage].hidePos = new THREE.Vector3(-10, -10 * i, -10);
        self.fontMessages[stage].showPos = new THREE.Vector3(-10, -10, -10);

        fontMesh.position.copy(new THREE.Vector3(-10, -10 * i, -10));
        fontMesh.quaternion.setFromAxisAngle(
          new THREE.Vector3(0.01, 1, 0),
          Math.PI - 0.65
        );
        fontMesh.scale.copy({ x: 0.01, y: 0.01, z: 0.01 });

        self.add(fontMesh);
      }
    });
  }
}
