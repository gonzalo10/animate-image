import React, { useState } from 'react';
import Buttons from './Buttons';
import { API_URL } from './config';
import './App.css';
import axios from 'axios';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faImage } from '@fortawesome/free-solid-svg-icons';
import { TransitionGroup } from 'react-transition-group';
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
const Water = styled.div`
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
		<FontAwesomeIcon icon={faImage} color='#3B5998' size='10x' />
	);
	if (imagen) {
		ImagenContent = <ImgWrapper src={imagen} onMouseEnter={handleMouseEnter} />;
	}
	return (
		<ImagenWrapper onMouseLeave={handleMouseLeave}>
			{isImgHovered && (
				<CloseIcon onClick={removeImg}>
					<FontAwesomeIcon icon={faTimesCircle} color='#3B5998' size='3x' />
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
			method: 'post',
			url: 'http://127.0.0.1:5000/watermask',
			data: {
				image: base64data,
			},
		})
			.then(res => {
				displaySecondImage(`data:image/png;base64,${res.data}`);
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
	};
};

const SVG = () => (
	<svg>
		<filter id='turbulence' x='0' y='0' width='100%' height='100%'>
			<feTurbulence
				id='sea-filter'
				numOctaves='3'
				seed='2'
				baseFrequency='0.5 0.5'></feTurbulence>
			<feDisplacementMap scale='50' in='SourceGraphic'></feDisplacementMap>
			<animate
				xlinkHref='#sea-filter'
				attributeName='baseFrequency'
				dur='60s'
				keyTimes='0;0.5;1'
				values='0.02 0.06;0.04 0.08;0.02 0.06'
				repeatCount='indefinite'
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
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
		img.style.display = 'none';
		var imageData = ctx.getImageData(0, 0, img.width, img.height);
		ctx.putImageData(imageData, 0, 0);
	};
};
const treatData2 = (file, uploadTransformedImage) => {
	var img = new Image();
	img.src = file;
	var canvas = document.getElementById('myCanvas2');
	var canvasInitial = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');
	var ctxInitial = canvasInitial.getContext('2d');
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
		img.style.display = 'none';
		var imageData = ctx.getImageData(0, 0, img.width, img.height);
		var imageDataInitial = ctxInitial.getImageData(0, 0, img.width, img.height);
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
			transformedImage: null,
		};
		this.handleChange = this.handleChange.bind(this);
		this.removeImg = this.removeImg.bind(this);
		this.displaySecondImage = this.displaySecondImage.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleClickMask = this.handleClickMask.bind(this);
		this.uploadTransformedImage = this.uploadTransformedImage.bind(this);
	}

	handleClick() {
		treatData(this.state.file);
	}
	handleClickMask() {
		treatData2(this.state.resultedImage, this.uploadTransformedImage);
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
			loading: true,
		});
	}
	render() {
		const { file, resultedImage, transformedImage, loading } = this.state;
		return (
			<div>
				<ImgPreview imagen={file} removeImg={this.removeImg} />
				<Buttons onChange={this.handleChange} />
				{resultedImage ? (
					<img src={resultedImage} />
				) : loading ? (
					<div>Loading...</div>
				) : null}
				{/* <canvas
					id='myCanvas'
					width='250'
					height='250'
					style={{ border: '1px solid black' }}></canvas>
				<button onClick={this.handleClick}>Convert</button>
				<canvas
					id='myCanvas2'
					width='250'
					height='250'
					style={{ border: '1px solid black' }}></canvas>
				<button onClick={this.handleClickMask}>Convert</button> 
				<Background image={file}>
					<Water image={transformedImage} />
				</Background>
				<SVG /> */}
			</div>
		);
	}
}
export default App;
