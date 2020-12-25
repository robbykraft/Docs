import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r123/three.module.min.js";
import { TrackballControls } from "../lib/threejs/three-trackballcontrols-no-scroll.js";
// import  TrackballControls  from "https://cdn.jsdelivr.net/npm/three-trackballcontrols@0.9.0/index.js";
// window.THREE = THREE;
// console.log(THREE);
// import { TrackballControls } from "https://cdn.jsdelivr.net/npm/three-trackballcontrols-es6@0.0.11/index.js";

window.THREE = THREE;

window.addEventListener('load', () => {
	let sceneMeshes = [];
	const scene = new THREE.Scene();
	const domParent = document.querySelector("#webgl-origami-single-vertex");
	const camera = new THREE.PerspectiveCamera(
		45,
		domParent.clientWidth / domParent.clientHeight,
		0.1,
		1000);
	// const controls = new THREE.OrbitControls(camera, domParent);
	// controls.enableZoom = false;
	camera.position.set(0.0, 0.0, 3.0);
	// controls.target.set(0.0, 0.0, 0.0);
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	if (window.devicePixelRatio !== 1) {
		renderer.setPixelRatio(window.devicePixelRatio);
	}
	renderer.setClearColor("#ffffff");
	renderer.setSize(domParent.clientWidth, domParent.clientHeight);
	domParent.appendChild(renderer.domElement);
	
	const controls = new TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = true;
	controls.noKeys = true;
	controls.noPan = true;

	// lights
	const ambientLight = new THREE.AmbientLight(0x888888);
	scene.add(ambientLight);
	const colors = [
		0xfafffd,
		0xf0faf8,
		0xf6fff0,
		0xfbf9f2,
	];
	for (let x = -1; x < 2; x += 2) {
		for (let y = -1; y < 2; y += 2) {
			for (let z = -1; z < 2; z += 2) {
				const color = colors[Math.floor(Math.random() * colors.length)];
				const intensity = Math.random() * 0.3;
				const dirLight = new THREE.DirectionalLight(color, intensity);
				dirLight.position.set(x * 5, y * 5, z * 5);
				scene.add(dirLight);
			}
		}
	}

	const render = () => {
		controls.update();
	//	requestAnimationFrame(render);
		renderer.render(scene, camera);
	};
	
	render();
	//controls.addEventListener("change", render);

  const animate = () => {
		requestAnimationFrame(animate);
		controls.update();
		render();
	};

	animate();

	const foldFileToThreeJSFaces = (foldFile) => {
		const mesh = ear.webgl.make_faces_geometry(foldFile);
		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			side: THREE.FrontSide,
			flatShading: true,
			shininess: 0,
			specular: 0xffffff,
			reflectivity: 0
		});
		const material2 = new THREE.MeshPhongMaterial({
			color: 0xee5533,
			side: THREE.BackSide,
			flatShading: true,
			shininess: 0,
			specular: 0xffffff,
			reflectivity: 0
		});
		return [
			new THREE.Mesh(mesh, material),
			new THREE.Mesh(mesh, material2),
		];
	};
	
	const foldFileToThreeJSLines = (foldFile, scale=0.002) => [new THREE.Mesh(
		ear.webgl.make_edges_geometry(foldFile, scale, 0.001),
		new THREE.MeshToonMaterial({
	    // shininess: 0,
	    side: THREE.DoubleSide,
			vertexColors: THREE.VertexColors
	  }))];
	
	const draw = (draw_graph) => {
		sceneMeshes.forEach(mesh => scene.remove(mesh));
		sceneMeshes = [
		  ...foldFileToThreeJSFaces(draw_graph),
		  ...foldFileToThreeJSLines(draw_graph, 0.01)
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
	
	foldOrigami(0.0);
	
	const slider = document.querySelector("#single-vertex-3d-slider");
	if (slider) {
		slider.oninput = (e) => {
			const t = e.target.value / 1024;
			foldOrigami(t);
		};
	}
});

