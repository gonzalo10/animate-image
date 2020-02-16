import React, { useState } from "react";
import Buttons from "./Buttons";
import { API_URL } from "./config";
import "./App.css";
import axios from "axios";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faImage } from "@fortawesome/free-solid-svg-icons";
import { TransitionGroup } from "react-transition-group";
import * as THREE from "three";
// import { GUI } from "three";
import { Water } from "./Water";
var OrbitControls = require("three-orbit-controls")(THREE);
const ImgWrapper = styled.img`
	max-width: 100%;
	max-height: 300px;
	border: 1px solid black;
	position: relative;
`;
const ImagenWrapper = styled.div`
	height: 300px;
	border: 1px solid black;
	display: flex;
	justify-content: center;
	align-items: center;
`;
const CloseIcon = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	cursor: pointer;
`;

const Background = styled.div`
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-image: url("${props => props.image}");
  background-size: cover;
`;
const Water_style = styled.div`
	background-image: url('${props => props.image}');
	background-size: cover;
	top: 0;
	left: 0;
	height: 100%;
  width: 100%;
  filter: url("#turbulence");
`;

const ImgPreview = ({ imagen, removeImg }) => {
	const [isImgHovered, setImageHovered] = useState(false);
	const handleMouseEnter = () => {
		setImageHovered(true);
	};
	const handleMouseLeave = () => {
		setImageHovered(false);
	};
	let ImagenContent = (
		<FontAwesomeIcon icon={faImage} color="#3B5998" size="10x" />
	);
	if (imagen) {
		ImagenContent = (
			<ImgWrapper
				src={imagen}
				onMouseEnter={handleMouseEnter}
			/>
		);
	}
	return (
		<ImagenWrapper onMouseLeave={handleMouseLeave}>
			{isImgHovered && (
				<CloseIcon onClick={removeImg}>
					<FontAwesomeIcon
						icon={faTimesCircle}
						color="#3B5998"
						size="3x"
					/>
				</CloseIcon>
			)}
			{ImagenContent}
		</ImagenWrapper>
	);
};

const uploadImage = (e, displaySecondImage) => {
	const files = Array.from(e.target.files);

	var reader = new FileReader();
	reader.readAsDataURL(files[0]);
	reader.onloadend = function() {
		var base64data = reader.result;
		axios({
			method: "post",
			url: "http://127.0.0.1:5000/watermask",
			data: {
				image: base64data
			}
		})
			.then(res => {
				displaySecondImage(
					`data:image/png;base64,${res.data}`
				);
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
	};
};

const SVG = () => (
	<svg>
		<filter id="turbulence" x="0" y="0" width="100%" height="100%">
			<feTurbulence
				id="sea-filter"
				numOctaves="3"
				seed="2"
				baseFrequency="0.5 0.5"
			></feTurbulence>
			<feDisplacementMap
				scale="50"
				in="SourceGraphic"
			></feDisplacementMap>
			<animate
				xlinkHref="#sea-filter"
				attributeName="baseFrequency"
				dur="60s"
				keyTimes="0;0.5;1"
				values="0.02 0.06;0.04 0.08;0.02 0.06"
				repeatCount="indefinite"
			/>
		</filter>
	</svg>
);

const blackToTransparent = (ctx, imageData) => {
	const pix = imageData.data;
	for (var i = 0; i < pix.length; i += 4) {
		const r = pix[i];
		const g = pix[i + 1];
		const b = pix[i + 2];
		if (r === 0 && g === 0 && b === 0) {
			pix[i + 3] = 0;
		}
	}
	ctx.putImageData(imageData, 0, 0);
};
const greenToOriginal = (ctx, imageData, imageDataInitial) => {
	const pix = imageData.data;
	const pixInit = imageDataInitial.data;
	for (var i = 0; i < pix.length; i += 4) {
		const r = pix[i];
		const g = pix[i + 1];
		const b = pix[i + 2];
		if (r === 0 && g === 255 && b === 0) {
			pix[i] = pixInit[i];
			pix[i + 1] = pixInit[i + 1];
			pix[i + 2] = pixInit[i + 2];
		}
	}
	ctx.putImageData(imageData, 0, 0);
};

const treatData = file => {
	var img = new Image();
	img.src = file;
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
		img.style.display = "none";
		var imageData = ctx.getImageData(0, 0, img.width, img.height);
		ctx.putImageData(imageData, 0, 0);
	};
};
const treatData2 = (file, uploadTransformedImage) => {
	var img = new Image();
	img.src = file;
	var canvas = document.getElementById("myCanvas2");
	var canvasInitial = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var ctxInitial = canvasInitial.getContext("2d");
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
		img.style.display = "none";
		var imageData = ctx.getImageData(0, 0, img.width, img.height);
		var imageDataInitial = ctxInitial.getImageData(
			0,
			0,
			img.width,
			img.height
		);
		greenToOriginal(ctx, imageData, imageDataInitial);
		blackToTransparent(ctx, imageData);
		uploadTransformedImage(canvas.toDataURL());
	};
};

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			file: null,
			resultedImage: null,
			loading: false,
			transformedImage: null
		};
		this.handleChange = this.handleChange.bind(this);
		this.removeImg = this.removeImg.bind(this);
		this.displaySecondImage = this.displaySecondImage.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleClickMask = this.handleClickMask.bind(this);
		this.uploadTransformedImage = this.uploadTransformedImage.bind(
			this
		);

		//		init();
		//		animate();
	}
	componentDidMount() {
		var scene, camera, renderer, water;
		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		// document.body.appendChild( renderer.domElement );
		// use ref as a mount point of the Three.js scene instead of the document.body
		this.mount.appendChild(renderer.domElement);
		scene = new THREE.Scene();

		// camera

		camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 25, 0);
		camera.lookAt(scene.position);

		// ground

		var groundGeometry = new THREE.PlaneBufferGeometry(
			20,
			20,
			10,
			10
		);
		var groundMaterial = new THREE.MeshBasicMaterial({
			color: 0xcccccc
		});
		var ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = Math.PI * -0.5;
		scene.add(ground);
		var light = new THREE.DirectionalLight(0xffffff, 0.8);
		scene.add(light);
		var textureLoader = new THREE.TextureLoader();
		textureLoader.load(
			//			"threeimages/FloorsCheckerboard_S_Diffuse.jpg",
			"threeimages/ocean02.jpeg",
			function(map) {
				//map.wrapS = THREE.RepeatWrapping;
				//map.wrapT = THREE.RepeatWrapping;
				//map.anisotropy = 16;
				//map.repeat.set(4, 4);
				groundMaterial.map = map;
				groundMaterial.needsUpdate = true;
			}
		);
		// water

		var waterGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
		/*
		water = new Water(waterGeometry, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load(
				"threeimages/waternormals.jpg",
				function(texture) {
					texture.wrapS = texture.wrapT =
						THREE.RepeatWrapping;
				}
			),
			alpha: 1.0,
			sunDirection: light.position.clone().normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		});
		water.rotation.x = -Math.PI / 2;
		scene.add(water);*/
		var flowMap = textureLoader.load(
			//"threeimages/FloorsCheckerboard_S_Diffuse.jpg"
			"threeimages/waternormals.jpg",
			function(flowMap) {
				console.log(flowMap);
				/*
				water = new Water(waterGeometry, {
					scale: 2,
					textureWidth: 1024,
					textureHeight: 1024,
					flowMap: flowMap
				});

				water.position.y = 1;
				water.rotation.x = Math.PI * -0.5;
				scene.add(water);
*/
				// flow map helper
				console.log("DONE");
			}
		);

		water = new Water(waterGeometry, {
			scale: 2,
			textureWidth: 1024,
			textureHeight: 1024,
			flowMap: flowMap
		});

		water.position.y = 1;
		water.rotation.x = Math.PI * -0.5;
		scene.add(water);
		var groundMaterial2 = new THREE.MeshBasicMaterial({
			color: 0xcccccc
		});
		var ground2 = new THREE.Mesh(groundGeometry, groundMaterial2);
		ground2.rotation.x = Math.PI * -0.5;
		textureLoader.load(
			//                      "threeimages/FloorsCheckerboard_S_Diffuse.jpg",
			"threeimages/back2.png",
			function(map) {
				//map.wrapS = THREE.RepeatWrapping;
				//map.wrapT = THREE.RepeatWrapping;
				//map.anisotropy = 16;
				//map.repeat.set(4, 4);
				console.log("BACK", map);
				groundMaterial2.map = map;
				groundMaterial2.needsUpdate = true;
			}
		);
		//scene.add(ground2);
		var animate = function() {
			requestAnimationFrame(animate);
			//			water.material.uniforms["time"].value += 1.0 / 60.0;
			renderer.render(scene, camera);
		};
		animate();
	}

	handleClick() {
		treatData(this.state.file);
	}
	handleClickMask() {
		treatData2(
			this.state.resultedImage,
			this.uploadTransformedImage
		);
	}

	uploadTransformedImage(image) {
		this.setState({ transformedImage: image });
	}

	removeImg() {
		this.setState({ file: null });
	}

	displaySecondImage(image) {
		this.setState({ resultedImage: image });
	}

	handleChange(event) {
		uploadImage(event, this.displaySecondImage);
		this.setState({
			file: URL.createObjectURL(event.target.files[0]),
			loading: true
		});
	}
	render() {
		const {
			file,
			resultedImage,
			transformedImage,
			loading
		} = this.state;
		return <div ref={ref => (this.mount = ref)} />;
	}
}
export default App;
