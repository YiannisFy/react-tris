import React from 'react';
import { useSelector } from 'react-redux';
import Row from './Row.js';

// The game board presenter.
export default function Board() {
	const nrRows = useSelector(state => state.reactris.board.rows.length);
	const rows = new Array(nrRows);
	for (let i = 0; i < nrRows; i++) {
		rows[i] = <Row index={i}/>
	}
	return <div>{rows}</div>;
}