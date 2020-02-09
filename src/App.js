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

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			file: null,
			resultedImage: null,
			loading: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.removeImg = this.removeImg.bind(this);
		this.displaySecondImage = this.displaySecondImage.bind(this);
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
		const { file, resultedImage } = this.state;
		return (
			<div>
				<ImgPreview imagen={file} removeImg={this.removeImg} />
				<Buttons onChange={this.handleChange} />
				{resultedImage ? <img src={resultedImage} /> : <div>Loading...</div>}
			</div>
		);
	}
}
export default App;
