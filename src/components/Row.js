import React from 'react';
import Block from './Block.js';

// A row rendered on the board.
export default function Row(props) {
	return (
		<div className='block-row'>{
			props.blocks.map(fv => <Block fillValue={fv} />)
		}</div>
	);
}