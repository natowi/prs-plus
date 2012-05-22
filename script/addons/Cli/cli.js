//
// CLI for Sony Reader
// by Ben Chenoweth
//
// Initial version: 2012-01-29
// Changelog:
//	2012-02-17 Ben Chenoweth - Added UP/DOWN (scroll window) and PREVIOUS (commands) buttons
//	2012-03-05 Ben Chenoweth - Scrollbar added; handle first command without scrolling
//	2012-04-03 Ben Chenoweth - Handle 'cd' (current directory) command
//	2012-04-04 Ben Chenoweth - Handle OS error codes; minor fix for 'cd ..' if returning to root
//	2012-04-05 Ben Chenoweth - Replace tabs with spaces in output
//	2012-05-22 Ben Chenoweth - Removed unused variables; changed globals to locals

var tmp = function () {
	
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons,
	getSoValue = kbook.autoRunRoot.getSoValue,
	setSoValue = kbook.autoRunRoot.setSoValue,
	getFileContent = kbook.autoRunRoot.getFileContent,
	deleteFile = kbook.autoRunRoot.deleteFile,
	shellExec = kbook.autoRunRoot.shellExec,
	
	CLIOUTPUT = "/tmp/cli.out",

	mouseLeave = getSoValue(target.btn_Ok, 'mouseLeave'),
	mouseEnter = getSoValue(target.btn_Ok, 'mouseEnter'),
	shifted = false,
	shiftOffset = 26,
	symbols = false,
	symbolsOffset = 52,
	keys = [],
	strShift = "\u2191", //up arrow
	strUnShift = "\u2193", //down arrow
	strBack = "\u2190", //left arrow
	custSel,
	prevSel,
	
	tempOutput = "",
	pageScroll,
	previousCommands = [],
	previousCommandNum = 0,
	firstTime = true,
	currentDir = "/",
	previousDir,
	
	twoDigits = function (i) {
		if (i<10) {return "0"+i}
		return i;	
	};

	target.loadKeyboard = function () {
		keys[0]="q";
		keys[1]="w";
		keys[2]="e";
		keys[3]="r";
		keys[4]="t";
		keys[5]="y";
		keys[6]="u";
		keys[7]="i";
		keys[8]="o";
		keys[9]="p";
		keys[10]="a";
		keys[11]="s";
		keys[12]="d";
		keys[13]="f";
		keys[14]="g";
		keys[15]="h";
		keys[16]="j";
		keys[17]="k";
		keys[18]="l";
		keys[19]="z";
		keys[20]="x";
		keys[21]="c";
		keys[22]="v";
		keys[23]="b";
		keys[24]="n";
		keys[25]="m";
		keys[26]="Q";
		keys[27]="W";
		keys[28]="E";
		keys[29]="R";
		keys[30]="T";
		keys[31]="Y";
		keys[32]="U";
		keys[33]="I";
		keys[34]="O";
		keys[35]="P";
		keys[36]="A";
		keys[37]="S";
		keys[38]="D";
		keys[39]="F";
		keys[40]="G";
		keys[41]="H";
		keys[42]="J";
		keys[43]="K";
		keys[44]="L";
		keys[45]="Z";
		keys[46]="X";
		keys[47]="C";
		keys[48]="V";
		keys[49]="B";
		keys[50]="N";
		keys[51]="M";
		keys[52]="1";
		keys[53]="2";
		keys[54]="3";
		keys[55]="4";
		keys[56]="5";
		keys[57]="6";
		keys[58]="7";
		keys[59]="8";
		keys[60]="9";
		keys[61]="0";
		keys[62]="%";
		keys[63]="&";
		keys[64]="*";
		keys[65]="(";
		keys[66]=")";
		keys[67]="_";
		keys[68]="+";
		keys[69]=";";
		keys[70]=":";
		keys[71]="!";
		keys[72]="?";
		keys[73]="\"";
		keys[74]="\'";
		keys[75]=",";
		keys[76]=".";
		keys[77]="/";
		keys[78]="~";
		keys[79]="@";
		keys[80]="#";
		keys[81]="$";
		keys[82]="^";
		keys[83]="-";
		keys[84]="`";
		keys[85]="=";
		keys[86]="{";
		keys[87]="}";
		keys[88]="\u00AC";
		keys[89]="\u00A3";
		keys[90]="\u20AC";
		keys[91]="\u00A7";
		keys[92]="\u00A6";
		keys[93]="[";
		keys[94]="]";
		keys[95]="|";
		keys[96]="\\";
		keys[97]="\u00B2";
		keys[98]="\u00B0";
		keys[99]="\u00B5";
		keys[100]="\u00AB";
		keys[101]="\u00BB";
		keys[102]="<";
		keys[103]=">";

		// put keys on buttons
		for (var i=1; i<=26; i++) {
			setSoValue(target['key'+twoDigits(i)], 'text', keys[i-1]);
		}
	
		//simplify some labels
		setSoValue(target.BACK, 'text', strBack);
		setSoValue(target.SHIFT, 'text', strShift);
		setSoValue(target.SPACE, 'text', "");
		
		// highlight OK button for nonTouch
		if (hasNumericButtons) {
			custSel = 5;
			target.ntHandleEventsDlg();
		}
		return;
	};
	
	target.init = function () {
		//target.bubble("tracelog","initialising...");
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
		try {
			pageScroll = getSoValue(this.cliText, 'scrollPage');
		} catch (ignore) { }
		this.enable(true);
		this.loadKeyboard();
		tempOutput = "/> ";
		this.cliText.setValue(tempOutput);
		if (hasNumericButtons) {
			this.touchLabel0.show(false);
			this.touchLabel1.show(false);
		} else {
			this.nonTouch0.show(false);
			this.nonTouch1.show(false);
		}
		previousCommands.push(""); // start previous commands list with a blank entry
	};

	target.setOutput = function (output) {
		this.cliText.setValue(output);
		if (firstTime) {
			firstTime = false;
		} else {
			try {
				pageScroll.call(this.cliText, true, 1);
			}
			catch (ignore) { }
		}
	};
	
	target.doOK = function () {
		var cmd, result, len, changeDir, exitError, exitCode;
		// get currentLine
		cmd = target.getVariable("current_line");
		if (cmd === "exit") target.doQuit();
		
		// add command to previousCommands array
		if (cmd !== "") {
			previousCommands.push(cmd);
		}
		previousCommandNum = 0;
		previousDir = currentDir;
		
		// handle 'cd' command
		if (cmd === "cd /") {
			// move to root directory
			currentDir = "/";
			tempOutput = tempOutput + cmd + "\n" + currentDir + "> ";
			this.setOutput(tempOutput);
		} else if (cmd === "cd ..") {
			// move to parent directory
			currentDir = currentDir.substring(0, currentDir.lastIndexOf("/"));
			if (currentDir === "") {
				currentDir = "/";
			}
			tempOutput = tempOutput + cmd + "\n" + currentDir + "> ";
			this.setOutput(tempOutput);
		} else if (cmd === "cd .") {
			// stay in current directory
			tempOutput = tempOutput + cmd + "\n" + currentDir + "> ";
			this.setOutput(tempOutput);
		} else {
			len = cmd.length;
			if ((len > 4) && (cmd.substring(0,4) === "cd /")) {
				// move to directory defined from root directory
				currentDir = cmd.substring(3);
				changeDir = true;
			} else if ((len > 3) && (cmd.substring(0,3) === "cd ")) {
				// move to subdirectory
				if (currentDir === "/") {
					currentDir = "/" + cmd.substring(3);
				} else {
					currentDir = currentDir + "/" + cmd.substring(3);
				}
				changeDir = true;
			} else {
				changeDir = false;
			}
			
			try {
				if (changeDir) {
					// execute cmd
					shellExec("cd " + currentDir + " > " + CLIOUTPUT);
				} else {
					// move to current directory and then execute cmd
					shellExec("cd " + currentDir + ";" + cmd + " > " + CLIOUTPUT);
				}
				
				// get output
				result = getFileContent(CLIOUTPUT, "222");
				if (result !== "222") {
					// output
					result = result.replace(/\t/g,"    "); // replace tabs with spaces
					tempOutput = tempOutput + cmd + "\n" + result + "\n" + currentDir + "> ";
					this.setOutput(tempOutput);
				} else {
					// no output file!
					tempOutput = tempOutput + cmd + "\nError\n" + currentDir + "> ";
					this.setOutput(tempOutput);
				}
			} catch(e) {
				currentDir = previousDir;
				exitError = e.indexOf("exit code: ");
				if (exitError>0) {
					exitCode = e.substring(exitError + 11);
					switch(exitCode) {
						case "1":
							e = "Operation not permitted";
							break;
						case "2":
							e = "No such file or directory";
							break;
						case "3":
							e = "No such process";
							break;
						case "4":
							e = "Interrupted system call";
							break;
						case "5":
							e = "Input/output error";
							break;
						case "6":
							e = "No such device or address";
							break;
						case "7":
							e = "Argument list too long";
							break;
						case "8":
							e = "Exec format error";
							break;
						case "9":
							e = "Bad file number";
							break;
						case "10":
							e = "No child processes";
							break;
						case "11":
							e = "Resource temporarily unavailable";
							break;
						case "12":
							e = "Out of memory";
							break;
						case "13":
							e = "Permission denied";
							break;
						case "14":
							e = "Bad address";
							break;
						case "15":
							e = "Block device required";
							break;
						case "16":
							e = "Device or resource busy";
							break;
						case "17":
							e = "File exists";
							break;
						case "18":
							e = "Invalid cross-device link";
							break;
						case "19":
							e = "No such device";
							break;
						case "20":
							e = "Not a directory";
							break;
						case "21":
							e = "Is a directory";
							break;
						case "22":
							e = "Invalid argument";
							break;
						case "23":
							e = "Too many open files in system";
							break;
						case "24":
							e = "Too many open files";
							break;
						case "25":
							e = "Inappropriate ioctl for device";
							break;
						case "26":
							e = "Text file busy";
							break;
						case "27":
							e = "File too large";
							break;
						case "28":
							e = "No space left on device";
							break;
						case "29":
							e = "Illegal seek";
							break;
						case "30":
							e = "Read-only file system";
							break;
						case "31":
							e = "Too many links";
							break;
						case "32":
							e = "Broken pipe";
							break;
						case "33":
							e = "Numerical argument out of domain";
							break;
						case "34":
							e = "Numerical result out of range";
							break;
						case "35":
							e = "Resource deadlock avoided";
							break;
						case "36":
							e = "File name too long";
							break;
						case "37":
							e = "No record locks available";
							break;
						case "38":
							e = "Function not implemented";
							break;
						case "39":
							e = "Directory not empty";
							break;
						case "40":
							e = "Too many symbolic links encountered";
							break;
						case "42":
							e = "No message of desired type";
							break;
						case "43":
							e = "Identifier removed";
							break;
						case "44":
							e = "Channel number out of range";
							break;
						case "45":
							e = "Level 2 not synchronized";
							break;
						case "46":
							e = "Level 3 halted";
							break;
						case "47":
							e = "Level 3 reset";
							break;
						case "48":
							e = "Link number out of range";
							break;
						case "49":
							e = "Protocol driver not attached";
							break;
						case "50":
							e = "No CSI structure available";
							break;
						case "51":
							e = "Level 2 halted";
							break;
						case "52":
							e = "Invalid exchange";
							break;
						case "53":
							e = "Invalid request descriptor";
							break;
						case "54":
							e = "Exchange full";
							break;
						case "55":
							e = "No anode";
							break;
						case "56":
							e = "Invalid request code";
							break;
						case "57":
							e = "Invalid slot";
							break;
						case "59":
							e = "Bad font file format";
							break;
						case "60":
							e = "Device not a stream";
							break;
						case "61":
							e = "No data available";
							break;
						case "62":
							e = "Timer expired";
							break;
						case "63":
							e = "Out of streams resources";
							break;
						case "64":
							e = "Machine is not on the network";
							break;
						case "65":
							e = "Package not installed";
							break;
						case "66":
							e = "Object is remote";
							break;
						case "67":
							e = "Link has been severed";
							break;
						case "68":
							e = "Advertise error";
							break;
						case "69":
							e = "Srmount error";
							break;
						case "70":
							e = "Communication error on send";
							break;
						case "71":
							e = "Protocol error";
							break;
						case "72":
							e = "Multihop attempted";
							break;
						case "73":
							e = "RFS specific error";
							break;
						case "74":
							e = "Not a data message";
							break;
						case "75":
							e = "Value too large for defined data type";
							break;
						case "76":
							e = "Name not unique on network";
							break;
						case "77":
							e = "File descriptor in bad state";
							break;
						case "78":
							e = "Remote address changed";
							break;
						case "79":
							e = "Can not access a needed shared library";
							break;
						case "80":
							e = "Accessing a corrupted shared library";
							break;
						case "81":
							e = ".lib section in a.out corrupted";
							break;
						case "82":
							e = "Attempting to link in too many shared libraries";
							break;
						case "83":
							e = "Cannot exec a shared library directly";
							break;
						case "84":
							e = "Illegal byte sequence";
							break;
						case "85":
							e = "Interrupted system call should be restarted";
							break;
						case "86":
							e = "Streams pipe error";
							break;
						case "87":
							e = "Too many users";
							break;
						case "88":
							e = "Socket operation on non-socket";
							break;
						case "89":
							e = "Destination address required";
							break;
						case "90":
							e = "Message too long";
							break;
						case "91":
							e = "Protocol wrong type for socket";
							break;
						case "92":
							e = "Protocol not available";
							break;
						case "93":
							e = "Protocol not supported";
							break;
						case "94":
							e = "Socket type not supported";
							break;
						case "95":
							e = "Operation not supported";
							break;
						case "96":
							e = "Protocol family not supported";
							break;
						case "97":
							e = "Address family not supported by protocol";
							break;
						case "98":
							e = "Address already in use";
							break;
						case "99":
							e = "Cannot assign requested address";
							break;
						case "100":
							e = "Network is down";
							break;
						case "101":
							e = "Network is unreachable";
							break;
						case "102":
							e = "Network dropped connection on reset";
							break;
						case "103":
							e = "Software caused connection abort";
							break;
						case "104":
							e = "Connection reset by peer";
							break;
						case "105":
							e = "No buffer space available";
							break;
						case "106":
							e = "Transport endpoint is already connected";
							break;
						case "107":
							e = "Transport endpoint is not connected";
							break;
						case "108":
							e = "Cannot send after transport endpoint shutdown";
							break;
						case "109":
							e = "Too many references: cannot splice";
							break;
						case "110":
							e = "Connection timed out";
							break;
						case "111":
							e = "Connection refused";
							break;
						case "112":
							e = "Host is down";
							break;
						case "113":
							e = "No route to host";
							break;
						case "114":
							e = "Operation already in progress";
							break;
						case "115":
							e = "Operation now in progress";
							break;
						case "116":
							e = "Stale NFS file handle";
							break;
						case "117":
							e = "Structure needs cleaning";
							break;
						case "118":
							e = "Not a XENIX named type file";
							break;
						case "119":
							e = "No XENIX semaphores available";
							break;
						case "120":
							e = "Is a named type file";
							break;
						case "121":
							e = "Remote I/O error";
							break;
						case "122":
							e = "Disk quota exceeded";
							break;
						case "123":
							e = "No medium found";
							break;
						case "124":
							e = "Wrong medium type";
							break;
						case "126":
							e = "Command cannot execute";
							break;
						case "127":
							e = "Command not found";
							break;
						case "139":
							e = "Segmentation fault";
							break;
						default:
					}
				}
				tempOutput = tempOutput + cmd + "\nError: " + e + "\n" + currentDir + "> ";
				this.setOutput(tempOutput);
			}
		}
			
		// clear currentLine
		cmd = "";
		target.currentText.setValue(cmd);
		target.setVariable("current_line",cmd);		
		return;
	};
		
	target.doQuit = function () {
		deleteFile(CLIOUTPUT);
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};
	
	target.doRoot = function () {
		this.doQuit();
		return;
	};
	
	target.doHold0 = function () {
		this.doQuit();
		return;
	};
	
	target.doButtonClick = function (sender) {
		var id, n, numCommands, currentLine;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);	
		if (n == "PRE") {
			// copy previous command into command box
			numCommands = previousCommands.length;
			if (numCommands !== 0) {
				if (previousCommandNum <= 1) {
					previousCommandNum = numCommands;
				} else {
					previousCommandNum--;
				}
				// replace currentLine with previous command
				currentLine = previousCommands[previousCommandNum-1];
				target.currentText.setValue(currentLine);
				target.setVariable("current_line",currentLine);
			}
			return;
		}		
	};

	target.doPrevious = function () {
		// scroll cliText textbox up
		try {
			pageScroll.call(this.cliText, true, -1);
		}
		catch (ignore) { }
		return;
	};

	target.doNext = function () {
		// scroll cliText textbox down
		try {
			pageScroll.call(this.cliText, true, 1);
		}
		catch (ignore) { }
		return;
	};

	target.doMark = function () {
		return;
	};
		
	target.doSize = function () {
		return;
	};
	
	target.doOption = function () {
		return;
	};
	
	target.doMenu = function () {
		return;
	};
	
	target.refreshKeys = function () {
		var i,n,key;
		n = -1;
		if (shifted) {
			n = n + shiftOffset;
			setSoValue(target.SHIFT, 'text', strUnShift);
			mouseEnter.call(target.SHIFT);
			mouseLeave.call(target.SHIFT);
		} else {
			setSoValue(target.SHIFT, 'text', strShift);
			mouseEnter.call(target.SHIFT);
			mouseLeave.call(target.SHIFT);
		}
		if (symbols) {
			n = n + symbolsOffset;
			setSoValue(target.SYMBOL, 'text', "Abc");
			mouseEnter.call(target.SYMBOL);
			mouseLeave.call(target.SYMBOL);
		} else {
			setSoValue(target.SYMBOL, 'text', "Symbols");
			mouseEnter.call(target.SYMBOL);
			mouseLeave.call(target.SYMBOL);
		}
		for (i=1; i<=26; i++) {
			key = 'key'+twoDigits(i);
			setSoValue(target[key], 'text', keys[n+i]);
			mouseEnter.call(target[key]);
			mouseLeave.call(target[key]);
		}
		if (hasNumericButtons) {
			// highlight active key
			this.ntHandleEventsDlg;
		}
	};

	target.doSpace = function () {
		// ADD A SPACE
		var currentLine = target.getVariable("current_line");
		currentLine = currentLine + " ";
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);
	};

	target.doSymbol = function () {
		symbols = !symbols;
		this.refreshKeys();
	};

	target.doShift = function () {
		shifted = !shifted;
		this.refreshKeys();
	};
	
	target.doBack = function () {
		// BACKSPACE
		var currentLine = target.getVariable("current_line");
		currentLine = currentLine.slice(0,currentLine.length-1);
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);
	};
	
	target.doKeyPress = function (sender) {
		var id = getSoValue(sender, "id");
		this.addCharacter(id);
		return;
	};
	
	target.addCharacter = function (id) {
		var n = parseInt(id.substring(3, 5));
		if (symbols) { n = n + symbolsOffset };
		if (shifted) { n = n + shiftOffset };
		var character = keys[n-1];
		var currentLine = target.getVariable("current_line");
		currentLine = currentLine + character;
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);		
	};

	target.ntHandleEventsDlg = function () {
		if (custSel === 5) {
			mouseEnter.call(target.btn_Ok);
			mouseLeave.call(target.BUTTON_PRE);
			mouseLeave.call(target.key01);
			mouseLeave.call(target.key02);
			mouseLeave.call(target.key03);
			mouseLeave.call(target.key04);
			mouseLeave.call(target.key05);
			mouseLeave.call(target.key06);
			mouseLeave.call(target.key07);
			mouseLeave.call(target.key08);
			mouseLeave.call(target.key09);
			mouseLeave.call(target.key10);
		}
		if (custSel === 6) {
			mouseLeave.call(target.btn_Ok);
			mouseEnter.call(target.BUTTON_PRE);
			mouseLeave.call(target.key10);
		}
		if (custSel == 7) {
			mouseEnter.call(target.key01);
			mouseLeave.call(target.key02);
			mouseLeave.call(target.key11);
		}
		if (custSel == 8) {
			mouseLeave.call(target.key01);
			mouseEnter.call(target.key02);
			mouseLeave.call(target.key03);
			mouseLeave.call(target.key12);
		}
		if (custSel == 9) {
			mouseLeave.call(target.key02);
			mouseEnter.call(target.key03);
			mouseLeave.call(target.key04);
			mouseLeave.call(target.key13);
		}
		if (custSel == 10) {
			mouseLeave.call(target.key03);
			mouseEnter.call(target.key04);
			mouseLeave.call(target.key05);
			mouseLeave.call(target.key14);
		}
		if (custSel == 11) {
			mouseLeave.call(target.key04);
			mouseEnter.call(target.key05);
			mouseLeave.call(target.key06);
			mouseLeave.call(target.key15);
		}
		if (custSel == 12) {
			mouseLeave.call(target.key05);
			mouseEnter.call(target.key06);
			mouseLeave.call(target.key07);
			mouseLeave.call(target.key16);
		}
		if (custSel == 13) {
			mouseLeave.call(target.key06);
			mouseEnter.call(target.key07);
			mouseLeave.call(target.key08);
			mouseLeave.call(target.key17);
		}
		if (custSel == 14) {
			mouseLeave.call(target.key07);
			mouseEnter.call(target.key08);
			mouseLeave.call(target.key09);
			mouseLeave.call(target.key18);
		}
		if (custSel == 15) {
			mouseLeave.call(target.key08);
			mouseEnter.call(target.key09);
			mouseLeave.call(target.key10);
			mouseLeave.call(target.key19);
		}
		if (custSel == 16) {
			mouseLeave.call(target.key09);
			mouseEnter.call(target.key10);
			mouseLeave.call(target.btn_Ok);
			mouseLeave.call(target.BUTTON_PRE);
		}
		if (custSel == 17) {
			mouseLeave.call(target.key01);
			mouseEnter.call(target.key11);
			mouseLeave.call(target.key12);
			mouseLeave.call(target.SHIFT);
		}
		if (custSel == 18) {
			mouseLeave.call(target.key02);
			mouseLeave.call(target.key11);
			mouseEnter.call(target.key12);
			mouseLeave.call(target.key13);
			mouseLeave.call(target.key20);
		}
		if (custSel == 19) {
			mouseLeave.call(target.key03);
			mouseLeave.call(target.key12);
			mouseEnter.call(target.key13);
			mouseLeave.call(target.key14);
			mouseLeave.call(target.key21);
		}
		if (custSel == 20) {
			mouseLeave.call(target.key04);
			mouseLeave.call(target.key13);
			mouseEnter.call(target.key14);
			mouseLeave.call(target.key15);
			mouseLeave.call(target.key22);
		}
		if (custSel == 21) {
			mouseLeave.call(target.key05);
			mouseLeave.call(target.key14);
			mouseEnter.call(target.key15);
			mouseLeave.call(target.key16);
			mouseLeave.call(target.key23);
		}
		if (custSel == 22) {
			mouseLeave.call(target.key06);
			mouseLeave.call(target.key15);
			mouseEnter.call(target.key16);
			mouseLeave.call(target.key17);
			mouseLeave.call(target.key24);
		}
		if (custSel == 23) {
			mouseLeave.call(target.key07);
			mouseLeave.call(target.key16);
			mouseEnter.call(target.key17);
			mouseLeave.call(target.key18);
			mouseLeave.call(target.key25);
		}
		if (custSel == 24) {
			mouseLeave.call(target.key08);
			mouseLeave.call(target.key17);
			mouseEnter.call(target.key18);
			mouseLeave.call(target.key19);
			mouseLeave.call(target.key26);
		}
		if (custSel == 25) {
			mouseLeave.call(target.key09);
			mouseLeave.call(target.key10);
			mouseLeave.call(target.key18);
			mouseEnter.call(target.key19);
		}
		if (custSel == 26) {
			mouseLeave.call(target.key11);
			mouseLeave.call(target.key20);
			mouseEnter.call(target.SHIFT);
			mouseLeave.call(target.SYMBOL);
		}
		if (custSel == 27) {
			mouseLeave.call(target.key12);
			mouseLeave.call(target.SHIFT);
			mouseEnter.call(target.key20);
			mouseLeave.call(target.key21);
			mouseLeave.call(target.SYMBOL);
		}
		if (custSel == 28) {
			mouseLeave.call(target.key13);
			mouseLeave.call(target.key20);
			mouseEnter.call(target.key21);
			mouseLeave.call(target.key22);
			mouseLeave.call(target.SPACE);
		}
		if (custSel == 29) {
			mouseLeave.call(target.key14);
			mouseLeave.call(target.key21);
			mouseEnter.call(target.key22);
			mouseLeave.call(target.key23);
			mouseLeave.call(target.SPACE);
		}
		if (custSel == 30) {
			mouseLeave.call(target.key15);
			mouseLeave.call(target.key22);
			mouseEnter.call(target.key23);
			mouseLeave.call(target.key24);
			mouseLeave.call(target.SPACE);
		}
		if (custSel == 31) {
			mouseLeave.call(target.key16);
			mouseLeave.call(target.key23);
			mouseEnter.call(target.key24);
			mouseLeave.call(target.key25);
			mouseLeave.call(target.SPACE);
		}
		if (custSel == 32) {
			mouseLeave.call(target.key17);
			mouseLeave.call(target.key24);
			mouseEnter.call(target.key25);
			mouseLeave.call(target.key26);
			mouseLeave.call(target.SPACE);
		}
		if (custSel == 33) {
			mouseLeave.call(target.key18);
			mouseLeave.call(target.key19);
			mouseLeave.call(target.key25);
			mouseEnter.call(target.key26);
			mouseLeave.call(target.BACK);
		}
		if (custSel == 34) {
			mouseLeave.call(target.SHIFT);
			mouseLeave.call(target.key20);
			mouseLeave.call(target.SPACE);
			mouseEnter.call(target.SYMBOL);
		}
		if (custSel == 35) {
			mouseLeave.call(target.key21);
			mouseLeave.call(target.key22);
			mouseLeave.call(target.key23);
			mouseLeave.call(target.key24);
			mouseLeave.call(target.key25);
			mouseEnter.call(target.SPACE);
			mouseLeave.call(target.SYMBOL);
			mouseLeave.call(target.BACK);
			mouseLeave.call(target.btn_Ok);
		}	
		if (custSel == 36) {
			mouseLeave.call(target.key26);
			mouseLeave.call(target.SPACE);
			mouseEnter.call(target.BACK);
		}
		return;
	};

	target.moveCursor = function (direction) {
		switch (direction) {
			case "up" : {
				if (custSel===6) {
					prevSel=custSel;
					custSel=5;
					target.ntHandleEventsDlg();
				} else if ((custSel>6) && (custSel<17)) {
					prevSel=custSel;
					custSel=5;
					target.ntHandleEventsDlg();
				} else if ((custSel>16) && (custSel<26)) {
					prevSel=custSel;
					custSel=custSel-10;
					target.ntHandleEventsDlg();
				} else if (custSel==26) {
					prevSel=custSel;
					custSel=17;
					target.ntHandleEventsDlg();				
				} else if ((custSel>26) && (custSel<34)) {
					prevSel=custSel;
					custSel=custSel-9;
					target.ntHandleEventsDlg();
				} else if (custSel==34) {
					prevSel=custSel;
					custSel=26;
					target.ntHandleEventsDlg();				
				} else if (custSel==35) {
					prevSel=custSel;
					custSel=30;
					target.ntHandleEventsDlg();				
				} else if (custSel==36) {
					prevSel=custSel;
					custSel=33;
					target.ntHandleEventsDlg();				
				}
				break
			}
			case "down" : {
				if (custSel===5) {
					prevSel=custSel;
					custSel=6;
					target.ntHandleEventsDlg();
				} else if ((custSel>6) && (custSel<16)) {
					prevSel=custSel;
					custSel=custSel+10;
					target.ntHandleEventsDlg();
				} else if (custSel===16) {
					prevSel=custSel;
					custSel=25;
					target.ntHandleEventsDlg();
				} else if ((custSel>16) && (custSel<24)) {
					prevSel=custSel;
					custSel=custSel+9;
					target.ntHandleEventsDlg();			
				} else if ((custSel===24) || (custSel===25)) {
					prevSel=custSel;
					custSel=33;
					target.ntHandleEventsDlg();			
				} else if ((custSel===26) || (custSel===27)) {
					prevSel=custSel;
					custSel=34;
					target.ntHandleEventsDlg();			
				} else if ((custSel>27) && (custSel<33)) {
					prevSel=custSel;
					custSel=35;
					target.ntHandleEventsDlg();			
				} else if (custSel===33) {
					prevSel=custSel;
					custSel=36;
					target.ntHandleEventsDlg();			
				}
				break
			}
			case "left" : {
				if (custSel===6) {
					prevSel=custSel;
					custSel=16;
					target.ntHandleEventsDlg();	
				} else if ((custSel>7) && (custSel<17)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if ((custSel>17) && (custSel<26)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if ((custSel>26) && (custSel<34)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if ((custSel===35) || (custSel===36)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				}
				break
			}		
			case "right" : {
				if (custSel===16) {
					prevSel=custSel;
					custSel=6;
					target.ntHandleEventsDlg();	
				} else if ((custSel>6) && (custSel<16)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if ((custSel>16) && (custSel<25)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if ((custSel>25) && (custSel<33)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if ((custSel===34) || (custSel===35)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				}
				break
			}
			return;
		}
	};
	
	target.doCenterF = function () {
		if (custSel === 5) target.btn_Ok.click();
		if (custSel === 6) target.BUTTON_PRE.click();
		if (custSel === 7) target.key01.click();
		if (custSel === 8) target.key02.click();
		if (custSel === 9) target.key03.click();
		if (custSel === 10) target.key04.click();
		if (custSel === 11) target.key05.click();
		if (custSel === 12) target.key06.click();
		if (custSel === 13) target.key07.click();
		if (custSel === 14) target.key08.click();
		if (custSel === 15) target.key09.click();
		if (custSel === 16) target.key10.click();
		if (custSel === 17) target.key11.click();
		if (custSel === 18) target.key12.click();
		if (custSel === 19) target.key13.click();
		if (custSel === 20) target.key14.click();
		if (custSel === 21) target.key15.click();
		if (custSel === 22) target.key16.click();
		if (custSel === 23) target.key17.click();
		if (custSel === 24) target.key18.click();
		if (custSel === 25) target.key19.click();
		if (custSel === 26) target.SHIFT.click();
		if (custSel === 27) target.key20.click();
		if (custSel === 28) target.key21.click();
		if (custSel === 29) target.key22.click();
		if (custSel === 30) target.key23.click();
		if (custSel === 31) target.key24.click();
		if (custSel === 32) target.key25.click();
		if (custSel === 33) target.key26.click();
		if (custSel === 34) target.SYMBOL.click();
		if (custSel === 35) target.SPACE.click();
		if (custSel === 36) target.BACK.click();
		return;
	};
};
tmp();
tmp = undefined;