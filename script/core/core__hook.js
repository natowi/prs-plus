// Name: Hook
// Description: Hooking related methods.
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-17 kartu - Moved global vars into local functions context
//	2010-07-09 kartu - Renamed file so that it is loaded before other modules

try {
	// dummy function, to avoid introducing global vars
	tmp = function() {
		Core.hook = {};
		
		// Constants
		var CORE_HOOK_BEFORE = 0;
		var CORE_HOOK_INSTEAD = 1;
		var CORE_HOOK_AFTER = 2;
		
		var core_hook_doHook = function (where, what, oldFunc, newFunc, hookType, tag) {
			if(typeof where[what] !== "function" && hookType !== CORE_HOOK_INSTEAD) {
				log.error("cannot hook before/after non-existing function: " + what);
				return;
			}
			switch(hookType) {
			case CORE_HOOK_BEFORE:
				where[what] = function() {
					try {
						newFunc.call(this, arguments, oldFunc, tag);
					} catch(ignore) {
					}
					oldFunc.apply(this, arguments);
				};
				break;
			case CORE_HOOK_AFTER:
				where[what] = function() {
					oldFunc.apply(this, arguments);
					try {
						newFunc.call(this, arguments, oldFunc, tag);
					} catch (ignore) {
					}
				};
				break;
			case CORE_HOOK_INSTEAD:
				where[what] = function() {
					newFunc.call(this, arguments, oldFunc, tag);
				};
				break;
			default:
				log.error("unknown hook type: " + hookType);
			}
			
		};
		Core.hook.hook = function(where, what, newFunction, tag) {
			core_hook_doHook(where, what, where[what], newFunction, CORE_HOOK_INSTEAD, tag);
		};
		Core.hook.hookBefore = function(where, what, newFunction, tag) {
			core_hook_doHook(where, what, where[what], newFunction, CORE_HOOK_BEFORE, tag);
		};
		Core.hook.hookAfter = function(where, what, newFunction, tag) {
			core_hook_doHook(where, what, where[what], newFunction, CORE_HOOK_AFTER, tag);
		};
	};
	tmp();
} catch (e) {
	log.error("initializing core-hook", e);
}
