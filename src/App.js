import React from 'react';
import Buttons from './Buttons';
import { API_URL } from './config';
import './App.css';

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

		const formData = new FormData();
		const types = ['image/png', 'image/jpeg', 'image/gif'];

		files.forEach((file, i) => {
			if (types.every(type => file.type !== type)) {
				errs.push(`'${file.type}' is not a supported format`);
			}

			if (file.size > 150000) {
				errs.push(`'${file.name}' is too large, please pick a smaller file`);
			}

			formData.append(i, file);
		});

		if (errs.length) {
			throw errs;
		}

		fetch(`${API_URL}/image-upload`, {
			method: 'POST',
			body: formData,
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
