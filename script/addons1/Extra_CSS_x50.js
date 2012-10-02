// Name: Extra_CSS_x50 derived from Analogus_CSS
// Author: ANALOGUS; Mark Nord

// History:
// 	Initial version: 2012-10-01

tmp = function() 
{
	var	myFineFontSize,
		myLineHeight,
		myAlign,
		PATH_SIZEOVERLAY = kbook.model.container.sandbox.SIZE_OVERLAY_GROUP.sandbox.VIEW.sandbox.SIZE_OVERLAY,
		PATH_SIZEOVERLAYSANDBOX = kbook.model.container.sandbox.SIZE_OVERLAY_GROUP.sandbox.VIEW.sandbox.SIZE_OVERLAY.sandbox,
		NAME = "Extra_CSS_x50",
		L = Core.lang.getLocalizer("ViewerSettings_x50"),
		log = Core.log.getLogger(NAME),
		exec = Core.shell.exec,
		doFineFontSize,
		doLineHeight,
		doAlign,
		Extra_CSS_x50,
		changeValueTitles,
		t_align = ['default', 'left', 'center', 'right', 'justify'],
		t_ffont = ['default', '1.033em', '1.066em', '1.10em', '1.20em'],
		t_lheight = ['default', '1.0em', '1.25em', '1.5em', '2.0em'],
		t_indent = ['default', '0em', '1.0em', '1.5em', '2.0em'],
		t_margin = ['default', '0em', '0.5em', '1.0em', '1.5em'],
		externCSS,
		userStyleexternCSS = ['','','','','','',''],


	handleExtraCSS = function (index, value) {
		var currentPage;
		if (value !== "default") {
			userStyleexternCSS[index] = externCSS[index].replace(/placeholder/, value);
			if (index  === 2) { // workaround handle @page {margin: }
				userStyleexternCSS[index+1] = externCSS[index+1].replace(/placeholder/, value);
			}
		} else {
			userStyleexternCSS[index] = '';
			if (index  === 2) { // workaround handle @page {margin: }
				userStyleexternCSS[index+1] = '';
			}
		};
		Core.addonByName.EpubUserStyle.reloadBook(userStyleexternCSS);
		return true;
	},

	ResetCss = function ()
		{
			exec('rm -f /Data/CSS/addstyle.css; touch /Data/CSS/addstyle.css; rm -f /Data/database/system/PRSPlus/epub/style.css; touch /Data/database/system/PRSPlus/epub/style.css');	
			Extra_CSS_x50.options.Option_Fontsize = '0';
			Extra_CSS_x50.options.Option_Lineheight = '0';
			Extra_CSS_x50.options.Option_Pagemargin = '0';
			Extra_CSS_x50.options.Option_Textalign = '0';
			Extra_CSS_x50.options.Option_Textindent = '0';					
			Extra_CSS_x50.options.Option_Padding = '0';
			Core.settings.saveOptions(Extra_CSS_x50);
			BookReload();
		};

	oldInitSizeMenu = pageSizeOverlayModel.initSizeMenu;

	pageSizeOverlayModel.initSizeMenu = function () {
		myFineFontSize = Extra_CSS_x50.options.Option_Fontsize * 1;
		myLineHeight = Extra_CSS_x50.options.Option_Lineheight * 1;
		myAlign = Extra_CSS_x50.options.Option_Textalign * 1;
		try{
			Core.system.setSoValue(PATH_SIZEOVERLAYSANDBOX.sizeV.sandbox.FONTSIZEFINE.sandbox.ff_title, "text", L("OPTION_FONTSIZE"));
			Core.system.setSoValue(PATH_SIZEOVERLAYSANDBOX.sizeV.sandbox.LINEHEIGHT.sandbox.lh_title, "text", L("OPTION_LINEHEIGHT"));
			Core.system.setSoValue(PATH_SIZEOVERLAYSANDBOX.sizeV.sandbox.ALIGN.sandbox.lh_align, "text", L("OPTION_TEXTALIGN"));

			Core.system.setSoValue(PATH_SIZEOVERLAYSANDBOX.sizeH.sandbox.FONTSIZEFINE.sandbox.ff_title, "text", L("OPTION_FONTSIZE"));
			Core.system.setSoValue(PATH_SIZEOVERLAYSANDBOX.sizeH.sandbox.LINEHEIGHT.sandbox.lh_title, "text", L("OPTION_LINEHEIGHT"));
			Core.system.setSoValue(PATH_SIZEOVERLAYSANDBOX.sizeH.sandbox.ALIGN.sandbox.lh_align, "text", L("OPTION_TEXTALIGN"));
		} catch (e) { log.trace('writing to sandbox-values e: '+e) 
		}
		PATH_SIZEOVERLAY.setVariable('VAR_RADIO_LINEHEIGHT', myLineHeight);
		PATH_SIZEOVERLAY.setVariable('VAR_RADIO_FONTSIZEFINE', myFineFontSize);
		PATH_SIZEOVERLAY.setVariable('VAR_RADIO_ALIGN', myAlign);
		oldInitSizeMenu.apply(this, arguments);
	};

//---------taking commands from/functions for Font_Size_Overlay-buttons:--------------------------------
	
	//Fontsize-Changing over Font_Size_Overlay:
	//doFontSize: own variable to be found in sizeOverlay.xml:
	doFineFontSize = function (sender) {
		var id;
		id = sender.id.substring(5,6);
		myFineFontSize = id * 1;
		handleExtraCSS(0, t_ffont[myFineFontSize]);
		Extra_CSS_x50.options.Option_Fontsize = myFineFontSize.toString();
		Core.settings.saveOptions(Extra_CSS_x50);
	};


	//Lineheight-Changing over Font_Size_Overlay
	//doLineHeight: to be found in sizeOverlay.xml:
	doLineHeight = function (sender) {
		var id;
		id = sender.id.substring(4,5);
		myLineHeight = id * 1;	
		handleExtraCSS(1, t_lheight[myLineHeight]);
		Extra_CSS_x50.options.Option_Lineheight = myLineHeight.toString();	
		Core.settings.saveOptions(Extra_CSS_x50);
	};

	//doAlign: to be found in sizeOverlay.xml:
	doAlign = function (sender) {
		var id;
		id = sender.id.substring(5,6);
		myAlign = id * 1;	
		handleExtraCSS(4, t_align[myAlign]);
		Extra_CSS_x50.options.Option_Textalign = myAlign.toString();	
		Core.settings.saveOptions(Extra_CSS_x50);
	};

	PATH_SIZEOVERLAYSANDBOX.doLineHeight = doLineHeight;

	PATH_SIZEOVERLAYSANDBOX.doFontSize = doFineFontSize;

	PATH_SIZEOVERLAYSANDBOX.doAlign = doAlign;

	PATH_SIZEOVERLAYSANDBOX.isEpub = function () {
		var current = kbook.model.currentBook;
		return (current && current.media.mime === 'application/epub+zip');
	};

	/*/Activates Zoom-Lock (former: normal zoom-mode) over Font_Size_Overlay		
	PATH_SIZEOVERLAYSANDBOX.goZoomMode = function () {
		Core.addonByName.TouchSettings.actions[2].action();
	}; */

	loadExtraCSS = function () {
		var filePath, content, lines, path, i, n;
		// load externCSS
			filePath = Core.config.userCSSPath + "extern.css";
			content = Core.io.getFileContent(filePath, null);
			if (content !== null) {
				externCSS = [];
				lines = content.split("\n");
				if (lines) {
					i = 0;
					n = lines.length;
						for (i; i < n; i++) {
							if ((lines[i].indexOf("#")) === -1 && (lines[i].length)) {
								externCSS.push(lines[i]);
							}
						}	
					}
			} else {
				externCSS = ['','','','','','',''];
			}
	};

	changeValueTitles = function () {
		var i, n, optionDefs = Extra_CSS_x50.optionDefs[0];
		n = t_ffont.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[0].valueTitles[i.toSting()] = t_ffont[i];
		}
		n = t_lheight.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[1].valueTitles[i.toSting()] = t_lheight[i];
		}
		n = t_margin.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[2].valueTitles[i.toSting()] = t_margin[i];
		}
		n = t_margin.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[3].valueTitles[i.toSting()] = t_margin[i];
		}
		n = t_align.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[4].valueTitles[i.toSting()] = t_align[i];
		}
		n = t_intend.length;
		for (i=0; i<n; i++) {	
			optionDefs.optionDefs[2].valueTitles[i.toSting()] = t_intend[i];
		}
	};
//-----------------------------------------------------------------------------------------------------
	Extra_CSS_x50 = 
	{
		name: NAME,
		settingsGroup: "fonts", 
		title: L("GROUP_BOOK_FORMAT"),	
		icon: "BOOKOPEN", 		
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
						values: ['0', '1', '2', '3'],
						valueTitles: 
							{
							'0': t_margin[0], 
							'1': t_margin[1], //no margins					
							'2': t_margin[2],
							'3': t_margin[3]
							}
					},
					
					{
						name: 'Option_Padding',	
						title: L('OPTION_PADDING'),
						icon: 'FONT',
						//helpText: L('HELP_PADDING'),
						defaultValue: '0',
						values: ['0', '1', '2', '3'],
						valueTitles: 
							{
							'0': t_margin[0], 
							'1': t_margin[1], //no margins					
							'2': t_margin[2],
							'3': t_margin[3]
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
						values: ['0', '1', '2', '3'],
						valueTitles: 
							{
							'0': t_indent[0], 
							'1': t_indent[1],
							'2': t_indent[2], 
							'3': t_indent[3]
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
						handleExtraCSS(0, t_ffont[newValue]) ;	
					break ;
				case 'Option_Lineheight':
						handleExtraCSS(1, t_lheight[newValue]) ;
					break ;
				case 'Option_Pagemargin':
						handleExtraCSS(2, t_margin[newValue]) ;
					break ;
				case 'Option_Padding':
						handleExtraCSS(6, t_margin[newValue]) ;
					break ;
				case 'Option_Textalign':
						handleExtraCSS(4, t_align[newValue]) ;
					break ;
				case 'Option_Textindent':
						handleExtraCSS(5, t_indent[newValue]) ;
					break;
			/*	case 'LrfFont':
						LrfFontFunction (newValue) ;	
					break ;  */
				case 'Reset_CSS':
						ResetCss ();
					break ;
			/*	case 'Option_Edit_Tags':
						EditTagsFunction(newValue); 
					break ; */
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
	log.error("in Extra_CSS_x50.js", e);
}