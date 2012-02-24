// Description: Dictionary by Celemenseken & Lisak & m-land 
// History: 
//      2010-05-18 kartu - Uploaded scrolling fixes by m-land 
//      2010-05-20 kartu - Fixed flickering caused by hourglass 
//	2010-05-30 m-land - text, zoom, scroll aso
//	2010-12-03 Mark Nord - adapterd for PRS+ moved out of sandbox using kartus solution
//			       select special character by doHold# 
//	2011-03-01 kartu - Reformatted code. Made sprite focusable (in xml) so that group actually receives key events.
//				dictionary.xml - Swapped next/prev and left/right so that it also works on 350
//				dictionary.xml - Added events for hold next / prev so that switching between words works on 300
// 	2011-03-01 kartu - Moved into a function, to allow variable name optimizations

var tmp = function () {
	var bootLog = function (msg) {
		var s = new Stream.File("/Data/boot.log", 3);
		try {
			s.seek(s.bytesAvailable);
			s.writeLine(msg);
		} finally {
			s.close();
		}
	};
	
	try {
		var simEnviro, dictPath, lineNo, xCol, getSoValue, setSoValue, maxSmartZoom, 
			resultSize, threeButton, keyMap, holdDigit, isSelectChar, setPopupChar, sonderZeichen;
		if (!kbook.simEnviro) {
			simEnviro = false;
		} else {
			simEnviro = true;
		}
	
		dictPath = kbook.autoRunRoot.dictPath; //"/Data/database/system/PRSPlus/dictionary/"; //directory with dictionaries
		lineNo = 0; //a line number with the result of the last search 
		xCol = 1; //starting position of the cursor - at the middle column
	
		getSoValue = kbook.autoRunRoot.getSoValue;
		setSoValue = kbook.autoRunRoot.setSoValue;
		maxSmartZoom = kbook.autoRunRoot.maxSmartZoom;
		resultSize = kbook.autoRunRoot.resultSize;
	
		//Three button selection mode: if true, left arrow: left column, up arrow: up column, right arrow: right column 
		//otherwise: up arrow: previous term, left arrow - move cursor to left, right arrow - move cursor to the right 
		//target.threeButton = true; 
		threeButton = false;
	
		//map of special function keys 
		keyMap = [
			['', 'CLR', 'BS'],
			['a', 'b', 'c'],
			['d', 'e', 'f'],
			['g', 'h', 'i'],
			['j', 'k', 'l'],
			['m', 'n', 'o'],
			['p', 'q', 'r'],
			['s', 't', 'u'],
			['v', 'w', 'x'],
			['y', 'z', ' ']
		];
		sonderZeichen = false;
	
		try {
			var fnPageScroll = getSoValue(target.textlines, 'scrollPage');
		} catch (e) {
			//   this.myLog('Err:' + e);
		}
		//return file's content in a string 
		var fileToString = function (path) {
			return kbook.autoRunRoot.getFileContent(path, null);
		};
	
		//put text into /tmp/script.sh and run it 
		var runCommand = function (text) {
			kbook.autoRunRoot.exec(text);
		};
	
		//run a command and return the result 
		var runCommandResult = function (text) {
			var tmpf = "/tmp/__dict_result__";
			runCommand(text + " >" + tmpf);
	
			var res = fileToString(tmpf);
			this.issue = res;
	
			FileSystem.deleteFile(tmpf);
			return res;
		};
	
		//DICTIONARY FUNCTIONS
		target.init = function () {
			this.changeResultsSize(kbook.autoRunRoot.resultSize);
		};
	
		target.exitApp = function () {
			kbook.autoRunRoot.exitIf(kbook.model);
		};
	
		target.clearInput = function () {
			this.inputLine.setValue('');
			//this.log.setValue("");  //@@@
		};
	
		target.myLog = function (x) {
			this.log.setValue(this.log.getValue() + '\n' + x);
		};
	
		target.clearStatus = function () {
			this.statusLine.setValue('');
		};
	
		target.clearLines = function () {
			this.textlines.setValue('');
		};
	
		//shows/hides hourglass 
		target.showHourGlass = function (show) {
	
			this.hourGlass.show(show);
			this.hourGlass.invalidate();
			if (show) {
				// Force screen update 
				if (!simEnviro) {
					FskUI.Window.update.call(kbook.model.container.getWindow());
				}
			}
		};
	
		target.changeResultsSize = function (s) {
			var te, stf, sk, styles, style, textinv;
			try {
				te = getSoValue(this.textlines, 'te');
				stf = getSoValue(te, 'setTextFormat');
				 sk = getSoValue(this.textlines, 'skin');
				styles = getSoValue(sk, 'styles');
				style = styles[0];
				setSoValue(style, 'size', s);
				stf.call(te, style);
				textinv = getSoValue(this.textlines, 'invalidate');
				textinv.call(this.textlines);
			} catch (e) {
				// this.myLog("E:" + e);
			}
		};
	
		target.changeSize = function () {
			try {
				//this.myLog("S1");
			} catch (e) {
				//    this.myLog("E:" + e);
			}
		};
		target.doSmartZoom = function () {
			try {
				var gs = getSoValue(this.textlines, 'getSize');
				var gr = getSoValue(this.textlines, 'getRange');
				var sz = gs.call(this.textlines, true);
				var ra = gr.call(this.textlines, true);
				if (sz >= ra) {
					return;
				} else {
					var ratio = 100 - sz * 100 / ra;
					if (ratio > maxSmartZoom) {
						ratio = maxSmartZoom;
					}
					var resRetio = resultSize * (1 - ratio / 100);
					this.changeResultsSize(resRetio);
				}
			} catch (e) {
				//this.myLog("E:" + e);
			}
		};
	
		target.txtFormat = function (txt) {
			if (maxSmartZoom > 0) {
				this.textlines.setValue('');
				this.changeResultsSize(resultSize);
			}
			var myLines;
			var szBul = '•';
			myLines = szBul + txt.replace('\t', '\n' + szBul);
			this.textlines.setValue(myLines);
			if (maxSmartZoom > 0) {
				this.doSmartZoom();
			}
		};
	
		target.doNewScroll = function (by) {
			try {
				// var fnPageScroll = getSoValue(this.textlines, 'scrollPage');
				fnPageScroll.call(this.textlines, true, by);
			} catch (e) {
				//   this.myLog('Err:' + e);
			}
		};
	
		//move cursor in columns (xCol: 0, 1 or 2) 
		target.moveCursor = function (direction) {
			if (direction === "left") {
				if (--xCol < 0) {
					xCol = 2;
				}
			}
			if (direction === "right") {
				if (++xCol > 2) {
					xCol = 0;
				}
			}
	
			this.lineCursor.changeLayout(457 + xCol * 48, undefined, undefined, 627, undefined, undefined);
		};
		//move cursor in columns (xCol: 0, 1 or 2)
		target.arrowKey = function (button) {
			if (button === "left") {
				if (threeButton) {
					xCol = 0;
				} else {
					//lookup previous dict. line 
					this.findNeighbour(-1);
				}
			}
			if (button === "right") {
				if (threeButton) {
					xCol = 2;
				} else {
					//lookup next dict. line 
					this.findNeighbour(1);
				}
			}
	
			if (button === "up") {
				this.doNewScroll(-1);
			}
	
			if (button === "down") {
				this.doNewScroll(1);
			}
	
			this.lineCursor.changeLayout(457 + xCol * 48, undefined, undefined, 627, undefined, undefined);
		};
		target.doHold1 = function () {
			holdDigit(1);
		};
		target.doHold2 = function () {
			holdDigit(2);
		};
		target.doHold3 = function () {
			holdDigit(3);
		};
		target.doHold4 = function () {
			holdDigit(4);
		};
		target.doHold5 = function () {
			holdDigit(5);
		};
		target.doHold6 = function () {
			holdDigit(6);
		};
		target.doHold7 = function () {
			holdDigit(7);
		};
		target.doHold8 = function () {
			holdDigit(8);
		};
		target.doHold9 = function () {
			holdDigit(9);
		};
		target.doHold0 = function () {
			holdDigit(0);
		};
	
		holdDigit = function (digit) {
			var button, o, prop, oprop; 
			if (!sonderZeichen) {
				button = keyMap[digit][xCol];
				if (isSelectChar(button) !== 255) {
					sonderZeichen = true;
					setPopupChar(button, target.PopUp);
					o = target.PopUp;
					for (prop in o) {
						try {
							oprop = o[prop];
							oprop.show(getSoValue(oprop, "text") !== "");
						} catch (ignore) {}
					}
					target.PopUp.show(true);
				} else {
					target.inputLine.setValue(target.inputLine.getValue() + button);
				}
			}
		};
	
		//select a letter/function w/ function keys (key: 0..9) 
		target.pressDigit = function (digit) {
			var button, processed, input, id;
			try {
				if (!sonderZeichen) {
					button = keyMap[digit][xCol];
					processed = false; //has the key been processed? ('catch all letters') 
	
					if (button === '') {
						return;
					}
	
					if (button === 'BS') {
						//backspace 
						input = this.inputLine.getValue();
						this.inputLine.setValue(input.slice(0, input.length - 1));
						processed = true;
					}
	
					if (button === 'CLR') {
						//clear all text from inputLine 
						processed = true;
						this.clearInput();
						this.clearLines();
					}
	
					if (!processed) {
						//letter 
						this.inputLine.setValue(this.inputLine.getValue() + button);
					}
				} else {
					sonderZeichen = false;
					this.PopUp.show(false);
					id = "key" + digit;
					button = getSoValue(this.PopUp[id], "text");
					this.inputLine.setValue(this.inputLine.getValue() + button);
				}
			} catch (e) {
				bootLog("Error in pressDigit: " + e);
			}
		};
	
	
		target.searchTerm = function (term) {
			var scriptLine, res, colonIdx, termIdx, definition, error;
			this.showHourGlass(true);
			//I cannot access memory card from the shell (for the moment), so I have to have dictionary copied to internal memory 
			scriptLine = "/bin/grep -n -i '^" + term + "' " + dictPath + " | head -n 1";
			if (!simEnviro) {
				res = runCommandResult(scriptLine);
			} else {
				res = "1: set  množina	stanovit	určit	určovat	ustanovit	set/set/set	skupina	usadit	přístroj	řada	přijímač	parta	kolekce	napravit	nařídit	sada	sbírka	souprava	umístit	komplex	položit	set	soubor	jemná omítka	komplet	nastavit	nastavovat	soustava	stanovení	stanovený	umístil	umístěn	upevnit	ustavit	zafixovat	zařídit	ztuhnout	ztvrdnout";
			}
			this.showHourGlass(false);
			if (res !== '') {
				try {
					//get leading line number (separated by colon) 
					colonIdx = res.indexOf(':');
					lineNo = Number(res.slice(0, colonIdx));
	
					//get term (separated by two spaces) 
					termIdx = res.search('  ');
					term = res.slice(colonIdx + 1, termIdx);
					this.inputLine.setValue(term);
	
					//get defintion 
					definition = res.slice(termIdx + 2, res.length - 1);
					this.txtFormat(definition);
					//TODO: store original searched term 
				} catch (e) {
					error = "Error searching for term: " + term + ": " + e;
					this.statusLine.setValue(error);
				}
			} else {
				this.statusLine.setValue('Word not found.\nPlease try again.');
			}
		};
	
		//perform a search or load a new dictionary: 
		target.centerKey = function () {
			var input = this.inputLine.getValue();
	
			if (input === '') {
				this.clearLines();
				this.statusLine.setValue('Please type some text before pressing Enter.');
				return;
			}
			this.clearStatus();
			this.searchTerm(this.inputLine.getValue());
		};
	
		//previous/next line. offset = distance from original line 
		target.findNeighbour = function (offset) {
			var newLineNo, scriptLine, res, termIdx, term, definition;
			newLineNo = lineNo + offset;
	
			scriptLine = "/bin/sed -n '" + newLineNo + "p' " + dictPath;
			if (!simEnviro) {
				res = runCommandResult(scriptLine);
			} else {
				res = "set a stage for  připravit podmínky pro	připravit půdu pro";
			}
			if (res === '') {
				//before first or after last line 
				this.statusLine.setValue('No line found - end of dictionary?');
				return;
			}
	
			lineNo = newLineNo;
			//get term (separated by two spaces) 
			termIdx = res.search('  ');
			term = res.slice(0, termIdx);
			this.inputLine.setValue(term);
			//get defintion 
			definition = res.slice(termIdx + 2, res.length - 1);
			this.txtFormat(definition);
		}; /* next two functions copy 'n past from 650th kbook.so */
		isSelectChar = function (key) {
			var nRet, i;
			var selChar = ['A', 'a', 'C', 'c', 'D', 'd', 'E', 'e', 'I', 'i', 'N', 'n', 'O', 'o', 'S', 's', 'U', 'u', 'Y', 'y', 'Z', 'z', '!', '?', ''];
			nRet = 255;
			i = 0;
			while (selChar[i] !== '') {
				if (key === selChar[i]) {
					nRet = i;
					break;
				} else {
					i++;
				}
			}
			return nRet;
		};
	
		setPopupChar = function (text, popup) {
			var selCharGroup = [
				['A', '192', '193', '194', '195', '196', '197', '198', 8],
				['a', '224', '225', '226', '227', '228', '229', '230', 8],
				['C', '199', '0', '0', '0', '0', '0', '0', 2],
				['c', '231', '0', '0', '0', '0', '0', '0', 2],
				['D', '208', '0', '0', '0', '0', '0', '0', 2],
				['d', '240', '0', '0', '0', '0', '0', '0', 2],
				['E', '200', '201', '202', '203', '0', '0', '0', 5],
				['e', '232', '233', '234', '235', '0', '0', '0', 5],
				['I', '204', '205', '206', '207', '0', '0', '0', 5],
				['i', '236', '237', '238', '239', '0', '0', '0', 5],
				['N', '209', '0', '0', '0', '0', '0', '0', 2],
				['n', '241', '0', '0', '0', '0', '0', '0', 2],
				['O', '210', '211', '212', '213', '214', '216', '338', 8],
				['o', '242', '243', '244', '245', '246', '248', '339', 8],
				['S', '352', '0', '0', '0', '0', '0', '0', 2],
				['s', '353', '223', '0', '0', '0', '0', '0', 3],
				['U', '217', '218', '219', '220', '0', '0', '0', 5],
				['u', '249', '250', '251', '252', '0', '0', '0', 5],
				['Y', '221', '376', '0', '0', '0', '0', '0', 3],
				['y', '253', '255', '0', '0', '0', '0', '0', 3],
				['Z', '381', '0', '0', '0', '0', '0', '0', 2],
				['z', '382', '0', '0', '0', '0', '0', '0', 2],
				['!', '161', '0', '0', '0', '0', '0', '0', 2],
				['?', '191', '0', '0', '0', '0', '0', '0', 2],
				['', 0, '0', '0', '0', '0', '0', '0', 0]
			];
			var i;
			i = 0;
			while (selCharGroup[i][0] !== '') {
				if (selCharGroup[i][0] === text) {
					// target.bubble('tracelog',_Core.debug.dumpToString(popup,'popup.',3));
					popup.key1.setText(selCharGroup[i][0]);
					popup.key2.setText(String.fromCharCode(selCharGroup[i][1]));
					popup.key3.setText(String.fromCharCode(selCharGroup[i][2]));
					popup.key4.setText(String.fromCharCode(selCharGroup[i][3]));
					popup.key5.setText(String.fromCharCode(selCharGroup[i][4]));
					popup.key6.setText(String.fromCharCode(selCharGroup[i][5]));
					popup.key7.setText(String.fromCharCode(selCharGroup[i][6]));
					popup.key8.setText(String.fromCharCode(selCharGroup[i][7]));
					// popup.key9.setText("");  
					break;
				} else {
					i++;
				}
			}
			//	target.bubble('tracelog','exit selCharGroup i='+i);
			return selCharGroup[i][8];
		};
	
	} catch (e) {
		bootLog("exception in dictionary.js " + e);
	}
};
tmp();
tmp = undefined;
