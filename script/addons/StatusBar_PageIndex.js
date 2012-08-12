// Name: PageIndex
// Description: Shows the book index in different formats
// Author: Duglum, VICTORGSJG, kartu
//
// History:
//	2010-03-01 kartu - Fixed NaN problem in epubs
//	2010-03-01 kartu - Refactored code to use L localize function
//	2010-03-01 kartu - Added VICTORGSJG's "menu index" feature
//	2010-03-06 kartu - Renamed Not_SHOWN_IF_SINGLE_PAGE to NOT_SHOWN_IF_SINGLE_PAGE
//	2010-03-14 kartu - Refactored Utils -> Core
//	2010-03-14 kartu - Localized
//	2010-04-22 kartu - Fixed minor bug: "1 of 1" menu was visible even when menu mode was "not shown on single pages"
//	2010-04-24 kartu - Prepared for merging into single JS
//	2010-05-05 kartu - Added ppm, time to left, "pages remaning"
//	2010-05-11 kartu - Fixed NaN bug in ppm
//	2010-05-11 kartu - Fixed time left bug (time to read entire book was shown instead of remaining). Noticed by Duglum.
//	2010-05-20 kartu - Fixed timeout bug
//				Scrolling back resets the counter
//				last 3 page changes will be taken into account instead of 5
//	2010-05-24 kravitz - Fixed getPpm() result checking
//	2010-07-21 kartu - Refactored as Statusbar "plugin"
//	2010-11-29 kartu - ALL: implemented #16 "88.1% (add decimal) in statusbar"
//	2011-10-13 quisvir - Fixed "Remaining Time: 2:60" (thanks flobauke)
//	2011-12-19 quisvir - Added option "pages to next chapter"
//	2012-01-06 quisvir - Added next/previous chapter actions

tmp = function() {
	var log, L, lastTime, lastPage, ppmHistory, ppmIdx, MAX_PPM_HISTORY, MAX_DELAY, NA,
		resetCounter, getPpm, getTimeLeft, updateIndexBook, updateIndexMenu, toc, nextChapter,
		prevChapter, getChapterPages, getToc, resetToC, jumpToNextChapter, jumpToPrevChapter;
	log = Core.log.getLogger("StatusBar_PageIndex");
	L = Core.lang.getLocalizer("StatusBar_PageIndex");

	MAX_PPM_HISTORY = 3;
	// Maximum delay between pages, to consider it the same session, in milliseconds
	MAX_DELAY = 30 * 60 * 1000;
	NA = "*";

	resetCounter = function () {
		lastTime = undefined;
	};

	// Calculates ppm based on page changes history.
	// Takes into account MAX_PPM_HISTORY pages.
	// Resets the counter if there was a delay longar than MAX_DELAY milliseconds
	//
	getPpm = function (currentPage) {
		try {
			var i, currentTime, result, n;
			if (lastTime === undefined) {
				lastTime = (new Date()).getTime();
				lastPage = currentPage;
				ppmIdx = 0;
				ppmHistory = new Array(MAX_PPM_HISTORY);
				for (i = 0; i < MAX_PPM_HISTORY; i++) {
					ppmHistory[i] = 0;
				}
				return NA;
			}

			// It took tooo long, or if user scrolled back, resetting the counter
			currentTime = (new Date()).getTime();
			if (currentTime - lastTime > MAX_DELAY || currentPage < lastPage) {
				resetCounter();
				return NA;
			}

			if (currentPage !== lastPage) {
				if (ppmIdx >= MAX_PPM_HISTORY) {
					ppmIdx = 0;
				}
				ppmHistory[ppmIdx] = (currentPage - lastPage) * 1000 * 60 / (currentTime - lastTime);
				ppmIdx++;
				lastTime = currentTime;
				lastPage = currentPage;
			}

			result = 0;
			n = 0;
			for (i = 0; i < MAX_PPM_HISTORY; i++) {
				if (ppmHistory[i] !== 0) {
					n++;
					result = result + ppmHistory[i];
				}
			}
			result = Math.round(result / n * 10) / 10;

			return (isNaN(result) || result === 0) ? NA : result;
		} catch (e) {
			log.error("ppmIdx = " + ppmIdx + " ppmHistory =  " + ppmHistory + " in getPpm: ", e);
		}
		return NA;
	};

	// Returns time left to finish the book
	//
	getTimeLeft = function (ppm, pages) {
		var t, hours, minutes;
		if (ppm === NA) {
			return NA;
		}
		t = Math.round(pages / ppm);
		hours = Math.floor(t / 60);
		minutes = t % 60;
		if (hours > 0) {
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			return hours + ":" + minutes;
		} else {
			return minutes;
		}
	};
	
	resetToC = function () {
		toc = nextChapter = prevChapter = undefined;
	}
	
	// Returns number of pages to next chapter
	getChapterPages = function (i) {
		var j;
		if (toc === undefined) {
			toc = [];
			getToc(kbook.model.currentBook.media.content.bookmarks);
			toc.sort(function (a,b) { return a-b });
		}
		if (nextChapter && nextChapter > i) {
			if (!prevChapter || prevChapter <= i) {
				return nextChapter - i - 1;
			}
		}
		for (j = 0; j < toc.length; j++) {
			if (toc[j] > i) {
				prevChapter = (j > 0) ? toc[j - 1] : undefined;
				nextChapter = toc[j];
				return nextChapter - i - 1;
			}
		}
		return null;
	}

	// Creates array of bookmarks entry page numbers
	getToc = function (bm) {
		var j;
		for (j = 0; j < bm.length; j++) {
			try {
				toc.push(bm[j].mark.getPage());
			} catch(ignore) {}
			if (bm[j].bookmarks) {
				getToc(bm[j].bookmarks);
			}
		}
	}
	
	jumpToNextChapter = function (book) {
		var i, j, page;
		i = book.getPage();
		if (nextChapter) {
			page = nextChapter;
		} else {
			if (toc === undefined) {
				toc = [];
				getToc(kbook.model.currentBook.media.content.bookmarks);
				toc.sort(function (a,b) { return a-b });
			}
			for (j = 0; j < toc.length; j++) {
				if (toc[j] > i) {
					page = toc[j];
					break;
				}
			}
		}
		if (page) {
			nextChapter = prevChapter = null;
			book.doGoto(page + 1);
		} else {
			kbook.model.doBlink();
		}
	}
	
	jumpToPrevChapter = function (book) {
		var i, j, page;
		i = book.getPage();
		if (prevChapter && prevChapter < i) {
			page = prevChapter;
		} else {
			if (toc === undefined) {
				toc = [];
				getToc(kbook.model.currentBook.media.content.bookmarks);
				toc.sort(function (a,b) { return a-b });
			}
			for (j = 0; j < toc.length; j++) {
				if (toc[j] >= i) {
					if (j > 0) page = toc[j-1];
					break;
				}
			}
		}
		if (page) {
			nextChapter = prevChapter = null;
			book.doGoto(page + 1);
		} else {
			kbook.model.doBlink();
		}
	}
	
	updateIndexBook = function () {
		try {
			var c, ii, i, per, roundedPer, show, timeLeft, ppm, pages;
			switch (StatusBar.options.indexBookMode) {
				case "always":
					break;
				case "never":
					StatusBar.setBookIndex("");
					return;
			}

			// get pages
			c = this.countPages();
			ii = this.componentPages();
			i = this.getPage() + 1;
			if (!c) {
				c++;
			}
			per = (i / c) * 100;
			roundedPer = per.toFixed(1);

			show = "";

			switch(StatusBar.options.indexBookStyle) {
				case "XofY":
					show = ii + " " + L("OF") + " " + c;
					break;
				case "XofYper":
					// get percentage
					show = ii + " " + L("OF") + " " + c + " (" + roundedPer + "%) ";
					break;
				case "XdivY":
					show = ii + " / " + c;
					break;
				case "XdivYper":
					// get percentage
					show = ii + " / " + c + " (" + roundedPer + "%) ";
					break;
				case "XremYper":
					show = ii + " + " + (c - i) + " (" + roundedPer + "%) ";
					break;
				case "XremYperRem":
					show = ii + " + " + (c - i) + " (" + (100 - per).toFixed(1) + "%) ";
					break;
				case "XdivYstats0":
					show = ii + " / " + c +  " (" + getPpm(i) + ")";
					break;
				case "XdivYstats1":
					timeLeft = getTimeLeft(getPpm(i), c - i);
					show = ii + " / " + c +  " (" + timeLeft + ")";
					break;
				case "XdivYstats2":
					ppm = getPpm(i);
					timeLeft = getTimeLeft(ppm, c - i);
					show = ii + " / " + c +  " (" + ppm + " / " + timeLeft + ")";
					break;
				case "XdivYchapt":
					pages = getChapterPages(i - 1);
					if (pages !== null) {
						show = ii + " / " + c +  " (" + pages + ")";
					} else {
						show = ii + " / " + c;
					}
					break;
				default:
					show = ii + " " + L("OF") + " " + c;
					break;
			}

			StatusBar.setBookIndex(show);
		} catch (e) {
			log.error("in updateIndexBook: " + e);
		}
	};

	updateIndexMenu = function () {
		try {
			var c, i, show;
			// get pages
			c = this.countPages();
			i = this.getPage() + 1;
			if (!c) {
				c++;
			}
			show = "";

			switch (StatusBar.options.indexMenuMode) {
				case "always":
					break;
				case "not_if_only_one_page":
					if (c > 1) {
						break;
					} else {
						StatusBar.setMenuIndex("");
						return;
					}
					break;
				case "never":
					StatusBar.setMenuIndex("");
					return;
			}

			switch(StatusBar.options.indexMenuStyle) {
				case "MenuXofY":
					show = i + " " + L("OF") + " " + c;
					break;
				case "MenuXdivY":
					show = i + " / " + c;
					break;
				default:
					show = i + " " + L("OF") + " " + c;
					break;
			}

			StatusBar.setMenuIndex(show);
		} catch (e) {
			log.error("in updateIndexMenu: " + e);
		}
	};
	
	StatusBar.addWidget({
		name: "PageIndex",
		onMenuPageChanged: updateIndexMenu,
		onBookPageChanged: updateIndexBook,
		jumpToNextChapter: jumpToNextChapter,
		jumpToPrevChapter: jumpToPrevChapter,
		optionDefs: [{
			groupTitle: L("TITLE"),
			groupIcon: "LIST",
			optionDefs: [{
					name: "indexBookStyle",
					title: L("INDEX_STYLE_BOOK"),
					icon: "LIST",
					defaultValue: "XdivY",
					values: ["XofY", "XofYper", "XdivY", "XdivYper", "XremYper", "XremYperRem", "XdivYstats0", "XdivYstats1", "XdivYstats2", "XdivYchapt"],
					valueTitles: {
						XofY: "5 " + L("OF") + " 100",
						XofYper: "5 " + L("OF") + " 100 (5%)",
						XdivY: "5 / 100",
						XdivYper: "5 / 100 (5%)",
						XremYper: "5 + 95 (5%)",
						XremYperRem: "5 + 95 (95%)",
						XdivYstats0: L("VALUE_STATS0"),
						XdivYstats1: L("VALUE_STATS1"),
						XdivYstats2: L("VALUE_STATS2"),
						XdivYchapt: L("VALUE_CHAPTER")
					}
				},
				{
					name: "indexBookMode",
					title:	 L("INDEX_MODE_BOOK"),
					icon:	"LIST",
					defaultValue: "always",
					values: ["always", "never"],
					valueTitles: {
						always: L("ALWAYS_SHOWN"),
						never: L("NEVER_SHOWN")
					}
				},
				{
					name: "indexMenuStyle",
					title: L("INDEX_STYLE_MENU"),
					icon: "LIST",
					defaultValue: "MenuXdivY",
					values: ["MenuXofY", "MenuXdivY"],
					valueTitles: {
						MenuXofY: "5 " + L("OF") + " 100",
						MenuXdivY: "5 / 100"
					}
				},
				{
					name: "indexMenuMode",
					title: L("INDEX_MODE_MENU"),
					icon:	"LIST",
					defaultValue: "always",
					values: ["always", "not_if_only_one_page", "never"],
					valueTitles: {
						always: L("ALWAYS_SHOWN"),
						not_if_only_one_page: L("NOT_SHOWN_IF_SINGLE_PAGE"),
						never: L("NEVER_SHOWN")
					}
				}
			]
		}]
	});
	
	// Reset index on book change
	Core.events.subscribe(Core.events.EVENTS.BOOK_CHANGED, resetCounter);
	Core.events.subscribe(Core.events.EVENTS.BOOK_CHANGED, resetToC, true);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in StatusBar_PageIndex.js", e);
}