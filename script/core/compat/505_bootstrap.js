// Name: 505
// Description: Sony PRS-505 bootstrap code
//	Receives PARAMS argument with the following fields:
//		bootLog, Core, loadAddons, loadCore
//	Must call loadAddons, loadCore and Core.init at appropriate times
//
// History:
//	2011-03-04 kartu - Initial version
//	2011-04-01 kartu - Renamed language files to corresponding 2 letter ISO codes
//	2011-04-21 kartu - Added option to disable scanning without loading cache
//	2011-07-04 Mark Nord - 	Added #38 "Standby image"
//	2011-07-04 Mark Nord - 	Added #24 "Displaying first page of the book on standby" based on code found by Ben Chenoweth
//	2011-07-06 Ben Chenoweth - Minor fix to StandbyImage (mime not needed)
//	2011-09-10 Mark Nord - 	added localised "Sleeping.." to curretn page-StandbyImage;
//	2011-09-12 Mark Nord - 	FIXED first book-page as StandbyImage for all file-formats
//	2011-09-16 Mark Nord - 	Fixed display correct page on page-turn after waking from sleep with book-cover as standby image
//	2011-10-08 Mark Nord - 	Fixed #195 "blank" & "Sleeping..." for landscape-mode by making coordinates dynamic (thx quisvir) 
//				show cover and wallpaper always in portrait, no more need for /landscape/ - subfolder 
//				will flash once in portrait before resume with landscape-mode, due to needed ebook.rotate()
//				could be avoided with inverse code in doResume(), but then resume will take noticeable longer
//	2011-10-09 Mark Nord - 	preserve ascept-ratio for cover-pages (using code from quisvir)
//	2011-10-11 Mark Nord -  code tidying for cover/wallpaper on standby 
//	2011-11-20 quisvir - Added sub-collection support (max 1 sub-level, using | as separator)
//	2011-11-21 quisvir - Moved Standby Image code to addon
//	2012-02-24 quisvir - Moved sub-collection support to addon

var tmp = function() {
	var oldReadPreference, oldCallback, bootLog;
	bootLog = PARAMS.bootLog;
	
	// Init core here
	oldReadPreference = kbook.model.readPreference;
	kbook.model.readPreference = function() {
		// Path to 505 specific language files
		var langPath505 = "/opt/sony/ebook/application/resources/prsp_lang/";
		try {
			oldReadPreference.apply(this, arguments);
			// restore "old" readPreference
			kbook.model.readPreference = oldReadPreference;
			
			PARAMS.loadCore();

			// Init 505 specific lang files
			try {
				var code = PARAMS.Core.io.getFileContent(langPath505 + "lang.js", null);
				if (code !== null) {
					var lang505 = new Function("Core,loadAddons,langPath505", code);
					lang505(PARAMS.Core, PARAMS.loadAddons, langPath505);	
				} else {
					bootLog("Error loading lang.js");
				}
			} catch (e0) {
				bootLog("error calling initLang505: " + e0);
			}
		} catch (e) {
			bootLog("in overriden readPreference " + e);
		}
	};
	
	// Disable card scan
	var originalCanHandleVolume = FskCache.diskSupport.canHandleVolume;
	FskCache.diskSupport.canHandleVolume = function (volume) {
		try {
			if (PARAMS.Core && PARAMS.Core.config && PARAMS.Core.config.cardScanMode === "disabled") {
				return false;
			}
		} catch (ee) {
			bootLog("canHandleVolume" + ee);
		}
		return originalCanHandleVolume.apply(this, arguments);
	};
	
	// Disabling scanning, but loading cache
	oldCallback = FskCache._diskSource.synchronizeCallback;
	FskCache._diskSource.synchronizeCallback = function() {
		try {
			if (PARAMS.Core && PARAMS.Core.config 
				&& PARAMS.Core.config.cardScanMode === "disabledLoadCache") {
				this.target.synchronizedSource();
				this.target.synchronizeDone();
				this.stack.pop();
			} else {
				oldCallback.apply(this, arguments);
			}
		} catch (e) {
			bootLog("Error in callback: " + e);
			oldCallback.apply(this, arguments);
		}
	};
	
	/*
		<function id="doDigit" params="part"><![CDATA[
			var c = this.PAGE.countPages().toString().length - 1;
			var s = "";
			for (var i = 0; i < c; i++)
				s += "_";
			s += part.key.charAt(0);
			this.setVariable("GOTO_VARIABLE", s);
			var container = this.container;
			container.beforeModal(container.GOTO_GROUP);
		]]></function>
	*/
	// First digit is ignored, if it is zero, when opening "goto" dialog (original function quoted above)
	kbook.model.container.sandbox.PAGE_GROUP.sandbox.doDigit = function(part) {
		try {
			var c, s, i, container, key;
			c = this.sandbox.PAGE.countPages().toString().length - 1;
			s = "";
			for (i = 0; i < c; i++) {
				s += "_";
			}
			key = part.key.charAt(0);
			if (key !== "0") {
				s += key;
			} else {
				s += "_";
			}
			this.setVariable("GOTO_VARIABLE", s);
			container = kbook.model.container;
			container.sandbox.beforeModal.call(container, container.sandbox.GOTO_GROUP);
		} catch (ignore) {
			bootLog("error in doDigit: " + ignore);
		}
	};
	
	// Fix sorting
	var compareStrings =  PARAMS.Core.config.compat.compareStrings;
	String.prototype.localeCompare = function(a) {
		return compareStrings(this.valueOf(), a);
	};

	/* 
	// This hook is needed, since the parent node doesn't have a "shuffleList", so default onEnterSong fails
	//
	var oldOnEnterSong = kbook.model.onEnterSong;
	kbook.model.onEnterSong = function(node) {
		try {
			if (xs.isInstanceOf(node, musicPrototype)) {
				this.currentNode = node;
				this.STATE = 'SONG';
				kbook.menuData.setNode(null);
				if (this.currentSong != node) {
					this.playSong(node);
				} else {
					kbook.movieData.resetDisplayTimer();
				}			
			} else {
				oldOnEnterSong.apply(this, arguments);
			}
		} catch (e) {
			log.trace("Error in onEnterSong: " + e);
		}
	}; */

};

try {
	tmp();
} catch (ignore) {
}
