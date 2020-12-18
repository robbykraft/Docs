let sceneMeshes = [];
const scene = new THREE.Scene();
const domParent = document.querySelector("#webgl-origami-single-vertex");
const camera = new THREE.PerspectiveCamera(
	45,
	domParent.clientWidth / domParent.clientHeight,
	0.1,
	1000);
const controls = new THREE.OrbitControls(camera, domParent);
controls.enableZoom = false;
camera.position.set(-1.0, 3.0, -0.025);
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

const draw = (draw_graph) => {
	sceneMeshes.forEach(mesh => scene.remove(mesh));
	sceneMeshes = [
	  foldFileToThreeJSFaces(draw_graph),
	  foldFileToThreeJSLines(draw_graph)
  ];
	sceneMeshes.forEach(mesh => scene.add(mesh));
};

const cp = ear.cp.circle();

// make 3 random angles, sorted
const angles = [0,1,2]
  .map(() => Math.random() * Math.PI * 2)
  .sort((a, b) => a - b);

// kawasaki solver will give anywhere between 1-3 solutions
// paired with sectors, so we need to filter undefineds.
// get one. any will work. just get the first one.
angles.push(ear.math.kawasaki_solutions_radians(angles)
  .filter(a => a !== undefined)
  .shift());

// crease 4 rays. currently they have no assignment
angles.map(a => ear.vector.fromAngle(a))
  .map(vec => ear.ray(vec))
  .forEach(vec => cp.ray(vec));

// what is the index of the vertex at the center?
const vert = cp.nearest(0, 0).vertex.index;
// get the 4 sector angles
const sectors = cp.vertices_sectors[vert];
// this solves the crease assignment and layer over
const solution = ear.graph.assignment_solver(sectors).shift();

cp.vertices_edges[vert].forEach((e, i) => {
  cp.edges_assignment[e] = solution.assignment[i];
});

const assignments = cp.vertices_edges[vert].map(e => cp.edges_assignment[e]);

const foldOrigami = (t) => {
	// console.log("drawing folded", t);
	const copied = JSON.parse(JSON.stringify(cp));
	const res = ear.graph.single_vertex_fold_angles(sectors, assignments, t);
	cp.vertices_edges[vert].forEach((e, i) => {
 	 copied.edges_foldAngle[e] = res[i] * 180 / Math.PI;
	});
	delete copied.faces_matrix;
	const coords = ear.graph.make_vertices_coords_folded(copied);
	copied.vertices_coords = coords;
	draw(copied);
};

foldOrigami(0.5);

window.addEventListener('load', (event) => {
	const slider = document.querySelector("#single-vertex-3d-slider");
	if (slider) {
		slider.oninput = (e) => {
//			console.log(e);
			const t = e.target.value / 1024;
			foldOrigami(t);
		};
	}
});

