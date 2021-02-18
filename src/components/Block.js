import React from 'react';

// A rendered block on the board.
export default function Block({fillValue}) {
	let className = "block";
	switch(fillValue) {
		case false:
		case undefined:
			break;
		case true:
			className = 'block filled';
			break;
		default:
			className = 'block filled-' + fillValue;
			break;
	}

	return (
		<div className={className}/>
	);
}