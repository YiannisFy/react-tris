import React from 'react';
import { useSelector } from 'react-redux';
import Block from './Block.js';

// A row rendered on the board.
export default function Row(props) {
	const rowBlocks = useSelector(state => state.reactris.board.rows[props.index]);
	return (
		<div className='block-row'>{
			rowBlocks.map(fv => <Block fillValue={fv} />)
		}</div>
	);
}