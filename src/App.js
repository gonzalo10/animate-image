import React from 'react';
import Buttons from './Buttons';
import { API_URL } from './config';
import './App.css';
import axios from 'axios';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			file: null,
		};
		this.handleChange = this.handleChange.bind(this);
		this.uploadImage = this.uploadImage.bind(this);
	}

	uploadImage(e) {
		const errs = [];
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
					if (!res.ok) {
						throw res;
					}
					return res.json();
				})
				.catch(err => {
					console.log(err);
				});
			// axios
			// 	.post(``, {
			//
			// 	})
		};
	}

	handleChange(event) {
		this.uploadImage(event);
		this.setState({
			file: URL.createObjectURL(event.target.files[0]),
		});
	}
	render() {
		return (
			<div>
				<Buttons onChange={this.handleChange} />
				<img width={600} src={this.state.file} />
			</div>
		);
	}
}
export default App;
