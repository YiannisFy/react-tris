import React from 'react';

// A rendered block on the board.
export default function Block(props) {
	const fv = props.fillValue;
	let className = "block";
	switch(fv) {
		case false:
		case undefined:
			break;
		case true:
			className = 'block filled';
			break;
		default:
			className = 'block filled-' + fv;
			break;
	}

	return (
		<div className={className}/>
	);
}