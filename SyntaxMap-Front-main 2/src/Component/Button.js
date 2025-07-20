import React from "react";

function Button(props) {
	const button = (props.isDisable) ? <button className={props.name} onClick={props.onClick} disabled> {props.value}</button> : <button className={props.name} onClick={props.onClick}> {props.value} </button>
	return (
		button
	);
}

export default Button;