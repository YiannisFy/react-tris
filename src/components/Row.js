import React from 'react';
import Block from './Block';

// A row rendered on the board.
export default function Row({row}) {
	return (
		<div className='block-row'>{
			row.map(fv => <Block fillValue={fv} />)
		}</div>
	);
}