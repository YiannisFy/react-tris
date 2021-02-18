import React from 'react';
import Row from './Row.js';

// The game board presenter.
export default function Board({rows}) {
	return <div>{rows.map(r => <Row row={r}/>)}</div>;
}