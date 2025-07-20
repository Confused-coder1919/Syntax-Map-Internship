import React, { createContext, Component } from 'react';

export const ModalContext = createContext();

class ModalContextProvider extends Component {
	state = {
		isOpen: false
	};

	setOpen = () => {
		this.setState({isOpen: true})
	}

	setClose = () => {
		this.setState({isOpen: false})
	}

	render() {
	return (
		<ModalContext.Provider value={{...this.state, setOpen: this.setOpen, setClose: this.setClose}}>
			{this.props.children}
		</ModalContext.Provider>
		);
	}
}

export default ModalContextProvider;