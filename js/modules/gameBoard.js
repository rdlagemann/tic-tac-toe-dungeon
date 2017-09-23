const gameBoard = (function() {

	// useful references
	let context, table, cells,
		currentPlayer, humanPlayer, cpuPlayer,
		humanScore, cpuScore;

	const checker = {};

	// functions to check game stats
	checker.checkLines = tttHelper.checkLines.bind( {}, weaponEquality );
	checker.checkColumns = tttHelper.checkColumns.bind( {}, weaponEquality );
	checker.checkMainDiagonal = tttHelper.checkMainDiagonal.bind( {}, weaponEquality );
	checker.checkInverseDiagonal = tttHelper.checkInverseDiagonal.bind( {}, weaponEquality );

	// initialize this module
	const pubInit = function init(con, player, playerCPU) {
		context = con;
		table = context.document.getElementById('tttTable');
		cells = context.document.querySelectorAll('td');
		humanScore = context.document.getElementById('humanScore');
		cpuScore = context.document.getElementById('cpuScore');

		currentPlayer = humanPlayer = player;
		cpuPlayer = playerCPU;

		// extend and config table cells 
		Array.from(cells).forEach(function(element) {
			extend( element, new Weapon() );
			element.draw();			
			element.addEventListener('click', playWeapon);
		});
	};
	
	const getFreeCells = function freecells(cells){
		return Array.from(cells).filter( element => element.getValue() === 'noWeapon' );
	};

	const checkWin = function check(cels) {
		let checkTest,
			result = {
				name: 'noname',
				win: false,
				shouldReset: false
			}

		for (let key in checker) {
			if ( typeof checker[key] === 'function') {
				checkTest = checker[key](cels);
			}
			if (checkTest.win) {
				break;
			}
		}

		if (checkTest.win) {
			result.name = currentPlayer._name;
			result.win = true;
			result.shouldReset = true;

			return result;
		}

		else if (!checkTest.win && (getFreeCells(cels).length === 0)) {
			// console.log('checkWin: TIE');
			
			result.win = false;
			result.shouldReset = true;

			return result;
		}
		
		return result;
	};

	const clearBoard = function clear() {
		Array.from(cells).forEach(function(element) {
			element.setValue();
			element.draw();
		});
	};

	const pubReset = function reset() {
		cpuScore.innerText = ' 0';
		humanScore.innerText = ' 0';
		currentPlayer = humanPlayer;
		clearBoard();
	};

	const emptyBlocks = function(newCells) {
		let emps = [];
		newCells.forEach( (el, index) => {
			// console.log('el = ', el);
			if (el.getValue() === 'noWeapon') {
				emps.push(index);
			}
		});

		return emps;
	}

	const bestSpot = function bestSpot() {
		let cellscopy = Array.from(cells).slice();
		return minimax(cellscopy, cpuPlayer).index;
	};

	let deep = 0;

	
	const minimax = function minimax(newCells, player) {
		let freeCells = emptyBlocks(newCells);
				
		result = checkWin(newCells);

		deep += 1;



		// stop conditions
		if (result.name === 'human') {
			return {score: 10};			
		}else if (result.name === 'cpu'){			
			return {score: -10};
		}
		else if(result.shouldReset){
			return {score: 0};
		}
		

		let moves = [];

		for (let i = 0; i < freeCells.length; i += 1) {
			let move = {};
			
			move.index = freeCells[i];
			newCells[move.index].setValue(player._weapon.getValue());	

					
			if (player._name === 'cpu') {
				currentPlayer = humanPlayer;
				let result = minimax(newCells, humanPlayer);
				move.score = result.score;
			} 
			else if(player._name === 'human') {
				currentPlayer = cpuPlayer;
				let result = minimax(newCells, cpuPlayer);
				move.score = result.score;
			}

			newCells[move.index].setValue(undefined);

			moves.push(move);
		}

		//move with highest score when cpu is playing
		let bestMove;
		
		if (player._name === 'cpu') {
			let bestScore = -10000;
			for (let i = 0; i < moves.length; i += 1) {
				if (moves[i].score > bestScore) {
					bestScore = moves[i].score;
					bestMove = i;
				}
			}
		}
		//move with lowest score when human is playing 
		else if(player._name === 'human'){
			let bestScore = 10000;
			for (let i = 0; i < moves.length; i += 1) {
				if (moves[i].score < bestScore) {
					bestScore = moves[i].score;
					bestMove = i;
				}
			}
		}

		// console.log(moves[bestMove]);

		return moves[bestMove];	

	};
	
	const cpuPlay = function playcpu() {
		// TODO: Implement AI
		let freeCells = getFreeCells(cells);

		if (freeCells.length <= 1) {
			return;
		}

		let result, move;

		currentPlayer = cpuPlayer;	

		console.log(freeCells.length);

		if (freeCells.length === 8) {
			for (let i = 0; i < cells.length; i += 2) {
				if (cells[i].getValue() !== 'noWeapon') {
					if (i % 2 === 0 && i !== 4) {
						move = 4;
						break;
					}
					else if (i === 4) {
						move = 0;
						break;
					}
				}
			}
		}
		else {
			move = bestSpot();
		}
		
		cells[move].setValue( cpuPlayer._weapon.getValue() );
		cells[move].draw();		

		result = checkWin(cells);	

		console.log(result);

		if (result.win) {
			cpuScore.innerText = ' ' + (parseInt(cpuScore.innerText) + 1);
			clearBoard();
		}
		else if (result.shouldReset) {
			clearBoard();
		}

		currentPlayer = humanPlayer;
		
	};

	const playWeapon = function playWeapon() {
		if (this.getValue() === 'noWeapon') {
			
			this.setValue( humanPlayer._weapon.getValue() );
			this.draw();


			let result = checkWin( cells );

			if (result.win) {
				humanScore.innerText = ' ' + (parseInt(humanScore.innerText) + 1);
				clearBoard();

				return;
			}
			else if (result.shouldReset){
				clearBoard();
			}
			else {
				cpuPlay();
			}

		}
		else {
			console.log('invalid move');
		}
		
	}

	return {
		name: 'gameBoard',
		init: pubInit,
		reset: pubReset
	}

	}());