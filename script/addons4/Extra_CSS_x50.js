// Name: Extra_CSS_x50 derived from Analogus_CSS
// Author: ANALOGUS; Mark Nord

// History:
//	Initial version: 2012-10-07 for 600/x50 models
//	2012-10-07 Mark Nord - PopUpMenu on middle button
//	2012-10-27 Mark Nord - 600: kbook.radio2icon.stylesOffset; kbook.radio2icon.modified_kbook_draw; kbook.radio2icon.draw;
//	2012-10-28 Mark Nord - 600: just set align0.stylesOffset = 2; to fix icon-offset, manual creation of radio-button-control-variables
//	2012-10-30 Mark Nord - 600: moved - backported x50th stylesOffset for radio2icon button - to 600_bootstrap, merged code for x50/600
//	2012-12-23 Mark Nord - extra-button caption, enable the use of all 4 values for margin, fix a error in changeValueTitles

tmp = function() 
{
	var	myFineFontSize,
		myLineHeight,
		myAlign,
		// path to SIZE_OVERLAY set model-specific
		PATH_SIZEOVERLAY,
		PATH_SIZEOVERLAYSANDBOX,
		NAME = 'Extra_CSS_x50',
		L = Core.lang.getLocalizer('ViewerSettings_x50'),
		log = Core.log.getLogger(NAME),
		exec = Core.shell.exec,
		isEpub,
		doFineFontSize,
		doLineHeight,
		doAlign,
		doVariable,
		buildMoreCSSMenu,
		Extra_CSS_x50,
		changeValueTitles,
		t_align = ['default', 'left', 'center', 'right', 'justify'],
		t_ffont = ['default', '1.033em', '1.066em', '1.10em', '1.20em'],
		t_lheight = ['default', '1.00em', '1.25em', '1.50em', '2.00em'],
		t_indent = ['default', '0em', '1.0em', '1.5em', '2.0em'],
		t_margin = ['default', '0em', '0.5em', '1.0em', '1.5em'],
		externCSS,
		userStyleexternCSS = ['','','','','','',''],
		cssMenu,

	handleExtraCSS = function (index, value) {
		var currentPage;
		if (value !== 'default') {
			userStyleexternCSS[index] = externCSS[index].replace(/placeholder/, value);
			if (index  === 2) { // workaround handle @page {margin: }
				userStyleexternCSS[index+1] = externCSS[index+1].replace(/placeholder/, value);
			}
		} else {
			userStyleexternCSS[index] = '';
			if (index  === 2) { // workaround handle @page {margin: }
				userStyleexternCSS[index+1] = '';
			}
		}
		Core.addonByName.EpubUserStyle.reloadBook(userStyleexternCSS);
		return true;
	},

	ResetCss = function ()	{
		var options = Extra_CSS_x50.options;
		options.Option_Fontsize = '0';
		options.Option_Lineheight = '0';
		options.Option_Pagemargin = '0';
		options.Option_Textalign = '0';
		options.Option_Textindent = '0';
		options.Option_Padding = '0';
		Core.settings.saveOptions(Extra_CSS_x50);
		userStyleexternCSS = ['','','','','','',''];
		Core.addonByName.EpubUserStyle.reloadBook(userStyleexternCSS);
	};

	if (Core.config.model === '600') {
		PATH_SIZEOVERLAY = kbook.model.container.sandbox.SIZE_OVERLAY;
		PATH_SIZEOVERLAYSANDBOX = kbook.model.container.sandbox.SIZE_OVERLAY.sandbox;
	} else {// x50
		PATH_SIZEOVERLAY = kbook.model.container.sandbox.SIZE_OVERLAY_GROUP.sandbox.VIEW.sandbox.SIZE_OVERLAY;
		PATH_SIZEOVERLAYSANDBOX = kbook.model.container.sandbox.SIZE_OVERLAY_GROUP.sandbox.VIEW.sandbox.SIZE_OVERLAY.sandbox;
	}
		
	oldInitSizeMenu = pageSizeOverlayModel.initSizeMenu;

	pageSizeOverlayModel.initSizeMenu = function () {
		var i, n,
		sizeVsb = PATH_SIZEOVERLAYSANDBOX.sizeV.sandbox,
		sizeHsb = PATH_SIZEOVERLAYSANDBOX.sizeH.sandbox,
		myFineFontSize = Extra_CSS_x50.options.Option_Fontsize * 1;
		myLineHeight = Extra_CSS_x50.options.Option_Lineheight * 1;
		myAlign = Extra_CSS_x50.options.Option_Textalign * 1;
		try{
			if (Core.config.model === '600') {// model-sniffing; set styleOffset manually for 600
				n = 5;
				for (i = 0; i<n; i++)	{
					sizeVsb.FONTSIZE.sandbox['font'+i].stylesOffset = 2;
					sizeHsb.FONTSIZE.sandbox['font'+i].stylesOffset = 2;
					sizeVsb.LINEHEIGHT.sandbox['line'+i].stylesOffset = 2;
					sizeHsb.LINEHEIGHT.sandbox['line'+i].stylesOffset = 2;
					sizeVsb.FONTSIZEFINE.sandbox['ffont'+i].stylesOffset = 2;
					sizeHsb.FONTSIZEFINE.sandbox['ffont'+i].stylesOffset = 2;
				}
				sizeVsb.ALIGN.sandbox.align0.stylesOffset = 2;
				sizeHsb.ALIGN.sandbox.align0.stylesOffset = 2;
			}
			
			sizeVsb.FONTSIZEFINE.sandbox.ff_title.setValue(L('OPTION_FONTSIZE'));
			sizeVsb.LINEHEIGHT.sandbox.lh_title.setValue(L('OPTION_LINEHEIGHT'));
			sizeVsb.ALIGN.sandbox.lh_align.setValue(L('OPTION_TEXTALIGN'));
			sizeVsb.FONTSIZE.sandbox.varBtn.setText(L('MORE_CSS'));

			sizeHsb.FONTSIZEFINE.sandbox.ff_title.setValue(L('OPTION_FONTSIZE'));
			sizeHsb.LINEHEIGHT.sandbox.lh_title.setValue(L('OPTION_LINEHEIGHT'));
			sizeHsb.ALIGN.sandbox.lh_align.setValue(L('OPTION_TEXTALIGN'));
			sizeHsb.FONTSIZE.sandbox.varBtn.setText(L('MORE_CSS'));

			// LineHeight Button-Caption
			n = 5;
			for (i = 1; i < n; i++) {	
				sizeVsb.LINEHEIGHT.sandbox['line'+i].setText(t_lheight[i].substring(0, 4));
				sizeHsb.LINEHEIGHT.sandbox['line'+i].setText(t_lheight[i].substring(0, 4));
				sizeVsb.FONTSIZEFINE.sandbox['ffont'+i].setText(t_ffont[i].substring(0, 4));
				sizeHsb.FONTSIZEFINE.sandbox['ffont'+i].setText(t_ffont[i].substring(0, 4));
			}
		} catch (e) { 
			log.trace('writing to sandbox-values e: '+e);
		}
		PATH_SIZEOVERLAY.setVariable('VAR_RADIO_LINEHEIGHT', myLineHeight);
		PATH_SIZEOVERLAY.setVariable('VAR_RADIO_FONTSIZEFINE', myFineFontSize);
		PATH_SIZEOVERLAY.setVariable('VAR_RADIO_ALIGN', myAlign);
		oldInitSizeMenu.apply(this, arguments);
	};

	doFineFontSize = function (sender) {
		var id;
		id = sender.id.substring(5,6);
		myFineFontSize = id * 1;
		handleExtraCSS(0, t_ffont[myFineFontSize]);
		Extra_CSS_x50.options.Option_Fontsize = myFineFontSize.toString();
		Core.settings.saveOptions(Extra_CSS_x50);
	};

	doLineHeight = function (sender) {
		var id;
		id = sender.id.substring(4,5);
		myLineHeight = id * 1;	
		handleExtraCSS(1, t_lheight[myLineHeight]);
		Extra_CSS_x50.options.Option_Lineheight = myLineHeight.toString();
		Core.settings.saveOptions(Extra_CSS_x50);
	};

	doAlign = function (sender) {
		var id;
		id = sender.id.substring(5,6);
		myAlign = id * 1;	
		handleExtraCSS(4, t_align[myAlign]);
		Extra_CSS_x50.options.Option_Textalign = myAlign.toString();
		Core.settings.saveOptions(Extra_CSS_x50);
	};

	loadExtraCSS = function () {
		var filePath, content, lines, path, i, n;
		// load externCSS
			filePath = Core.config.userCSSPath + 'extern.css';
			content = Core.io.getFileContent(filePath, null);
			if (content !== null) {
				externCSS = [];
				lines = content.split('\n');
				if (lines) {
					i = 0;
					n = lines.length;
						for (i; i < n; i++) {
							if ((lines[i].indexOf('#')) === -1 && (lines[i].length)) {
								externCSS.push(lines[i]);
							}
						}
					}
			} else {
				externCSS = ['','','','','','',''];
			}
	};

	buildMoreCSSMenu = function () {
		// PopUpMenu definition
		var cssMargin, cssPadding, cssIndent, 
		LSA = Core.lang.getLocalizer('StandardActions'),
		createMenuItem = Core.popup.createMenuItem; // not to type Core.popup X times

		// Root menu for epubs
		cssMenu = createMenuItem();
		cssMenu.addChild(createMenuItem(LSA('ACTION_doRotate'), function () {kbook.model.onEnterOrientation();} )); 
		cssMenu.addChild(createMenuItem(L('CHANGEFONT'), function () {
			pageSizeOverlayModel.closeCurrentOverlay();
			Core.addonByName.EpubUserStyle.actions[0].action(); } )); 
		// Submenus
		cssMargin = createMenuItem(L('OPTION_PAGEMARGIN'));
		cssPadding = createMenuItem(L('OPTION_PADDING'));
		cssIndent = createMenuItem(L('OPTION_TEXTINDENT'));
		cssMenu.addChild(cssIndent);
		cssMenu.addChild(cssMargin);
		cssMenu.addChild(cssPadding);

		// Subsubmenus
		cssIndent.addChild(createMenuItem(t_indent[0], function() {return handleExtraCSS(5, t_indent[0]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[1], function() {return handleExtraCSS(5, t_indent[1]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[2], function() {return handleExtraCSS(5, t_indent[2]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[3], function() {return handleExtraCSS(5, t_indent[3]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[4], function() {return handleExtraCSS(5, t_indent[4]);}  ));

		cssMargin.addChild(createMenuItem(t_margin[0], function() {return handleExtraCSS(2, t_margin[0]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[1], function() {return handleExtraCSS(2, t_margin[1]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[2], function() {return handleExtraCSS(2, t_margin[2]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[3], function() {return handleExtraCSS(2, t_margin[3]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[3], function() {return handleExtraCSS(2, t_margin[4]);}  ));

		cssPadding.addChild(createMenuItem(t_margin[0], function() {return handleExtraCSS(6, t_margin[0]);}  ));
		cssPadding.addChild(createMenuItem(t_margin[1], function() {return handleExtraCSS(6, t_margin[1]);}  ));
		cssPadding.addChild(createMenuItem(t_margin[2], function() {return handleExtraCSS(6, t_margin[2]);}  ));
		cssPadding.addChild(createMenuItem(t_margin[3], function() {return handleExtraCSS(6, t_margin[3]);}  ));
		cssPadding.addChild(createMenuItem(t_margin[3], function() {return handleExtraCSS(6, t_margin[4]);}  ));
	};

	isEpub = function () {
		var current = kbook.model.currentBook;
		return (current && current.media.mime === 'application/epub+zip');
	};

	changeValueTitles = function () {
		var i, n, optionDefs = Extra_CSS_x50.optionDefs[0];
		n = t_ffont.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[0].valueTitles[i.toString()] = t_ffont[i];
		}
		n = t_lheight.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[1].valueTitles[i.toString()] = t_lheight[i];
		}
		n = t_margin.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[2].valueTitles[i.toString()] = t_margin[i];
		}
		n = t_margin.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[3].valueTitles[i.toString()] = t_margin[i];
		}
		n = t_align.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[4].valueTitles[i.toString()] = t_align[i];
		}
		n = t_indent.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[5].valueTitles[i.toString()] = t_indent[i];
		}
	};

	doVariable = function () {
		pageSizeOverlayModel.closeCurrentOverlay();
		if (isEpub) {
			Core.popup.showMenu(cssMenu);
		} /* else { show another menu if we like } */
	};

	PATH_SIZEOVERLAYSANDBOX.doVariable = doVariable;

	PATH_SIZEOVERLAYSANDBOX.doLineHeight = doLineHeight;

	PATH_SIZEOVERLAYSANDBOX.doFontSize = doFineFontSize;

	PATH_SIZEOVERLAYSANDBOX.doAlign = doAlign;

	PATH_SIZEOVERLAYSANDBOX.isEpub = isEpub;

	if (Core.config.model === '600') { // model-sniffing;  manual creation of radio-button-control-variables
		var VAR_RADIO_LINEHEIGHT = xs.newInstanceOf(Fskin.modelVariable);
		VAR_RADIO_LINEHEIGHT.id = 'VAR_RADIO_LINEHEIGHT';
		VAR_RADIO_LINEHEIGHT.construct(kbook.model);

		var VAR_RADIO_FONTSIZEFINE = xs.newInstanceOf(Fskin.modelVariable);
		VAR_RADIO_FONTSIZEFINE.id = 'VAR_RADIO_FONTSIZEFINE';
		VAR_RADIO_FONTSIZEFINE.construct(kbook.model);

		var VAR_RADIO_ALIGN = xs.newInstanceOf(Fskin.modelVariable);
		VAR_RADIO_ALIGN.id = 'VAR_RADIO_ALIGN';
		VAR_RADIO_ALIGN.construct(kbook.model); 
	}

	/*/Activates Zoom-Lock (former: normal zoom-mode) over Font_Size_Overlay
	PATH_SIZEOVERLAYSANDBOX.goZoomMode = function () {
		Core.addonByName.TouchSettings.actions[2].action();
	}; */
//-----------------------------------------------------------------------------------------------------
	Extra_CSS_x50 = 
	{
		name: NAME,
		settingsGroup: 'fonts',
		title: L('GROUP_BOOK_FORMAT'),
		icon: 'BOOKOPEN',
		optionDefs:
		[
			//Group 1
			{ 
			groupTitle: L('CSS_OPTIONS'),
			groupIcon: 'FONT',
			helpText: L('HELP_CSS_EDITING'),
			optionDefs: 
				[
					{
						name: 'Option_Fontsize',
						title: L('OPTION_FONTSIZE'),
						icon: 'FONT',
						//helpText: L('HELP_FONTSIZE'),
						defaultValue: '0',
						values: ['0', '1', '2', '3', '4'],
						valueTitles: 
							{
							'0': t_ffont[0],
							'1': t_ffont[1],
							'2': t_ffont[2],
							'3': t_ffont[3],
							'4': t_ffont[4]
							}
					},
					
					{
						name: 'Option_Lineheight',
						title: L('OPTION_LINEHEIGHT'),
						icon: 'FONT',
						//helpText: L('HELP_LINEHEIGHT'),
						defaultValue: '0',
						values: ['0', '1', '2', '3', '4'],
						valueTitles: 
							{
							'0': t_lheight[0], 
							'1': t_lheight[1],
							'2': t_lheight[2],
							'3': t_lheight[3],
							'4': t_lheight[4]
							}
					},
					
					{
						name: 'Option_Pagemargin',
						title: L('OPTION_PAGEMARGIN'),
						icon: 'FONT',
						//helpText: L('HELP_PAGEMARGIN'),
						defaultValue: '0',
						values: ['0', '1', '2', '3', '4'],
						valueTitles: 
							{
							'0': t_margin[0], 
							'1': t_margin[1], //no margins
							'2': t_margin[2],
							'3': t_margin[3],
							'4': t_margin[4],
							}
					},
					
					{
						name: 'Option_Padding',
						title: L('OPTION_PADDING'),
						icon: 'FONT',
						//helpText: L('HELP_PADDING'),
						defaultValue: '0',
						values: ['0', '1', '2', '3', '4'],
						valueTitles: 
							{
							'0': t_margin[0], 
							'1': t_margin[1], //no margins
							'2': t_margin[2],
							'3': t_margin[3],
							'4': t_margin[4]
							}		
					},

					{
						name: 'Option_Textalign',
						title: L('OPTION_TEXTALIGN'),
						icon: 'FONT',
						//helpText: L('HELP_PAGEMARGIN'),
						defaultValue: '0',
						values: ['0', '1', '2', '3', '4'],
						valueTitles: 
							{
							'0': t_align[0],
							'1': t_align[1],
							'2': t_align[2],
							'3': t_align[3],
							'4': t_align[4]
							}
					},
					
					{
						name: 'Option_Textindent',
						title: L('OPTION_TEXTINDENT'),
						icon: 'FONT',
						//helpText: L('HELP_PAGEMARGIN'),
						defaultValue: '0',
						values: ['0', '1', '2', '3', '4'],
						valueTitles: 
							{
							'0': t_indent[0], 
							'1': t_indent[1],
							'2': t_indent[2], 
							'3': t_indent[3],
							'4': t_indent[4]
							}
					},

					{
						name: 'Reset_CSS',
						title: L('RESET_CSS'),
						icon: 'BACK',
						helpText: L('HELP_RESET_CSS'),
						defaultValue: 'RESET',
						values: ['RESET'],
						valueTitles: 
							{
							//'NO_OPTION': L('NO_OPTION'), 
							'RESET': L('RESET')
							}
					}
				]
			}	
		],

//----------------------------------------------------------------------------------------------------------
		onInit: function () {
			var result;
			loadExtraCSS();
			buildMoreCSSMenu();
			// load userCSSValues - if any
			result = Core.system.callScript(Core.config.userCSSValues, log);
		if (result) { 
				t_ffont = result.t_ffont;
				t_lheight = result.t_lheight;
				t_indent = result.t_indent;
				t_margin = result.t_margin;
				changeValueTitles();
			}
		},		
		//Called from Core_Settings.js after changing options:
		onSettingsChanged: function (propertyName, oldValue, newValue, object) 
		{	newValue = newValue *1;
			switch (propertyName) 
			{
				case 'Option_Fontsize':
						handleExtraCSS(0, t_ffont[newValue]);	
					break ;
				case 'Option_Lineheight':
						handleExtraCSS(1, t_lheight[newValue]);
					break ;
				case 'Option_Pagemargin':
						handleExtraCSS(2, t_margin[newValue]);
					break ;
				case 'Option_Padding':
						handleExtraCSS(6, t_margin[newValue]);
					break ;
				case 'Option_Textalign':
						handleExtraCSS(4, t_align[newValue]);
					break ;
				case 'Option_Textindent':
						handleExtraCSS(5, t_indent[newValue]);
					break;
				case 'Reset_CSS':
						ResetCss();
					break ;
			} 
		}
	};

	Core.addAddon(Extra_CSS_x50);
};


try 
{
	tmp();
} catch (e) 
{
	// Core's log
	log.error('in Extra_CSS_x50.js', e);
}