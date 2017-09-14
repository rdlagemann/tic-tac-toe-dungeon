(function (window, undefined) { 

	// from tttHelper.js
	if (tttHelper === undefined) {
		alert("Sorry, an error ocurred when loading the page.");
		throw new Error('tttHelper.js not found');
	}

	/* create game modules  */
	const weaponChooser = (function() {
		// not initialized variables
		let xWeapon, oWeapon;
		let weapons = [];
		let player;
		
		let pubInit = function (context, human) {
			player = human;

			/* just two weapon types, so let's hard code */
			xWeapon = context.document.getElementById('xWeapon');
			oWeapon = context.document.getElementById('oWeapon');

			weapons.push( xWeapon );
			weapons.push( oWeapon );

			weapons.forEach( function (element) {
				extend( element, new Weapon() );
				element.addEventListener('click', getWeapon);
			});

			xWeapon.setValue('x');
			oWeapon.setValue('o');

			draw();

		};


		function draw () {
			weapons.forEach( function (element) {				
				element.draw();
			});
		}
		

		function getWeapon () {
			var selected = this;

			selected.classList.add( 'weapon__selected' );

			weapons.forEach( function (element) {
				if (element !== selected) {
					element.classList.remove( 'weapon__selected' );
				}
			});

			player.weapon.setValue( selected.getValue() );
		}


		return {
			init: pubInit
		}

	}());


	const gameBoard = (function() {
		/* pvt */

		let table, cells, currentPlayer, humanPlayer, cpuPlayer;
		
		const weaponEquality = function (a, b) {
			return (a.value === b.value && a.value !== "noWeapon") ? a : false;
		}

		const checkLines = tttHelper.checkLines;
		const checkColumns = tttHelper.checkColumns;

		let checkWin = function (cells) {
			if ( checkLines( cells, weaponEquality ).win ){
				console.log('win in lines');
				return true;
			}
			else if ( checkColumns( cells, weaponEquality ).win ){
				console.log('win in columns');
			 	return true;
			}
			// else if ( checkDiagonals( cells) ){
			// 	return true;
			// }
		};

		/* pub */

		let pubInit = function ( context, player, playerCPU ) {
			table = context.document.getElementById('tttTable');
			cells = context.document.querySelectorAll('td');
			humanPlayer = player;
			cpuPlayer = playerCPU;

			console.log(humanPlayer);
			console.log(cpuPlayer);

			/* extend and config table cells */
			Array.from(cells).forEach(function (element) {
				extend( element, new Weapon() );

				element.draw();
				
				element.addEventListener('click', playWeapon);
			});


		};

		function pubReset () {
			Array.from(cells).forEach(function (element) {
				element.setValue();
				element.draw();
			});
		}

		function pubPlayWeapon (index, weapon) {
			console.log('play a weapon');
			checkWin( cells );
		};

		function cpuPlay ( ) {
			// TODO: Implement AI

			let freeCells = Array.from(cells).filter( element => element.value === 'noWeapon' );

			if (freeCells.length <= 1) {
				return;
			}				

			let len = cells.length,
				index = 0,
				isValid = false

	
			while (!isValid) {
			
				index = Math.floor( Math.random() * freeCells.length );

				if (freeCells[index].value === 'noWeapon') {
					isValid = true;
					freeCells[index].setValue( cpuPlayer.weapon.value );
					freeCells[index].draw();
					//checkWin();
				}
			}			

		};

		function playWeapon () {
			if (this.value === 'noWeapon') {
				this.setValue( humanPlayer.weapon.value );
				this.draw();

				if( checkWin( cells ) ){
					console.log('win');
					return;
				}
				else{
					//cpuPlay();	
				}				
			}
			else {
				console.log('invalid move');
			}
			
		}

		function setPlayer ( player ) {
			currentPlayer = player;
		}

		return {
			init: pubInit,
			play: pubPlayWeapon,
			reset: pubReset
		}

	}());

	/* human and cpu configs */
	var playerProto = {
		reset: function () {
			this.score = 0;
		}
	}

	function Player ( wpn ) {
		let weapon = new Weapon( wpn ); 
		let score = 0;

		function P(){};
		P.prototype = playerProto; 

		let player = new P();
		player.weapon = weapon;
		player.score = score;

		return player;

	};

	const human = new Player('x');
	const cpu = new Player();

	// call after player choose a weapon
	cpu.configWeapon = function ( player ) {
		this.weapon.setValue(
				(player.weapon.value === 'x') ? 
				'o' : 'x'
			);
	};


	/* button configs */
	const gameArea = document.getElementById('gameArea'),
		  playButton = document.getElementById('playButton'),
		  weaponArea = document.getElementById('weaponArea'),
		  resetButton = document.getElementById('resetButton');

	resetButton.addEventListener('click', function () {
		human.reset();
		cpu.reset();
		gameBoard.reset( window );
		gameArea.classList.add( 'hide' );
		weaponArea.classList.remove( 'hide' );

	});

	playButton.addEventListener('click', function () {
		weaponArea.classList.add( 'hide' );
		gameArea.classList.remove( 'hide' );

		cpu.configWeapon( human );
		gameBoard.init( window, human, cpu);
		
	});


	weaponChooser.init( window, human );

	

	/* helper functions */
	function extend (target, extension) {
		for (var key in extension) {
			target[key] = extension[key];
		}
	}


})( window )