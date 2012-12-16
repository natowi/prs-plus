// Name: PRS+ Dictionary
// Description: Dictionary for x50 & 600 models
// Author: kartu
// Contributors: 
//
// History:
//	2012-12-16 kartu - Initial version

tmp = function () {
	var L, log, DISABLED, Dictionary, endsWith, dict, Article, Err, WordList, sonyOpenShortcut, prspOpenShortcut, initUI, dictControl,
		dictControlGroup, getDictControl;
	log = Core.log.getLogger('Dictionary');
	L = Core.lang.getLocalizer('Dictionary');
	endsWith = Core.text.endsWith;
	DISABLED = "disabled";

	// What happens, when word is selected
	prspOpenShortcut = function (span, word, dx, dy) {
		var txt, article, ui, i, n, words;
		try {
			article = dict.search(span.getText());
			ui = getDictControl();

			if (article.type === 'article') {
				ui.text = article.article;
				ui.page = 0;
				ui.invalidate();
			} else if (article.type === 'list') {
				words = article.words;
				txt = "";
				// TODO fix: Last "word" is a range (hence -1), but needs to be taken care of elsewhere
				for (i = 0, n = words.length - 1; i < n; i++) {
					txt += words[i] + "\n";
				}
				ui.text = txt;
			} else {
				ui.text = "Error: unknown article type";
			}
		} catch (cause) {
			log.error(cause);
			Core.ui.showMsg('Error: ' + cause);
		}
	};

	Dictionary = {
		name: 'Dictionary',
		title: L('TITLE'),
		icon: 'DICTIONARY',

		optionDefs: [{
			name: "dictionary",
			title: L("OPTION_DICTIONARY"),
			icon: "ABC",
			defaultValue: DISABLED,
			values: [DISABLED],
			valueTitles: {
					disabled: L("VALUE_DISABLED")
			}
		}],

		onPreInit : function () {
			var item, path, od, iterator;
			this.root = Core.config.userDictionaryPath;

			// Init epubCssFile values
			if (!FileSystem.getFileInfo(this.root)) {
					// dictionary folder doesn't exist, nothing to do
					return;
			}
			iterator = new FileSystem.Iterator(this.root);
			try {
				
				od = this.optionDefs[0];
				while (item = iterator.getNext()) {
					if (item.type === "file") {
						path = item.path;
						if (endsWith(path, ".prspdict")) {
							od.values.push(path);
							od.valueTitles[path]  = path;
						}
					}
				}
			} finally {
					iterator.close();
			}
		},
		
		onInit : function() {
			sonyOpenShortcut = pageShortcutOverlayModel.openShortcut;
			this.onSettingsChanged();
		},
		
		onSettingsChanged : function () {
			if (DISABLED === this.options.dictionary) {
				// unhook
				pageShortcutOverlayModel.openShortcut = sonyOpenShortcut;
			} else {
				// hook
				pageShortcutOverlayModel.openShortcut = prspOpenShortcut;
			}
		}
	};
	
	//------------------------------------------------------------------------------------------------------------------
	// Dictionary (command line)
	//------------------------------------------------------------------------------------------------------------------
	Err = function (msg) {
		this.type = 'error';
		this.message = msg;
	};
	
	Article = function(word, article) {
		this.type = 'article';
		this.word = word;
		this.article = article;
	};
	
	WordList = function(word, prevOffset, nextOffset, words) {
		this.type = 'list';
		this.word = word;
		this.nextOffset = nextOffset;
		this.prevOffset = prevOffset;
		this.words = words;
	};
	
	// Wrapper around dictionary executable
	dict = {
		tempFile : '/tmp/dic_tmp',
		binary : System.applyEnvironment("[prspPath]") + 'dictionary',
		getCmd : function (cmd, param) {
			return this.binary + ' "' + Dictionary.root + Dictionary.options.dictionary + '" ' + cmd + ' "' + param + '" > ' + this.tempFile + ' 2>&1 ';
		},
		search : function(word) {
			var cmd = this.getCmd('e', word);
			Core.shell.exec(cmd);
			return this.parseResult(this.tempFile, word);
		},
		list : function(word) {
			var cmd = this.getCmd('l', word);
			Core.shell.exec(cmd);
			return this.parseResult(this.tempFile, word);
		},
		next : function (wordList) {
			var cmd = this.getCmd('n', wordList.nextOffset);
			Core.shell.exec(cmd);
			return this.parseResult(this.tempFile, wordList.word);
		},
		prev : function (wordList) {
			var cmd = this.getCmd('p', wordList.prevOffset);
			Core.shell.exec(cmd);
			return this.parseResult(this.tempFile, wordList.word);
		},
		getArticle : function (offset) {
			var cmd = this.getCmd('x', offset);
			Core.shell.exec(cmd);
			return this.parseResult(this.tempFile, "");
		},
		parseResult : function (fileName, word) {
			var offsets, result, s = Core.io.getFileContent(fileName, null);
			if (s === null) {
				return new Err("Error loading dictionary search result");
			}
			s = s.split('\n');
			switch (s[0]) {
				case 'match':
					s.splice(0, 1);
					result = new Article(word, s.join('\n'));
					break;
				case 'list':
					// remove command & last line
					offsets = s.splice(0, 1).pop().split('\t');
					result = new WordList(word, offsets[0], offsets[1], s);
					break;
					// TODO Handle "there is only a single space" case
				default:
					result = new Err("Unknown result type: " + s[0]);
			}
			
			return result;
		}
	};
	
	//------------------------------------------------------------------------------------------------------------------
	// UI
	//------------------------------------------------------------------------------------------------------------------
	getDictControl = function () {
		if (dictControl) {			
			dictControlGroup.show(true);
			return dictControl;
		}

		var createButton = function(title, container, skin) {
				var button = xs.newInstanceOf(Fskin.button);
				button.root = container.root;
				button.container = container;
				button.state = 1;
				button.ready = true;
				if (skin !== undefined) {
					button.skin = skin;
					button.root.bindSkin(button);
				}		
				if (title !== undefined) {
					button.text = title;
				}
				button.top = 2;
				button.width = 57;
				button.height = 42;

				return button;
			};	
			
			
		// Draws paragraphs of text using current text style
		//
		var renderText = function (txt, indent, lineSpacing, wordSpacing, width, offset, win) {
			var ps, lineH, x, i, j, n, m, words, word, y, b, currentStyle, currentSize, currentColor;

			try {
				currentStyle = win.getTextStyle();
				currentSize = win.getTextSize();
				currentColor = win.getPenColor();
				win.setTextStyle(1);
				win.setTextSize(18);
				win.setPenColor(Color.black);
				ps = txt.split('\n');
				y = 0;
				

				for (i = 0, n = ps.length; i < n; i++) {
					x = indent;
					lineH = 0;
					words = ps[i].split(' ');
					for (j = 0, m = words.length; j < m; j++) {
						word = words[j];
						b = win.getTextBounds(word);
						if (b.width + wordSpacing + x > width) {
							y += lineH + lineSpacing;
							x = -wordSpacing;
						}
						x += wordSpacing;
						win.drawText(word, x, y - offset, b.width, b.height);
						x += b.width;
						lineH = Math.max(lineH, b.height);
					}
					y += lineH + lineSpacing;
				}
				
				win.setTextStyle(currentStyle);
				win.setTextSize(currentSize);
				win.setPenColor(currentColor);
			} catch (e) {
				log.error("Error in renderText" + e);
			}

			return y;
		};		
		
		
		// UI control to attach to 
		// TODO 600
		var pageGroup = kbook.model.container.sandbox.PAGE_GROUP;

		var button, button2, group, control;
			
		var sampleText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit.\n Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
		sampleText += sampleText;

		// < button
		// TODO 600
		button = createButton('<', pageGroup, 'btn_callDic');
		button.left = 10;
		button.click = function() {
			if (control.page > 0) {
				control.page--;
				control.invalidate();
			}
			log('click < ' + control.page + ' max ' + control.maxPages);
		};
		
		// > button
		// TODO 600
		button2 = createButton('>', pageGroup, 'btn_search');
		button2.left = 100;
		button2.click = function() {
			if (!control.maxPages || control.page < control.maxPages) {
				control.page++;
				control.invalidate();
			}
			log('click > ' + control.page + ' max ' + control.maxPages);
		};
		
		// Close button
		// TODO 600
		button3 = createButton('X', pageGroup, 'btn_search');
		button3.right = 10;
		button3.click = function() {
			// hiding dict control
			group.show(false);
		};		
		
		// Custom control
		control = xs.newInstanceOf(Fskin.control);
		control.update = function (event) {
			var bounds, contents, c, i;
			if (this.visible) {
				if (FskUI.Rectangle.intersects.call(this, event)) {
					this.draw(event);
				}
			}	
		};
		control.page = 0;
		control.oldClip = {};
		control.draw = function (event) {
			var win, oldOrigin, height, offset;
			try {
				win = this.root.window;
				oldOrigin = win.getOrigin();
				win.setPenColor(Color.white);
				win.fillRectangle(this.x, this.y, this.width, this.height);
				win.setOrigin({
					x: this.x + this.gap,
					y: this.y + this.gap
				});
				offset = this.height * this.page;
				win.getClip(this.oldClip);
				Fskin.scratchRectangle.set(0, 0, this.width, this.height);
				win.setClip(Fskin.scratchRectangle);
				height = renderText(this.text, 20, 10, 10, this.width - this.gap*2, offset, win);
			} catch (e) {
				log.trace("Error in control.draw: " + e);
			} finally {
				try {
					win.setOrigin(oldOrigin);	
					win.setClip(this.oldClip);
				} catch (ee) {
					log.error("when restoring windows state");
				}
			}
			this.maxPages = Math.ceil(height / this.height) -1;
		};
		control.gap = 3;
		control.left = 0;
		control.right = 0;
		control.bottom = 0;
		control.top = 50;
		control.ready = true;
		control.text = sampleText;
		control.root = pageGroup.root;
		control.container = pageGroup;
		
		// A group
		group = xs.newInstanceOf(Fskin.group);
		group.root = pageGroup.root;
		group.container = pageGroup;
		group.contents = [control, button, button2, button3];
		group.ready = true;
		group.x = 0;
		group.y = 500;
		group.width = 600;
		group.height = 270;
		var oldDraw = group.draw;
		group.draw = function (event) {
			var win = this.root.window;
			var oldClip = {};
			win.getClip(oldClip);
			win.setPenColor(Fskin.color.parse('#ffc0c0c0'));
			win.fillRectangle(this.x, this.y, this.width, this.height);
			win.setPenColor(Color.black);
			win.frameRectangle(this.x, this.y, this.width, this.height);
			Fskin.scratchRectangle.set(this.x, this.y, this.width, this.height);
			win.setClip(Fskin.scratchRectangle);
			oldDraw.apply(this, arguments);
			win.setClip(oldClip);
		};
		
		for (i = 0, n = group.contents.length; i < n; i++) {
			group.contents[i].initializeCoordinates(group.root, group);	
		}
		
		// TODO 600 differs from x50
		pageGroup.contents[7] = group;		
		dictControl = control;
		dictControlGroup = group;
		
		return control;
	}
	
	
	Core.addAddon(Dictionary);
	
};

try {
	tmp();
} catch (e) {
	log.error('in Test.js: ' + e);
}