import { updatePGN } from '../utils.js';
import { makeMove, newGame, connectToGame } from '../actions/gameActions.js';

const initialState = {};

export function gameReducer(state = initialState, action, ws) {
	if (action.type === 'game/connect' && state[action.id]) {
		// connecting to existing game
		ws.send(connectToGame({
			id: action.id,
			orientation: state[action.id].connections.length === 1
				? 'white' : 'black',
			isPlayer: state[action.id].connections.length < 2,
			pgn: state[action.id].pgn
		}));
		return {
			...state,
			[action.id]: {
				...state[action.id],
				connections: state[action.id].connections.concat(ws)
			}
		};
	}
	else if (action.type === 'game/move' && state[action.id]) {
		state[action.id].connections
			.filter(conn => conn._receiver._mask !== ws._receiver._mask && conn.readyState === 1)
			.forEach(conn => conn.send(makeMove({
				pgn: updatePGN(state[action.id].pgn, action.move)
			})));
		return {
			...state,
			[action.id]: {
				...state[action.id],
				pgn: updatePGN(state[action.id].pgn, action.move)
			}
		};
	}
	// else if (action.type === 'game/flag') {
	// 	return state;
	// }
	return state;
}
