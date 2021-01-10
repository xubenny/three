function init() {
  const renderer = initRenderer();
  const camera = initCamera(new THREE.Vector3(0, 20, 40));
  const trackballControls = initTrackballControls(camera, renderer);
  var clock = new THREE.Clock();

  var scene = new THREE.Scene();
  var groundPlane = addLargeGroundPlane(scene)
  groundPlane.position.y = -10;
  initDefaultLighting(scene);
  scene.add(new THREE.AmbientLight(0x444444));

  var textureLoader = new THREE.TextureLoader();
  var gui = new dat.GUI();
  var controls = {};

  var cube = new THREE.BoxGeometry(10, 10, 10)
  var cubeMesh = addGeometry(scene, cube, 'cube', textureLoader.load('./textures/stone.jpg'), gui, controls);

  render();
  function render() {
    trackballControls.update(clock.getDelta());
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    cubeMesh.rotation.x += 0.01;
    cubeMesh.rotation.y += 0.02;
    cubeMesh.rotation.z += 0.03;
  }
}

function initRenderer() {
  const renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById("webgl-output").appendChild(renderer.domElement);

  return renderer;
}

/**
 * Initialize a simple camera and point it at the center of a scene
 *
 * @param {THREE.Vector3} [initialPosition]
 */
function initCamera(initialPosition) {
  const position = (initialPosition !== undefined) ? initialPosition : new THREE.Vector3(-30, 40, 30);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.copy(position);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
}

/**
 * Initialize trackball controls to control the scene
 *
 * @param {THREE.Camera} camera
 * @param {THREE.Renderer} renderer
 */
function initTrackballControls(camera, renderer) {
  var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

  return trackballControls;
}

/**
 * Add a simple ground plance to the provided scene
 *
 * @param {THREE.Scene} scene
 */
function addLargeGroundPlane(scene, useTexture) {

  var withTexture = (useTexture !== undefined) ? useTexture : false;

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(10000, 10000);
  var planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff
  });
  if (withTexture) {
      var textureLoader = new THREE.TextureLoader();
      planeMaterial.map = textureLoader.load("../../assets/textures/general/floor-wood.jpg");
      planeMaterial.map.wrapS = THREE.RepeatWrapping;
      planeMaterial.map.wrapT = THREE.RepeatWrapping;
      planeMaterial.map.repeat.set(80,80)
  }
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;

  scene.add(plane);

  return plane;
}

function initDefaultLighting(scene, initialPosition) {
  var position = (initialPosition !== undefined) ? initialPosition : new THREE.Vector3(-10, 30, 40);

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 15;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.05;
  spotLight.name = "spotLight"

  scene.add(spotLight);

  var ambientLight = new THREE.AmbientLight(0x343434);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
}

function addGeometry(scene, geom, name, texture, gui, controls) {
  var mat = new THREE.MeshStandardMaterial(
    {
      map: texture,
      metalness: 0.2,
      roughness: 0.07
  });
  var mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;

  scene.add(mesh);
  addBasicMaterialSettings(gui, controls, mat, name + '-THREE.Material');
  addSpecificMaterialSettings(gui, controls, mat, name + '-THREE.MeshStandardMaterial');

  return mesh;
};

/**
 * Add a folder to the gui containing the basic material properties.
 *
 * @param gui the gui to add to
 * @param controls the current controls object
 * @param material the material to control
 * @param geometry the geometry we're working with
 * @param name optionally the name to assign to the folder
 */
function addBasicMaterialSettings(gui, controls, material, name) {

  var folderName = (name !== undefined) ? name : 'THREE.Material';

  controls.material = material;

  var folder = gui.addFolder(folderName);
  folder.add(controls.material, 'id');
  folder.add(controls.material, 'uuid');
  folder.add(controls.material, 'name');
  folder.add(controls.material, 'opacity', 0, 1, 0.01);
  folder.add(controls.material, 'transparent');
  folder.add(controls.material, 'visible');
  folder.add(controls.material, 'side', {FrontSide: 0, BackSide: 1, BothSides: 2}).onChange(function (side) {
      controls.material.side = parseInt(side)
  });

  folder.add(controls.material, 'colorWrite');
  folder.add(controls.material, 'flatShading').onChange(function(shading) {
      controls.material.flatShading = shading;
      controls.material.needsUpdate = true;
  });
  folder.add(controls.material, 'premultipliedAlpha');
  folder.add(controls.material, 'dithering');
  folder.add(controls.material, 'shadowSide', {FrontSide: 0, BackSide: 1, BothSides: 2});
  folder.add(controls.material, 'vertexColors', {NoColors: THREE.NoColors, FaceColors: THREE.FaceColors, VertexColors: THREE.VertexColors}).onChange(function (vertexColors) {
      material.vertexColors = parseInt(vertexColors);
  });
  folder.add(controls.material, 'fog');

  return folder;
}

function addSpecificMaterialSettings(gui, controls, material, name) {
  controls.material = material;

  var folderName = (name !== undefined) ? name : 'THREE.' + material.type;
  var folder = gui.addFolder(folderName);
  switch (material.type) {
      case "MeshNormalMaterial":
          folder.add(controls.material,'wireframe');
          return folder;

      case "MeshPhongMaterial":
          controls.specular = material.specular.getStyle();
          folder.addColor(controls, 'specular').onChange(function (e) {
              material.specular.setStyle(e)
          });
          folder.add(material, 'shininess', 0, 100, 0.01);
          return folder;

      case "MeshStandardMaterial":
          controls.color = material.color.getStyle();
          folder.addColor(controls, 'color').onChange(function (e) {
              material.color.setStyle(e)
          });
          controls.emissive = material.emissive.getStyle();
          folder.addColor(controls, 'emissive').onChange(function (e) {
              material.emissive.setStyle(e)
          });
          folder.add(material, 'metalness', 0, 1, 0.01);
          folder.add(material, 'roughness', 0, 1, 0.01);
          folder.add(material, 'wireframe');

          return folder;
  }
}

