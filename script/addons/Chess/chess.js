//
// Chess for Sony Reader
// by Ben Chenoweth
//
// 2 player mode code extracted (and significantly modified) from HTML Chess, version 1.0 revision #8, by Stefano Gioffre' (http://htmlchess.sourceforge.net/)
// AI code extracted from the main-branch of p4wn (http://p4wn.sourceforge.net/main-branch/)
//
//	2011-01-23 Ben Chenoweth - Updated to fix the graphics issue affecting non-Touch readers; buttons 1-8 now move cursor, which is no longer the hand icon.
//	2011-01-26 Ben Chenoweth - Changed location of promotion piece label; Changed the "what moved" and "from where" sprites
//		(to make them slightly more noticeable on the reader)
//	2011-01-29 Ben Chenoweth - Added AI for computer-calculated moves.  AI is definitely not perfect!  King has a tendency to offensively move into check.
//		At other times, check is not recognised or defended against.  Tracking down these bugs will be (I think) impossible!
//		Perhaps a different AI engine could be utilised instead...
//	2011-01-30 Ben Chenoweth - Fixed the discovering if in checkmate / stalemate issue
//	2011-01-31 Ben Chenoweth - Changed the default AI level to "Medium"
//	2011-02-06 Ben Chenoweth - HOME button now quits game.  There is now an Auto Mode (on by default).  NEXT cycles AI Speed and Auto Mode on/off.
//		1-level undo implemented (OPTIONS on touch, MENU on non-touch).  Some slight changes made to labels (touch version).
//	2011-02-28 Ben Chenoweth - Changed buttons for non-touch (since 300 does not have NEXT and PREV buttons)
//	2011-03-01 kartu - Reformatted
//		Moved into a function, to allow variable name optimizations
//	2011-03-20 Ben Chenoweth - Moved all labels out of status bar.
//	2011-03-23 Ben Chenoweth - Added icon; implemented 10-depth undo.
//	2011-03-25 Ben Chenoweth - Skins changed over to use common AppAssests.
//	2011-03-27 Ben Chenoweth - Fixed labels for PRS-950.
//	2011-04-03 Ben Chenoweth - Moved all labels around slightly; switched Prev and Next function for Touch.
//	2011-06-07 Ben Chenoweth - Added Save/Load; 'in check' message.
//	2011-06-08 Ben Chenoweth - Fixed a checking for checkmate bug; changed the touch labels slightly.
//	2011-06-10 Ben Chenoweth - Added success/fail message on save; further checking for checkmate/stalemate fixes.
//	2011-06-11 Ben Chenoweth - Added pop-up puzzle panel! 30 checkmate in 2 moves; 30 checkmate in 3 moves; 15 checkmate in 4 moves.
//	2011-06-12 Ben Chenoweth - Added (white) move counter during puzzles.
//	2011-06-14 Ben Chenoweth - Added more puzzles: total of 90 checkmate in 2 moves; 180 checkmate in 3 moves; 45 checkmate in 4 moves.
//	2011-08-23 Ben Chenoweth - Changed the way puzzles are loaded.
//	2011-09-26 Ben Chenoweth - Fixed a problem with valid moves for kings; added a work-around for rare AI failure.
//	2011-11-02 Ben Chenoweth - Added AI speed-up if there is only one possible move.
//	2011-12-25 Ben Chenoweth - Added another work-around for rare AI failure.
//	2011-12-26 Ben Chenoweth - Fix to prevent castling after king moves (not compatible with undo).
//	2011-12-26 Ben Chenoweth - Fix to prevent castling through threatened square.
//	2011-12-27 Ben Chenoweth - Fixed another AI bug when only one move possible.

var tmp = function () {
	var sMovesList;
	var bCheck = false;
	var bGameNotOver = true;
	var lastStart = 0;
	var lastEnd = 0;
	var kings = [0, 0];
	var etc = {
		aBoard: [],
		nPromotion: 0,
		bBlackSide: false,
		lookAt: function (nGetPosX, nGetPosY) {
			return (this.aBoard[nGetPosY * 10 + nGetPosX + 22]);
		}
	};
	var fourBtsLastPc;
	var flagWhoMoved;
	var bHasMoved = false;
	var wHasMoved = false;
	var wOldKing = 96;
	var bOldKing = 26;
	var nFrstFocus;
	var nScndFocus;
	var aParams = [5, 3, 4, 6, 2, 4, 3, 5, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9, 9, 13, 11, 12, 14, 10, 12, 11, 13];
	var cursorX = 0;
	var cursorY = 520;
	var newEvent;
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var isNT = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var setSoValue = kbook.autoRunRoot.setSoValue;	
	var mouseLeave = getSoValue( target.PUZZLE_DIALOG.btn_Cancel,'mouseLeave');
	var mouseEnter = getSoValue( target.PUZZLE_DIALOG.btn_Cancel,'mouseEnter');
	
	// variables for AI
	var bmove = 0; // the moving player 0=white 8=black
	var moveno = 0; // no of moves  
	var ep = 0; //en passant state (points to square behind takable pawn, ie, where the taking pawn ends up.
	var parsees = 0; //DEV: number of moves read by parser
	var prunees = 0; //DEV: number of parses cut off without evaluation
	var evaluees = 0; //DEV: number of times in treeclimber
	var Bt = 1999;
	var Al = -Bt;
	var comp = new Function('a', 'b', 'return b[0]-a[0]'); //comparison function for treeclimb integer sort (descending)
	var moves = [0, 0, [1, 10],
		[21, 19, 12, 8],
		[11, 9],
		[1, 10, 11, 9],
		[1, 10, 11, 9], 0]; //in order _,p,r,n,b,q,k       
	var castle = [3, 3]; // castle[0] &1 is white's left, castle[0]&2 is right castle
	var kp = [25, 95]; // points to king - to be used in weighting 
	var pv = [0, 1, 5, 3, 3, 9, 63, 0]; // value of various pieces
	var board = []; //where it all happens - a 120 byte array 
	var boardrow = 'g00000000g'; //g stands for off board
	var edgerow = 'gggggggggg';
	var bstring = edgerow + edgerow + "g23456432gg11111111g" + boardrow + boardrow + boardrow + boardrow + "g99999999ggABCDECBAg" + edgerow + edgerow; //in base 35 (g is 16)
	var wstring = boardrow + boardrow + boardrow + "000111100000123321000123553210"; //weighting string -mirror image
	var weight = []; // gets made into centre waiting 
	var weights = [];
	var pw = '000012346900';
	var b_pweights = [];
	var b_weights = []; // central weighting for ordinary pieces.
	var pieces = []; // becomes array of each colours pieces and positions
	var s00 = 3;
	var s0 = 4;
	var s1 = 1;
	var dirs = [10, -10];
	var level = 2; // "Medium"
	var automode = true; // reader controls the black pieces
	var oldlevel = level;
	var tempBoard = [];
	
	// Undo
	var undoboard;
	var currundo;
	var undodepth;	
	
	// Save/Load
	var datPath;
	
	// Puzzles
	var puzPath;
	var puzDatPath;
	var maxMateIn2 = 90;
	var maxMateIn3 = 180;
	var maxMateIn4 = 45;
	var puzzDlgOpen = false;
	var doingPuzzle = false;
	var puzzleMoves;
	var datPath;
	var datPath0 = kbook.autoRunRoot.gamesSavePath+'Chess/';

	
	target.init = function () {
		/* set translated appTitle and appIcon */
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;

		FileSystem.ensureDirectory(datPath0);  		
		datPath = datPath0+'chess.dat';
		puzPath = target.chessRoot + 'puzzles/';
		puzDatPath = datPath0+'chess2.dat';

		// load current puzzle numbers (if they exist)
		try {
			if (FileSystem.getFileInfo(puzDatPath)) {
				var stream = new Stream.File(puzDatPath);
				var tempnum = stream.readLine();
				var cMateIn2 = Math.floor(tempnum); // convert string to integer
				tempnum = stream.readLine();
				var cMateIn3 = Math.floor(tempnum); // convert string to integer
				tempnum = stream.readLine();
				var cMateIn4 = Math.floor(tempnum); // convert string to integer
				stream.close();
				target.setVariable("checkmate_2",cMateIn2);
				target.setVariable("checkmate_3",cMateIn3);
				target.setVariable("checkmate_4",cMateIn4);			
			}
		}  catch (e) {}
	
		// hide unwanted graphics
		this.congratulations.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection2.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection3.changeLayout(0, 0, uD, 0, 0, uD);
		this.checkStatus.setValue("");
		this.puzzleName.setValue("");
		this.puzzleSource.setValue("");
		this.puzzleMoves.setValue("");
	
		if (hasNumericButtons) {
			this.BUTTON_RES.show(false);
			this.BUTTON_SAV.show(false);
			this.BUTTON_LOA.show(false);
			this.BUTTON_PUZ.show(false);
			this.gridCursor.changeLayout(cursorX, 75, uD, cursorY, 75, uD);
			this.touchButtons0.show(false);
			this.touchButtons1.show(false);			
			this.touchButtons2.show(false);
			this.touchButtons3.show(false);
			this.touchButtons4.show(false);
			this.sometext1.show(false);
			this.sometext2.show(false);
		} else {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
			this.nonTouch.show(false);
			this.nonTouch2.show(false);
			this.nonTouch3.show(false);
			this.nonTouch4.show(false);
			this.nonTouch5.show(false);
			this.nonTouch6.show(false);
			this.nonTouch7.show(false);
			this.nonTouch8.show(false);
			this.nonTouch9.show(false);
			this.nonTouch_colHelp.show(false);
		}
	
		// initialise AI variables
		for (z = 0; z < 8; z++) {
			pv[z + 8] = pv[z] *= 10;
			mz = moves[z]; // should be ref to same array as moves[z]
			if (mz) { // adding in negative version of the move (ie. backwards for white)
				s = mz.length; //probably some better way
				for (x = 0; x < s;) {
					mz[s + x - 1] = -mz[x++];
				}
			}
		}
		for (y = 0; y < 12; y++) {
			for (x = 0; x < 10; x++) {
				z = (y * 10) + x;
				b_pweights[z] = parseInt(pw.charAt(y), 10); //also need to add main weight set at start.
				b_weights[z] = parseInt(wstring.charAt((z < 60) ? z : 119 - z), 35) & 7; // for all the ordinary pieces
				board[z] = parseInt(bstring.charAt(z), 35);
			}
		}
		board[120] = 0;
	
		// initiate new game
		this.resetBoard();
		this.writePieces();
		this.prepare();
		
		// set up undo arrays
		undodepth=11; // this allows for 10 undos
		currundo=0;
		undoboard=new Array(undodepth);
		for (t=0; t<undodepth; t++)
		{
			undoboard[t]=new Array(120);
		}
		this.updateUndo();
		return;
	};
	
	target.resetBoard = function () {
		var iParamId, iPosition;
		iParamId = 0;
		nFrstFocus = fourBtsLastPc = lastStart = lastEnd = 0;
		flagWhoMoved = 8;
		wHasMoved = false;
		bHasMoved = false;
		wOldKing = 96;
		bOldKing = 26;
	
		// place all pieces in their starting positions (located in the first 32 items of the aParams array)
		for (iPosition = 0; iPosition < 120; iPosition++) {
			etc.aBoard[iPosition] = iPosition % 10 ? iPosition / 10 % 10 < 2 | iPosition % 10 < 2 ? 7 : iPosition / 10 & 4 ? 0 : this.getPcByParams(iParamId++, iPosition - 1) | 16 : 7;
			//this.bubble("tracelog","iPosition="+iPosition+", etc.aBoard="+etc.aBoard[iPosition - 1]);
		}
		sMovesList = "";
		this.checkStatus.setValue("");
		this.puzzleName.setValue("");
		this.puzzleSource.setValue("");
		this.puzzleMoves.setValue("");
		doingPuzzle = false;
	};
	
	target.writePieces = function () {
		var sSqrContent, nSquareId, nMenacedSq, nConst, iCell, pieceId = -1;
		//this.bubble("tracelog","redraw board");
		for (iCell = 0; iCell < 64; iCell++) {
			x = iCell % 8; // find column
			y = Math.floor(iCell / 8); // find row
			nSquareId = (y + 2) * 10 + 2 + x;
			sSqrContent = etc.aBoard[nSquareId];
			//this.bubble("tracelog","iCell="+iCell+", sSqrContent="+sSqrContent);
			if (sSqrContent > 0) {
				pieceId++;
				sSqrContent = sSqrContent - 17;
				if (sSqrContent > 5) {
					// aParams assumes array of characters has two spaces separating black characters from white characters, but we don't
					sSqrContent = sSqrContent - 2;
				}
				this['piece' + pieceId].u = sSqrContent;
				//this.bubble("tracelog","sSqrContent="+sSqrContent+", x="+x+", y="+y);
				this['piece' + pieceId].changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
			}
			if (nSquareId === lastStart) {
				// place selection2 mask over square to indicate previous move start
				this.selection2.changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
			}
			if (nSquareId === lastEnd) {
				// place selection3 mask over square to indicate previous move end
				this.selection3.changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
			}
		}
	
		// hide unwanted pieces
		if (pieceId < 31) {
			do {
				pieceId++;
				this['piece' + pieceId].changeLayout(0, 0, uD, 0, 0, uD);
			} while (pieceId < 31);
		}
	};
	
	target.doSquareClick = function (sender) {
		var id, n, x, y, iPosition, sMove;
		id = getSoValue(sender, "id");
		n = id.substring(6, 8);
		x = n % 8; // find column
		y = Math.floor(n / 8); // find row
		iPosition = (y + 2) * 10 + 2 + x;
		//this.bubble("tracelog","n="+n+", iPosition="+iPosition);
		this.makeSelection(iPosition, false);
		return;
	};
	
	target.makeSelection = function (nSquareId, bFromSolid) {
		var x, y, z, destx, desty, ourRook;
		if (!bGameNotOver) {
			return;
		}
		fourBtsLastPc = etc.aBoard[nSquareId] - 16;
		//this.bubble("tracelog","etc.aBoard[nSquareId]="+etc.aBoard[nSquareId]+", flagWhoMoved="+flagWhoMoved+", fourBtsLastPc="+fourBtsLastPc);	
		if ((fourBtsLastPc > 8) && (!etc.bBlackSide)) {
			if (nFrstFocus) {
				this.squareFocus(nFrstFocus, false);
				nFrstFocus = 0;
			}
			if (!bFromSolid) {
				this.squareFocus(nSquareId, true);
				nFrstFocus = nSquareId;
			}
		} else if (nFrstFocus && (fourBtsLastPc < 9) && !etc.bBlackSide) {
			x = nFrstFocus % 10 - 2;
			y = (nFrstFocus - nFrstFocus % 10) / 10 - 2;
			destx = nSquareId % 10 - 2;
			desty = (nSquareId - nSquareId % 10) / 10 - 2;
			//this.bubble("tracelog","x="+x+", y="+y+", destx="+destx+", desty="+desty);
			if (this.isValidMove(x, y, destx, desty, false, -1, true)) {
				nScndFocus = nSquareId;
				fourBtsLastPc = etc.aBoard[nFrstFocus] & 15;
	
				// check for pawn promotion
				if ((fourBtsLastPc == 9) && (nScndFocus <= 29)) {
					fourBtsLastPc = 14 - etc.nPromotion;
				}
	
				// update move
				etc.aBoard[nFrstFocus] = 0;
				etc.aBoard[nSquareId] = fourBtsLastPc + 16;
				lastStart = nFrstFocus;
				lastEnd = nSquareId;
	
				// need to handle (white) castling
				nPiece = etc.aBoard[nSquareId];
				nPieceType = nPiece & 7;
				if (nPieceType == 2) {
					wHasMoved = true;
				}
				nDiffX = destx - x;
				nDiffY = desty - y;
				xRook = 30 - nDiffX >> 2 & 7;
				ourRook = etc.lookAt(xRook, desty);
				if ((nPieceType == 2) && (nDiffX + 2 | 4) === 4 && nDiffY === 0 && ourRook > 0 && Boolean(ourRook & 16)) {
					etc.aBoard[desty * 10 + xRook + 22] = 0;
					if (destx == 6) {
						etc.aBoard[nSquareId - 1] = ourRook;
					} else if (destx == 2) {
						etc.aBoard[nSquareId + 1] = ourRook;
					}
				}
	
				// need to handle en passent
				flagPcColor = nPiece & 8;
				nWay = 4 - flagPcColor >> 2;
				if ((nPieceType == 1) && (y === 7 + nWay >> 1)) {
					// remove black pawn
					etc.aBoard[nSquareId + 10] = 0;
				}
	
				// remove selections
				this.squareFocus(nFrstFocus, false);
				nFrstFocus = 0;
	
				// redraw board
				this.writePieces();
				this.updateUndo();
	
				// check for checkmate
				if (nPieceType == 2) {
					kings[flagPcColor >> 3] = nSquareId;
				} // update location of king when it is moved
				this.getInCheckPieces();
	
				// switch player
				etc.bBlackSide = !etc.bBlackSide;
				flagWhoMoved ^= 8;
				this.messageStatus.setValue("Black's turn");
		
				// update AI board
				z = 0;
				for (y = 20; y < 100; y += 10) {
					for (x = 1; x < 9; x++) {
						z = etc.aBoard[y + x + 1];
						if (z == 25) z = 1;
						if (z == 29) z = 2;
						if (z == 27) z = 3;
						if (z == 28) z = 4;
						if (z == 30) z = 5;
						if (z == 26) z = 6;
						if (z == 17) z = 9;
						if (z == 21) z = 10;
						if (z == 19) z = 11;
						if (z == 20) z = 12;
						if (z == 22) z = 13;
						if (z == 18) z = 14;
						newy = 110 - y;
						board[newy + x] = z;
						// update the position of the kings in the special king array
						if (z == 6) kp[0] = newy + x;
						if (z == 14) kp[1] = newy + x;
					}
				}
				//this.bubble("tracelog","kp="+kp);
				//this.bubble("tracelog","kings="+kings);		
				this.prepare(); // get stuff ready for next move
				moveno++;
				if (doingPuzzle) {
					// update number of moves for puzzle
					puzzleMoves=Math.floor((moveno+1)/2);
					this.puzzleMoves.setValue(puzzleMoves);
				}
	
				if (automode) {
					FskUI.Window.update.call(kbook.model.container.getWindow());
					oldlevel=level;
					// Save board in case AI fails
					for (y = 0; y < 110; y++) {
						tempBoard[y] = etc.aBoard[y];
					}
					this.doSize();
				}
			}
		} else if ((fourBtsLastPc > 0) && (fourBtsLastPc < 9) && (etc.bBlackSide)) {
			if (nFrstFocus) {
				this.squareFocus(nFrstFocus, false);
				nFrstFocus = 0;
			}
			if (!bFromSolid) {
				this.squareFocus(nSquareId, true);
				nFrstFocus = nSquareId;
			}
		} else if (nFrstFocus && ((fourBtsLastPc > 8) || (fourBtsLastPc < 0)) && etc.bBlackSide) {
			x = nFrstFocus % 10 - 2;
			y = (nFrstFocus - nFrstFocus % 10) / 10 - 2;
			destx = nSquareId % 10 - 2;
			desty = (nSquareId - nSquareId % 10) / 10 - 2;
			//this.bubble("tracelog","x="+x+", y="+y+", destx="+destx+", desty="+desty);
			if (this.isValidMove(x, y, destx, desty, false, -1, true)) {
				nScndFocus = nSquareId;
				fourBtsLastPc = etc.aBoard[nFrstFocus] - 16;
	
				// check for pawn promotion
				if ((fourBtsLastPc == 1) && (nScndFocus >= 90)) {
					fourBtsLastPc = 6 - etc.nPromotion;
				}
	
				// update move
				etc.aBoard[nFrstFocus] = 0;
				etc.aBoard[nSquareId] = fourBtsLastPc + 16;
				lastStart = nFrstFocus;
				lastEnd = nSquareId;
	
				// need to handle (black) castling
				nPiece = etc.aBoard[nSquareId];
				nPieceType = nPiece & 7;
				if (nPieceType == 2) {
					bHasMoved = true;
				}
				nDiffX = destx - x;
				nDiffY = desty - y;
				xRook = 30 - nDiffX >> 2 & 7;
				ourRook = etc.lookAt(xRook, desty);
				if ((nPieceType == 2) && (nDiffX + 2 | 4) === 4 && nDiffY === 0 && ourRook > 0 && Boolean(ourRook & 16)) {
					etc.aBoard[desty * 10 + xRook + 22] = 0;
					if (destx == 6) {
						etc.aBoard[nSquareId - 1] = ourRook;
					} else if (destx == 2) {
						etc.aBoard[nSquareId + 1] = ourRook;
					}
				}
	
				// need to handle en passent
				nPiece = etc.aBoard[nSquareId];
				nPieceType = nPiece & 7;
				flagPcColor = nPiece & 8;
				nWay = 4 - flagPcColor >> 2;
				if ((nPieceType == 1) && (y === 7 + nWay >> 1)) {
					// remove white pawn
					etc.aBoard[nSquareId - 10] = 0;
				}
	
				// remove selections
				this.squareFocus(nFrstFocus, false);
				nFrstFocus = 0;
	
				// redraw board
				this.writePieces();
				this.updateUndo();
	
				// check for checkmate
				if (nPieceType == 2) {
					kings[flagPcColor >> 3] = nSquareId;
				} // update location of king when it is moved
				this.getInCheckPieces();
	
				// switch player
				etc.bBlackSide = !etc.bBlackSide;
				flagWhoMoved ^= 8;
				this.messageStatus.setValue("White's turn");
	
				// update AI board
				z = 0;
				for (y = 20; y < 100; y += 10) {
					for (x = 1; x < 9; x++) {
						z = etc.aBoard[y + x + 1];
						if (z == 25) z = 1;
						if (z == 29) z = 2;
						if (z == 27) z = 3;
						if (z == 28) z = 4;
						if (z == 30) z = 5;
						if (z == 26) z = 6;
						if (z == 17) z = 9;
						if (z == 21) z = 10;
						if (z == 19) z = 11;
						if (z == 20) z = 12;
						if (z == 22) z = 13;
						if (z == 18) z = 14;
						newy = 110 - y;
						board[newy + x] = z;
						// update the position of the kings in the special king array
						if (z == 6) kp[0] = newy + x;
						if (z == 14) kp[1] = newy + x;
					}
				}
				//this.bubble("tracelog","kp="+kp);
				//this.bubble("tracelog","kings="+kings);
				this.prepare(); // get stuff ready for next move
				moveno++;
				if (doingPuzzle) {
					// update number of moves for puzzle
					puzzleMoves=Math.floor((moveno+1)/2);
					this.puzzleMoves.setValue(puzzleMoves);
				}
			}
		}
		return;
	}
	
	target.squareFocus = function (nPieceId, bMakeActive) {
		var x, y;
		//this.bubble("tracelog","bMakeActive="+bMakeActive);
		if (etc.bBlackSide) {
			x = (nPieceId - 2) % 10;
			y = Math.floor((nPieceId - 22) / 10);
			//this.bubble("tracelog","nPieceId="+nPieceId+", x="+x+", y="+y);
			if (bMakeActive) {
				this['selection1'].changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
			} else {
				this['selection1'].changeLayout(0, 0, uD, 0, 0, uD);
			}
		} else {
			x = (nPieceId - 2) % 10;
			y = Math.floor((nPieceId - 22) / 10);
			//this.bubble("tracelog","nPieceId="+nPieceId+", x="+x+", y="+y);
			if (bMakeActive) {
				this['selection1'].changeLayout(x * 75, 75, uD, y * 75 + 70, 75, uD);
			} else {
				this['selection1'].changeLayout(0, 0, uD, 0, 0, uD);
			}
		}
		return;
	}
	
	target.isValidMove = function (nPosX, nPosY, nTargetX, nTargetY, inCheck, colorPcInCheck, firstMove) {
		var startSq, nPiece, endSq, nTarget, nPieceType, flagPcColor, flagTgColor, pawnHasMoved, nWay, nDiffX, nDiffY;
		//this.bubble("tracelog","isValidMove?");
		startSq = nPosY * 10 + nPosX + 22;
		nPiece = etc.aBoard[startSq];
		if (nPiece === 0) {
			//this.bubble("tracelog","No piece there!");
			return (true);
		}
		endSq = nTargetY * 10 + nTargetX + 22;
		nTarget = etc.aBoard[endSq];
		nPieceType = nPiece & 7;
		flagPcColor = nPiece & 8;
		//this.bubble("tracelog","startSq="+startSq+", nPiece="+nPiece+", nPieceType="+nPieceType+", flagPcColor="+flagPcColor);
		if (flagPcColor === 8) {
			kingHasMoved = wHasMoved;
		} else {
			kingHasMoved = bHasMoved;
		}
		flagTgColor = nTarget & 8;
		pawnHasMoved = Boolean(nPiece & 16 ^ 16);
		//this.bubble("tracelog","endSq="+endSq+", nTarget="+nTarget+", flagTgColor="+flagTgColor);
		nWay = 4 - flagPcColor >> 2;
		nDiffX = nTargetX - nPosX;
		nDiffY = nTargetY - nPosY;
		switch (nPieceType) {
		case 1:
			// pawn
			if (((nDiffY | 7) - 3) >> 2 !== nWay) {
				//this.bubble("tracelog","Invalid move for pawn");
				return (false);
			}
			if (nDiffX === 0) {
				if ((nDiffY + 1 | 2) !== 2 && (nDiffY + 2 | 4) !== 4) {
					//this.bubble("tracelog","Invalid move for pawn");
					return (false);
				}
				if (nTarget > 0) {
					//this.bubble("tracelog","Invalid move for pawn");
					return (false);
				}
				if (nTargetY === nPosY + (2 * nWay)) {
					if (pawnHasMoved) {
						//this.bubble("tracelog","Invalid move for pawn");
						return (false);
					}
					if (etc.lookAt(nTargetX, nTargetY - nWay) > 0) {
						//this.bubble("tracelog","Invalid move for pawn");
						return (false);
					}
				}
				if ((nDiffY == -2) && (nPosY != 6)) {
					//this.bubble("tracelog","Invalid move for pawn");
					return (false);
				}
				if ((nDiffY == 2) && (nPosY != 1)) {
					//this.bubble("tracelog","Invalid move for pawn");
					return (false);
				}
			} else if ((nDiffX + 1 | 2) === 2) {
				if (nDiffY !== nWay) {
					//this.bubble("tracelog","Invalid move for pawn");
					return (false);
				}
				if ((nTarget < 1 || flagTgColor === flagPcColor) && ( /* not en passant: */ nPosY !== 7 + nWay >> 1)) {
					//this.bubble("tracelog","Invalid move for pawn");
					return (false);
				}
			} else {
				//this.bubble("tracelog","Invalid move for pawn");
				return (false);
			}
			break;
		case 2:
			// king
			var ourRook;
			if ((nDiffY === 0 || (nDiffY + 1 | 2) === 2) && (nDiffX === 0 || (nDiffX + 1 | 2) === 2)) {
				if (nTarget > 0 && flagTgColor === flagPcColor) {
					//this.bubble("tracelog","Invalid move for king");
					return (false);
				}
			} else if (ourRook = etc.lookAt(30 - nDiffX >> 2 & 7, nTargetY), (nDiffX + 2 | 4) === 4 && nDiffY === 0 && !bCheck && !kingHasMoved && ourRook > 0 && Boolean(ourRook & 16)) { // castling
				for (var passX = nDiffX * 3 + 14 >> 2; passX < nDiffX * 3 + 22 >> 2; passX++) {
					if (etc.lookAt(passX, nTargetY) > 0 || this.isThreatened(passX, nTargetY, flagTgColor)) {
						//this.bubble("tracelog","Invalid move for king");
						return (false);
					}
				}
				if (nDiffX + 2 === 0 && etc.aBoard[nTargetY * 10 + 1 + 22] > 0) {
					//this.bubble("tracelog","Invalid move for king");
					return (false);
				}
			} else {
				//this.bubble("tracelog","Invalid move for king");
				return (false);
			}
			break;
		case 3:
			// knight
			if (((nDiffY + 1 | 2) - 2 | (nDiffX + 2 | 4) - 2) !== 2 && ((nDiffY + 2 | 4) - 2 | (nDiffX + 1 | 2) - 2) !== 2) {
				//this.bubble("tracelog","Invalid move for knight");
				return (false);
			}
			if (nTarget > 0 && flagTgColor === flagPcColor) {
				//this.bubble("tracelog","Invalid move for knight");
				return (false);
			}
			break;
		case 4:
			// bishop
			if (Math.abs(nDiffX) !== Math.abs(nDiffY)) {
				//this.bubble("tracelog","Invalid move for bishop");
				return (false);
			}
			break;
		case 5:
			// rook
			if (nTargetY !== nPosY && nTargetX !== nPosX) {
				//this.bubble("tracelog","Invalid move for rook");
				return (false);
			}
			break;
		case 6:
			// queen
			if (nTargetY !== nPosY && nTargetX !== nPosX && Math.abs(nDiffX) !== Math.abs(nDiffY)) {
				//this.bubble("tracelog","Invalid move for queen");
				return (false);
			}
			break;
		}
		
		// additional checks
		if (nPieceType === 5 || nPieceType === 6) {
			// check to see if all squares between start and end are clear for rook or queen
			if (nTargetY === nPosY) {
				if (nPosX < nTargetX) {
					for (var iOrthogX = nPosX + 1; iOrthogX < nTargetX; iOrthogX++) {
						if (etc.lookAt(iOrthogX, nTargetY) > 0) {
							//this.bubble("tracelog","Invalid move for rook or queen");
							return (false);
						}
					}
				} else {
					for (var iOrthogX = nPosX - 1; iOrthogX > nTargetX; iOrthogX--) {
						if (etc.lookAt(iOrthogX, nTargetY) > 0) {
							//this.bubble("tracelog","Invalid move for rook or queen");
							return (false);
						}
					}
				}
			}
			if (nTargetX === nPosX) {
				if (nPosY < nTargetY) {
					for (var iOrthogY = nPosY + 1; iOrthogY < nTargetY; iOrthogY++) {
						if (etc.lookAt(nTargetX, iOrthogY) > 0) {
							//this.bubble("tracelog","Invalid move for rook or queen");
							return (false);
						}
					}
				} else {
					for (var iOrthogY = nPosY - 1; iOrthogY > nTargetY; iOrthogY--) {
						if (etc.lookAt(nTargetX, iOrthogY) > 0) {
							//this.bubble("tracelog","Invalid move for rook or queen");
							return (false);
						}
					}
				}
			}
			if (nTarget > 0 && flagTgColor === flagPcColor) {
				//this.bubble("tracelog","Invalid move for rook or queen");
				return (false);
			}
		}
		
		if (nPieceType === 4 || nPieceType === 6) {
			// check to see if all squares between start and end are clear for bishop or queen
			if (nTargetY > nPosY) {
				var iObliqueY = nPosY + 1;
				if (nPosX < nTargetX) {
					for (var iObliqueX = nPosX + 1; iObliqueX < nTargetX; iObliqueX++) {
						if (etc.lookAt(iObliqueX, iObliqueY) > 0) {
							//this.bubble("tracelog","Invalid move for bishop or queen");
							return (false);
						}
						iObliqueY++;
					}
				} else {
					for (var iObliqueX = nPosX - 1; iObliqueX > nTargetX; iObliqueX--) {
						if (etc.lookAt(iObliqueX, iObliqueY) > 0) {
							//this.bubble("tracelog","Invalid move for bishop or queen");
							return (false);
						}
						iObliqueY++;
					}
				}
			}
			if (nTargetY < nPosY) {
				var iObliqueY = nPosY - 1;
				if (nPosX < nTargetX) {
					for (var iObliqueX = nPosX + 1; iObliqueX < nTargetX; iObliqueX++) {
						if (etc.lookAt(iObliqueX, iObliqueY) > 0) {
							//this.bubble("tracelog","Invalid move for bishop or queen");
							return (false);
						}
						iObliqueY--;
					}
				} else {
					for (var iObliqueX = nPosX - 1; iObliqueX > nTargetX; iObliqueX--) {
						if (etc.lookAt(iObliqueX, iObliqueY) > 0) {
							//this.bubble("tracelog","Invalid move for bishop or queen");
							return (false);
						}
						iObliqueY--;
					}
				}
			}
			if (nTarget > 0 && flagTgColor === flagPcColor) {
				//this.bubble("tracelog","Invalid move for bishop or queen");
				return (false);
			}
		}
		
		if (nPieceType==2) {
			// if king moves (possibly taking the piece that currently has him in check), will he still be in check?
			var bKingInCheck = false;
			etc.aBoard[startSq] = 0;
			etc.aBoard[endSq] = nPiece;
			if (this.isThreatened(endSq % 10 - 2, (endSq - endSq % 10) / 10 - 2, flagPcColor ^ 8)) {
				bKingInCheck = true;
			}
			etc.aBoard[startSq] = nPiece;
			etc.aBoard[endSq] = nTarget;
			if (bKingInCheck) {
				//exception: if king is moving to take king (even if this places the moving king in check), then this is a valid move
				nTargetType = nTarget & 7;
				if (nTargetType!=2) {
					//this.bubble("tracelog","Invalid move for king");
					return (false);
				}
			}
		} else {
			// if piece other than king moves, will king still be in check?
			//this.bubble("tracelog","inCheck="+inCheck+", flagPcColor="+flagPcColor+", colorPcInCheck="+colorPcInCheck);
			if ((inCheck) && (flagPcColor != colorPcInCheck)) {
				// no need to do this if opponent's piece is already in check
				//this.bubble("tracelog","Invalid move, because opponent's piece is already in check");
				return (false);
			}
			var oKing = kings[flagPcColor >> 3];
			etc.aBoard[startSq] = 0;
			etc.aBoard[endSq] = nPiece;
			//this.bubble("tracelog","Move piece of color "+flagPcColor+" from "+startSq+" to "+endSq+" with king at "+oKing);
			if ((inCheck) && (flagPcColor == colorPcInCheck)) {
				// if already in check and trying to find a move to get out of check
				if (this.isThreatened(oKing % 10 - 2, (oKing - oKing % 10) / 10 - 2, flagPcColor ^ 8)) {
					//this.bubble("tracelog","King will (still) be in check");
					bKingInCheck = true;
				}
			} else {
				if (firstMove) {
					// see if moving this piece will place you in check
					if (this.isThreatened(oKing % 10 - 2, (oKing - oKing % 10) / 10 - 2, flagPcColor ^ 8)) {
						//this.bubble("tracelog","King will be in check");
						bKingInCheck = true;
					}
				}
			}
			etc.aBoard[startSq] = nPiece;
			etc.aBoard[endSq] = nTarget;
			if (bKingInCheck) {
				//this.bubble("tracelog","Invalid move because king is still (or will be) in check");
				return (false);
			}
		}
		//this.bubble("tracelog","Valid move");
		return (true);
	}
	
	target.isThreatened = function (nPieceX, nPieceY, flagFromColor) {
		//this.bubble("tracelog","isThreatened?: X="+nPieceX+", Y="+nPieceY+", By color="+flagFromColor);
		var iMenacing, bIsThrtnd = false;
		for (var iMenaceY = 0; iMenaceY < 8; iMenaceY++) {
			for (var iMenaceX = 0; iMenaceX < 8; iMenaceX++) {
				iMenacing = etc.aBoard[iMenaceY * 10 + iMenaceX + 22];
				if (iMenacing > 0 && (iMenacing & 8) === flagFromColor && this.isValidMove(iMenaceX, iMenaceY, nPieceX, nPieceY, false, -1, false)) {
					bIsThrtnd = true;
					//this.bubble("tracelog","Piece is threatened by piece at X="+iMenaceX+", Y="+iMenaceY);
					break;
				}
			}
			if (bIsThrtnd) {
				break;
			}
		}
		//if (!bIsThrtnd) this.bubble("tracelog","Piece is not being threatened");
		return (bIsThrtnd);
	}
	
	target.doSelectClick = function (sender) {
		return;
	}
	
	target.doRoot = function (sender) {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}
	
	target.doMark = function (sender) {
		this.loadGame(datPath);
		return;
	}
	
	target.doHoldMark = function (sender) {
		this.saveGame();
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
				for (t=0; t<120; t++)
				{
					undoboard[s-1][t]=undoboard[s][t];
				}
			}
		}

		// store current board
		for (t=0; t<120; t++)
		{
			undoboard[currundo-1][t]=etc.aBoard[t];
		}
		return;
	}
	
	target.doUndo = function (sender) {
		if (!bGameNotOver) return;
	
		// do undo
		if (currundo<2) return;
		
		// retrieve most recent undo
		for (t=0; t<120; t++)
		{
			if (automode) {
				etc.aBoard[t]=undoboard[currundo-3][t];
				if (etc.aBoard[t] == 18) kings[0] = t;
				if (etc.aBoard[t] == 26) kings[1] = t;				
			} else {
				etc.aBoard[t]=undoboard[currundo-2][t];
				if (etc.aBoard[t] == 18) kings[0] = t;
				if (etc.aBoard[t] == 26) kings[1] = t;								
			}
		}
		
		// decrement current undo
		currundo--;
		if (automode) currundo--;
		
		// update board
		this.writePieces();
		if (!automode) {
			etc.bBlackSide=!etc.bBlackSide;
			flagWhoMoved ^= 8;
		}
		if (etc.bBlackSide) {
			this.messageStatus.setValue("Black's turn");
		} else {
			this.messageStatus.setValue("White's turn");
		}

		// update AI board
		z = 0;
		for (y = 20; y < 100; y += 10) {
			for (x = 1; x < 9; x++) {
				z = etc.aBoard[y + x + 1];
				if (z == 25) z = 1;
				if (z == 29) z = 2;
				if (z == 27) z = 3;
				if (z == 28) z = 4;
				if (z == 30) z = 5;
				if (z == 26) z = 6;
				if (z == 17) z = 9;
				if (z == 21) z = 10;
				if (z == 19) z = 11;
				if (z == 20) z = 12;
				if (z == 22) z = 13;
				if (z == 18) z = 14;
				newy = 110 - y;
				board[newy + x] = z;
				// update the position of the kings in the special king array
				if (z == 6) kp[0] = newy + x;
				if (z == 14) kp[1] = newy + x;
			}
		}
		this.prepare(); // get stuff ready for next move
		if (automode) {
			moveno = moveno - 2;
		} else {
			moveno = moveno - 1;
		}
		if (doingPuzzle) {
			// update number of moves for puzzle
			puzzleMoves=Math.floor((moveno+1)/2);
			this.puzzleMoves.setValue(puzzleMoves);
		}
	
		// remove what moved highlights
		this['selection1'].changeLayout(0, 0, uD, 0, 0, uD);
		this['selection2'].changeLayout(0, 0, uD, 0, 0, uD);
		this['selection3'].changeLayout(0, 0, uD, 0, 0, uD);
		
		// check for check
		flagWhoMoved ^= 8;
		etc.bBlackSide = !etc.bBlackSide;
		this.getInCheckPieces();
		flagWhoMoved ^= 8;
		etc.bBlackSide = !etc.bBlackSide;		
		return;
	}
	
	target.getInCheckPieces = function () {
		var iExamX, iExamY, iExamPc, bNoMoreMoves = true;
		var myKing = kings[flagWhoMoved >> 3 ^ 1];
		
		bCheck = this.isThreatened(myKing % 10 - 2, (myKing - myKing % 10) / 10 - 2, flagWhoMoved);
		//this.bubble("tracelog","getInCheckPieces: bCheck="+bCheck+", flagWhoMoved="+flagWhoMoved);
		if (bCheck) {
			if (flagWhoMoved==0) {
				this.checkStatus.setValue("White king is in check!");
			} else {
				this.checkStatus.setValue("Black king is in check!");
			}
		} else {
			this.checkStatus.setValue("");
		}
		var pcInCheckColor = flagWhoMoved ^ 8;
		for (var iExamSq = 22; iExamSq <= 99; iExamSq++) {
			// search the board
			if (iExamSq % 10 < 2) {
				continue;
			}
			//this.bubble("tracelog","iExamSq="+iExamSq);
			iExamX = (iExamSq - 2) % 10;
			iExamY = Math.floor((iExamSq - 22) / 10);
			//iExamX = iExamSq % 10 - 2;
			//iExamY = (iExamSq - iExamSq % 10) / 10 - 2;
			iExamPc = etc.aBoard[iExamSq];
			if ((bNoMoreMoves && iExamPc > 0) && ((iExamPc & 8 ^ 8) === flagWhoMoved)) {
				// found a piece of the side whose king is in check
				//this.bubble("tracelog","Piece "+iExamPc+" found at="+iExamSq+" of color "+pcInCheckColor);
				for (var iWaySq = 22; iWaySq <= 99; iWaySq++) {
					// search the board looking for a valid move that will get them out of check
					if (iWaySq % 10 < 2) {
						continue;
					}
					//this.bubble("tracelog","iWaySq="+iWaySq);
					iTempX = (iWaySq - 2) % 10;
					iTempY = Math.floor((iWaySq - 22) / 10);
					if (this.isValidMove(iExamX, iExamY, iTempX, iTempY, bCheck, pcInCheckColor, false)) {
						//this.bubble("tracelog","Apparently, this is a valid move.  Piece at X="+iExamX+", Y="+iExamY+", to X="+iTempX+", Y="+iTempY);
						bNoMoreMoves = false;
						break;
					}
				}
			}
		}
		//this.bubble("tracelog","bNoMoreMoves="+bNoMoreMoves+", bCheck="+bCheck);
		if (bNoMoreMoves) {
			if (bCheck) {
				var sWinner = etc.bBlackSide ? "Black" : "White";
				this.checkStatus.setValue("Checkmate! " + sWinner + " wins.");
				bGameNotOver = false;
			} else {
				this.checkStatus.setValue("Stalemate!");
				bGameNotOver = false;
			}
		} else {
			bGameNotOver = true;
		}
		return;
	}
	
	target.findNumberOfMoves = function () {
		flagWhoMoved ^= 8;
		var iExamX, iExamY, iExamPc;
		var noOfMoves = 0;
		var myKing = kings[flagWhoMoved >> 3 ^ 1];
		var foundmove = [];
		
		bCheck = this.isThreatened(myKing % 10 - 2, (myKing - myKing % 10) / 10 - 2, flagWhoMoved);
		var pcInCheckColor = flagWhoMoved ^ 8;
		for (var iExamSq = 22; iExamSq <= 99; iExamSq++) {
			// search the board
			if (iExamSq % 10 < 2) {
				continue;
			}
			//this.bubble("tracelog","iExamSq="+iExamSq);
			iExamX = (iExamSq - 2) % 10;
			iExamY = Math.floor((iExamSq - 22) / 10);
			//iExamX = iExamSq % 10 - 2;
			//iExamY = (iExamSq - iExamSq % 10) / 10 - 2;
			iExamPc = etc.aBoard[iExamSq];
			if ((iExamPc > 0) && ((iExamPc & 8 ^ 8) === flagWhoMoved)) {
				// found a piece of the side whose king is in check
				//this.bubble("tracelog","Piece "+iExamPc+" found at="+iExamSq+" of color "+pcInCheckColor);
				for (var iWaySq = 22; iWaySq <= 99; iWaySq++) {
					// search the board looking for a valid move that will get them out of check
					if (iWaySq % 10 < 2) {
						continue;
					}
					//this.bubble("tracelog","iWaySq="+iWaySq);
					iTempX = (iWaySq - 2) % 10;
					iTempY = Math.floor((iWaySq - 22) / 10);
					if (this.isValidMove(iExamX, iExamY, iTempX, iTempY, bCheck, pcInCheckColor, false)) {
						//this.bubble("tracelog","Apparently, this is a valid move.  Piece at X="+iExamX+", Y="+iExamY+", to X="+iTempX+", Y="+iTempY);
						noOfMoves++;
						foundmove = [noOfMoves, iExamX, iExamY, iTempX, iTempY];
						if (noOfMoves>1) break;
					}
				}
			}
		}
		//this.bubble("tracelog","noOfMoves="+noOfMoves);
		flagWhoMoved ^= 8;
		return foundmove;
	}
	
	target.getPcByParams = function (nParamId, nWhere) {
		var nPieceId = aParams[nParamId];
		if ((nPieceId & 7) === 2) {
			kings[nParamId >> 3 & 1] = nWhere + 1;
		}
		return (nPieceId);
	}
	
	target.doButtonClick = function (sender) {
		var id;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "RES") {
			// initiate new game
			this.resetBoard();
			bGameNotOver = true;
			this.messageStatus.setValue("White's turn");
			this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
			this.selection2.changeLayout(0, 0, uD, 0, 0, uD);
			this.selection3.changeLayout(0, 0, uD, 0, 0, uD);
			etc.bBlackSide = false;
	
			// initialise AI variables
			bmove = 0;
			moveno = 0;
			ep = 0;
			parsees = 0;
			prunees = 0;
			evaluees = 0;
			Bt = 1999;
			Al = -Bt;
			castle = [3, 3];
			kp = [25, 95];
			board = [];
			weight = [];
			weights = [];
			b_pweights = [];
			b_weights = [];
			pieces = [];
			s00 = 3;
			s0 = 4;
			s1 = 1;
			dirs = [10, -10];
	
			for (y = 0; y < 12; y++) {
				for (x = 0; x < 10; x++) {
					z = (y * 10) + x;
					b_pweights[z] = parseInt(pw.charAt(y)); //also need to add main weight set at start.
					b_weights[z] = parseInt(wstring.charAt((z < 60) ? z : 119 - z), 35) & 7; // for all the ordinary pieces
					board[z] = parseInt(bstring.charAt(z), 35);
				}
			}
			board[120] = 0;
			this.prepare();
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
		if (n == "LOA") {
			this.loadGame(datPath);
			return;
		}
		if (n == "SAV") {
			this.saveGame();
			return;
		}
		if (n == "PUZ") {
			this.PUZZLE_DIALOG.open();
			return;
		}
	}

	target.saveGame = function () {
		try {
			if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
			stream = new Stream.File(datPath, 1);
			// save board to file
			for (t=22; t<=99; t++)
			{
				if (t % 10 > 1) {
					stream.writeLine(etc.aBoard[t]);
				}
			}
			stream.writeLine(etc.bBlackSide);
			stream.writeLine(moveno);
			stream.close();
			this.checkStatus.setValue("Game saved successfully");
		} catch (e) { this.checkStatus.setValue("Game save failed"); }	
	}
	
	target.loadGame = function (filePath) {
		try {
			if (FileSystem.getFileInfo(filePath)) {
				var stream = new Stream.File(filePath);

				// load board from save file
				for (t=22; t<=99; t++)
				{
					if (t % 10 > 1) {
						tempnum = stream.readLine();
						etc.aBoard[t] = Math.floor(tempnum); // convert string to integer
						if (etc.aBoard[t] == 18) kings[0] = t;
						if (etc.aBoard[t] == 26) kings[1] = t;
					}
				}
				 tempboolean = stream.readLine();
				 if (tempboolean=="true") {
					etc.bBlackSide = true;
					flagWhoMoved = 0;
					this.messageStatus.setValue("Black's turn");
				} else {
					etc.bBlackSide = false;
					flagWhoMoved = 8;
					this.messageStatus.setValue("White's turn");
				}
				moveno = stream.readLine();
				this.puzzleName.setValue("");
				this.puzzleSource.setValue("");
				this.puzzleMoves.setValue("");
				doingPuzzle = false;
				//}
				
				stream.close();

				// update board
				this.writePieces();

				// reset undo
				currundo=0;
				this.updateUndo();
				
				// update AI board
				z = 0;
				for (y = 20; y < 100; y += 10) {
					for (x = 1; x < 9; x++) {
						z = etc.aBoard[y + x + 1];
						if (z == 25) z = 1;
						if (z == 29) z = 2;
						if (z == 27) z = 3;
						if (z == 28) z = 4;
						if (z == 30) z = 5;
						if (z == 26) z = 6;
						if (z == 17) z = 9;
						if (z == 21) z = 10;
						if (z == 19) z = 11;
						if (z == 20) z = 12;
						if (z == 22) z = 13;
						if (z == 18) z = 14;
						newy = 110 - y;
						board[newy + x] = z;
						// update the position of the kings in the special king array
						if (z == 6) kp[0] = newy + x;
						if (z == 14) kp[1] = newy + x;
					}
				}
				this.prepare(); // get stuff ready for next move
			
				// remove what moved highlights
				this['selection1'].changeLayout(0, 0, uD, 0, 0, uD);
				this['selection2'].changeLayout(0, 0, uD, 0, 0, uD);
				this['selection3'].changeLayout(0, 0, uD, 0, 0, uD);

				// check for checkmate/stalemate
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
				this.getInCheckPieces();
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
			}
		} catch (e) { this.checkStatus.setValue("Game load failed"); }	
	}
	
	target.moveCursor = function (dir) {
		if (puzzDlgOpen) {
			this.PUZZLE_DIALOG.moveCursor(dir);
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
		var x, y, iPosition, sMove;
		if (puzzDlgOpen) {
			this.PUZZLE_DIALOG.doCenterF();
			return;
		}
		x = cursorX / 75; // find column
		y = (cursorY - 70) / 75; // find row
		iPosition = (y + 2) * 10 + 2 + x;
		//this.bubble("tracelog","n="+n+", iPosition="+iPosition);
		this.makeSelection(iPosition, false);
		return;
	}
	
	target.digitF = function (key) {
		if ((key > 0) && (key < 9)) {
			cursorX = (key - 1) * 75;
			this.gridCursor.changeLayout(cursorX, 75, uD, cursorY, 75, uD);
		}
		if (key == 9) {
			etc.nPromotion++;
			if (etc.nPromotion == 4) {
				etc.nPromotion = 0;
			}
			if (etc.nPromotion == 0) {
				this.nonTouch5.setValue("[9] Pawn promotion to: Queen");
			}
			if (etc.nPromotion == 1) {
				this.nonTouch5.setValue("[9] Pawn promotion to: Rook");
			}
			if (etc.nPromotion == 2) {
				this.nonTouch5.setValue("[9] Pawn promotion to: Bishop");
			}
			if (etc.nPromotion == 3) {
				this.nonTouch5.setValue("[9] Pawn promotion to: Knight");
			}
			return;
		}
		if (key == 0) {
			// This indicates the AI level. It can be 1: "very stupid", 2: "slow, stupid", or 3: "very slow".
			level++;
			if (level == 4) {
				level = 1;
				automode = !automode;
			}
			if (level == 1) {
				if (automode) {
					this.nonTouch6.setValue("[0] AI speed: Fast (Auto ON)");
				} else {
					this.nonTouch6.setValue("[0] AI speed: Fast (Auto OFF)");
				}
			}
			if (level == 2) {
				if (automode) {
					this.nonTouch6.setValue("[0] AI speed: Medium (Auto ON)");
				} else {
					this.nonTouch6.setValue("[0] AI speed: Medium (Auto OFF)");
				}
			}
			if (level == 3) {
				if (automode) {
					this.nonTouch6.setValue("[0] AI speed: Slow (Auto ON)");
				} else {
					this.nonTouch6.setValue("[0] AI speed: Slow (Auto OFF)");
				}
			}
		}
		return;
	}
	
	target.doHold9 = function () {
		// initiate new game
		this.resetBoard();
		this.writePieces();
		bGameNotOver = true;
		this.messageStatus.setValue("White's turn");
		this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection2.changeLayout(0, 0, uD, 0, 0, uD);
		this.selection3.changeLayout(0, 0, uD, 0, 0, uD);
		cursorX = 0;
		cursorY = 520;
		this.gridCursor.changeLayout(cursorX, 75, uD, cursorY, 75, uD);
		etc.bBlackSide = false;
	
		// initialise AI variables
		bmove = 0;
		moveno = 0;
		ep = 0;
		parsees = 0;
		prunees = 0;
		evaluees = 0;
		Bt = 1999;
		Al = -Bt;
		castle = [3, 3];
		kp = [25, 95];
		board = [];
		weight = [];
		weights = [];
		b_pweights = [];
		b_weights = [];
		pieces = [];
		s00 = 3;
		s0 = 4;
		s1 = 1;
		dirs = [10, -10];
	
		for (y = 0; y < 12; y++) {
			for (x = 0; x < 10; x++) {
				z = (y * 10) + x;
				b_pweights[z] = parseInt(pw.charAt(y)); //also need to add main weight set at start.
				b_weights[z] = parseInt(wstring.charAt((z < 60) ? z : 119 - z), 35) & 7; // for all the ordinary pieces
				board[z] = parseInt(bstring.charAt(z), 35);
			}
		}
		board[120] = 0;
		this.prepare();
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

	target.doHold1 = function () {
		this.PUZZLE_DIALOG.open();
		return;
	}
	
	target.doPrev = function () {
		if (hasNumericButtons) {
			this.moveCursor("left");
			return;
		}
		// This indicates the AI level. It can be 1: "very stupid", 2: "slow, stupid", or 3: "very slow".
		level++;
		if (level == 4) {
			level = 1;
			automode = !automode;
		}
		if (level == 1) {
			if (automode) {
				this.touchButtons1.setValue("Fast (Auto ON)");
			} else {
				this.touchButtons1.setValue("Fast (Auto OFF)");
			}
		}
		if (level == 2) {
			if (automode) {
				this.touchButtons1.setValue("Medium (Auto ON)");
			} else {
				this.touchButtons1.setValue("Medium (Auto OFF)");
			}
		}
		if (level == 3) {
			if (automode) {
				this.touchButtons1.setValue("Slow (Auto ON)");
			} else {
				this.touchButtons1.setValue("Slow (Auto OFF)");
			}
		}
		return;
	}
	
	target.doNext = function () {
		if (hasNumericButtons) {
			this.moveCursor("right");
			return;
		}
		etc.nPromotion++;
		if (etc.nPromotion == 4) {
			etc.nPromotion = 0;
		}
		if (etc.nPromotion == 0) {
			this.sometext2.setValue("Queen");
		}
		if (etc.nPromotion == 1) {
			this.sometext2.setValue("Rook");
		}
		if (etc.nPromotion == 2) {
			this.sometext2.setValue("Bishop");
		}
		if (etc.nPromotion == 3) {
			this.sometext2.setValue("Knight");
		}
		return;
	}
	
	target.doSize = function () {
		var x, y, z, newy, checkAI = false;
		if (!bGameNotOver) {
			return;
		}
		
		// check for check before findmove
		if (bCheck) {
			checkAI=true;
		}
			
		// call AI routine to calculate move for whichever player is currently supposed to be making a move
		if (this.findmove()) {
			// update aBoard
			z = 0;
			for (y = 20; y < 100; y += 10) {
				for (x = 1; x < 9; x++) {
					z = board[y + x];
					if (z == 1) z = 25;
					if (z == 2) z = 29;
					if (z == 3) z = 27;
					if (z == 4) z = 28;
					if (z == 5) z = 30;
					if (z == 6) z = 26;
					if (z == 9) z = 17;
					if (z == 10) z = 21;
					if (z == 11) z = 19;
					if (z == 12) z = 20;
					if (z == 13) z = 22;
					if (z == 14) z = 18;
					newy = 110 - y;
					etc.aBoard[newy + x + 1] = z;
					// update the position of the kings in the special king array
					if (z == 26) {
						kings[1] = newy + x + 1;
						if (kings[1] != wOldKing) {
							wHasMoved = true;
						}
					}
					if (z == 18) {
						kings[0] = newy + x + 1;
						if (kings[0] != bOldKing) {
							bHasMoved = true;
						}
					}
				}
			}
			
			// do a special check for check
			this.getInCheckPieces();
			if ((bCheck) && (checkAI) && (bGameNotOver)) {
				// AI failed so reverse move and try again at lesser level
				for (y = 0; y < 110; y++) {
					etc.aBoard[y] = tempBoard[y];
				}
				// Revert AI board
				z = 0;
				for (y = 20; y < 100; y += 10) {
					for (x = 1; x < 9; x++) {
						z = etc.aBoard[y + x + 1];
						if (z == 25) z = 1;
						if (z == 29) z = 2;
						if (z == 27) z = 3;
						if (z == 28) z = 4;
						if (z == 30) z = 5;
						if (z == 26) z = 6;
						if (z == 17) z = 9;
						if (z == 21) z = 10;
						if (z == 19) z = 11;
						if (z == 20) z = 12;
						if (z == 22) z = 13;
						if (z == 18) z = 14;
						newy = 110 - y;
						board[newy + x] = z;
						// update the position of the kings in the special king array
						if (z == 6) kp[0] = newy + x;
						if (z == 14) kp[1] = newy + x;
					}
				}
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
				this.prepare(); // get stuff ready for next move
				// try to find move at lesser level
				level--;
				if (level==0) {
					level=oldlevel;
					// output AI failure message
					this.checkStatus.setValue("AI failed. Sorry!");
					return;
				} else {
					this.prepare();
					this.doSize();
					level=oldlevel;
					return;
				}
			} else {
				// AI succeeded
				this.writePieces();
				this.updateUndo();
				level=oldlevel;

				// check for checkmate / stalemate
				//this.getInCheckPieces();
				if (bGameNotOver) {
					flagWhoMoved ^= 8;
					etc.bBlackSide = !etc.bBlackSide;
					this.getInCheckPieces();
					flagWhoMoved ^= 8;
					etc.bBlackSide = !etc.bBlackSide;
				}
		
				// black needs to do an automove if game not over and in automode
				if ((bGameNotOver) && (automode) && (etc.bBlackSide)) {
					oldlevel=level;
					FskUI.Window.update.call(kbook.model.container.getWindow());
					// Save board in case AI fails
					for (y = 0; y < 110; y++) {
						tempBoard[y] = etc.aBoard[y];
					}
					this.doSize();
				}
			}
		} else {
			// couldn't find a move, so check for checkmate / stalemate
			this.getInCheckPieces();
			if (bGameNotOver) {
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
				this.getInCheckPieces();
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
			}
			if (bGameNotOver) {
				// try to find move at lesser level
				level--;
				if (level==0) {
					level=oldlevel;
					// output AI failure message
					this.checkStatus.setValue("AI failed. Sorry!");
					return;
				} else {
					this.prepare();
					this.doSize();
					level=oldlevel;
					return;
				}
			}
		}
		return;
	}
	
	// AI functions
	target.treeclimber = function (count, bm, sc, s, e, alpha, beta, EP) {
		//this.bubble("tracelog","Entering treeclimber: count="+count+", bm="+bm+", sc="+sc+", s="+s+", e="+e+", alpha="+alpha+", beta="+beta+", EP="+EP);
		var z = -1;
		sc = -sc;
		var nbm = 8 - bm;
		if (sc < -400) {
			//this.bubble("tracelog","Leaving treeclimber...");
			return [sc, s, e]; //if king taken, no deepening.
		}
	
		var b = Al; //best move starts at -infinity    
		var S, E = board[e];
		board[e] = S = board[s];
		board[s] = 0;
		//rather than trying to track changes
		//parse checks to see if each one is still there
		if (S) pieces[nbm][pieces[nbm].length] = [S, e];
	
		//now some stuff to handle queening, castling
		var rs, re;
		if (S & 7 == 1 && board[e + dirs[bm >> 3]] > 15) {
			board[e] += 4 - queener; //queener is choice for pawn queening
		}
		if (S & 7 == 6 && (s - e == 2 || e - s == 2)) { //castling - move rook too
			rs = s - 4 + (s < e) * 7;
			re = (s + e) >> 1; //avg of s,e=rook's spot
			board[rs] = 0;
			board[re] = bm + 2;
		}
	
		//this.bubble("tracelog","Made it this far. bm="+bm+", EP="+EP+", sc="+sc);
	
		var movelist;
		var movecount;
		var mv;
		movelist = this.parse(bm, EP, sc);
		movecount = movelist.length;
		parsees += movecount;
		evaluees++;
		if (movecount) {
			if (count) {
				//BRANCH NODES 
				var t;
				var cmp = comp;
	
				movelist.sort(cmp); //descending order
				count--;
				best = movelist[0];
				var bs = best[1];
				var be = best[2];
				b = -this.treeclimber(count, nbm, best[0], bs, be, -beta, -alpha, best[3])[0];
	
				//	best[0]=b;
				for (z = 1; z < movecount; z++) {
	
					if (b > alpha) alpha = b; //b is best
					//alpha is always set to best or greater.
	
					mv = movelist[z];
					// try now with empty window - assuming fail.
					t = -this.treeclimber(count, nbm, mv[0], mv[1], mv[2], -alpha - 1, -alpha, mv[3])[0];
					if ((t > alpha) && (t < beta)) {
						// but if not fail, now look for the actual score.
						// which becomes new best.
						t = -this.treeclimber(count, nbm, mv[0], mv[1], mv[2], -beta, -t, mv[3])[0];
					}
	
					if (t > b) {
						// if this move is still better than best,
						// it becomes best. 
						b = t;
						bs = mv[1];
						be = mv[2];
						//		best[0]=b;
						// and alpha becomes this score,
						// and if this is better than beta, stop looking.
						if (t > alpha) alpha = t;
						if (b > beta) {
							// if best > beta, other side won't have it.
							break;
						}
					}
				}
			} else {
				b = Al;
				//LEAF NODES
				while (--movecount && beta > b) {
					if (movelist[movecount][0] > b) {
						b = movelist[movecount][0];
					}
				}
			}
		}
		if (rs) {
			board[rs] = bm + 2;
			board[re] = 0;
		}
		board[s] = S;
		board[e] = E;
		pieces[nbm].length--;
	
		//this.bubble("tracelog","Leaving treeclimber: b="+b+", bs="+bs+", be="+be);
		return [b, bs, be];
	}
	
	//*************************************making moves
	target.findmove = function () {
		var s, e, pn, themove, sb, bs, noOfMoves;
		evaluees = parsees = prunees = 0;
	
		if (etc.bBlackSide) {
			bmove = 8;
		} else {
			bmove = 0;
		}
		
		//check to see if there is only one possible move available
		noOfMoves=target.findNumberOfMoves();
		
		if (noOfMoves[0]==1) {
			//this.bubble("tracelog","Only one move for "+bmove);
			pn = 0; //points don't matter
			s = (7 - noOfMoves[2])*10 + noOfMoves[1] + 21;
			e = (7 - noOfMoves[4])*10 + noOfMoves[3] + 21;
		} else {
			//this.bubble("tracelog","Finding a move for "+bmove+", level="+level);
			themove = this.treeclimber(level, bmove, 0, 120, 120, Al, Bt, ep);
			pn = themove[0];
			s = themove[1];
			e = themove[2];
		}
	
		//this.bubble("tracelog","FOUND A MOVE: pn="+pn+", s="+s+", e="+e);
		return this.move(s, e, 0, pn);
	}
	
	target.move = function (s, e, queener, score) {
		var E = board[e];
		var S = board[s];
		var a = S & 7;
		var bmx = bmove >> 3;
		var dir = dirs[bmx];
		var x = s % 10;
		//    var tx=e%10;
		//    var ty=e-tx;
		var gap = e - s;
		var ch;
		var test = 0;
	
		//test if this move is legal
		var p = this.parse(bmove, ep, 0);
		for (z = 0; z < p.length; z++) {
			var t = p[z];
			test = test || (s == t[1] && e == t[2]);
		}
		if (!test) {
			this.messageStatus.setValue("No such move...");
			return 0;
		}
	
		var themove;
	
		// now see whether in check after this move, by getting the best reply.  
		board[e] = S;
		board[s] = 0;
	
		themove = this.treeclimber(0, 8 - bmove, 0, 120, 120, Al, Bt, ep);
		//this.bubble("tracelog","got this far: themove="+themove);
		if (themove[0] > 400) {
			//this.bubble("tracelog","in check");
			board[s] = S;
			board[e] = E;	
			return 0;
		}
	
		//if got this far, the move is accepted. 
		// there is no turning back
	
		//this.bubble("tracelog","Move: s="+s+", e="+e+", score="+score);
	
		p = pieces[bmove];
		for (z = 0; z < p.length; z++) {
			if (p[z][1] == s) p[z][1] = e;
		}

		board[s] = S;
		board[e] = E;
	
		//Now it's a matter of saving changed state (enpassant, castling, and queening.)
		ep = 0; // ep reset
		if (a == 1) { // pawns
			if (board[e + dir] > 15) board[s] += 4 - queener; //queener is choice for pawn queening
			if (e == s + 2 * dir && (board[e - 1] & 1 || board[e + 1] & 1)) ep = s + dir; //set up ep - with pawn test to save time in parse loop
			if (!E && (s - e) % 10) this.shift(e, e - dir); // blank ep pawn
		}
		if (s == 21 + bmx * 70 || s == 28 + bmx * 70) castle[bmx] &= (x < 5) + 1; //castle flags (blank on any move from rook points)
		if (a == 6) {
			kp[bmx] = e; //king position for fancy weighting 
			if (gap * gap == 4) { //castling - move rook too
				//if (!this.check(s,8-bmove,dir,gap>>1))return false
				this.shift(s - 4 + (s < e) * 7, s + gap / 2);
			}
			castle[bmx] = 0;
		}
	
		this.shift(s, e);
		this.prepare(); // get stuff ready for next move
		moveno++;
		if (doingPuzzle) {
			// update number of moves for puzzle
			puzzleMoves=Math.floor((moveno+1)/2);
			this.puzzleMoves.setValue(puzzleMoves);
		}		
	
		// the move is done 
		//so give the other side a turn.
		etc.bBlackSide = !etc.bBlackSide;
		flagWhoMoved ^= 8;
		if (!etc.bBlackSide) this.messageStatus.setValue("White's turn");
		if (etc.bBlackSide) this.messageStatus.setValue("Black's turn");
	
		//find location of the start and end places of the piece that just moved
		tempdiv = Math.floor(s / 10) * 10;
		lastStart = 110 - tempdiv + s % 10 + 1;
		tempdiv = Math.floor(e / 10) * 10;
		lastEnd = 110 - tempdiv + e % 10 + 1;
	
		return 1;
	}
	
	target.prepare = function () {
		var z, BM;
		//this.bubble("tracelog","Preparing for move...");
	
		if (!(moveno & 7) && s0 > 1) s0--; //every 4 moves for first 20, s0 decreases.
		s1 = (moveno >> 4) & 1; //every sixteen moves s1 increases
		pieces[0] = [];
		pieces[8] = [];
		kweights = [];
		pweights = [
			[],
			[]
		];
		for (z = 21; z < 99; z++) {
			// get moveno, and work out appropriate weightings from it.
			// using base weightings.       	
			a = board[z];
			if (a & 7) {
				pieces[a & 8][pieces[a & 8].length] = [a, z];
			}
			weights[z] = b_weights[z] * s0;
			kweights[z] = (moveno > 40) || (10 - 2 * b_weights[z]) * s0; // while moveno <= 40, weight to edge. 
			pweights[1][119 - z] = pweights[0][z] = b_pweights[z]; //centralising for first 8 moves, then forwards only.
			if (moveno < 5 && z > 40) pweights[0][z] = pweights[1][119 - z] += (Math.random() * weights[z]) >> 1;
		}
		//this.bubble("tracelog","White pieces="+pieces[0]);
		//this.bubble("tracelog","Black pieces="+pieces[8]);
		return;
	}
	
	target.parse = function (bm, EP, tpn) {
		var yx, tyx; //start and end position  
		var h; //for pawn taking moves
		var E, a; //E=piece at end place, a= piece moving
		var cx; // loop for move direction
		var mv; // list of move direction
		var k = -1; // length of movelist (mvl) 
		var bmx = bm >> 3; //0 for white, 1 for black
		var nbm = bm ^ 8; //not bm (bm is the players colour)
		var nx = nbm >> 3; //not bmx (ie 1 for white, 0 for black)
		var dir = dirs[bmx]; //dir= 10 for white, -10 for black
		var mvl = []; // movelist (built up with found moves)
		var m; // current value in mv[cx]            
		var wate; // initial weighting of piece's position 
		var pweight = pweights[bmx]; //=pweights[bmx]
		var weight; //=weight localised weight
		var cbmx = castle[bmx]; // flags whether this side can castle
		var z; //loop counter.
		var ak; //flags piece moving is king.
		var mlen; //mv length in inner loop
		var pbm = pieces[bm]; //list of pieces that can move
		var pbl = pbm.length; //marginal time saving
		var B = board; //local ref to board
	
		//this.bubble("tracelog","Entering parse... bm="+bm+", EP="+EP+", tpn="+tpn);
		//this.bubble("tracelog","pbl="+pbl);
		for (z = 0; z < pbl; z++) {
			//this.bubble("tracelog","z="+z);
			yx = pbm[z][1];
			a = B[yx];
			//this.bubble("tracelog","pbm[z][0]="+pbm[z][0]+", a="+a);
			if (pbm[z][0] == a) {
				a &= 7;
				if (a > 1) { //non-pawns
					//this.bubble("tracelog","made it this far: nonpawn");
					ak = a == 6;
					weight = ak ? kweights : weights //different weight tables for king/knight
					wate = tpn - weight[yx];
					mv = moves[a];
					//this.bubble("tracelog","mv="+mv);
					if (a == 3 || ak) {
						for (cx = 0; cx < 8;) { //knights,kings
							tyx = yx + mv[cx++];
							E = B[tyx];
							if (!E || (E & 24) == nbm) {
								mvl[++k] = [wate + pv[E] + weight[tyx], yx, tyx];
								//rating,start,end,-- enpassant left undefined
							}
						}
						if (ak && cbmx) {
							if (cbmx & 1 && !(B[yx - 1] + B[yx - 2] + B[yx - 3]) && this.check(yx - 2, nbm, dir, -1)) { //Q side
								mvl[++k] = [wate + 11, yx, yx - 2]; //no analysis, just encouragement
							}
							if (cbmx & 2 && !(B[yx + 1] + B[yx + 2]) && this.check(yx, nbm, dir, 1)) { //K side
								mvl[++k] = [wate + 12, yx, yx + 2]; //no analysis, just encouragement
							}
						}
					} else { //rook, bishop, queen
						mlen = mv.length;
						for (cx = 0; cx < mlen;) { //goeth thru list of moves
							E = 0;
							m = mv[cx++];
							tyx = yx;
							while (!E) { //while on board && no piece
								//this.bubble("tracelog","E="+E);
								tyx += m;
								E = B[tyx];
								if (!E || (E & 24) == nbm) {
									mvl[++k] = [wate + pv[E] + weight[tyx], yx, tyx];
								}
							}
							//this.bubble("tracelog","E="+E);
						}
					}
				} else { //pawns
					//this.bubble("tracelog","made it this far: pawn");
					wate = tpn - pweight[yx];
					tyx = yx + dir;
					if (!B[tyx]) {
						mvl[++k] = [wate + pweight[tyx], yx, tyx];
						if (!pweight[yx] && (!B[tyx + dir])) { //2 squares at start - start flagged by 0 pweights weighting
							mvl[++k] = [wate + pweight[tyx + dir], yx, tyx + dir, tyx]; //ep points to the takeable spot
						}
					}
					if (EP && (EP == tyx + 1 || EP == tyx - 1)) { //&& bm!=(B[EP-dir]&8)) { 
						//enpassant. if EP is working properly, the last test is redundant	    
						mvl[++k] = [wate + pweight[tyx], yx, EP];
					}
					for (h = tyx - 1; h < tyx + 2; h += 2) { //h=-1,1 --for pawn capturing
						E = B[h] + bm;
						if (E & 7 && E & 8) {
							mvl[++k] = [wate + pv[E] + pweight[h], yx, h];
						}
					}
				}
			}
		}
		//this.bubble("tracelog","Leaving parse...");
		return mvl;
	}
	
	//************************************CHECK
	target.check = function (yx, nbm, dir, side) { //dir is dir
		var tyx, E, E7, sx = yx % 10,
			x, m, ex = yx + 3,
			md = dir + 2,
			k = moves[3],
			B = board;
		for (; yx < ex; yx++) { //go thru 3positions, checking for check in each
			for (m = dir - 2; ++m < md;) {
				E = B[yx + m];
				if (E && (E & 8) == nbm && ((E & 7) == 1 || (E & 7) == 6)) return 0; //don't need to check for pawn position --cannot arrive at centre without passing thru check
				E = 0;
				tyx = yx;
				while (!E) { //while on B && no piece
					tyx += m;
					E = B[tyx];
					//                if (E&16)break
					if ((E == nbm + 2 + (m != dir) * 2) || E == nbm + 5) return 0;
				}
			}
			for (z = 0; z < 8;) {
				if (B[yx + k[z++]] - nbm == 3) return 0; //knights
			}
		}
		E = 0;
		yx -= 3;
		while (!E) { //queen or rook out on other side
			yx -= side;
			E = B[yx];
			if (E == nbm + 2 || E == nbm + 5) return 0;
		}
		return 1;
	};
	
	target.shift = function (s, e) {
		var z = 0,
			a = board[s],
			p = pieces[bmove];
		board[e] = a;
		board[s] = 0;
		for (z = 0; z < p.length; z++) {
			if (p[z][1] = s) p[z][1] = e;
		}
	}
	
	// Puzzle pop-up panel stuff
    target.PUZZLE_DIALOG.open = function() {
	   if (isNT) {
		target.PUZZLE_DIALOG.checkmateIn_2.enable(true);
	   	custSel = 0; 
	   	ntHandlePuzzDlg();
	   }
	   puzzDlgOpen = true;
       target.PUZZLE_DIALOG.show(true);
    }
	
	var ntHandlePuzzDlg = function () {
		if (custSel === 0) {
			target.PUZZLE_DIALOG.checkmateIn_2.enable(true);
			target.PUZZLE_DIALOG.checkmateIn_3.enable(false);
			target.PUZZLE_DIALOG.checkmateIn_4.enable(false);
			mouseLeave.call(target.PUZZLE_DIALOG.btn_Ok);
		}
		if (custSel === 1) {
			target.PUZZLE_DIALOG.checkmateIn_2.enable(false);
			target.PUZZLE_DIALOG.checkmateIn_3.enable(true);
			target.PUZZLE_DIALOG.checkmateIn_4.enable(false);
			mouseLeave.call(target.PUZZLE_DIALOG.btn_Ok);
		}			
		if (custSel === 2) {
			target.PUZZLE_DIALOG.checkmateIn_2.enable(false);
			target.PUZZLE_DIALOG.checkmateIn_3.enable(false);
			target.PUZZLE_DIALOG.checkmateIn_4.enable(true);
			mouseLeave.call(target.PUZZLE_DIALOG.btn_Ok);	
		}
		if (custSel === 3) {				
			target.PUZZLE_DIALOG.checkmateIn_2.enable(false);
			target.PUZZLE_DIALOG.checkmateIn_3.enable(false);
			target.PUZZLE_DIALOG.checkmateIn_4.enable(false);
			mouseLeave.call(target.PUZZLE_DIALOG.btn_Cancel);
			mouseEnter.call(target.PUZZLE_DIALOG.btn_Ok);	
		}			
		if (custSel === 4) {				 		
			mouseLeave.call(target.PUZZLE_DIALOG.btn_Ok);
			mouseEnter.call(target.PUZZLE_DIALOG.btn_Cancel);	
		}								
	}

	target.PUZZLE_DIALOG.moveCursor = function (direction) {
	switch (direction) {
		case "up" : {
			if (custSel>0) {
				custSel --;
				ntHandlePuzzDlg();
				}
			break
		}
		case "down" : {
			if (custSel<4) {
				custSel ++;
				ntHandlePuzzDlg();
				}
			break
		}
		case "left" : {
			if (custSel === 0) target.PUZZLE_DIALOG["checkmateIn_2-"].click();
			if (custSel === 1) target.PUZZLE_DIALOG["checkmateIn_3-"].click();
			if (custSel === 2) target.PUZZLE_DIALOG["checkmateIn_4-"].click();
			break
		}		
		case "right" : {
			if (custSel === 0) target.PUZZLE_DIALOG["checkmateIn_2+"].click();
			if (custSel === 1) target.PUZZLE_DIALOG["checkmateIn_3+"].click();
			if (custSel === 2) target.PUZZLE_DIALOG["checkmateIn_4+"].click();
			break
		}
	  }	
	}
	
	target.PUZZLE_DIALOG.doCenterF = function () {
		if (custSel === 0) target.setVariable("puzzle_selected","2");
		if (custSel === 1) target.setVariable("puzzle_selected","3");
		if (custSel === 2) target.setVariable("puzzle_selected","4");
		if (custSel === 3) target.PUZZLE_DIALOG.btn_Ok.click();	
		if (custSel === 4) target.PUZZLE_DIALOG.btn_Cancel.click();	
	}
	
	target.PUZZLE_DIALOG.doPlusMinus = function(sender) {
	   var senderID, cMateIn2;
	   senderID = getSoValue(sender,"id");
	   step = ( senderID.lastIndexOf("+") != -1) ? 1 : -1;
	   senderID = senderID.slice(0,senderID.length-1);
	   cMateIn2 = parseInt(target.getVariable("checkmate_2"));
	   cMateIn3 = parseInt(target.getVariable("checkmate_3"));
	   cMateIn4 = parseInt(target.getVariable("checkmate_4"));
	   this.bubble("tracelog","senderID="+senderID+", step="+step+", cMateIn2="+cMateIn2+", cMateIn3="+cMateIn3+", cMateIn4="+cMateIn4);
	   switch (senderID) {
			case "checkmateIn_2" :
			{
				if (cMateIn2<=maxMateIn2-step && cMateIn2>0-step) {
					cMateIn2 = cMateIn2+step;
				}
				this.container.setVariable("checkmate_2",cMateIn2);
				break;
			}
			case "checkmateIn_3" :
			{
				if (cMateIn3<=maxMateIn3-step && cMateIn3>0-step) {
					cMateIn3 = cMateIn3+step;
				}
				this.container.setVariable("checkmate_3",cMateIn3);
				break;
			}
			case "checkmateIn_4" :
			{
				if (cMateIn4<=maxMateIn4-step && cMateIn4>0-step) {
					cMateIn4 = cMateIn4+step;
				}
				this.container.setVariable("checkmate_4",cMateIn4);
				break;
			}
	   }	 
	}
	
	target.PUZZLE_DIALOG.setPuzzleType = function (t) {
		/*target.bubble("tracelog",t);
		if ( t == "2" || t == "3" || t == "4" )
		{
			target.setVariable("puzzle_selected",t);
		} 
		else {
			t = target.getVariable("puzzle_selected");
		}*/
		return;
	}
	
	target.closeDlg = function () {
		puzzDlgOpen = false;
		return;
	}
	
	target.loadPuzzle = function () {
		puzzDlgOpen = false;
		var t = target.getVariable("puzzle_selected");
		//target.bubble("tracelog",t);
		var cMateIn2 = parseInt(target.getVariable("checkmate_2"));
		var cMateIn3 = parseInt(target.getVariable("checkmate_3"));
		var cMateIn4 = parseInt(target.getVariable("checkmate_4"));
		
		if (t == "2") {
				fileToLoad = puzPath+"mate_in_two_moves.dat";
				puzzleToLoad = parseInt(cMateIn2);
		}
		if (t == "3") {
				fileToLoad = puzPath+"mate_in_three_moves.dat";
				puzzleToLoad = parseInt(cMateIn3);
		}
		if (t == "4") {
				fileToLoad = puzPath+"mate_in_four_moves.dat";
				puzzleToLoad = parseInt(cMateIn4);
		}
		//this.bubble("tracelog","load puzzle "+fileToLoad+": "+puzzleToLoad);

		// save current puzzle numbers to puzDatPath
		try {
			if (FileSystem.getFileInfo(puzDatPath)) FileSystem.deleteFile(puzDatPath);
			stream = new Stream.File(puzDatPath, 1);
			stream.writeLine(cMateIn2);
			stream.writeLine(cMateIn3);
			stream.writeLine(cMateIn4);
			stream.close();
		} catch (e) { }

		// load puzzle
		try {
			if (FileSystem.getFileInfo(fileToLoad)) {
				var stream = new Stream.File(fileToLoad);
				var puzzleData = [];
				var inpLine;
				
				for (var numpuzzle=1; numpuzzle<=puzzleToLoad; numpuzzle++)
				{
					// read through puzzle file until you come to the desired puzzle
					inpLine = stream.readLine();
				}
				
				stream.close();
				
				puzzleData = inpLine.split(";");
				var dataItemNum = 0;
				
				// load board from save file
				for (t=22; t<=99; t++)
				{
					if (t % 10 > 1) {
						tempnum = puzzleData[dataItemNum];
						dataItemNum++;
						etc.aBoard[t] = Math.floor(tempnum); // convert string to integer
						if (etc.aBoard[t] == 18) kings[0] = t;
						if (etc.aBoard[t] == 26) kings[1] = t;
					}
				}
				tempboolean = puzzleData[dataItemNum];
				dataItemNum++;
				if (tempboolean=="true") {
					etc.bBlackSide = true;
					flagWhoMoved = 0;
					this.messageStatus.setValue("Black's turn");
				} else {
					etc.bBlackSide = false;
					flagWhoMoved = 8;
					this.messageStatus.setValue("White's turn");
				}
				moveno = puzzleData[dataItemNum];
				dataItemNum++;
				
				// load extra information
				var puzzleName = puzzleData[dataItemNum];
				dataItemNum++;
				var puzzleSource = puzzleData[dataItemNum];
				dataItemNum++;
				this.puzzleName.setValue(puzzleName);
				this.puzzleSource.setValue(puzzleSource);
				puzzleMoves=0;
				doingPuzzle = true;
				this.puzzleMoves.setValue(puzzleMoves);
				
				// update board
				this.writePieces();

				// reset undo
				currundo=0;
				this.updateUndo();
				
				// update AI board
				z = 0;
				for (y = 20; y < 100; y += 10) {
					for (x = 1; x < 9; x++) {
						z = etc.aBoard[y + x + 1];
						if (z == 25) z = 1;
						if (z == 29) z = 2;
						if (z == 27) z = 3;
						if (z == 28) z = 4;
						if (z == 30) z = 5;
						if (z == 26) z = 6;
						if (z == 17) z = 9;
						if (z == 21) z = 10;
						if (z == 19) z = 11;
						if (z == 20) z = 12;
						if (z == 22) z = 13;
						if (z == 18) z = 14;
						newy = 110 - y;
						board[newy + x] = z;
						// update the position of the kings in the special king array
						if (z == 6) kp[0] = newy + x;
						if (z == 14) kp[1] = newy + x;
					}
				}
				this.prepare(); // get stuff ready for next move
			
				// remove what moved highlights
				this['selection1'].changeLayout(0, 0, uD, 0, 0, uD);
				this['selection2'].changeLayout(0, 0, uD, 0, 0, uD);
				this['selection3'].changeLayout(0, 0, uD, 0, 0, uD);

				// check for checkmate/stalemate
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
				this.getInCheckPieces();
				flagWhoMoved ^= 8;
				etc.bBlackSide = !etc.bBlackSide;
			}
		} catch (e) { this.checkStatus.setValue("Puzzle load failed"); }	
		return;
	};
};
tmp();
tmp = undefined;