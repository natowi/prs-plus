//
// Draughts for Sony Reader
// by Ben Chenoweth
//
// Initial version: 2011-03-19 (2 player only)
// Changelog:
// 2011-03-19 Ben Chenoweth - AI implemented, but requires further refinement.
//							  The AI code is based on a Draughts game by Kurt Grigg (http://www.hypergurl.com/games/draughts.html)
//							  But I have adapted it and refined it, adding extra steps, which has improved the difficulty a little.
// 2011-03-20 Ben Chenoweth - Located bugs that were causing the AI to hang occasionally; moved all labels out of the status bar.
// 2011-03-25 Ben Chenoweth - Skins changed over to use common AppAssests
// 2011-03-26 Mark Nord - Fixed the popup panel
// 2011-03-27 Ben Chenoweth - Fixed labels for PRS-950
// 2011-03-28 Ben Chenoweth - AI improved
// 2011-03-29 Ben Chenoweth - Further improvements to AI
// 2011-03-30 Ben Chenoweth - Added new first step to AI: look for multi-step jump
// 2011-03-31 Ben Chenoweth - Change board format for kings (to make regular and ai representations the same)
// 2011-04-03 Ben Chenoweth - Moved all labels around slightly
// 2011-09-19 Ben Chenoweth - Added setting: pawns can capture backwards
// 2011-09-20 Ben Chenoweth - Added setting: compulsory jumping

var tmp = function () {

	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var getFileContent = kbook.autoRunRoot.getFileContent;

	var undoboard;
	var currundo;
	var undodepth;	
	var auto_mode = true;
	var cursorX = 0;
	var cursorY = 445;
	var lastEnd_x = -1;
	var lastEnd_y = -1;
	var black = -1; // computer is black
	var white = 1; // visitor is white
	var square_dim = 35;
	var piece_toggled = false;
	var curr_x;
	var curr_y;
	var black_turn = false;
	var double_jump = false;
	var comp_move = false;
	var game_is_over = false;
	var safe_from = safe_to = null;
	var jump_priority = 10;	// the higher the jump_priority, the more often the computer will take the jump over the safe move
	var board = [[],[],[],[],[],[],[],[]];
	var startLayout = [[0,-1,0,0,0,1,0,1],[-1,0,-1,0,0,0,1,0],[0,-1,0,0,0,1,0,1],[-1,0,-1,0,0,0,1,0],[0,-1,0,0,0,1,0,1],[-1,0,-1,0,0,0,1,0],[0,-1,0,0,0,1,0,1],[-1,0,-1,0,0,0,1,0]];

	var bestlength;
	var bestboard = [[],[],[],[],[],[],[],[]];
	var bestlastendx;
	var bestlastendy;
	var foundmultijump;
	var templength;
	var tempboard = [[],[],[],[],[],[],[],[],[],[]];
	
	var datPath0 = kbook.autoRunRoot.gamesSavePath+'Draughts/';
	FileSystem.ensureDirectory(datPath0);  
	var settingsPath = datPath0 + 'settings.dat';
	var settingsDlgOpen = false;
	var PawnsCaptureBackwards = "NO";
	var CompulsoryJumping = "NO";
	var mouseLeave = getSoValue( target.SETTINGS_DIALOG.btn_Cancel,'mouseLeave');
	var mouseEnter = getSoValue( target.SETTINGS_DIALOG.btn_Cancel,'mouseEnter');

	// variables to be saved to a file
	target.settings = {	
		PawnsCaptureBackwards : "NO",
		CompulsoryJumping : "NO"
	};        

	// reads values of target.settings.xx from file
	target.loadSettings = function () {
		var stream, inpLine;
		var values = [];
      	try {
      		if (FileSystem.getFileInfo(settingsPath)) {
      			stream = new Stream.File(settingsPath);    			
		      	while (stream.bytesAvailable) {
      				inpLine = stream.readLine();
      				values = inpLine.split(':');
      				if ((values[1] == 'true') || (values[1] == 'false')) {   					
						target.settings[values[0]] = values[1] == 'true';
      				} else {
      					target.settings[values[0]]=values[1];  
      				}
      			}
      		}	
      		stream.close();
      	} catch (e) {}
		CompulsoryJumping=target.settings.CompulsoryJumping;
		PawnsCaptureBackwards=target.settings.PawnsCaptureBackwards;
	}         

	// writes values of target.settings.xx to file         
	target.saveSettings = function () { 
		var o, stream;
      	try {
      		if (FileSystem.getFileInfo(settingsPath)) FileSystem.deleteFile(settingsPath);
      		stream = new Stream.File(settingsPath, 1);
      		for (o in target.settings) {
      			stream.writeLine(o+':'+target.settings[o]);
      		}
      		stream.close();
      	} catch (e) { }         
    } 

	// Load settings from save file once at startup
	target.loadSettings();
	
	// assign model-variables
	with (target.settings) {
		PawnsCaptureBackwards = PawnsCaptureBackwards;
		target.setVariable("pawns_capture_backwards",PawnsCaptureBackwards);
		target.setVariable("compulsory_jumping",CompulsoryJumping);
	}
	
	target.init = function () {
		var i;
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;		

	
		// hide unwanted graphics
		this.congratulations.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection2.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection3.changeLayout(0, 0, uD, 0, 0, uD);
		this.sometext1.show(false);
		this.nonTouch5.show(false);
		this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
		this.jumpText.show(false);
	
		if (hasNumericButtons) {
			this.BUTTON_RES.show(false);
			//this.BUTTON_EXT.show(false);
			this.gridCursor.changeLayout(cursorX, 75, uD, cursorY, 75, uD);
			this.touchButtons3.show(false);
			this.touchButtons4.show(false);
			this.touchButtons1.show(false);
			this.touchButtons2.show(false);
		} else {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
			this.nonTouch.show(false);
			this.nonTouch2.show(false);
			this.nonTouch3.show(false);			
			this.nonTouch4.show(false);
			this.nonTouch6.show(false);
			this.nonTouch_colHelp.show(false);
		}
	
		// initiate board
		this.setupBoard();
		board[8] = new Array(); // prevents errors
		board[9] = new Array(); // prevents errors
		this.writePieces();
	
		// set up undo arrays
		undodepth=11; // this allows for 10 undos
		currundo=0;
		undoboard=new Array(undodepth);
		for (t=0; t<undodepth; t++)
		{
			undoboard[t]=new Array(8);
			for (r=0; r<8; r++)
			{
				undoboard[t][r]=new Array(8);
			}
		}		
		this.updateUndo();
		return;
	};

	target.setupBoard = function () {
		var i,j;
		for (i=0; i<8; i++) {
			for (j=0; j<8; j++) {
				board[i][j] = startLayout[i][j];
			}
		}
		return;
	};
	
	target.writePieces = function () {
		var sqrContent,x,y,pieceId=-1,num_white=0,num_black=0;
		var black_moves=false,white_moves=false;
		//this.bubble("tracelog","redraw board");
		for (x=0; x<8; x++) {
			for (y=0; y<8; y++) {
				sqrContent = board[x][y];
				if (sqrContent!=0) {
					pieceId++;	
					//this.bubble("tracelog","x="+x+", y="+y+", sqrContent="+sqrContent);
					if (sqrContent==1) {
						this['piece' + pieceId].u = 0;
						num_white++;
						
						// check to see if white pawn has a valid move
						if (!white_moves) {
							if ((y>0) && (x>0) && (board[x-1][y-1]==0)) white_moves=true;
							if ((y>0) && (board[x+1][y-1]==0)) white_moves=true;
							if ((y>1) && (x>1) && (board[x-1][y-1]<0) && (board[x-2][y-2]==0)) white_moves=true;
							if ((y>1) && (board[x+1][y-1]<0) && (board[x+2][y-2]==0)) white_moves=true;
							if (PawnsCaptureBackwards=="YES") {
								if ((y<6) && (x>1) && (board[x-1][y+1]<0) && (board[x-2][y+2]==0)) white_moves=true;
								if ((y<6) && (board[x+1][y+1]<0) && (board[x+2][y+2]==0)) white_moves=true;
							}
						}
					}
					if (sqrContent==1.1) {
						this['piece' + pieceId].u = 1;
						num_white++;
						
						// check to see if white king has a valid move
						if (!white_moves) {
							if ((y>0) && (x>0) && (board[x-1][y-1]==0)) white_moves=true;
							if ((y>0) && (board[x+1][y-1]==0)) white_moves=true;
							if ((y>1) && (x>1) && (board[x-1][y-1]<0) && (board[x-2][y-2]==0)) white_moves=true;
							if ((y>1) && (board[x+1][y-1]<0) && (board[x+2][y-2]==0)) white_moves=true;
							if ((y<7) && (x>0) && (board[x-1][y+1]==0)) white_moves=true;
							if ((y<7) && (board[x+1][y+1]==0)) white_moves=true;
							if ((y<6) && (x>1) && (board[x-1][y+1]<0) && (board[x-2][y+2]==0)) white_moves=true;
							if ((y<6) && (board[x+1][y+1]<0) && (board[x+2][y+2]==0)) white_moves=true;
						}
					}
					if (sqrContent==-1) {
						this['piece' + pieceId].u = 2;
						num_black++;
						
						// check to see if black pawn has a valid move
						if (!black_moves) {
							if ((y<7) && (x>0) && (board[x-1][y+1]==0)) black_moves=true;
							if ((y<7) && (board[x+1][y+1]==0)) black_moves=true;
							if ((y<6) && (x>1) && (board[x-1][y+1]>0) && (board[x-2][y+2]==0)) black_moves=true;
							if ((y<6) && (board[x+1][y+1]>0) && (board[x+2][y+2]==0)) black_moves=true;
							if (PawnsCaptureBackwards=="YES") {
								if ((y>1) && (x>1) && (board[x-1][y-1]>0) && (board[x-2][y-2]==0)) black_moves=true;
								if ((y>1) && (board[x+1][y-1]>0) && (board[x+2][y-2]==0)) black_moves=true;
							}
						}
					}
					if (sqrContent==-1.1) {
						this['piece' + pieceId].u = 3;
						num_black++;
						
						// check to see if black king has a valid move
						if (!black_moves) {
							if ((y>0) && (x>0) && (board[x-1][y-1]==0)) black_moves=true;
							if ((y>0) && (board[x+1][y-1]==0)) black_moves=true;
							if ((y>1) && (x>1) && (board[x-1][y-1]>0) && (board[x-2][y-2]==0)) black_moves=true;
							if ((y>1) && (board[x+1][y-1]>0) && (board[x+2][y-2]==0)) black_moves=true;
							if ((y<7) && (x>0) && (board[x-1][y+1]==0)) black_moves=true;
							if ((y<7) && (board[x+1][y+1]==0)) black_moves=true;
							if ((y<6) && (x>1) && (board[x-1][y+1]>0) && (board[x-2][y+2]==0)) black_moves=true;
							if ((y<6) && (board[x+1][y+1]>0) && (board[x+2][y+2]==0)) black_moves=true;
						}
					}
					this['piece' + pieceId].changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
				}
				if ((x == lastEnd_x) && (y == lastEnd_y)) {
					// place selection3 mask over square to indicate previous move end
					this.selection3.changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
				}
			}
		}
	
		// hide unwanted pieces
		if (pieceId < 23) {
			do {
				pieceId++;
				this['piece' + pieceId].changeLayout(0, 0, uD, 0, 0, uD);
			} while (pieceId < 23);
		}
		
		// check for outright win
		if (num_black==0) {
			// White wins
			this.messageStatus.setValue("White wins!");
			game_is_over=true;
		} else if (num_white==0) {
			// Black wins
			this.messageStatus.setValue("Black wins!");
			game_is_over=true;
		}
		
		// check for player with no possible moves
		if ((black_turn) && (!black_moves)) {
			// White wins
			this.messageStatus.setValue("White wins!");
			game_is_over=true;
		} else if ((!black_turn) && (!white_moves)) {
			// Black wins
			this.messageStatus.setValue("Black wins!");
			game_is_over=true;
		}
		return;
	};
	
	target.doSquareClick = function (sender) {
		var id, n, x, y;
		id = getSoValue(sender, "id");
		n = id.substring(6, 8);
		x = n % 8; // find column
		y = Math.floor(n / 8); // find row
		//this.bubble("tracelog","n="+n+", x="+x+", y="+y);
		this.makeSelection(x,y);
		return;
	};
	
	target.makeSelection = function (x,y) {
		var check_for_double_jump=false;
		var white_jump=false;
		var black_jump=false;
		var i,j,sqrContent;
		
		if (game_is_over) {
			return;
		}
		
		if (!black_turn) {
			// white's turn
			if ((board[x][y]>0) && (!double_jump)) {
				// player can change which piece is selected, as long as a double jump is not in progress
				this.squareFocus(x, y, true);
				piece_toggled=true;
				curr_x=x;
				curr_y=y;
			} else if (piece_toggled) {
				// check for ending a possible double jump without jumping
				if ((double_jump) && (curr_x==x) && (curr_y==y)) {
					this.squareFocus(x, y, false);
					lastEnd_x=x;
					lastEnd_y=y;
					black_turn=true;
					piece_toggled=false;
					double_jump=false;
					this.updateUndo();
					this.writePieces();
					this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
					this.jumpText.show(false);
					if (!game_is_over) {
						this.messageStatus.setValue("Black's turn");
						if (auto_mode) {
							FskUI.Window.update.call(kbook.model.container.getWindow());
							this.autoMove();
						}
					}
				}
				// if compulsory jumping, check for possible jump first
				if (CompulsoryJumping=="YES") {
					for (i=0; i<8; i++) {
						for (j=0; j<8; j++) {
							sqrContent = board[i][j];
							if (sqrContent==1) {
								// check to see if white pawn has a jump
								if (!white_jump) {
									if ((j>1) && (i>1) && (board[i-1][j-1]<0) && (board[i-2][j-2]==0)) white_jump=true;
									if ((j>1) && (board[i+1][j-1]<0) && (board[i+2][j-2]==0)) white_jump=true;
									if (PawnsCaptureBackwards=="YES") {
										if ((i>1) && (board[i-1][j+1]<0) && (board[i-2][j+2]==0)) white_jump=true;
										if ((board[i+1][j+1]<0) && (board[i+2][j+2]==0)) white_jump=true;
									}
								}
							}
							if (sqrContent==1.1) {
								// check to see if white king has a jump
								if (!white_jump) {
									if ((j>1) && (i>1) && (board[i-1][j-1]<0) && (board[i-2][j-2]==0)) white_jump=true;
									if ((j>1) && (board[i+1][j-1]<0) && (board[i+2][j-2]==0)) white_jump=true;
									if ((i>1) && (board[i-1][j+1]<0) && (board[i-2][j+2]==0)) white_jump=true;
									if ((board[i+1][j+1]<0) && (board[i+2][j+2]==0)) white_jump=true;
								}
							}
						}
					}
				}
				// check for valid move
				if (board[curr_x][curr_y]==1) {
					// trying to move a pawn
					if ((y==curr_y-1) && ((x==curr_x-1) || (x==curr_x+1)) && (board[x][y]==0) && (!double_jump)) {
						// single move into free square (not possible during double jump)
						if ((CompulsoryJumping=="YES") && white_jump) {
							
						} else {
							board[curr_x][curr_y]=0;
							if (y==0) {
								board[x][y]=1.1;
							} else {
								board[x][y]=1;
							}
							this.squareFocus(curr_x, curr_y, false);
							lastEnd_x=x;
							lastEnd_y=y;
							black_turn=true;
							piece_toggled=false;
							this.updateUndo();
							this.writePieces();
							this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
							this.jumpText.show(false);
							if (!game_is_over) {
								this.messageStatus.setValue("Black's turn");
								if (auto_mode) {
									FskUI.Window.update.call(kbook.model.container.getWindow());
									this.autoMove();
								}
							}
						}
					}
					if (y==curr_y-2) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y-1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y-1]=0;
							if (y==0) {
								board[x][y]=1.1;
							} else {
								board[x][y]=1;
							}
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y-1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y-1]=0;
							if (y==0) {
								board[x][y]=1.1;
							} else {
								board[x][y]=1;
							}
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y>1) && (x>1) && (((board[x-1][y-1]<0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]<0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]<0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=true;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								if (!game_is_over) {
									this.messageStatus.setValue("Black's turn");
									if (auto_mode) {
										FskUI.Window.update.call(kbook.model.container.getWindow());
										this.autoMove();
									}
								}							
							}
						}
					}
					if ((y==curr_y+2) && (PawnsCaptureBackwards=="YES")) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y+1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y+1]=0;
							if (y==0) {
								board[x][y]=1.1;
							} else {
								board[x][y]=1;
							}
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y+1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y+1]=0;
							if (y==0) {
								board[x][y]=1.1;
							} else {
								board[x][y]=1;
							}
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y>1) && (x>1) && (((board[x-1][y-1]<0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]<0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]<0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && (x>1) && (((board[x-1][y+1]<0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]<0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]<0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=true;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								if (!game_is_over) {
									this.messageStatus.setValue("Black's turn");
									if (auto_mode) {
										FskUI.Window.update.call(kbook.model.container.getWindow());
										this.autoMove();
									}
								}							
							}
						}
					}
				}
				if (board[curr_x][curr_y]==1.1) {
					// trying to move a king
					if ((y==curr_y-1) && ((x==curr_x-1) || (x==curr_x+1)) && (board[x][y]==0) && (!double_jump)) {
						// single move into free square (not possible during double jump)
						if ((CompulsoryJumping=="YES") && white_jump) {
							
						} else {
							board[curr_x][curr_y]=0;
							board[x][y]=1.1;
							this.squareFocus(curr_x, curr_y, false);
							lastEnd_x=x;
							lastEnd_y=y;
							black_turn=true;
							piece_toggled=false;
							this.updateUndo();
							this.writePieces();
							this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
							this.jumpText.show(false);
							if (!game_is_over) {
								this.messageStatus.setValue("Black's turn");
								if (auto_mode) {
									FskUI.Window.update.call(kbook.model.container.getWindow());
									this.autoMove();
								}
							}
						}
					}
					if ((y==curr_y+1) && ((x==curr_x-1) || (x==curr_x+1)) && (board[x][y]==0) && (!double_jump)) {
						// single move into free square (not possible during double jump)
						if ((CompulsoryJumping=="YES") && white_jump) {
							
						} else {
							board[curr_x][curr_y]=0;
							board[x][y]=1.1;
							this.squareFocus(curr_x, curr_y, false);
							lastEnd_x=x;
							lastEnd_y=y;
							black_turn=true;
							piece_toggled=false;
							this.updateUndo();
							this.writePieces();
							this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
							this.jumpText.show(false);
							if (!game_is_over) {
								this.messageStatus.setValue("Black's turn");
								if (auto_mode) {
									FskUI.Window.update.call(kbook.model.container.getWindow());
									this.autoMove();
								}
							}
						}
					}					
					if (y==curr_y-2) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y-1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y-1]=0;
							board[x][y]=1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y-1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y-1]=0;
							board[x][y]=1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y>1) && (x>1) && (((board[x-1][y-1]<0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]<0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]<0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else if ((y<6) && (x>1) && (((board[x-1][y+1]<0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]<0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]<0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=true;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								if (!game_is_over) {
									this.messageStatus.setValue("Black's turn");
									if (auto_mode) {
										FskUI.Window.update.call(kbook.model.container.getWindow());
										this.autoMove();
									}
								}							
							}
						}
					}
					if (y==curr_y+2) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y+1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y+1]=0;
							board[x][y]=1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y+1]<0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y+1]=0;
							board[x][y]=1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y>1) && (x>1) && (((board[x-1][y-1]<0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]<0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]<0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else if ((y<6) && (x>1) && (((board[x-1][y+1]<0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]<0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]<0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=true;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								if (!game_is_over) {
									this.messageStatus.setValue("Black's turn");
									if (auto_mode) {
										FskUI.Window.update.call(kbook.model.container.getWindow());
										this.autoMove();
									}
								}							
							}
						}
					}						
				}
			}
		} else {
			// black's turn
			if (auto_mode) return;
			if ((board[x][y]<0) && (!double_jump)) {
				// player can change which piece is selected, as long as a double jump is not in progress
				this.squareFocus(x, y, true);
				piece_toggled=true;
				curr_x=x;
				curr_y=y;
			} else if (piece_toggled) {
				// check for ending a possible double jump without jumping
				if ((double_jump) && (curr_x==x) && (curr_y==y)) {
					this.squareFocus(x, y, false);
					lastEnd_x=x;
					lastEnd_y=y;
					black_turn=false;
					piece_toggled=false;
					double_jump=false;
					this.updateUndo();
					this.writePieces();
					this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
					this.jumpText.show(false);
					this.messageStatus.setValue("White's turn");				
				}
				// if compulsory jumping, check for possible jump first
				if (CompulsoryJumping=="YES") {
					for (i=0; i<8; i++) {
						for (j=0; j<8; j++) {
							sqrContent = board[i][j];
							if (sqrContent==-1) {
								// check to see if black pawn has a jump
								if (!black_jump) {
									if ((i>1) && (board[i-1][j+1]>0) && (board[i-2][j+2]==0)) black_jump=true;
									if ((board[i+1][j+1]>0) && (board[i+2][j+2]==0)) black_jump=true;
									if (PawnsCaptureBackwards=="YES") {
										if ((j>1) && (i>1) && (board[i-1][j-1]>0) && (board[i-2][j-2]==0)) black_jump=true;
										if ((j>1) && (board[i+1][j-1]>0) && (board[i+2][j-2]==0)) black_jump=true;
									}
								}
							}
							if (sqrContent==-1.1) {
								// check to see if black king has a jump
								if (!black_jump) {
									if ((j>1) && (i>1) && (board[i-1][j-1]>0) && (board[i-2][j-2]==0)) black_jump=true;
									if ((j>1) && (board[i+1][j-1]>0) && (board[i+2][j-2]==0)) black_jump=true;
									if ((j<6) && (i>1) && (board[i-1][j+1]>0) && (board[i-2][j+2]==0)) black_jump=true;
									if ((j<6) && (board[i+1][j+1]>0) && (board[i+2][j+2]==0)) black_jump=true;
								}
							}
						}
					}
				}
				// check for valid move
				if (board[curr_x][curr_y]==-1) {
					// trying to move a pawn
					if ((y==curr_y+1) && ((x==curr_x-1) || (x==curr_x+1)) && (board[x][y]==0) && (!double_jump)) {
						// single move into free square (not possible during double jump)
						if ((CompulsoryJumping=="YES") && black_jump) {
							
						} else {
							board[curr_x][curr_y]=0;
							if (y==7) {
								board[x][y]=-1.1;
							} else {
								board[x][y]=-1;
							}
							this.squareFocus(curr_x, curr_y, false);
							lastEnd_x=x;
							lastEnd_y=y;
							black_turn=false;
							piece_toggled=false;
							this.updateUndo();
							this.writePieces();
							this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
							this.jumpText.show(false);
							this.messageStatus.setValue("White's turn");
						}
					}
					if (y==curr_y+2) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y+1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y+1]=0;
							if (y==7) {
								board[x][y]=-1.1;
							} else {
								board[x][y]=-1;
							}
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y+1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y+1]=0;
							if (y==7) {
								board[x][y]=-1.1;
							} else {
								board[x][y]=-1;
							}

							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y<6) && (x>1) && (((board[x-1][y+1]>0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]>0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]>0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							}else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=false;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								this.messageStatus.setValue("White's turn");								
							}
						}
					}
					if ((y==curr_y-2) && (PawnsCaptureBackwards=="YES")) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y-1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y-1]=0;
							if (y==7) {
								board[x][y]=-1.1;
							} else {
								board[x][y]=-1;
							}
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y-1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y-1]=0;
							if (y==7) {
								board[x][y]=-1.1;
							} else {
								board[x][y]=-1;
							}

							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y<6) && (x>1) && (((board[x-1][y+1]>0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]>0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]>0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && (x>1) && (((board[x-1][y-1]>0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]>0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]>0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=false;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								this.messageStatus.setValue("White's turn");								
							}
						}
					}
				}
				if (board[curr_x][curr_y]==-1.1) {
					// trying to move a king
					if ((y==curr_y-1) && ((x==curr_x-1) || (x==curr_x+1)) && (board[x][y]==0) && (!double_jump)) {
						// single move into free square (not possible during double jump)
						if ((CompulsoryJumping=="YES") && black_jump) {
							
						} else {
							board[curr_x][curr_y]=0;
							board[x][y]=-1.1;
							this.squareFocus(curr_x, curr_y, false);
							lastEnd_x=x;
							lastEnd_y=y;
							black_turn=false;
							piece_toggled=false;
							this.updateUndo();
							this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
							this.jumpText.show(false);
							this.messageStatus.setValue("White's turn");
						}
					}
					if ((y==curr_y+1) && ((x==curr_x-1) || (x==curr_x+1)) && (board[x][y]==0) && (!double_jump)) {
						// single move into free square (not possible during double jump)
						if ((CompulsoryJumping=="YES") && black_jump) {
							
						} else {
							board[curr_x][curr_y]=0;
							board[x][y]=-1.1;
							this.squareFocus(curr_x, curr_y, false);
							lastEnd_x=x;
							lastEnd_y=y;
							black_turn=false;
							piece_toggled=false;
							this.updateUndo();
							this.writePieces();
							this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
							this.jumpText.show(false);
							this.messageStatus.setValue("White's turn");
						}
					}					
					if (y==curr_y-2) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y-1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y-1]=0;
							board[x][y]=-1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y-1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y-1]=0;
							board[x][y]=-1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y>1) && (x>1) && (((board[x-1][y-1]>0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]>0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]>0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else if ((y<6) && (x>1) && (((board[x-1][y+1]>0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]>0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]>0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=false;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								this.messageStatus.setValue("White's turn");								
							}
						}
					}
					if (y==curr_y+2) {
						if ((x==curr_x-2) && (board[curr_x-1][curr_y+1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x-1][curr_y+1]=0;
							board[x][y]=-1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						} else if ((x==curr_x+2) && (board[curr_x+1][curr_y+1]>0) && (board[x][y]==0)) {
							// jumping a piece
							board[curr_x][curr_y]=0;
							board[curr_x+1][curr_y+1]=0;
							board[x][y]=-1.1;
							this.squareFocus(curr_x, curr_y, false);
							check_for_double_jump=true;
						}
						if (check_for_double_jump) {	
							// check for more possible jumps
							if ((y>1) && (x>1) && (((board[x-1][y-1]>0) && (board[x-2][y-2]==0)) || ((board[x+1][y-1]>0) && (board[x+2][y-2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y>1) && ((board[x+1][y-1]>0) && (board[x+2][y-2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else if ((y<6) && (x>1) && (((board[x-1][y+1]>0) && (board[x-2][y+2]==0)) || ((board[x+1][y+1]>0) && (board[x+2][y+2]==0)))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;
							} else if ((y<6) && ((board[x+1][y+1]>0) && (board[x+2][y+2]==0))) {
								this.squareFocus(x, y, true);
								curr_x=x;
								curr_y=y;
								this.jumpTextBox.changeLayout(130, 350, uD, 24, 35, uD);
								this.jumpText.show(true);
								double_jump=true;							
							} else {
								lastEnd_x=x;
								lastEnd_y=y;
								black_turn=false;
								piece_toggled=false;
								double_jump=false;
								this.updateUndo();
								this.writePieces();
								this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
								this.jumpText.show(false);
								this.messageStatus.setValue("White's turn");								
							}
						}
					}
				}
			}
		}
		this.writePieces();
		return;
	}
	
	target.squareFocus = function (x, y, makeActive) {
		if (makeActive) {
			this['selection1'].changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
		} else {
			this['selection1'].changeLayout(0, 0, uD, 0, 0, uD);
		}
		return;
	}
	
	target.doSelectClick = function (sender) {
		return;
	}
	
	target.doRoot = function (sender) {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}
	
	target.doMark = function (sender) {
		return;
	}
	
	target.doButtonClick = function (sender) {
		var id;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "RES") {
			// initiate new game
			this.setupBoard();
			game_is_over = false;
			this.messageStatus.setValue("White's turn");
			this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
			this.selection2.changeLayout(0, 0, uD, 0, 0, uD);
			this.selection3.changeLayout(0, 0, uD, 0, 0, uD);
			black_turn = false;
			piece_toggled = false;
			double_jump = false;
			lastEnd_x = -1;
			lastEnd_y = -1;
			this.writePieces();
	
			// initial undo
			currundo=0;
			this.updateUndo();
			return;
		}
		if (n == "EXT") {
			kbook.autoRunRoot.exitIf(kbook.model);
			return;
		}
	}
	
	target.moveCursor = function (dir) {
		if (settingsDlgOpen) {
			this.SETTINGS_DIALOG.moveCursor(dir);
			return;
		}	
		switch (dir) {
		case "down":
			{
				cursorY += 75;
				if (cursorY > 595) {
					cursorY = 70;
				}
				break;
			}
		case "up":
			{
				cursorY -= 75;
				if (cursorY < 70) {
					cursorY = 595;
				}
				break;
			}
		case "left":
			{
				cursorX -= 75;
				if (cursorX < 0) {
					cursorX = 525;
				}
				break;
			}
		case "right":
			{
				cursorX += 75;
				if (cursorX > 525) {
					cursorX = 0;
				}
				break;
			}
		}
		this.gridCursor.changeLayout(cursorX, 75, uD, cursorY, 75, uD);
	}
	
	target.cursorClick = function () {
		if (settingsDlgOpen) {
			this.SETTINGS_DIALOG.doCenterF();
		}	
		var x, y, iPosition, sMove;
		x = cursorX / 75; // find column
		y = (cursorY - 70) / 75; // find row
		this.makeSelection(x,y);
		return;
	}
	
	target.digitF = function (key) {
		if ((key > 0) && (key < 9)) {
			cursorX = (key - 1) * 75;
			this.gridCursor.changeLayout(cursorX, 75, uD, cursorY, 75, uD);
		}
		if (key == 0) {
			auto_mode = !auto_mode;
			if (auto_mode) {
				this.nonTouch6.setValue("[0] Auto ON");
			} else {
				this.nonTouch6.setValue("[0] Auto OFF");
			}
		}
		return;
	}
	
	target.doHold9 = function () {
		// initiate new game
		this.setupBoard();
		game_is_over = false;
		this.messageStatus.setValue("White's turn");
		this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection2.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection3.changeLayout(0, 0, uD, 0, 0, uD);
		black_turn = false;
		piece_toggled = false;
		double_jump = false;
		lastEnd_x = -1;
		lastEnd_y = -1;
		this.writePieces();
			
		// initial undo
		currundo=0;
		this.updateUndo();
		return;
	}
	
	target.doHold0 = function () {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}
	
	target.doPrev = function () {
		if (hasNumericButtons) {
			this.moveCursor("left");
			return;
		}
		// change auto_mode
		auto_mode = !auto_mode;
		if (auto_mode) {
			this.touchButtons1.setValue("[Prev] Auto ON");
		} else {
			this.touchButtons1.setValue("[Prev] Auto OFF");
		}
		return;
	}
	
	target.doNext = function () {
		if (hasNumericButtons) {
			this.moveCursor("right");
			return;
		}
		return;
	}
	
	target.doUndo = function () {
		if (game_is_over) return;
		
		// do undo
		if (currundo<2) return;
		
		// retrieve most recent undo
		for (t=0; t<8; t++)
		{
			for (r=0; r<8; r++)
			{
				if (auto_mode) {
					board[t][r]=undoboard[currundo-3][t][r];
				} else {
					board[t][r]=undoboard[currundo-2][t][r];
				}
			}
		}
		
		// decrement current undo
		currundo--;
		if (auto_mode) currundo--;
		
		// update board
		this.writePieces();
		if (!auto_mode) black_turn=!black_turn;
		if (black_turn) {
			this.messageStatus.setValue("Black's turn");
		} else {
			this.messageStatus.setValue("White's turn");
		}
		piece_toggled=false;
		double_jump=false;
		lastEnd_x = -1;
		lastEnd_y = -1;
		
		// hide selection sprites
		this.selection1.changeLayout(-0,0,uD,0,0,uD);
		this.selection3.changeLayout(-0,0,uD,0,0,uD);
		
		return;
	}
	
	target.updateUndo = function () {
		// update undo
		if (currundo < undodepth) {
			// increment current undo if possible
			currundo++;
		}
		else {
			// if not possible, then shift all previous undos, losing oldest one
			for (s=1; s<undodepth; s++)
			{
				for (t=0; t<8; t++)
				{
					for (r=0; r<8; r++)
					{
						undoboard[s-1][t][r]=undoboard[s][t][r];
					}
				}
			}
		}

		// store current board
		for (t=0; t<8; t++)
		{
			for (r=0; r<8; r++)
			{
				undoboard[currundo-1][t][r]=board[t][r];
			}
		}
		return;
	}
	
	target.autoMove = function () {
		var i,j;
		// AI move (black)
		black_moves=this.computer();
		
		if (!game_is_over) {
			black_turn=false;
			piece_toggled=false;
			double_jump=false;
			this.updateUndo();
			this.writePieces();
			this.jumpTextBox.changeLayout(0, 0, uD, 0, 0, uD);
			this.jumpText.show(false);
			this.messageStatus.setValue("White's turn");
		} else {
			// White wins	
			this.writePieces();
			this.messageStatus.setValue("White wins!");
		}
		return;
	}
	
	// AI routines
	target.Coord = function (x,y) {	
		this.x = x;
		this.y = y;
	}
	
	target.coord = function (x,y) {
		c = new this.Coord(x,y);
		return c;
	}
	
	target.integ = function (num) {
		if (num != null) {
			var result=Math.round(num);
			//this.bubble("tracelog","num="+num+", result="+result);
			return result;
		} else {
			return null;
		}
	}
	
	target.abs = function (num) {
		return Math.abs(num);
	}
	
	target.sign = function (num) {
		if (num < 0) return -1;
		else return 1;
	}
	
	target.concatenate = function (arr1,arr2) {
		// function tacks the second array onto the end of the first and returns result
		for(var i=0;i<arr2.length;i++)
			arr1[arr1.length+i] = arr2[i];
		return arr1;
	}
	
	target.legal_move = function (from,to) {
		if ((to.x < 0) || (to.y < 0) || (to.x > 7) || (to.y > 7)) return false;
		piece = board[from.x][from.y];
		distance = this.coord(to.x-from.x,to.y-from.y);
		//this.bubble("tracelog","piece="+piece+", distance.x="+distance.x+", distance.y="+distance.y);
		if ((distance.x == 0) || (distance.y == 0)) {
			//this.bubble("tracelog","error: zero distance!");
			return false;
		}
		if (this.abs(distance.x) != this.abs(distance.y)) {
			//this.bubble("tracelog","error: not a diagonal!");
			return false;
		}
		if (this.abs(distance.x) > 2) {
			//this.bubble("tracelog","error: moving too far!");
			return false;
		}
		if ((this.abs(distance.x) == 1) && double_jump) {
			//this.bubble("tracelog","error: not far enough on a double jump!");
			return false;
		}
		if ((board[to.x][to.y] != 0) || (piece == 0)) {
			//this.bubble("tracelog","error: no piece or square occupied!");
			return false;
		}
		if ((this.abs(distance.x) == 2)
			&& (this.integ(piece) != -this.integ(board[from.x+this.sign(distance.x)][from.y+this.sign(distance.y)]))) {
			//this.bubble("tracelog","error: something involving 2 spaces!");
			return false;
		}
		if ((this.integ(piece) == piece) && (this.sign(piece) == this.sign(distance.y))) {
			//this.bubble("tracelog","error: pawn piece - problem with signs!");
			return false;
		}
		//this.bubble("tracelog","move is legal!");
		return true;
	}

	target.templegal_move = function (from,to) {
		if ((to.x < 0) || (to.y < 0) || (to.x > 7) || (to.y > 7)) return false;
		piece = tempboard[from.x][from.y];
		distance = this.coord(to.x-from.x,to.y-from.y);
		//this.bubble("tracelog","templegalmove: piece="+piece+", distance.x="+distance.x+", distance.y="+distance.y);
		if ((distance.x == 0) || (distance.y == 0)) {
			//this.bubble("tracelog","error: zero distance!");
			return false;
		}
		if (this.abs(distance.x) != this.abs(distance.y)) {
			//this.bubble("tracelog","error: not a diagonal!");
			return false;
		}
		if (this.abs(distance.x) > 2) {
			//this.bubble("tracelog","error: moving too far!");
			return false;
		}
		if ((this.abs(distance.x) == 1) && double_jump) {
			//this.bubble("tracelog","error: not far enough on a double jump!");
			return false;
		}
		if ((tempboard[to.x][to.y] != 0) || (piece == 0)) {
			//this.bubble("tracelog","error: no piece or square occupied!");
			return false;
		}
		if ((this.abs(distance.x) == 2)
			&& (this.integ(piece) != -this.integ(tempboard[from.x+this.sign(distance.x)][from.y+this.sign(distance.y)]))) {
			//this.bubble("tracelog","error: something involving 2 spaces!");
			return false;
		}
		if ((this.integ(piece) == piece) && (this.sign(piece) == this.sign(distance.y))) {
			//this.bubble("tracelog","error: pawn piece - problem with signs!");
			return false;
		}
		//this.bubble("tracelog","move is legal!");
		return true;
	}
	
	target.king_me = function (x,y) {
		if (board[x][y] == 1) {
			board[x][y] = 1.1; // white king
		} else if (board[x][y] == -1) {
			board[x][y] = -1.1; // black king
		}
	}
	
	target.remove = function (x,y) {
		board[x][y] = 0;
	}
	
	target.swap = function (from,to) {
		var dummy_num = board[from.x][from.y];
		board[from.x][from.y] = board[to.x][to.y];
		board[to.x][to.y] = dummy_num;
	}
	
	target.move_comp = function (from,to) {
		//this.bubble("tracelog","from.x="+from.x+", from.y="+from.y+", to.x="+to.x+", to.y="+to.y);
		this.swap(from,to);
		//this.bubble("tracelog","piece moved");
		if (this.abs(from.x-to.x) == 2) {
			//this.bubble("tracelog","need to remove jumped piece");
			this.remove(from.x+this.sign(to.x-from.x),from.y+this.sign(to.y-from.y));
		}
		if ((board[to.x][to.y] == -1) && (to.y == 7)) this.king_me(to.x,to.y);
		lastEnd_x=to.x;
		lastEnd_y=to.y;		
		return true;
	}

	target.tempmove_comp = function (from,to) {
		// move piece on tempboard
		var dummy_num = tempboard[from.x][from.y];
		tempboard[from.x][from.y] = tempboard[to.x][to.y];
		tempboard[to.x][to.y] = dummy_num;

		if (this.abs(from.x-to.x) == 2) {
			//this.bubble("tracelog","need to remove jumped piece from tempboard");
			tempboard[from.x+this.sign(to.x-from.x)][from.y+this.sign(to.y-from.y)]=0;
		}
		
		// update temp variables
		templength++;
		templastendx=to.x;
		templastendy=to.y;		
		return true;
	}	
	
	target.computer = function () {
		var piecesx=[];
		var piecesy=[];
		var numpieces=0;
		//this.bubble("tracelog","starting AI");

		// step one - make a multi-jump if one exists (and find the longest such multi-jump available)
		bestlength=0;
		bestlastendx=-1;
		bestlastendy=-1;
		foundmultijump=false;
		
		// locate all black pieces
		for(var j=7;j>=0;j--) {
			for(var i=0;i<8;i++) {
				if (this.integ(board[i][j]) == -1) {
					//this.bubble("tracelog","Black piece found at x="+i+", y="+j);
					piecesx[numpieces]=i;
					piecesy[numpieces]=j;
					numpieces++;
				}
			}
		}
		
		// go through all black pieces looking for multi-step jump
		for(var num=0;num<numpieces;num++) {
			//this.bubble("tracelog","Piece="+num);
			this.tryfindmultijump(piecesx[num],piecesy[num]);
		}
		
		if (foundmultijump) {
			//this.bubble("tracelog","Found multi-step jump!");
			//update board
			for(var j=0;j<8;j++) {
				for(var i=0;i<8;i++) {
					board[i][j]=bestboard[i][j];
				}
			}
			
			// update end position of jumping piece
			lastEnd_x=bestlastendx;
			lastEnd_y=bestlastendy;
			
			// king jumping piece if required
			if ((board[bestlastendx][bestlastendy] == -1) && (bestlastendy == 7)) this.king_me(bestlastendx,bestlastendy);
			return true;
		}
		//this.bubble("tracelog","step one passed: no multi-step jumps found");
		
		// step two - prevent any jumps by jumping the threatening piece
		for(var j=0;j<8;j++) {
			for(var i=0;i<8;i++) {
				if (this.integ(board[i][j]) == 1) {
					if ((i>0) && (i<6) && (j>1) && (this.legal_move(this.coord(i,j),this.coord(i+2,j-2)))) {
						//this.bubble("tracelog","Jumper at i="+i+", j="+j);
						if ((this.integ(board[i-1][j-1]) == -1) && (this.jump(i-1,j-1))) return true;
						if ((this.integ(board[i+1][j-1]) == -1) && (this.jump(i+1,j-1))) return true;
						if ((board[i-1][j+1] == -1.1) && (this.jump(i-1,j+1))) return true;
						if ((board[i+1][j+1] == -1.1) && (this.jump(i+1,j+1))) return true;
					}
					if ((i>1) && (i<7) && (j>1) && (this.legal_move(this.coord(i,j),this.coord(i-2,j-2)))) {
						//this.bubble("tracelog","Jumper at i="+i+", j="+j);
						if ((this.integ(board[i-1][j-1]) == -1) && (this.jump(i-1,j-1))) return true;
						if ((this.integ(board[i+1][j-1]) == -1) && (this.jump(i+1,j-1))) return true;
						if ((board[i-1][j+1] == -1.1) && (this.jump(i-1,j+1))) return true;
						if ((board[i+1][j+1] == -1.1) && (this.jump(i+1,j+1))) return true;
					}
				}
			}
		}
		//this.bubble("tracelog","step two passed: no jumps to prevent by jumping");

		// step three - prevent any jumps by moving (skip if compulsory jumping)
		if (CompulsoryJumping=="NO") {
			for(var j=0;j<8;j++) {
				for(var i=0;i<8;i++) {
					if (this.integ(board[i][j]) == 1) {
						//this.bubble("tracelog","Potential jumper at i="+i+", j="+j);
						if ((j>1) && (this.legal_move(this.coord(i,j),this.coord(i+2,j-2))) && (this.prevent(this.coord(i+2,j-2),this.coord(i+1,j-1)))) {
							return true;
						}
						if ((i>1) && (j>1) && (this.legal_move(this.coord(i,j),this.coord(i-2,j-2))) && (this.prevent(this.coord(i-2,j-2),this.coord(i-1,j-1)))) {
							return true;
						}
					}
					if (board[i][j] == 1.1) {
						if ((i>1) && (this.legal_move(this.coord(i,j),this.coord(i-2,j+2))) && (this.prevent(this.coord(i-2,j+2),this.coord(i-1,j+1)))) {
							return true;
						}
						if ((this.legal_move(this.coord(i,j),this.coord(i+2,j+2))) && (this.prevent(this.coord(i+2,j+2),this.coord(i+1,j+1)))) {
							return true;
						}
					}
				}
			}
		}
		//this.bubble("tracelog","step three passed: no jumps to prevent");
		
		// step four - look for jumps
		for(var j=7;j>=0;j--) {
			for(var i=0;i<8;i++) {
				if (this.jump(i,j))
					return true;
			}
		}
		//this.bubble("tracelog","step four passed: no jumps to make");

		// step five - look for single space move to obtain a king
		for(var i=0;i<8;i++) {
			if (board[i][6]==-1) {
				// black piece in row above king row
				if ((board[i-1][7]==0) && (board[i+1][7]==0)) {
					if (Math.floor(Math.random()*2)==1) {
						this.move_comp(this.coord(i,6),this.coord(i-1,7));
						return true;
					} else {
						this.move_comp(this.coord(i,6),this.coord(i+1,7));
						return true;
					}
				} else if (board[i-1][7]==0) {
					this.move_comp(this.coord(i,6),this.coord(i-1,7));
					return true;
				} else if (board[i+1][7]==0) {
					this.move_comp(this.coord(i,6),this.coord(i+1,7));
					return true;
				}
			}
		}	
		//this.bubble("tracelog","step five passed: no pieces can move to be crowned");

		// step six - look for safe single space move for a king (but use random to prevent kings dominating the moves)
		for(var j=0;j<8;j++) {
			for(var i=0;i<8;i++) {
				if (board[i][j]==-1.1) {
					if (Math.floor(Math.random()*4)==1) {
						if (this.single(i,j)) {
							return true;
						}
					}
				}
			}
		}
		//this.bubble("tracelog","step six passed: no safe single spaces for a king to make");

		// step seven - look for pawn in row 5 that can safely move to row 6
		for(var i=0;i<8;i++) {
			if (board[i][5]==-1) {
				// black piece in 2 rows above king row
				if ((i>1) && (board[i-1][6]==0) && (board[i-2][7]==0) && (board[i][7]==0)) {
					this.move_comp(this.coord(i,5),this.coord(i-1,6));
					return true;
				} else if ((board[i+1][6]==0) && (board[i+2][7]==0) && (board[i][7]==0)) {
					this.move_comp(this.coord(i,5),this.coord(i+1,6));
					return true;
				}
			}
		}	
		//this.bubble("tracelog","step seven passed: no pieces can move closer to be crowned");
		
		safe_from = null;
		// step eight - look for safe single space moves (possibly in attack mode)
		// Use random to choose between looking for pieces from left to right or right to left
		if (Math.floor(Math.random()*2)==1) {
			//this.bubble("tracelog","left to right");
			for(var j=0;j<8;j++) {
				for(var i=0;i<8;i++) {
					if (this.single(i,j,false)) {
						//this.bubble("tracelog","MOVE FOUND!");
						return true;
					}
				}
			}
		} else {
			//this.bubble("tracelog","right to left");
			for(var j=0;j<8;j++) {
				for(var i=7;i>=0;i--) {
					if (this.single(i,j,false)) {
						//this.bubble("tracelog","MOVE FOUND!");
						return true;
					}
				}
			}
		}
		//this.bubble("tracelog","step eight passed: attack failed");

		safe_from = null;
		// step nine - look for safe single space moves (override attackmode)
		// Use random to choose between looking for pieces from left to right or right to left
		if (Math.floor(Math.random()*2)==1) {
			//this.bubble("tracelog","left to right");
			for(var j=0;j<8;j++) {
				for(var i=0;i<8;i++) {
					if (this.single(i,j,true)) {
						//this.bubble("tracelog","MOVE FOUND!");
						return true;
					}
				}
			}
		} else {
			//this.bubble("tracelog","right to left");
			for(var j=0;j<8;j++) {
				for(var i=7;i>=0;i--) {
					if (this.single(i,j,true)) {
						//this.bubble("tracelog","MOVE FOUND!");
						return true;
					}
				}
			}
		}
		//this.bubble("tracelog","step nine passed: no safe single spaces to move into");

		// step ten - if no safe moves, just take whatever you can get
		if (safe_from != null) {
			this.move_comp(safe_from,safe_to);
		} else {
			//this.bubble("tracelog","NO MOVES!");
			game_is_over = true;
		}
		safe_from = safe_to = null;
		return false;
	}
	
	target.tryfindmultijump = function (i,j) {
		// reset temp variables
		for(var k=0;k<10;k++) {
			for(var l=0;l<8;l++) {
				tempboard[k][l]=board[k][l];
			}
		}
		templength=0;
		
		// look for jump
		//this.bubble("tracelog","Look for multijump starting from piece at x="+i+", y="+j);
		this.multijump(i,j);
		
		// if number of steps is greater than what was found previously
		if (templength>bestlength) {
			//this.bubble("tracelog","Found longer jump sequence, length="+templength);
			// update best variables
			bestlength=templength;
			bestlastendx=templastendx;
			bestlastendy=templastendy;
			for(var j=0;j<8;j++) {
				for(var i=0;i<8;i++) {
					bestboard[i][j]=tempboard[i][j];
				}
			}
		}
		
		// if best length has more than 1 jump then it is a multi-step jump
		if (bestlength>1) foundmultijump=true;
		return;
	}

	target.multijump = function (i,j) {
		if (tempboard[i][j] == -1.1) {
			if ((j>1) && (this.templegal_move(this.coord(i,j),this.coord(i+2,j-2)))) {
				this.tempmove_comp(this.coord(i,j),this.coord(i+2,j-2));
				this.multijump(i+2,j-2);
				return true;
			}
			if ((i>1) && (j>1) && (this.templegal_move(this.coord(i,j),this.coord(i-2,j-2)))) {
				this.tempmove_comp(this.coord(i,j),this.coord(i-2,j-2));
				this.multijump(i-2,j-2);
				return true;
			}
		}
		if (this.integ(tempboard[i][j]) == -1) {
			if ((i>1) && (this.templegal_move(this.coord(i,j),this.coord(i-2,j+2)))) {
				if ((j==5) && (tempboard[i][j]==-1)) {
					this.tempmove_comp(this.coord(i,j),this.coord(i-2,j+2));	
					//this.jump(i-2,j+2); a pawn can't continue jumping after becoming a king			
					return true;
				} else {
					this.tempmove_comp(this.coord(i,j),this.coord(i-2,j+2));			
					this.multijump(i-2,j+2);
					return true;
				}
			}
			if (this.templegal_move(this.coord(i,j),this.coord(i+2,j+2))) {
				if ((j==5) && (tempboard[i][j]==-1)) {
					this.tempmove_comp(this.coord(i,j),this.coord(i+2,j+2));
					// this.jump(i+2,j+2); a pawn can't continue jumping after becoming a king
					return true;
				} else {
					this.tempmove_comp(this.coord(i,j),this.coord(i+2,j+2));					
					this.multijump(i+2,j+2);
					return true;
				}
			}
		}
		return false;
	}
	
	target.jump = function (i,j) {
		if (board[i][j] == -1.1) {
			if ((j>1) && (this.legal_move(this.coord(i,j),this.coord(i+2,j-2)))) {
				this.move_comp(this.coord(i,j),this.coord(i+2,j-2));
				this.jump(i+2,j-2);
				return true;
			}
			if ((i>1) && (j>1) && (this.legal_move(this.coord(i,j),this.coord(i-2,j-2)))) {
				this.move_comp(this.coord(i,j),this.coord(i-2,j-2));
				this.jump(i-2,j-2);
				return true;
			}
		}
		if (this.integ(board[i][j]) == -1) {
			if ((i>1) && (this.legal_move(this.coord(i,j),this.coord(i-2,j+2)))) {
				if ((j==5) && (board[i][j]==-1)) {
					this.move_comp(this.coord(i,j),this.coord(i-2,j+2));
					//this.jump(i-2,j+2); a pawn can't continue jumping after becoming a king
					return true;
				} else {
					this.move_comp(this.coord(i,j),this.coord(i-2,j+2));
					this.jump(i-2,j+2);
					return true;
				}
			}
			if (this.legal_move(this.coord(i,j),this.coord(i+2,j+2))) {
				if ((j==5) && (board[i][j]==-1)) {
					this.move_comp(this.coord(i,j),this.coord(i+2,j+2));
					// this.jump(i+2,j+2); a pawn can't continue jumping after becoming a king
					return true;
				} else {
					this.move_comp(this.coord(i,j),this.coord(i+2,j+2));
					this.jump(i+2,j+2);
					return true;
				}
			}
		}
		return false;
	}
	
	target.single = function (i,j,override) {
		var whitepieces,blackpieces,whitex,whitey,attack;
		whitepieces=0;
		blackpieces=0;
		attack=false;
		
		// Check for number of opponent pieces (and remember position of last piece found)
		for(var k=0;k<8;k++) {
			for(var l=0;l<8;l++) {
				if (this.integ(board[k][l]) == 1) {
					whitepieces++;
					whitex=k;
					whitey=l;
				} else if (this.integ(board[k][l]) == -1) {
					blackpieces++;
				}
			}
		}
		if (blackpieces > whitepieces) attack=true;
		if (whitepieces==1) attack=true;
		
		if ((!attack) || (override)) {
			//this.bubble("tracelog","Don't attack just yet...");
			if (board[i][j] == -1.1) {
				if ((j>0) && (this.legal_move(this.coord(i,j),this.coord(i+1,j-1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i+1,j-1);
					if (this.wise(this.coord(i,j),this.coord(i+1,j-1))) {
						this.move_comp(this.coord(i,j),this.coord(i+1,j-1));
						return true;
					}
				}
				if ((i>0) && (j>0) && (this.legal_move(this.coord(i,j),this.coord(i-1,j-1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i-1,j-1);
					if (this.wise(this.coord(i,j),this.coord(i-1,j-1))) {
						this.move_comp(this.coord(i,j),this.coord(i-1,j-1));
						return true;
					}
				}
			}
			if (this.integ(board[i][j]) == -1) {
				if (this.legal_move(this.coord(i,j),this.coord(i+1,j+1))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i+1,j+1);
					if (this.wise(this.coord(i,j),this.coord(i+1,j+1))) {
						this.move_comp(this.coord(i,j),this.coord(i+1,j+1));
						return true;
					}
				}
				if ((i>0) && (this.legal_move(this.coord(i,j),this.coord(i-1,j+1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i-1,j+1);
					if (this.wise(this.coord(i,j),this.coord(i-1,j+1))) {
						this.move_comp(this.coord(i,j),this.coord(i-1,j+1));
						return true;
					}
				}
			}
		} else {
			//this.bubble("tracelog","Attack!");
			if (board[i][j] == -1.1) {
				if ((j>0) && (i<whitex) && (j>whitey) && (this.legal_move(this.coord(i,j),this.coord(i+1,j-1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i+1,j-1);
					if (this.wise(this.coord(i,j),this.coord(i+1,j-1))) {
						this.move_comp(this.coord(i,j),this.coord(i+1,j-1));
						return true;
					}
				}
				if ((i>0) && (j>0) && (i>whitex) && (j>whitey) && (this.legal_move(this.coord(i,j),this.coord(i-1,j-1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i-1,j-1);
					if (this.wise(this.coord(i,j),this.coord(i-1,j-1))) {
						this.move_comp(this.coord(i,j),this.coord(i-1,j-1));
						return true;
					}
				}
			}
			if (this.integ(board[i][j]) == -1) {
				if ((i<whitex) && (j<whitey) && (this.legal_move(this.coord(i,j),this.coord(i+1,j+1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i+1,j+1);
					if (this.wise(this.coord(i,j),this.coord(i+1,j+1))) {
						this.move_comp(this.coord(i,j),this.coord(i+1,j+1));
						return true;
					}
				}
				if ((i>0) && (i>whitex) && (j<whitey) && (this.legal_move(this.coord(i,j),this.coord(i-1,j+1)))) {
					safe_from = this.coord(i,j);
					safe_to = this.coord(i-1,j+1);
					if (this.wise(this.coord(i,j),this.coord(i-1,j+1))) {
						this.move_comp(this.coord(i,j),this.coord(i-1,j+1));
						return true;
					}
				}
			}
		}
		return false;
	}
	
	target.possibilities = function (x,y) {
		//this.bubble("tracelog","x="+x+", y="+y);
		if (!this.jump(x,y)) {
			if (!this.single(x,y)) {
				//this.bubble("tracelog","not jump and not single, so return true");
				return true;
			} else {
				//this.bubble("tracelog","not jump and single, so return false");
				return false;
			}
		} else {
			//this.bubble("tracelog","jump, so return false");
			return false;
		}
	}
	
	target.prevent = function (end,s) {
		i = end.x;
		j = end.y;
		//this.bubble("tracelog","prevent: i="+i+", j="+j);
		if (!this.possibilities(s.x,s.y))
			return true;
		else if ((i>0) && (j>0) && (this.integ(board[i-1][j-1])==-1) && (this.legal_move(this.coord(i-1,j-1),this.coord(i,j)))) {
			return this.move_comp(this.coord(i-1,j-1),this.coord(i,j));
		} else if ((j>0) && (this.integ(board[i+1][j-1])==-1) && (this.legal_move(this.coord(i+1,j-1),this.coord(i,j)))) {
			return this.move_comp(this.coord(i+1,j-1),this.coord(i,j));
		} else if ((i>0) && (board[i-1][j+1]==-1.1) && (this.legal_move(this.coord(i-1,j+1),this.coord(i,j)))) {
			return this.move_comp(this.coord(i-1,j+1),this.coord(i,j));
		} else if ((board[i+1][j+1]==-1.1) && (this.legal_move(this.coord(i+1,j+1),this.coord(i,j)))) {
			return this.move_comp(this.coord(i+1,j+1),this.coord(i,j));
		} else {
			return false;
		}
	}
	
	target.wise = function (from,to) {
		i = to.x;
		j = to.y;
		n = (j>0);
		s = (j<7);
		e = (i<7);
		w = (i>0);
		if ((n&&e) && (j>0)) ne = board[i+1][j-1]; else ne = null;
		if ((n&&w) && (i>0) && (j>0)) nw = board[i-1][j-1]; else nw = null;
		if (s&&e) se = board[i+1][j+1]; else se = null;
		if ((s&&w) && (i>0)) sw = board[i-1][j+1]; else sw = null;
		eval(((to.y-from.y != 1)?"s":"n")+((to.x-from.x != 1)?"e":"w")+"=0;");
		if ((sw==0) && (ne==1.1)) return false;
		if ((se==0) && (nw==1.1)) return false;
		if ((nw==0) && (this.integ(se)==1)) return false;
		if ((ne==0) && (this.integ(sw)==1)) return false;

		// make sure move does not open up a jump
		i = from.x;
		j = from.y;
		if ((i>1) && (board[i-1][j+1] == -1) && (board[i-2][j+2] == 1)) return false;
		if ((board[i+1][j+1] == -1) && (board[i+2][j+2] == 1)) return false;
		
		//this.bubble("tracelog","returning true!");
		return true;
	}
	
	target.doCenterF = function () {
		if (settingsDlgOpen) {
			this.SETTINGS_DIALOG.doCenterF();
		}
		return;
	}
	
	target.doMenu = function () {
		this.doOption();
		return;
	}

	// Settings pop-up panel stuff
    target.doOption = function(sender) {
		target.SETTINGS_DIALOG.pawns_capture.setValue("Pawns capture backwards:");
		target.SETTINGS_DIALOG.compulsory_jump.setValue("Compulsory jumping:");
		if (PawnsCaptureBackwards=="NO") {
			target.setVariable("pawns_capture_backwards","1");
		} else {
			target.setVariable("pawns_capture_backwards","2");
		}
		if (CompulsoryJumping=="NO") {
			target.setVariable("compulsory_jumping","1");
		} else {
			target.setVariable("compulsory_jumping","2");
		}
		if (hasNumericButtons) {
			custSel = 0;
			this.ntHandleSettingsDlg();
		}
		settingsDlgOpen = true;
		target.SETTINGS_DIALOG.show(true);
		return;
    }
	
	target.closeDlg = function () {
		settingsDlgOpen = false;
		eventsDlgOpen = false;
		return;
	}

	target.changeSettings = function () {
		settingsDlgOpen = false;
		var t = target.getVariable("pawns_capture_backwards");
		
		if (t == "1") {
			PawnsCaptureBackwards="NO";
		}
		if (t == "2") {
			PawnsCaptureBackwards="YES";
		}
		
		t = target.getVariable("compulsory_jumping");
		if (t == "1") {
			CompulsoryJumping="NO";
		}
		if (t == "2") {
			CompulsoryJumping="YES";
		}
		
		// save current settings to settingsDatPath
		target.settings.PawnsCaptureBackwards = PawnsCaptureBackwards;
		target.settings.CompulsoryJumping = CompulsoryJumping;
		this.saveSettings();
		return;
	}
	
	target.ntHandleSettingsDlg = function () {
		if (custSel === 0) {
			target.SETTINGS_DIALOG.pawns_capture.enable(true);
			target.SETTINGS_DIALOG.compulsory_jump.enable(false);
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Ok);
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Cancel);
		}
		if (custSel === 1) {
			target.SETTINGS_DIALOG.pawns_capture.enable(false);
			target.SETTINGS_DIALOG.compulsory_jump.enable(true);
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Ok);
		}
		if (custSel === 2) {
			target.SETTINGS_DIALOG.compulsory_jump.enable(false);	
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Cancel);
			mouseEnter.call(target.SETTINGS_DIALOG.btn_Ok);
		}		
		if (custSel === 3) {				 		
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Ok);
			mouseEnter.call(target.SETTINGS_DIALOG.btn_Cancel);	
		}
		return;
	}

	target.SETTINGS_DIALOG.moveCursor = function (direction) {
	switch (direction) {
		case "up" : {
			if (custSel>0) {
				custSel--;
				target.ntHandleSettingsDlg();
			}
			break
		}
		case "down" : {
			if (custSel<3) {
				custSel++;
				target.ntHandleSettingsDlg();
			}
			break
		}
		case "left" : {
			if (custSel==0) {
				target.setVariable("pawns_capture_backwards","1");
			}
			if (custSel==1) {
				target.setVariable("compulsory_jumping","1");
			}
			break
		}		
		case "right" : {
			if (custSel==0) {
				target.setVariable("pawns_capture_backwards","2");
			}
			if (custSel==1) {
				target.setVariable("compulsory_jumping","2");
			}
			break
		}
		return;
	  }	
	}
	
	target.SETTINGS_DIALOG.doCenterF = function () {
		if (custSel === 2) target.SETTINGS_DIALOG.btn_Ok.click();	
		if (custSel === 3) target.SETTINGS_DIALOG.btn_Cancel.click();
		return;
	}

	target.SETTINGS_DIALOG.settingsType = function (t) {
		return;
	}
	
};
tmp();
tmp = undefined;