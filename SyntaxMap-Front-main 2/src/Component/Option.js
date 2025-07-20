import React from "react";

function Option(props) {
	return (
		<option className={props.name} value={props.value} datalang={props.lang} dataname={props.name}>
		  {props.value}
		</option>
	);
}

export default Option;