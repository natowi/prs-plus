// Name: Events
// Description: events handling
// Author: kartu, kravitz
//
// History:
//	2010-04-29 kravitz - Initial version
//	2010-05-03 kravitz - Renamed ReadingList to BookHistory
//	2010-05-04 kravitz - Fixed init()
//	2010-05-24 kravitz - Removed BookHistory.doDeleteBook handler
//	2010-05-20 kartu - Adapted for 300
//	2010-09-28 kartu - Adapted for 600
//	2011-01-28 kartu - Adapted for x50
//	2011-12-20 quisvir - Added KEY_EVENT and TOUCH_EVENT
//	2012-02-11 quisvir - Added SHUTDOWN

tmp = function() {
	var handlers, callAll, hook, getHandler,
		SHUTDOWN, TERMINATE, SLEEP, RESUME, MENU_PAGE_CHANGED, BOOK_PAGE_CHANGED, BOOK_CHANGED, BOOK_DELETED, KEY_EVENT, TOUCH_EVENT;
	SHUTDOWN = 0;
	TERMINATE = 1;
	SLEEP = 2;
	RESUME = 3;
	MENU_PAGE_CHANGED = 101;
	BOOK_PAGE_CHANGED = 201;
	BOOK_CHANGED = 202;
	BOOK_DELETED = 203;
	KEY_EVENT = 301;
	TOUCH_EVENT = 302;
	handlers = {};
	
	// Calls each element of function array
	callAll = Core.utils.callAll;
	
	// Hooks given event, dummy argument is not an actuall argument, it  is used for storing reference
	hook = function (eventKey, dummyOldFunc, dummyHandler) {
		var object, funcName, sandbox;
		switch (eventKey) {
			case TERMINATE:
				object = kbook.model;
				funcName = "terminating";
				break;
			case SHUTDOWN:
				object = kbook.model;
				funcName = "doDeviceShutdown";
				break;
			case SLEEP:
				object = kbook.model;
				funcName = "suspend";
				break;
			case RESUME:
				object = kbook.model;
				funcName = "resume";
				break;
			case MENU_PAGE_CHANGED:
				// FIXME model sniffing
				sandbox = kbook.model.container.sandbox;
				if (sandbox.MENU_GROUP) {
					object = sandbox.MENU_GROUP.sandbox.MENU;
				} else if (sandbox.MENU_DETAILS_GROUP) {
					object = sandbox.MENU_DETAILS_GROUP.sandbox.MENU;
				}
				funcName = "pageChanged";
				break;
			case BOOK_PAGE_CHANGED:
				// FIXME model sniffing
				sandbox =  kbook.model.container.sandbox;
				if (sandbox.PAGE_GROUP.sandbox.PAGE_SUBGROUP) {
					object =sandbox.PAGE_GROUP.sandbox.PAGE_SUBGROUP.sandbox.PAGE;
				} else {
					object = sandbox.PAGE_GROUP.sandbox.PAGE;
				}
				
				funcName = "pageChanged";
				break;
			case BOOK_CHANGED:
				object = kbook.model;
				funcName = "onChangeBook";
				break;
			case BOOK_DELETED:
				object = kbook.model;
				funcName = "doDeleteBook";
				break;
			case KEY_EVENT:
				object = Fskin.device;
				funcName = "handleEvent";
				break;
			case TOUCH_EVENT:
				// Model sniffing
				if (Core.config.compat.hasNumericButtons) return;
				object = BookUtil.gestureBase.tracker.gesture;
				funcName = "onStart";
				break;
			default:
				log.error("Cannot hook unknown event: " + eventKey);
		}
		// dummy is just a closure specific variable, that holds old function
		dummyOldFunc = object[funcName];
		dummyHandler = handlers[eventKey];
		if (typeof dummyOldFunc === "function") {
			object[funcName] = function() {
				callAll(dummyHandler.before, this, arguments);
				try {
					// call original function
					dummyOldFunc.apply(this, arguments);
				} catch (e) {
					log.error("Error calling original " + funcName + " for event " + eventKey, e); 
					log.error("function name is " + funcName);
				}
				callAll(dummyHandler.after, this, arguments);
			};
		} else {
			object[funcName] = function() {
				callAll(dummyHandler.before, this, arguments);
				callAll(dummyHandler.after, this, arguments);
			};
		}
	};
	
	/** Returns handler structure (containing 2 function arrays, before/after)
	 *
	 * @param eventKey - one of the Core.event.EVENTS constants
	 * @param dontCreate - if set to true, new handler won't be created if it doesn't exist
	 * @returns handler, or undefined, if dontCreate is set to true and handler wasn't found 
	*/
	getHandler = function (eventKey, dontCreate) {
		if (handlers[eventKey] === undefined && dontCreate !== true) {
			handlers[eventKey] = {
				before: [],
				after: []
			};
			hook(eventKey);
		}
		return handlers[eventKey];
	};
	
	Core.events = {
		EVENTS: {
			/** Device shutting down */		
			SHUTDOWN: SHUTDOWN,
			/** App going down (because of connected USB or shutting down) */
			TERMINATE: TERMINATE,
			/** Sleeping (user pulled off switch) */
			SLEEP: SLEEP,
			/** Resume, happens after sleep  (user pulled off switch) */
			RESUME: RESUME,
			/** Page changed in menu (MENU UI group is used as "this") */
			MENU_PAGE_CHANGED: MENU_PAGE_CHANGED,
			/** Page changed when reading book (MENU UI group is used as "this") */
			BOOK_PAGE_CHANGED: BOOK_PAGE_CHANGED,
			/** Book was opened, book node is passed as argument */
			BOOK_CHANGED: BOOK_CHANGED,
			/** Book was deleted, kbook.model.currentBook is the deleted book's node */
			BOOK_DELETED: BOOK_DELETED,
			/** Key was pressed */
			KEY_EVENT: KEY_EVENT,
			/** Successful touch action (note: only triggered BEFORE action) */
			TOUCH_EVENT: TOUCH_EVENT
		},
		subscribe: function (eventKey, func, before) {
			var handler = getHandler(eventKey);
			if (before) {
				handler.before.push(func);
			} else {
				handler.after.push(func);
			}
		},
		unsubscribe: function (eventKey, func, before) {
			var handler, a, i, n;
			handler = getHandler(eventKey, true);
			if (handler === undefined) {
				return;
			}
			a = before ? handler.before : handler.after;
			for (i = 0, n = a.length; i < n; i++) {
				if (a[i] === func) {
					a.splice(i, 1);
				}
			}
		}
	};
};

try {
	tmp();
	tmp = undefined;
} catch (e) {
	log.error("initializing core-events", e);
}
