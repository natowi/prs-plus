// Original code (c) Ben Chenoweth
// Initial version: Dec. 2010
// HISTORY:
// 	2010-12-09 Ben Chenoweth - Fixed "Player 2 won!" message was not appearing
// 	2010-12-11 Mark Nord - temporary fix for use with PRS+v1.1.3 on PRS-505; 
//		part.key = character on device -> typecast to number
// 	2010-12-12 Mark Nord - try catch block around prsp.compile and newEvent (not needed for PRS-505)	
// 	2011-02-07 Ben Chenoweth - HOME button how quits game; force screen update before reader's move.
// 	2011-02-10 Ben Chenoweth - Replaced small menu with buttons (touch version).
// 	2011-03-01 kartu - Moved into a function, to allow variable name optimizations
//  2011-03-20 Ben Chenoweth - Moved all labels out of the status bar.
//  2011-03-25 Ben Chenoweth - Skins changed over to use common AppAssests.
//  2012-05-22 Ben Chenoweth - Removed unused variables; changed globals to locals; fixed formatting.

var tmp = function () {
	var Exiting,
	gameover,
	players = 1,
	player1turn,
	firstX = 15,
	curDX = 50,
	firstY = 0,
	curDY = 50,
	posX,
	posY,
	maxX = 11,
	maxY = 13,
	col10m = [],
	oMovesX = [],
	oMovesY = [],
	oMoves,
	xMovesX = [],
	xMovesY = [],
	xMoves,
	isTouch,
	
	/* Mark Nord - Core workaround 
	var newEvent = prsp.compile("param", "return new Event(param)");
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue; */
	getSoValue, hasNumericButtons;
	
	//this.bubble("tracelog","id="+id);
	
	target.resetButtons = function () {
		var x, y, id;
		for (x = 0; x < maxX; x++) {
			for (y = 0; y < maxY; y++) {
				if (x < 10) {
					if (y < 10) {
						id = "3Buttons0" + x + '0' + y;
					} else {
						id = "3Buttons0" + x + '' + y;
					}
				} else {
					if (y < 10) {
						id = "3Buttons" + x + '0' + y;
					} else {
						id = "3Buttons" + x + '' + y;
					}
				}
				col10m[x][y] = 0;
				this[id].u = 0;
			}
		}
	};
	
	target.drawgrid1Cursor = function (x, y) {
		this.grid1Cursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
	};
	
	target.drawgrid2Cursor = function (x, y) {
		this.grid2Cursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
	};
	
	target.startPlay = function () {
		var x, y, id;
		posX = 5;
		posY = 6;
		gameover = false;
		oMoves = 0;
		xMoves = 0;
		
		// Reset the board - note that the col10m array needs to be initialised to be one column and row larger than the button array (for board-searching purposes)
		for (x = 0; x <= maxX; x++) {
			for (y = 0; y <= maxY; y++) {
				col10m[x][y] = 0;
				if ((x < maxX) && (y < maxY)) {
					if (x < 10) {
						if (y < 10) {
							id = "3Buttons0" + x + '0' + y;
						} else {
							id = "3Buttons0" + x + '' + y;
						}
					} else {
						if (y < 10) {
							id = "3Buttons" + x + '0' + y;
						} else {
							id = "3Buttons" + x + '' + y;
						}
					}
					this[id].u = 0;
				}
			}
		}
		//this.setButtons();
		this.drawgrid1Cursor(posX, posY);
		this.drawgrid2Cursor(posX, posY);
		if (players == 2) {
			this.showTurn.setValue("Player 1's turn...");
			player1turn = true;
			if (!isTouch) {
				this.grid1Cursor.show(true);
				this.grid2Cursor.show(false);
			}
		} else {
			this.showTurn.setValue("Your turn...");
			player1turn = true;
			if (!isTouch) {
				this.grid1Cursor.show(true);
				this.grid2Cursor.show(false);
			}
		}
	};
	
	target.init = function () {
		this.appIcon.u = kbook.autoRunRoot._icon;
	
	/* Mark Nord - temporary Core workaround  for PRS+ v1.1.3 */
	
		if(!kbook || !kbook.autoRunRoot || !kbook.autoRunRoot.getSoValue){ 
				if (kbook.simEnviro) { /*Sim without handover code */
					getSoValue = _Core.system.getSoValue;
					hasNumericButtons = _Core.config.compat.hasNumericButtons;
				} else {/* PRS-505 */
					getSoValue = function (obj, propName) {
					return FskCache.mediaMaster.getInstance.call(obj, propName);};
					hasNumericButtons = true;
				}
				try{
					var compile = getSoValue(prsp,"compile");
					var newEvent = compile("param", "return new Event(param)");
				} catch(ignore) {}	
		 }else { /* code is ok with PRS-600 */
			getSoValue = kbook.autoRunRoot.getSoValue;
			newEvent = prsp.compile("param", "return new Event(param)");
			hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
		}
	
		if (!hasNumericButtons) {
			isTouch = true;
			this.grid1Cursor.show(false);
			this.grid2Cursor.show(false);
			this.instr1.show(false);
			this.instr2.show(false);
			this.instr3.show(false);
			this.instr4.setValue("HOME: Quit");
			//this.Touch.MENUBAR.show(true);
			
		} else {
			isTouch = false;
			this.grid1Cursor.show(true);
			this.grid2Cursor.show(false);
			this.instr1.show(true);
			this.instr2.show(true);
			this.instr3.show(true);
			this.instr4.setValue("0: Quit");
			//this.Touch.MENUBAR.show(false);
			// this.BUTTON_EXT.show(false);
			this.BUTTON_ONE.show(false);
			this.BUTTON_TWO.show(false);
		}
		// note that the col10m array needs to be initialised to be one column and row larger than the button array (for board-searching purposes)
		for (var a = 0; a <= maxX; a++) {
			col10m[a] = [];
		}
		this.startPlay();
	};
	
	target.placeO = function () {
		var tempX, tempY, prevX, prevY, id, m, n, cnt, makemove = false, distance, direction, choices;
		
		// Step 1: Try to complete a win: look for 4 "O"s in a row
		for (n = 1; n <= oMoves ; n++) {
			//this.bubble("tracelog","Trying step 1...");
			prevX = oMovesX[n];
			prevY = oMovesY[n];
			
			// top left to bottom right diagonal
			cnt = 0;
			// look in the next 3 spaces
			for (m = 1; m <=3; m++) {
				if ((prevX + m < maxX) && (prevY + m < maxY)) {
					if (col10m[prevX + m][prevY + m] == 2) {
						cnt++;
					}
				}
			}
			if (cnt == 3) {
				// found OOOO, so check if next space is available
				if ((prevX + 4 < maxX) && (prevY + 4 < maxY)) {
					if (col10m[prevX + 4][prevY + 4] == 0) {
						tempX = prevX + 4;
						tempY = prevY + 4;
						makemove = true;
						break;
					}
				}
				// if not, try the previous space
				if ((prevX - 1 >= 0) && (prevY - 1 >= 0)) {
					if (col10m[prevX - 1][prevY - 1] == 0) {
						tempX = prevX - 1;
						tempY = prevY - 1;
						makemove = true;
						break;
					}
				}			
			}
			if (cnt == 2) {
				// found O-OO, OO-O, or OOO-, so look for O-OOO, OO-OO and OOO-O
				if ((prevX + 4 < maxX) && (prevY + 4 < maxY)) {
					// first check for that fifth O
					if (col10m[prevX + 4][prevY + 4] == 2) {
						// then check the spaces inbetween
						if (col10m[prevX + 1][prevY + 1] == 0) {
							tempX = prevX + 1;
							tempY = prevY + 1;
							makemove = true;
							break;
						} else if (col10m[prevX + 2][prevY + 2] == 0) {
							tempX = prevX + 2;
							tempY = prevY + 2;
							makemove = true;
							break;
						} else if (col10m[prevX + 3][prevY + 3] == 0) {
							tempX = prevX + 3;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
			}
			
			// up and down
			cnt = 0;
			// look in the next 3 spaces
			for (m = 1; m <=3; m++) {
				if (prevY + m < maxY) {
					if (col10m[prevX][prevY + m] == 2) {
						cnt++;
					}
				}
			}
			if (cnt == 3) {
				// found OOOO, so check if next space is available
				if (prevY + 4 < maxY) {
					if (col10m[prevX][prevY + 4] == 0) {
						tempX = prevX;
						tempY = prevY + 4;
						makemove = true;
						break;
					}
				}
				// if not, try the previous space
				if (prevY - 1 >= 0) {
					if (col10m[prevX][prevY - 1] == 0) {
						tempX = prevX;
						tempY = prevY - 1;
						makemove = true;
						break;
					}
				}				
			}
			if (cnt == 2) {
				// found O-OO, OO-O, or OOO-, so look for O-OOO, OO-OO and OOO-O
				if (prevY + 4 < maxY) {
					// first check for that fifth O
					if (col10m[prevX][prevY + 4] == 2) {
						// then check the spaces inbetween
						if (col10m[prevX][prevY + 1] == 0) {
							tempX = prevX;
							tempY = prevY + 1;
							makemove = true;
							break;
						} else if (col10m[prevX][prevY + 2] == 0) {
							tempX = prevX;
							tempY = prevY + 2;
							makemove = true;
							break;
						} else if (col10m[prevX][prevY + 3] == 0) {
							tempX = prevX;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
			}
			
			// top right to bottom left diagonal
			cnt = 0;
			// look in the next 3 spaces
			for (m = 1; m <=3; m++) {
				if ((prevX - m >= 0) && (prevY + m < maxY)) {
					if (col10m[prevX - m][prevY + m] == 2) {
						cnt++;
					}
				}
			}
			if (cnt == 3) {
				// found OOOO, so check if next space is available
				if ((prevX - 4 >= 0) && (prevY + 4 < maxY)) {
					if (col10m[prevX - 4][prevY + 4] == 0) {
						tempX = prevX - 4;
						tempY = prevY + 4;
						makemove = true;
						break;
					}
				}
				// if not, try the previous space
				if ((prevX + 1 < maxX) && (prevY - 1 >= 0)) {
					if (col10m[prevX + 1][prevY - 1] == 0) {
						tempX = prevX + 1;
						tempY = prevY - 1;
						makemove = true;
						break;
					}
				}	
			}
			if (cnt == 2) {
				// found O-OO, OO-O, or OOO-, so look for O-OOO, OO-OO and OOO-O
				if ((prevX - 4 >= 0) && (prevY + 4 < maxY)) {
					// first check for that fifth O
					if (col10m[prevX - 4][prevY + 4] == 2) {
						// then check the spaces inbetween
						if (col10m[prevX - 1][prevY + 1] == 0) {
							tempX = prevX - 1;
							tempY = prevY + 1;
							makemove = true;
							break;
						} else if (col10m[prevX - 2][prevY + 2] == 0) {
							tempX = prevX - 2;
							tempY = prevY + 2;
							makemove = true;
							break;
						} else if (col10m[prevX - 3][prevY + 3] == 0) {
							tempX = prevX - 3;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
			}
			
			// left to right
			cnt = 0;
			// look in the next 3 spaces
			for (m = 1; m <=3; m++) {
				if (prevX + m < maxX) {
					if (col10m[prevX + m][prevY] == 2) {
						cnt++;
					}
				}
			}
			if (cnt == 3) {
		    // found OOOO, so check if next space is available
				if (prevX + 4 < maxX) {
					if (col10m[prevX + 4][prevY] == 0) {
						tempX = prevX + 4;
						tempY = prevY;
						makemove = true;
						break;
					}
				}
				// if not, try the previous space
				if (prevX - 1 >= 0) {
					if (col10m[prevX - 1][prevY] == 0) {
						tempX = prevX - 1;
						tempY = prevY;
						makemove = true;
						break;
					}
				}				
			}
			if (cnt == 2) {
				// found O-OO, OO-O, or OOO-, so look for O-OOO, OO-OO and OOO-O
				if (prevX + 4 < maxX) {
					// first check for that fifth O
					if (col10m[prevX + 4][prevY] == 2) {
						// then check the spaces inbetween
						if (col10m[prevX + 1][prevY] == 0) {
							tempX = prevX + 1;
							tempY = prevY;
							makemove = true;
							break;
						} else if (col10m[prevX + 2][prevY] == 0) {
							tempX = prevX + 2;
							tempY = prevY;
							makemove = true;
							break;
						} else if (col10m[prevX + 3][prevY] == 0) {
							tempX = prevX + 3;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
				}
			}
		}
		
		// Step 2: Try to block X winning: look for 4 "X"s in a row
		if ((!makemove) && (xMoves > 3)) {
			//this.bubble("tracelog","Trying step 2...");
			for (n = 1; n <= xMoves; n++) {
				prevX = xMovesX[n];
				prevY = xMovesY[n];
				
				// top left to bottom right diagonal
				cnt = 0;
				// look in the next 3 spaces
				for (m = 1; m <=3; m++) {
					if ((prevX + m < maxX) && (prevY + m < maxY)) {
						if (col10m[prevX + m][prevY + m] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 3) {
					// found XXXX, so check if next space is available
					if ((prevX + 4 < maxX) && (prevY + 4 < maxY)) {
						if (col10m[prevX + 4][prevY + 4] == 0) {
							tempX = prevX + 4;
							tempY = prevY + 4;
							makemove = true;
							break;
						}
					}
					// if not, try the previous space
					if ((prevX - 1 >= 0) && (prevY - 1 >= 0)) {
						if (col10m[prevX - 1][prevY - 1] == 0) {
							tempX = prevX - 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}			
				}
				if (cnt == 2) {
					// found X-XX, XX-X, or XXX-, so look for X-X, XX-XX and XXX-X
					if ((prevX + 4 < maxX) && (prevY + 4 < maxY)) {
						// first check for that fifth X
						if (col10m[prevX + 4][prevY + 4] == 1) {
							// then check the spaces inbetween
							if (col10m[prevX + 1][prevY + 1] == 0) {
								tempX = prevX + 1;
								tempY = prevY + 1;
								makemove = true;
								break;
							} else if (col10m[prevX + 2][prevY + 2] == 0) {
								tempX = prevX + 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							} else if (col10m[prevX + 3][prevY + 3] == 0) {
								tempX = prevX + 3;
								tempY = prevY + 3;
								makemove = true;
								break;
							}
						}
					}
				}
				
				// up and down
				cnt = 0;
				// look in the next 3 spaces
				for (m = 1; m <=3; m++) {
					if (prevY + m < maxY) {
						if (col10m[prevX][prevY + m] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 3) {
					// found XXXX, so check if next space is available
					if (prevY + 4 < maxY) {
						if (col10m[prevX][prevY + 4] == 0) {
							tempX = prevX;
							tempY = prevY + 4;
							makemove = true;
							break;
						}
					}
					// if not, try the previous space
					if (prevY - 1 >= 0) {
						if (col10m[prevX][prevY - 1] == 0) {
							tempX = prevX;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}				
				}
				if (cnt == 2) {
					// found X-XX, XX-X, or XXX-, so look for X-X, XX-XX and XXX-X
					if (prevY + 4 < maxY) {
						// first check for that fifth X
						if (col10m[prevX][prevY + 4] == 1) {
							// then check the spaces inbetween
							if (col10m[prevX][prevY + 1] == 0) {
								tempX = prevX;
								tempY = prevY + 1;
								makemove = true;
								break;
							} else if (col10m[prevX][prevY + 2] == 0) {
								tempX = prevX;
								tempY = prevY + 2;
								makemove = true;
								break;
							} else if (col10m[prevX][prevY + 3] == 0) {
								tempX = prevX;
								tempY = prevY + 3;
								makemove = true;
								break;
							}
						}
					}
				}
				
				// top right to bottom left diagonal
				cnt = 0;
				// look in the next 3 spaces
				for (m = 1; m <=3; m++) {
					if ((prevX - m >= 0) && (prevY + m < maxY)) {
						if (col10m[prevX - m][prevY + m] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 3) {
					// found XXXX, so check if next space is available
					if ((prevX - 4 >= 0) && (prevY + 4 < maxY)) {
						if (col10m[prevX - 4][prevY + 4] == 0) {
							tempX = prevX - 4;
							tempY = prevY + 4;
							makemove = true;
							break;
						}
					}
					// if not, try the previous space
					if ((prevX + 1 < maxX) && (prevY - 1 >= 0)) {
						if (col10m[prevX + 1][prevY - 1] == 0) {
							tempX = prevX + 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}	
				}
				if (cnt == 2) {
					// found X-XX, XX-X, or XXX-, so look for X-X, XX-XX and XXX-X
					if ((prevX - 4 >= 0) && (prevY + 4 < maxY)) {
						// first check for that fifth X
						if (col10m[prevX - 4][prevY + 4] == 1) {
							// then check the spaces inbetween
							if (col10m[prevX - 1][prevY + 1] == 0) {
								tempX = prevX - 1;
								tempY = prevY + 1;
								makemove = true;
								break;
							} else if (col10m[prevX - 2][prevY + 2] == 0) {
								tempX = prevX - 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							} else if (col10m[prevX - 3][prevY + 3] == 0) {
								tempX = prevX - 3;
								tempY = prevY + 3;
								makemove = true;
								break;
							}
						}
					}
				}
				
				// left to right
				cnt = 0;
				// look in the next 3 spaces
				for (m = 1; m <=3; m++) {
					if (prevX + m < maxX) {
						if (col10m[prevX + m][prevY] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 3) {
					// found XXXX, so check if next space is available
					if (prevX + 4 < maxX) {
						if (col10m[prevX + 4][prevY] == 0) {
							tempX = prevX + 4;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
					// if not, try the previous space
					if (prevX - 1 >= 0) {
						if (col10m[prevX - 1][prevY] == 0) {
							tempX = prevX - 1;
							tempY = prevY;
							makemove = true;
							break;
						}
					}				
				}
				if (cnt == 2) {
					// found X-XX, XX-X, or XXX-, so look for X-X, XX-XX and XXX-X
					if (prevX + 4 < maxX) {
						// first check for that fifth X
						if (col10m[prevX + 4][prevY] == 1) {
							// then check the spaces inbetween
							if (col10m[prevX + 1][prevY] == 0) {
								tempX = prevX + 1;
								tempY = prevY;
								makemove = true;
								break;
							} else if (col10m[prevX + 2][prevY] == 0) {
								tempX = prevX + 2;
								tempY = prevY;
								makemove = true;
								break;
							} else if (col10m[prevX + 3][prevY] == 0) {
								tempX = prevX + 3;
								tempY = prevY;
								makemove = true;
								break;
							}
						}
					}
				}
			}
		}
		
		// Step 3: Try to make 4 "O"s in a row: look for 3 "O"s in a row (with appropriate spaces - at least 2 on one side and 1 on the other)
		if (!makemove) {
			//this.bubble("tracelog","Trying step 3...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if ((prevX + m < maxX) && (prevY + m < maxY)) {
						if (col10m[prevX + m][prevY + m] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for --OOO-
					if ((prevX - 2 >= 0) && (prevY - 2 >= 0) && (prevX + 3 < maxX) && (prevY + 3 < maxY)) {
						if ((col10m[prevX - 2][prevY - 2] == 0) && (col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 3][prevY + 3] == 0)) {
							tempX = prevX - 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
					// look for -OOO--
					if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 4 < maxX) && (prevY + 4 < maxY)) {
						if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 3][prevY + 3] == 0) && (col10m[prevX + 4][prevY + 4] == 0)) {
							tempX = prevX + 3;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
				
				// up and down
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if (prevY + m < maxY) {
						if (col10m[prevX][prevY + m] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for --OOO-
					if ((prevY - 2 >= 0) && (prevY + 3 < maxY)) {
						if ((col10m[prevX][prevY - 2] == 0) && (col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 3] == 0)) {
							tempX = prevX;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
					// look for -OOO--
					if ((prevY - 1 >= 0) && (prevY + 4 < maxY)) {
						if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 3] == 0) && (col10m[prevX][prevY + 4] == 0)) {
							tempX = prevX;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
	
				// top right to bottom left diagonal
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if ((prevX - m >= 0) && (prevY + m < maxY)) {
						if (col10m[prevX - m][prevY + m] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for --OOO-
					if ((prevX + 2 < maxX) && (prevY - 2 >= 0) && (prevX - 3 >= 0) && (prevY + 3 < maxY)) {
						if ((col10m[prevX + 2][prevY - 2] == 0) && (col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 3][prevY + 3] == 0)) {
							tempX = prevX + 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
					// look for -OOO--
					if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 4 >= 0) && (prevY + 4 < maxY)) {
						if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 3][prevY + 3] == 0) && (col10m[prevX - 4][prevY + 4] == 0)) {
							tempX = prevX - 3;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
	
				// left to right
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if (prevX + m < maxX) {
						if (col10m[prevX + m][prevY] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for --OOO-
					if ((prevX - 2 >= 0) && (prevX + 3 < maxX)) {
						if ((col10m[prevX - 2][prevY] == 0) && (col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 3][prevY] == 0)) {
							tempX = prevX - 1;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
					// look for -OOO--
					if ((prevX - 1 >= 0) && (prevX + 4 < maxX)) {
						if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 3][prevY] == 0) && (col10m[prevX + 4][prevY] == 0)) {
							tempX = prevX + 3;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
				}			
			}
		}
		
		// Step 4: Handle special cases: look for -O-OO- and -OO-O-
		if (!makemove) {
			//this.bubble("tracelog","Trying step 4...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 4 < maxX) && (prevY + 4 < maxY)) {
					if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 1][prevY + 1] == 0) && (col10m[prevX + 2][prevY + 2] == 2) && (col10m[prevX + 3][prevY + 3] == 2) && (col10m[prevX + 4][prevY + 4] == 0)) {
						tempX = prevX + 1;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
					if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 1][prevY + 1] == 2) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 2) && (col10m[prevX + 4][prevY + 4] == 0)) {
						tempX = prevX + 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
				
				// up and down
				if ((prevY - 1 >= 0) && (prevY + 4 < maxY)) {
					if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 1] == 0) && (col10m[prevX][prevY + 2] == 2) && (col10m[prevX][prevY + 3] == 2) && (col10m[prevX][prevY + 4] == 0)) {
						tempX = prevX;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
					if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 1] == 2) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 2) && (col10m[prevX][prevY + 4] == 0)) {
						tempX = prevX;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
	
				// top right to bottom left diagonal
				if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 4 >= 0) && (prevY + 4 < maxY)) {
					if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 1][prevY + 1] == 0) && (col10m[prevX - 2][prevY + 2] == 2) && (col10m[prevX - 3][prevY + 3] == 2) && (col10m[prevX - 4][prevY + 4] == 0)) {
						tempX = prevX - 1;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
					if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 1][prevY + 1] == 2) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 2) && (col10m[prevX - 4][prevY + 4] == 0)) {
						tempX = prevX - 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
	
				// left to right
				if ((prevX - 1 >= 0) && (prevX + 4 < maxX)) {
					if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 2) && (col10m[prevX + 3][prevY] == 2) && (col10m[prevX + 4][prevY] == 0)) {
						tempX = prevX + 1;
						tempY = prevY;
						makemove = true;
						break;
					}
					if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 1][prevY] == 2) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 2) && (col10m[prevX + 4][prevY] == 0)) {
						tempX = prevX + 2;
						tempY = prevY;
						makemove = true;
						break;
					}
				}
			}
		}
		
		// Step 5: Look for 3 "O"s in a row with only 1 space on each side
		if (!makemove) {
			//this.bubble("tracelog","Trying step 5...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if ((prevX + m < maxX) && (prevY + m < maxY)) {
						if (col10m[prevX + m][prevY + m] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for -OOO-
					if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 3 < maxX) && (prevY + 3 < maxY)) {
						if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 3][prevY + 3] == 0)) {
							tempX = prevX - 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
				}
				
				// up and down
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if (prevY + m < maxY) {
						if (col10m[prevX][prevY + m] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for -OOO-
					if ((prevY - 1 >= 0) && (prevY + 3 < maxY)) {
						if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 3] == 0)) {
							tempX = prevX;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
				}
	
				// top right to bottom left diagonal
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if ((prevX - m >= 0) && (prevY + m < maxY)) {
						if (col10m[prevX - m][prevY + m] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for -OOO-
					if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 3 >= 0) && (prevY + 3 < maxY)) {
						if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 3][prevY + 3] == 0)) {
							tempX = prevX + 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
				}
	
				// left to right
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if (prevX + m < maxX) {
						if (col10m[prevX + m][prevY] == 2) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found OOO, so check if appropriate spaces exist
					// look for -OOO-
					if ((prevX - 1 >= 0) && (prevX + 3 < maxX)) {
						if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 3][prevY] == 0)) {
							tempX = prevX - 1;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
				}			
			}	
		}
		
		// Step 6: Handle special cases: Look for O--OO and OO--O
		if (!makemove) {
			//this.bubble("tracelog","Trying step 6...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				if ((prevX + 4 < maxX) && (prevY + 4 < maxY)) {
					if ((col10m[prevX + 1][prevY + 1] == 0) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 2) && (col10m[prevX + 4][prevY + 4] == 2)) {
						tempX = prevX + 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
					if ((col10m[prevX + 1][prevY + 1] == 2) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 0) && (col10m[prevX + 4][prevY + 4] == 2)) {
						tempX = prevX + 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}				
				}
				
				// up and down
				if (prevY + 4 < maxY) {
					if ((col10m[prevX][prevY + 1] == 0) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 2) && (col10m[prevX][prevY + 4] == 2)) {
						tempX = prevX;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
					if ((col10m[prevX][prevY + 1] == 2) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 0) && (col10m[prevX][prevY + 4] == 2)) {
						tempX = prevX;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
	
				// top right to bottom left diagonal
				if ((prevX - 4 >= 0) && (prevY + 4 < maxY)) {
					if ((col10m[prevX - 1][prevY + 1] == 0) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 2) && (col10m[prevX - 4][prevY + 4] == 2)) {
						tempX = prevX - 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
					if ((col10m[prevX - 1][prevY + 1] == 2) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 0) && (col10m[prevX - 4][prevY + 4] == 2)) {
						tempX = prevX - 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
	
				// left to right
				if (prevX + 3 < maxX) {
					if ((col10m[prevX + 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 2) && (col10m[prevX + 4][prevY] == 2)) {
						tempX = prevX + 2;
						tempY = prevY;
						makemove = true;
						break;
					}
					if ((col10m[prevX + 1][prevY] == 2) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 0) && (col10m[prevX + 4][prevY] == 2)) {
						tempX = prevX + 2;
						tempY = prevY;
						makemove = true;
						break;
					}
				}
			}	
		}
		
		// Step 7: Handle special cases: Look for -X-XX- and -XX-X-
		if (!makemove) {
			//this.bubble("tracelog","Trying step 7...");
			for (n = 1; n <= xMoves ; n++) {
				prevX = xMovesX[n];
				prevY = xMovesY[n];
				
				// top left to bottom right diagonal
				if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 4 < maxX) && (prevY + 4 < maxY)) {
					if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 1][prevY + 1] == 0) && (col10m[prevX + 2][prevY + 2] == 1) && (col10m[prevX + 3][prevY + 3] == 1) && (col10m[prevX + 4][prevY + 4] == 0)) {
						tempX = prevX + 1;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
					if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 1][prevY + 1] == 1) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 1) && (col10m[prevX + 4][prevY + 4] == 0)) {
						tempX = prevX + 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
				
				// up and down
				if ((prevY - 1 >= 0) && (prevY + 4 < maxY)) {
					if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 1] == 0) && (col10m[prevX][prevY + 2] == 1) && (col10m[prevX][prevY + 3] == 1) && (col10m[prevX][prevY + 4] == 0)) {
						tempX = prevX;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
					if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 1] == 1) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 1) && (col10m[prevX][prevY + 4] == 0)) {
						tempX = prevX;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
	
				// top right to bottom left diagonal
				if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 4 >= 0) && (prevY + 4 < maxY)) {
					if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 1][prevY + 1] == 0) && (col10m[prevX - 2][prevY + 2] == 1) && (col10m[prevX - 3][prevY + 3] == 1) && (col10m[prevX - 4][prevY + 4] == 0)) {
						tempX = prevX - 1;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
					if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 1][prevY + 1] == 1) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 1) && (col10m[prevX - 4][prevY + 4] == 0)) {
						tempX = prevX - 2;
						tempY = prevY + 2;
						makemove = true;
						break;
					}
				}
	
				// left to right
				if ((prevX - 1 >= 0) && (prevX + 4 < maxX)) {
					if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 1) && (col10m[prevX + 3][prevY] == 1) && (col10m[prevX + 4][prevY] == 0)) {
						tempX = prevX + 1;
						tempY = prevY;
						makemove = true;
						break;
					}
					if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 1][prevY] == 1) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 1) && (col10m[prevX + 4][prevY] == 0)) {
						tempX = prevX + 2;
						tempY = prevY;
						makemove = true;
						break;
					}
				}
			}
		}	
			
		// Step 8: Block X getting four in a row: look for 3 "X"s in a row (with appropriate spaces - at least 2 on one side and 1 on the other)
		if (!makemove) {
			//this.bubble("tracelog","Trying step 8...");
			for (n = 1; n <= xMoves ; n++) {
				prevX = xMovesX[n];
				prevY = xMovesY[n];
				
				// top left to bottom right diagonal
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if ((prevX + m < maxX) && (prevY + m < maxY)) {
						if (col10m[prevX + m][prevY + m] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found XXX, so check if appropriate spaces exist
					// look for --XXX-
					if ((prevX - 2 >= 0) && (prevY - 2 >= 0) && (prevX + 3 < maxX) && (prevY + 3 < maxY)) {
						if ((col10m[prevX - 2][prevY - 2] == 0) && (col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 3][prevY + 3] == 0)) {
							tempX = prevX - 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
					// look for -XXX--
					if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 4 < maxX) && (prevY + 4 < maxY)) {
						if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 3][prevY + 3] == 0) && (col10m[prevX + 4][prevY + 4] == 0)) {
							tempX = prevX + 3;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
				
				// up and down
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if (prevY + m < maxY) {
						if (col10m[prevX][prevY + m] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found XXX, so check if appropriate spaces exist
					// look for --XXX-
					if ((prevY - 2 >= 0) && (prevY + 3 < maxY)) {
						if ((col10m[prevX][prevY - 2] == 0) && (col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 3] == 0)) {
							tempX = prevX;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
					// look for -XXX--
					if ((prevY - 1 >= 0) && (prevY + 4 < maxY)) {
						if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 3] == 0) && (col10m[prevX][prevY + 4] == 0)) {
							tempX = prevX;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
	
				// top right to bottom left diagonal
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if ((prevX - m >= 0) && (prevY + m < maxY)) {
						if (col10m[prevX - m][prevY + m] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found XXX, so check if appropriate spaces exist
					// look for --XXX-
					if ((prevX + 2 < maxX) && (prevY - 2 >= 0) && (prevX - 3 >= 0) && (prevY + 3 < maxY)) {
						if ((col10m[prevX + 2][prevY - 2] == 0) && (col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 3][prevY + 3] == 0)) {
							tempX = prevX + 1;
							tempY = prevY - 1;
							makemove = true;
							break;
						}
					}
					// look for -XXX--
					if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 4 >= 0) && (prevY + 4 < maxY)) {
						if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 3][prevY + 3] == 0) && (col10m[prevX - 4][prevY + 4] == 0)) {
							tempX = prevX - 3;
							tempY = prevY + 3;
							makemove = true;
							break;
						}
					}
				}
	
				// left to right
				cnt = 0;
				// look in the next 2 spaces
				for (m = 1; m <=2; m++) {
					if (prevX + m < maxX) {
						if (col10m[prevX + m][prevY] == 1) {
							cnt++;
						}
					}
				}
				if (cnt == 2) {
					// found XXX, so check if appropriate spaces exist
					// look for --XXX-
					if ((prevX - 2 >= 0) && (prevX + 3 < maxX)) {
						if ((col10m[prevX - 2][prevY] == 0) && (col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 3][prevY] == 0)) {
							tempX = prevX - 1;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
					// look for -XXX--
					if ((prevX - 1 >= 0) && (prevX + 4 < maxX)) {
						if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 3][prevY] == 0) && (col10m[prevX + 4][prevY] == 0)) {
							tempX = prevX + 3;
							tempY = prevY;
							makemove = true;
							break;
						}
					}
				}			
			}	
		}
		
		// Step 9: Try to form 3 "O"s in a row: look for two "O"s in a row with sufficient space to form -OOOO-
		if (!makemove) {
			//this.bubble("tracelog","Trying step 9...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				if ((prevX + 1 < maxX) && (prevY + 1 < maxY)) {
					if (col10m[prevX + 1][prevY + 1] == 2) {
						// found OO, so check for ---OO-, --OO--, -OO---
						if ((prevX - 3 >= 0) && (prevY - 3 >= 0) && (prevX + 2 < maxX) && (prevY + 2 < maxY)) {
							if ((col10m[prevX - 3][prevY - 3] == 0) && (col10m[prevX - 2][prevY - 2] == 0) && (col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 2][prevY + 2] == 0)) {
								tempX = prevX - 1;
								tempY = prevY - 1;
								makemove = true;
								break;
							}
						} else if ((prevX - 2 >= 0) && (prevY - 2 >= 0) && (prevX + 3 < maxX) && (prevY + 3 < maxY)) {
							if ((col10m[prevX - 2][prevY - 2] == 0) && (col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 0)) {
								tempX = prevX + 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						} else if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 4 < maxX) && (prevY + 4 < maxY)) {
							if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 0) && (col10m[prevX + 4][prevY + 4] == 0)) {
								tempX = prevX + 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						}
					}
				}
				
				// up and down
				if (prevY + 1 < maxY) {
					if (col10m[prevX][prevY + 1] == 2) {
						// found OO, so check for ---OO-, --OO--, -OO---
						if ((prevY - 3 >= 0) && (prevY + 2 < maxY)) {
							if ((col10m[prevX][prevY - 3] == 0) && (col10m[prevX][prevY - 2] == 0) && (col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 2] == 0)) {
								tempX = prevX;
								tempY = prevY - 1;
								makemove = true;
								break;
							}
						} else if ((prevY - 2 >= 0) && (prevY + 3 < maxY)) {
							if ((col10m[prevX][prevY - 2] == 0) && (col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 0)) {
								tempX = prevX;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						} else if ((prevY - 1 >= 0) && (prevY + 4 < maxY)) {
							if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 0) && (col10m[prevX][prevY + 4] == 0)) {
								tempX = prevX;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						}
					}
				}
				
				// top right to bottom left diagonal
				if ((prevX - 1 >= 0) && (prevY + 1 < maxY)) {
					if (col10m[prevX - 1][prevY + 1] == 2) {
						// found OO, so check for ---OO-, --OO--, -OO---
						if ((prevX + 3 < maxX) && (prevY - 3 >= 0) && (prevX - 2 >= 0) && (prevY + 2 < maxY)) {
							if ((col10m[prevX + 3][prevY - 3] == 0) && (col10m[prevX + 2][prevY - 2] == 0) && (col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 2][prevY + 2] == 0)) {
								tempX = prevX + 1;
								tempY = prevY - 1;
								makemove = true;
								break;
							}
						} else if ((prevX + 2 < maxX) && (prevY - 2 >= 0) && (prevX - 3 >= 0) && (prevY + 3 < maxY)) {
							if ((col10m[prevX + 2][prevY - 2] == 0) && (col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 0)) {
								tempX = prevX - 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						} else if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 4 >= 0) && (prevY + 4 < maxY)) {
							if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 0) && (col10m[prevX - 4][prevY + 4] == 0)) {
								tempX = prevX - 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						}
					}
				}
	
				// left to right
				if (prevX + 1 < maxX) {
					if (col10m[prevX + 1][prevY] == 2) {
						// found OO, so check for ---OO-, --OO--, -OO---
						if ((prevX - 3 >= 0) && (prevX + 2 < maxX)) {
							if ((col10m[prevX - 3][prevY] == 0) && (col10m[prevX - 2][prevY] == 0) && (col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 0)) {
								tempX = prevX - 1;
								tempY = prevY;
								makemove = true;
								break;
							}
						} else if ((prevX - 2 >= 0) && (prevX + 3 < maxX)) {
							if ((col10m[prevX - 2][prevY] == 0) && (col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 0)) {
								tempX = prevX + 2;
								tempY = prevY;
								makemove = true;
								break;
							}						
						} else if ((prevX - 1 >= 0) && (prevX + 4 < maxX)) {
							if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 0) && (col10m[prevX + 4][prevY] == 0)) {
								tempX = prevX + 2;
								tempY = prevY;
								makemove = true;
								break;
							}						
						}
					}
				}			
			}
		}
		
		// Step 10: Handle special case: Look for -O-O-
		if (!makemove) {
			//this.bubble("tracelog","Trying step 10...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 3 < maxX) && (prevY + 3 < maxY)) {
					if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 1][prevY + 1] == 0) && (col10m[prevX + 2][prevY + 2] == 2) && (col10m[prevX + 3][prevY + 3] == 0)) {
						tempX = prevX + 1;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
				}
				
				// up and down
				if ((prevY - 1 >=0) && (prevY + 3 < maxY)) {
					if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 1] == 0) && (col10m[prevX][prevY + 2] == 2) && (col10m[prevX][prevY + 3] == 0)) {
						tempX = prevX;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
				}
	
				// top right to bottom left diagonal
				if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 3 >= 0) && (prevY + 3 < maxY)) {
					if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 1][prevY + 1] == 0) && (col10m[prevX - 2][prevY + 2] == 2) && (col10m[prevX - 3][prevY + 3] == 0)) {
						tempX = prevX - 1;
						tempY = prevY + 1;
						makemove = true;
						break;
					}
				}
	
				// left to right
				if ((prevX - 1 >= 0) && (prevX + 3 < maxX)) {
					if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 2) && (col10m[prevX + 3][prevY] == 0)) {
						tempX = prevX + 1;
						tempY = prevY;
						makemove = true;
						break;
					}
				}
			}
		}	
		
		// Step 11: Try to form 3 "O"s in a row: look for two "O"s in a row with only just enough space to form 5 "O"s
		if (!makemove) {
			//this.bubble("tracelog","Trying step 11...");
			for (n = 1; n <= oMoves ; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				
				// top left to bottom right diagonal
				if ((prevX + 1 < maxX) && (prevY + 1 < maxY)) {
					if (col10m[prevX + 1][prevY + 1] == 2) {
						// found OO, so check for --OO-, -OO--
						if ((prevX - 2 >= 0) && (prevY - 2 >= 0) && (prevX + 2 < maxX) && (prevY + 2 < maxY)) {
							if ((col10m[prevX - 2][prevY - 2] == 0) && (col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 2][prevY + 2] == 0)) {
								tempX = prevX - 1;
								tempY = prevY - 1;
								makemove = true;
								break;
							}
						} else if ((prevX - 1 >= 0) && (prevY - 1 >= 0) && (prevX + 3 < maxX) && (prevY + 3 < maxY)) {
							if ((col10m[prevX - 1][prevY - 1] == 0) && (col10m[prevX + 2][prevY + 2] == 0) && (col10m[prevX + 3][prevY + 3] == 0)) {
								tempX = prevX + 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						}
					}
				}
				
				// up and down
				if (prevY + 1 < maxY) {
					if (col10m[prevX][prevY + 1] == 2) {
						// found OO, so check for --OO-, -OO--
						if ((prevY - 2 >= 0) && (prevY + 2 < maxY)) {
							if ((col10m[prevX][prevY - 2] == 0) && (col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 2] == 0)) {
								tempX = prevX;
								tempY = prevY - 1;
								makemove = true;
								break;
							}
						} else if ((prevY - 1 >= 0) && (prevY + 3 < maxY)) {
							if ((col10m[prevX][prevY - 1] == 0) && (col10m[prevX][prevY + 2] == 0) && (col10m[prevX][prevY + 3] == 0)) {
								tempX = prevX;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						}
					}
				}
				
				// top right to bottom left diagonal
				if ((prevX - 1 >= 0) && (prevY + 1 < maxY)) {
					if (col10m[prevX - 1][prevY + 1] == 2) {
						// found OO, so check for --OO-, -OO--
						if ((prevX + 2 < maxX) && (prevY - 2 >= 0) && (prevX - 2 >= 0) && (prevY + 2 < maxY)) {
							if ((col10m[prevX + 2][prevY - 2] == 0) && (col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 2][prevY + 2] == 0)) {
								tempX = prevX + 1;
								tempY = prevY - 1;
								makemove = true;
								break;
							}
						} else if ((prevX + 1 < maxX) && (prevY - 1 >= 0) && (prevX - 3 >= 0) && (prevY + 3 < maxY)) {
							if ((col10m[prevX + 1][prevY - 1] == 0) && (col10m[prevX - 2][prevY + 2] == 0) && (col10m[prevX - 3][prevY + 3] == 0)) {
								tempX = prevX - 2;
								tempY = prevY + 2;
								makemove = true;
								break;
							}						
						}
					}
				}
	
				// left to right
				if (prevX + 1 < maxX) {
					if (col10m[prevX + 1][prevY] == 2) {
						// found OO, so check for --OO-, -OO--
						if ((prevX - 2 >= 0) && (prevX + 2 < maxX)) {
							if ((col10m[prevX - 2][prevY] == 0) && (col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 0)) {
								tempX = prevX - 1;
								tempY = prevY;
								makemove = true;
								break;
							}
						} else if ((prevX - 1 >= 0) && (prevX + 3 < maxX)) {
							if ((col10m[prevX - 1][prevY] == 0) && (col10m[prevX + 2][prevY] == 0) && (col10m[prevX + 3][prevY] == 0)) {
								tempX = prevX + 2;
								tempY = prevY;
								makemove = true;
								break;
							}						
						}
					}
				}			
			}
		}
		
		// Step 12: Play a semi-random move near one of the previous moves
		if (!makemove) {
			//this.bubble("tracelog","Trying step 12...");
			loop1:
			for (n=1; n <= oMoves; n++) {
				prevX = oMovesX[n];
				prevY = oMovesY[n];
				choices = 0;
				distance = 1;
				loop2:
				do
				{
					do
					{
						choices++;
						if (choices == 15) {
							break loop2;
						}
						direction = Math.ceil(Math.random() * 8);
						loop3:
						switch (direction) {
						case 1:
							{
								tempX = prevX - distance;
								tempY = prevY - distance;
								break loop3;
							}
						case 2:
							{
								tempX = prevX;
								tempY = prevY - distance;
								break loop3;
							}
						case 3:
							{
								tempX = prevX + distance;
								tempY = prevY - distance;
								break loop3;
							}
						case 4:
							{
								tempX = prevX - distance;
								tempY = prevY;
								break loop3;
							}
						case 5:
							{
								tempX = prevX + distance;
								tempY = prevY;
								break loop3;
							}
						case 6:
							{
								tempX = prevX - distance;
								tempY = prevY + distance;
								break loop3;
							}
						case 7:
							{
								tempX = prevX;
								tempY = prevY + distance;
								break loop3;
							}
						case 8:
							{
								tempX = prevX + distance;
								tempY = prevY + distance;
							}				
						}
					} while ((tempX < 0) || (tempX >= maxX) || (tempY < 0) || (tempY >= maxY));
				} while (col10m[tempX][tempY] != 0);
				if ((choices != 15) && (col10m[tempX][tempY] == 0)) {
					// found a space next to one of O's moves
					makemove = true;
					break loop1;
				}
			}
		}
		
		// Step 13: Forced to play a dud move: random "O"
		if ((oMoves != 0) && (!makemove)) {
			//this.bubble("tracelog","Trying step 13 - random!...");
			do
			{
				tempX = Math.floor(Math.random() * maxX);
				tempY = Math.floor(Math.random() * maxY);
			}
			while (col10m[tempX][tempY] != 0);
		}
		
		// Make first move near X's first move
		if (oMoves == 0) {
			do
			{
				tempX = xMovesX[1];
				tempY = xMovesY[1];
				distance = Math.ceil(Math.random() * 2);
				direction = Math.ceil(Math.random() * 8);
				switch (direction) {
				case 1:
					{
						tempX = tempX - distance;
						tempY = tempY - distance;
						break;
					}
				case 2:
					{
						tempY = tempY - distance;
						break;
					}
				case 3:
					{
						tempX = tempX + distance;
						tempY = tempY - distance;
						break;
					}
				case 4:
					{
						tempX = tempX - distance;
						break;
					}
				case 5:
					{
						tempX = tempX + distance;
						break;
					}
				case 6:
					{
						tempX = tempX - distance;
						tempY = tempY + distance;
						break;
					}
				case 7:
					{
						tempY = tempY + distance;
						break;
					}
				case 8:
					{
						tempX = tempX + distance;
						tempY = tempY + distance;
					}				
				}
			} while ((tempX < 0) || (tempX >= maxX) || (tempY < 0) || (tempY >= maxY));
		}
		
		if (tempX < 10) {
			if (tempY < 10) {
				id = "3Buttons0" + tempX + '0' + tempY;
			} else {
				id = "3Buttons0" + tempX + '' + tempY;
			}
		} else {
			if (tempY < 10) {
				id = "3Buttons" + tempX + '0' + tempY;
			} else {
				id = "3Buttons" + tempX + '' + tempY;
			}
		}
		col10m[tempX][tempY] = 2;
		oMoves++; // first move stored in oMovesX[1] and oMovesY[1]
		oMovesX[oMoves] = tempX;
		oMovesY[oMoves] = tempY;
		return id;
	};
	
	target.checkWin = function (player) {
		var x, y, tempX, tempY, n, id,
		tempXA = [],
		tempYA = [],
		res = false,
		winsofar = 0,
		inarow;
	
		//searching for diagonals going from top left to bottom right
		for (y = 0; y < maxY - 4; y++) {
			for (x = 0; x < maxX - 4; x++) {
				if (col10m[x][y] == player) {
					tempX = x;
					tempY = y;
					inarow = 0;
					do
					{
						tempXA[winsofar + inarow] = tempX;
						tempYA[winsofar + inarow] = tempY;
						inarow++;
						tempX++;
						tempY++;
					}
					while ((col10m[tempX][tempY] == player) && (tempX < maxX) && (tempY < maxY));
					if (inarow > 4) {
						winsofar = winsofar + inarow;
					}
				}
			}
		}
		
		//searching for diagonals going from top right to bottom left
		for (y = 4; y < maxY; y++) {
			for (x = 0; x < maxX; x++) {
				if (col10m[x][y] == player) {
					tempX = x;
					tempY = y;
					inarow = 0;
					do
					{
						tempXA[winsofar + inarow] = tempX;
						tempYA[winsofar + inarow] = tempY;
						inarow++;
						tempX++;
						tempY--;
					}
					while ((col10m[tempX][tempY] == player) && (tempX < maxX) && (tempY > 0));
					if (inarow > 4) {
						winsofar = winsofar + inarow;
					}
				}
			}
		}
		
		//special search for diagonals going from top right to bottom left starting in the top row
		for (x = maxX; x > 4; x--) {
			if (col10m[x][0] == player) {
				tempX = x;
				tempY = 0;
				inarow = 0;
				do
				{
					tempXA[winsofar + inarow] = tempX;
					tempYA[winsofar + inarow] = tempY;
					inarow++;
					tempX--;
					tempY++;
				}
				while ((col10m[tempX][tempY] == player) && (tempX > 0) && (tempY < maxY));
				if (inarow > 4) {
					winsofar = winsofar + inarow;
				}
			}
		}
		
		//special handling of one tricky diagonal
		if ((col10m[4][0] == player) && (col10m[3][1] == player) && (col10m[2][2] == player) && (col10m[1][3] == player) && (col10m[0][4] == player)) {
			tempXA[winsofar] = 4;
			tempYA[winsofar] = 0;
			tempXA[winsofar + 1] = 3;
			tempYA[winsofar + 1] = 1;
			tempXA[winsofar + 2] = 2;
			tempYA[winsofar + 2] = 2;
			tempXA[winsofar + 3] = 1;
			tempYA[winsofar + 3] = 3;
			tempXA[winsofar + 4] = 0;
			tempYA[winsofar + 4] = 4;
			winsofar = winsofar + 5;
		}
		
		//searching for up and down
		for (y = 0; y < maxY - 4; y++) {
			for (x = 0; x < maxX; x++) {
				if (col10m[x][y] == player) {
					tempX = x;
					tempY = y;
					inarow = 0;
					do
					{
						tempXA[winsofar + inarow] = tempX;
						tempYA[winsofar + inarow] = tempY;
						inarow++;
						tempY++;
					}
					while ((col10m[tempX][tempY] == player) && (tempY < maxY));
					if (inarow > 4) {
						winsofar = winsofar + inarow;
					}
				}
			}
		}
	
		//searching for left to right
		for (x = 0; x < maxX - 4; x++) {
			for (y = 0; y < maxY; y++) {
				if (col10m[x][y] == player) {
					tempX = x;
					tempY = y;
					inarow = 0;
					do
					{
						tempXA[winsofar + inarow] = tempX;
						tempYA[winsofar + inarow] = tempY;
						inarow++;
						tempX++;
					}
					while ((col10m[tempX][tempY] == player) && (tempX < maxX));
					if (inarow > 4) {
						winsofar = winsofar + inarow;
					}
				}
			}
		}
		
		//check for result
		if (winsofar > 4) {
			res = true;
			gameover = true;
			
			if (players == 2) {
				if (player == 1) {
					// player 1 wins
					this.showTurn.setValue("Player 1 won!");
				} else {
					// player 2 wins
					this.showTurn.setValue("Player 2 won!");
				}
			} else {
				if (player == 1) {
					// player 1 wins
					this.showTurn.setValue("Congratulations!  You won!");
				} else {
					// reader wins
					this.showTurn.setValue("Bad luck!  I won!");
				}
			}
			this.grid2Cursor.show(false);
			this.grid1Cursor.show(false);
	
			
			//change buttons for entries in the temp arrays of tuplets
			for (n = 0; n < winsofar; n++) {
				//get button id using XA and YA
				if (tempXA[n] < 10) {
					if (tempYA[n] < 10) {
						id = "3Buttons0" + tempXA[n] + '0' + tempYA[n];
					} else {
						id = "3Buttons0" + tempXA[n] + '' + tempYA[n];
					}
				} else {
					if (tempYA[n] < 10) {
						id = "3Buttons" + tempXA[n] + '0' + tempYA[n];
					} else {
						id = "3Buttons" + tempXA[n] + '' + tempYA[n];
					}
				}
				//set button.u=player+2 (buttons with colors inverted)
				this[id].u = player + 2;
			}
			//this.setButtons();
		}
		return res;
	};
	
	target.checkfordraw = function () {
		var placesleft = 0, res = false, x, y;
		for (x = 0; x < maxX; x++) {
			for (y = 0; y < maxY; y++) {
				if (col10m[x][y] == 0) {
					placesleft++;
				}
			}
		}
		if (placesleft == 0) {
			this.showTurn.setValue("It's a draw!");
			gameover = true;
			res = true;
		}
		return res;
	};
	
	target.placeXO = function () {
		var id, res = false, drawres = false;
	
		if (Exiting) {
			kbook.autoRunRoot.exitIf(kbook.model);
		}
		
		if (gameover) {
			return;
		}
		
		if (posX < 10) {
			if (posY < 10) {
				id = "3Buttons0" + posX + '0' + posY;
			} else {
				id = "3Buttons0" + posX + '' + posY;
			}
		} else {
			if (posY < 10) {
				id = "3Buttons" + posX + '0' + posY;
			} else {
				id = "3Buttons" + posX + '' + posY;
			}
		}
		
		if (player1turn) {
			// player 1 places "X"
			if (col10m[posX][posY] != 0) {
				return;
			}
			col10m[posX][posY] = 1;
			this[id].u = 1;
			
			// store X's moves to help determine O's moves
			xMoves++;
			xMovesX[xMoves] = posX;
			xMovesY[xMoves] = posY;
			
			// check for win
			res = this.checkWin(1);
	
			if (!res) {
				// if not win
				// check for draw (no free spaces)
				drawres = this.checkfordraw();
				if (!drawres) {
					if (players == 1) {
						// reader's turn
						this.showTurn.setValue("My turn...");
						if (!isTouch) {
							this.grid1Cursor.show(false);
						}
						FskUI.Window.update.call(kbook.model.container.getWindow());
						id = target.placeO();
						this[id].u = 2;
											
						// check for win
						res = this.checkWin(2);
						
						if (!res) {
							// if not win
							// check for draw (no free spaces)
							drawres = this.checkfordraw();
							if (!drawres) {
								this.showTurn.setValue("Your turn...");
								if (!isTouch) {
									this.grid1Cursor.show(true);
								}
							}
						}
					} else {
						// player 2's turn
						player1turn = false;
						this.showTurn.setValue("Player 2's turn...");
						this.drawgrid2Cursor(posX, posY);
						if (!isTouch) {
							this.grid2Cursor.show(true);
							this.grid1Cursor.show(false);
						}
					}
				}
			}
		} else {
			// player 2 places "O"
			if (col10m[posX][posY] != 0) {
				return;
			}
			col10m[posX][posY] = 2;
			this[id].u = 2;
			//this.setButtons();
			
			// check for win
			res = this.checkWin(2);
			
			if (!res) {
				// if not win
				// check for draw (no free spaces)
				drawres = this.checkfordraw();
				if (!drawres) {
					player1turn = true;
					this.showTurn.setValue("Player 1's turn...");
					this.drawgrid1Cursor(posX, posY);
					if (!isTouch) {
						this.grid1Cursor.show(true);
						this.grid2Cursor.show(false);
					}
				}
			} else {
				// player 2 won!
				this.showTurn.setValue("Player 2 won!");
				this.showTurn.show(true);
				this.grid2Cursor.show(false);
				this.grid1Cursor.show(false);
				return;
			}
		}
	};
	
	target.doGridClick = function (sender) {
		var id, y, x, u;
		id = getSoValue(sender, "id");
		x = id.substring(8, 10);
		y = id.substring(10, 12);
		u = getSoValue(sender,"u");
		if (u == 0) {
			posX = parseInt(x, 10);
			posY = parseInt(y, 10);
			if (players == 2) {
				if (player1turn) {
					this.drawgrid1Cursor(posX, posY);
				} else {
					this.drawgrid2Cursor(posX, posY);
				}
			} else {
				this.drawgrid1Cursor(posX, posY);
			}
			this.placeXO();
		}	
	};
	
	target.doButtonClick = function (sender) {
		var id, n;
	    id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "ONE") {
			this.GameOnePlayer();
			return;
		}
		if (n == "TWO") {
			this.GameTwoPlayers();
			return;
		}	
	};
	
	target.moveCursor = function (dir) {
		switch (dir) {
		case "down":
			{
				posY = (posY + 1) % maxY;
				break;
			}
		case "up":
			{
				posY = (maxY + posY - 1) % maxY;
				break;
			}
		case "left":
			{
				posX = (maxX + posX - 1) % maxX;
				break;
			}
		case "right":
			{
				posX = (posX + 1) % maxX;
				break;
			}
		}
		if (players == 2) {
			if (player1turn) {
				this.drawgrid1Cursor(posX, posY);
			} else {
				this.drawgrid2Cursor(posX, posY);
			}
		} else {
			this.drawgrid1Cursor(posX, posY);
		}
	};
	
	target.doRoot = function (sender) {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};
	
	target.GameOnePlayer = function () {
		players = 1;
		this.resetButtons();
		posX = 5;
		posY = 6;
		gameover = false;
		oMoves = 0;
		xMoves = 0;
		this.drawgrid1Cursor(posX, posY);
		this.drawgrid2Cursor(posX, posY);
		this.showTurn.setValue("Your turn...");
		player1turn = true;
		if (!isTouch) {
			this.grid1Cursor.show(true);
			this.grid2Cursor.show(false);
		}
	};
	
	target.GameTwoPlayers = function () {
		players = 2;
		this.resetButtons();
		posX = 5;
		posY = 6;
		gameover = false;
		oMoves = 0;
		xMoves = 0;
		this.drawgrid1Cursor(posX, posY);
		this.drawgrid2Cursor(posX, posY);
		this.showTurn.setValue("Player 1's turn...");
		player1turn = true;
		if (!isTouch) {
			this.grid1Cursor.show(true);
			this.grid2Cursor.show(false);
		}
	};
	
	target.newGame = function (digit) {
		switch (digit*1) {	/* typecast to number */
		case 1:
			{
				players = 1;
				this.resetButtons();
				posX = 5;
				posY = 6;
				gameover = false;
				oMoves = 0;
				xMoves = 0;
				this.drawgrid1Cursor(posX, posY);
				this.drawgrid2Cursor(posX, posY);
				this.showTurn.setValue("Your turn...");
				player1turn = true;
				if (!isTouch) {
					this.grid1Cursor.show(true);
					this.grid2Cursor.show(false);
				}
				return;
			}
		case 2:
			{
				players = 2;
				this.resetButtons();
				posX = 5;
				posY = 6;
				gameover = false;
				oMoves = 0;
				xMoves = 0;
				this.drawgrid1Cursor(posX, posY);
				this.drawgrid2Cursor(posX, posY);
				this.showTurn.setValue("Player 1's turn...");
				player1turn = true;
				if (!isTouch) {
					this.grid1Cursor.show(true);
					this.grid2Cursor.show(false);
				}
				return;
			}
		case 0:
			{
				kbook.autoRunRoot.exitIf(kbook.model);
				return;
			}
		}
	};
	
	target.doCenterF = function () {
		return;
	};
};
tmp();
tmp = undefined;