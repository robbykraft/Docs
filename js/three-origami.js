let sceneMeshes = [];
const scene = new THREE.Scene();
const domParent = document.querySelector("#webgl-origami-twist");
const camera = new THREE.PerspectiveCamera(
	45,
	domParent.clientWidth / domParent.clientHeight,
	0.1,
	1000);
const controls = new THREE.OrbitControls(camera, domParent);
controls.enableZoom = false;
camera.position.set(-0.75, 2, -0.025);
controls.target.set(0.0, 0.0, 0.0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
if (window.devicePixelRatio !== 1) {
	renderer.setPixelRatio(window.devicePixelRatio);
}
renderer.setClearColor("#ffffff");
renderer.setSize(domParent.clientWidth, domParent.clientHeight);
domParent.appendChild(renderer.domElement);
// lights
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight2.position.set(20, 20, -100);
scene.add(directionalLight2);
// more lights
const spotLight1 = new THREE.SpotLight(0xffffff, 0.3);
spotLight1.position.set(50, -200, 100);
scene.add(spotLight1)
const spotLight2 = new THREE.SpotLight(0xffffff, 0.3);
spotLight2.position.set(100, 50, 200);
scene.add(spotLight2)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.48);
scene.add(ambientLight);

const render = () => {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	controls.update();
};

render();
// draw();
controls.addEventListener("change", render);

fetch("./twist-3d.fold")
	.then(res => res.json())
	.then(json => {
		graph3d = json;
		draw();
	});

const foldFileToThreeJSFaces = (foldFile, material) => new THREE.Mesh(
	ear.webgl.make_faces_geometry(foldFile),
	material != null ? material : new THREE.MeshPhongMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
		flatShading: true,
		shininess: 0,
		specular: 0xffffff,
		reflectivity: 0
	}));

const foldFileToThreeJSLines = (foldFile, material, scale=0.002) => new THREE.Mesh(
	ear.webgl.make_edges_geometry(foldFile, scale),
	material != null ? material : new THREE.MeshToonMaterial({
    shininess: 0,
    side: THREE.DoubleSide,
		vertexColors: THREE.VertexColors
  }));

const draw = () => {
	sceneMeshes.forEach(mesh => scene.remove(mesh));
	sceneMeshes = [
	  foldFileToThreeJSFaces(graph3d),
	  foldFileToThreeJSLines(graph3d)
  ];
	sceneMeshes.forEach(mesh => scene.add(mesh));
};

