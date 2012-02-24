// Description:  Install script 
// Author: kartu
//
// History:
//	2010-03-02 kartu - Added code to delete temporary image files after flashing
//	2010-03-02 kartu - Added custom copy routine, fixed script copying error
//	2010-03-02 kartu - Fixed source file copy problem
//	2010-03-04 kartu - Removed "prsp.sh.russian-sample", "prsp.sh.chinese-sample" from the file list to copy
//	2010-03-04 kartu - Added sync command to flasher
//	2010-04-27 kartu - Added "system is up to date" screen
//					    Removed script related code (as there is no "PRS+ script" any more)
//					    Removed "enter firmware upgrade mode" item
//					    Added move settings action (settings folder was changed to /opt0/prsp)
//	2010-09-03 kartu - Added support for 300
//	2010-09-07 kartu - Changed 1.1.00.18160 to 1.0.00.18160
//			disabled flashing root in "flash anyway"
//	2011-03-12 kartu - Added support for sample files / automatic removal of PRSPInstaller

var SUPPORTED = {
		"505": {"1.1.00.18040": true},
		"300": {"1.0.00.24180": true, "1.0.00.18160": true}
};
var MAX_FLASH_SIZE = {
		"505": {"Fsk": 8650752, "Rootfs": 9961472},
		"300": {"Fsk": 8650752, "Rootfs": 9961472},
		"500": {"Fsk": 7340032}
};

var FIRMWARE_PATH = target.path + "firmware/";
var TOOLS_PATH = target.path + "tools"; // trailing / is ommited on purpose
var DATA_PATH = target.path + "data";
var OLD_SETTINGS_FOLDER = "/Data/database/system/PRSPlus/settings";
var OLD_ADDONS_FOLDER = "/Data/database/system/PRSPlus/addons";
var OLD_FILES = ["/Data/database/system/PRSPlus/prsp.ver", "/Data/database/system/PRSPlus/PRSPlus.js", "/Data/database/system/PRSPlus/user.config.sample"];
var NEW_SETTINGS_FOLDER = "/opt0/prsp";

var AUTORUN = target.AUTORUN_GROUP.AUTORUN;
var INFO = AUTORUN.INFO;
var VERSIONS = AUTORUN.VERSIONS;
var LOG = target.AUTORUN_GROUP.LOG;
var WORKING = AUTORUN.WORKING;

var CMD_REMOUNT = "/bin/mount -o remount -t tmpfs -o size=32m /dev/shm /tmp >/tmp/script.log 2>&1";

var versions = {}; // object that contains firmware/prs+ script/etc versions
versions.ebook = {};
versions.installer = {};

//	Finds filename that is not occupied, by appending .<number> to the <path>
var getUnusedFilename = target.getUnusedFilename;

// Prints a message in "WORKING" panel.
//
var print = function (msg) {
	WORKING.print(msg);
};
var println = function (msg) {
	WORKING.println(msg);
};

var copyFile = function (from, to) {
	if (FileSystem.getFileInfo(to)) {
		FileSystem.deleteFile(to);
	}
	//FileSystem.copyFile(from, to);
	// Copy/paste from FileSystem.copyFile, slightly modified (removed progress)
	var s, d, c, len, totalLen, copied;
	try {
		s = new Stream.File(from, 2);
		d = new Stream.File(to, 3);
		len = 128 * 1024;
		copied = 0;
		totalLen = s.bytesAvailable;
		c = new Chunk(len);
		while (s.readChunk(len, c)) {
			copied += c.length;
			d.writeChunk(c);
		}
		if (copied !== totalLen) {
			throw "Error copying " + from + " to " + to;
		}
	} finally {
		if (c) {
			c.free();
		}
		if (s) {
			s.close();
		}
		if (d) {
			d.close();
		}
	}
};

// Localizer
var L = function(key) {
	return target.localize(key);
};

// Returns size of the file in bytes
//
var getFileSize = function (path) {
	var stream = new Stream.File(path);
	try {
		return stream.bytesAvailable;
	} finally {
		stream.close();
	}
};

// Returns content of the file <path> as a string.
// If any kind of error happens (file doesn't exist, or is not readable etc) returns <defVal>
//
var getFileContent = function (path, defVal) {
	var stream;
	try {
		stream = new Stream.File(path);
		return stream.toString();
	} catch (whatever) {
	} finally {
		try {
			stream.close();
		} catch (ignore) {
		}
	}
	return defVal;
};

// Sets content of the file <path> to <content>. If file exists it will be overwritten.
//
var setFileContent = function (path, content) {
	var stream;
	try {
		if (FileSystem.getFileInfo(path)) {
			FileSystem.deleteFile(path);
		}
		stream = new Stream.File(path, 1);
		stream.writeString(content);
		stream.flush();
	} catch (e) {
		throw "in setFileContent: " + e;
	} finally {
		try {
			stream.close();
		} catch (ignore) {
		}
	}
};

// Should not be called directly, use "exec" instead
//
var doExec = function(cmd) {
	var RESULT_FILE = "/tmp/__result__";
	try {
		FileSystem.deleteFile(RESULT_FILE);
	} catch (ignore) {
	}

	// Create script file
	var header = "#!/bin/sh\n"+
	"PATH=\"/usr/local/bin:/usr/bin:/sbin:/bin:/usr/bin/X11:/usr/games:/usr/local/sony/bin:/usr/sbin\"\n" +
	"LD_LIBRARY_PATH=\"/opt/sony/ebook/application:/lib:/usr/lib:/usr/local/sony/lib:/opt/sony/ebook/lib\"\n" +
	"export PATH LD_LIBRARY_PATH\n";
	setFileContent("/tmp/script.sh", header + cmd + "\necho -n $?>" + RESULT_FILE);

	// Call script
	var myvm = FskInclude.load("/tmp/prspVM.xml");
	try {
		myvm.load();
	} catch(e) {
		throw "vm load error: " + e;
	}

	var result = getFileContent(RESULT_FILE, "222");
	if(result !== "0") {
		throw "Failed to execute " + cmd + "\n" + result;
	}
};

// a function that copies libfsk.so to /tmp
var initTools;

// Executes a shell command <cmd>, throws an exception, if <cmd> returns result other than 0. (i.e. fails)
//
var exec = function(cmd) {
	var where;
	try {
		where = "initTools";
		initTools();
		where = "doExec";
		doExec(cmd);
	} catch (e) {
		throw "Error in " + where + ": " + e;
	}
};

// Deletes folder with all its content (including subfolders)
//
var deleteFolder = function(path) {
	if(!FileSystem.getFileInfo(path)) {
		// nothing to delete
		return;
	}

	var iterator = new FileSystem.Iterator(path);
	var item;
	while (item = iterator.getNext()) {
		if(item.type == "directory") {
			deleteFolder(path + item.path + "/");
		} else {
			FileSystem.deleteFile(path + item.path);
		}
	}
	FileSystem.deleteDirectory(path);
};

// Copies folder with all files and subfolders
//
var copyFolder = function(from, to, skipIfExist) {
	try {
		var queue, toTmp;
		queue = ["/"];
		while (queue.length > 0) {
			var dirPath = queue.pop();
			FileSystem.ensureDirectory(to + dirPath);
			var iterator = new FileSystem.Iterator(from + dirPath);
			var item;
			while (item = iterator.getNext()) {
				if(item.type == "directory") {
					queue.push(dirPath + item.path + "/");
				} else {
					try {
						toTmp = to + dirPath + item.path;
						if (!skipIfExist || (skipIfExist && !(FileSystem.getFileInfo(toTmp))) ) {
							copyFile(from + dirPath + item.path, toTmp);
						}
					} catch (e2) {
						println("Error copying from " + (from + dirPath + item.path) + " to " + (to + dirPath + item.path));
						throw e2;
					}
				}
			}
		}
	} catch (e) {
		throw e + " when copying folder \n from " + from + "\n to " + to;
	}
};

var toolsInitialized = false;
initTools = function() {
	var when = "";
	if (!toolsInitialized) {
		try {
			print(L("COPYING_TOOLS") );
			when = "copying libfskLoad.so";
			copyFile(TOOLS_PATH + "/libfskLoad.so", "/tmp/libfskLoad.so");
			when = "copying prspVM.xml";
			copyFile(TOOLS_PATH + "/prspVM.xml", "/tmp/prspVM.xml");
			when = "remounting /tmp";
			doExec(CMD_REMOUNT);
			when = "copying tools to remounted /tmp";
			copyFolder(TOOLS_PATH, "/tmp");
			toolsInitialized = true;
			println("OK");
		} catch (e) {
			throw e + " when  " + when;
		}
	}
};

// Flashes /tmp/<type>.img to whatever the <type> is. Checks md5 checksum (if supplied <checksum> is not an empty string).
// Also checks if the image is not bigger than allowed.
//
var flashImage = function(checksum, type) {
	if (typeof type === "undefined") {
		throw "Cannot flash image of unknown type";
	}
	var path = "/tmp/" + type + ".img";
	if (checksum !== "") {
		print("\n " + L("VERIFYING_CHECKSUM"));
		exec("/usr/bin/md5sum " + path + ">/tmp/md5.txt");
		var hash = getFileContent("/tmp/md5.txt");
		if (hash.length < 32 || hash.substring(0, 32) !== checksum) {
			throw L("CHECKSUM_MISMATCH") + checksum + "/" + hash;
		}
		print(" OK\n " + L("CHECKING_IMAGE_SIZE"));
		var max = versions.ebook.maxFlashSize[type];
		if (typeof max === "undefined") {
			throw L("ERR_UNKNOWN_IMAGE_SIZE") + type;
		}
		var size = getFileSize(path);
		if (max < size) {
			throw L("ERR_IMAGE_TOO_BIG") + max + "/" + size + "/" + type;
		}
		print("OK\n " + L("ERASING_PARTITION") + " " +  type + " ...");
		var nblsdm = "/usr/local/sony/bin/nblsdm";
		// $nblsdm delete Fsk
		exec(nblsdm + " delete " + type);
		print("OK\n " + L("FLASHING_PARTITION") + " " + type + "...");
		// $nblsdm create -d 1 -l $OPT_IMG_SIZE -i $W_DIR/new_opt.img Fsk
		exec(nblsdm + " create -d 1 -l " + size + " -i " + path + " " + type);
		print("OK\n " + L("CHECKING_PARTITION"));
		// $nblsdm cmp -i $W_DIR/new_opt.img Fsk
		exec(nblsdm + " cmp -i " + path + " " + type);

		// Copy data folder content (sample files etc)
		try {
			copyFolder(DATA_PATH, "/Data", true);
		} catch (ignore) {
		}
		
		// Delete flashed image
		try {
			FileSystem.deleteFile(path);
		} catch (ignore1) {
		}

		exec("sync");
		exec("sync");
		exec("sync");
		exec("sync");
		
		println("OK");
	} else {
		println(L("WARNING_SKIPPING_CHECKSUM"));
	}

};

var assertFileExists = function(filePath) {
	if(! FileSystem.getFileInfo(filePath)) {
		throw L("ERR_FILE_DOESNT_EXIST") + filePath;
	}
};

var getEBookModel = function() {
	var model = getFileContent("/opt1/info/model", null);
	try {
		if(model !== null) {
			return model.substring(4,7);
		}
	} catch (whatever) {
	}
	return "n/a";
};

// Initializes array of versions as well as labels on "VERSIONS" panel
//
var init = function() {
	try {
		versions.ebook.model = getEBookModel();
		versions.ebook.maxFlashSize = MAX_FLASH_SIZE[versions.ebook.model];
		versions.ebook.firmware = target.getVariable("FIRMWARE_VERSION");
		
		// new location
		versions.ebook.prspFirmware = getFileContent("/opt/sony/ebook/application/resources/prsp/prspfw.ver", "n/a");
		if (versions.ebook.prspFirmware === "n/a") {
			// if not in new, try old location
			versions.ebook.prspFirmware = getFileContent("/opt/prspfw.ver", "n/a");
		}
		
		versions.installer.firmware = getFileContent(FIRMWARE_PATH + versions.ebook.model + "/fw.ver", "n/a");
		versions.installer.prspFirmware = "@@@"; // replaced by build script
		
		versions.firmwareInstallNeeded = (versions.ebook.prspFirmware !== versions.installer.prspFirmware);
		
		VERSIONS.ebookModel.setValue(versions.ebook.model);

		VERSIONS.installerFirmware.setValue(versions.installer.firmware);
		VERSIONS.installerPRSPFirmware.setValue(versions.installer.prspFirmware);

		VERSIONS.ebookFirmware.setValue(versions.ebook.firmware);
		VERSIONS.ebookPRSPFirmware.setValue(versions.ebook.prspFirmware);

		// Choose initial screen to display
		var currentView;
		if (!SUPPORTED[versions.ebook.model]) {
			currentView = AUTORUN.UNSUPPORTED_MODEL;
		} else if (!SUPPORTED[versions.ebook.model][versions.ebook.firmware]) {
			currentView = AUTORUN.UNSUPPORTED_FIRMWARE;
		} else {
			if (versions.firmwareInstallNeeded) {
				currentView = AUTORUN.OK;
			} else {
				currentView = AUTORUN.SYSTEM_UP_TO_DATE;
			}
		}
		target.currentView = currentView;
		currentView.show(true);
	} catch (e) {
		target.log("error in init(): " + e);
	}
};


// Shows confirmation dialog so that user has option to either continue or cancel the action
//
var confirm = function(from, callback, message, action) {
	AUTORUN.CONFIRM.callback = callback;
	AUTORUN.CONFIRM.action = action;
	AUTORUN.CONFIRM.confirmMessage.setValue(message);
	target.go(from, "CONFIRM");
};

// Shows "Working" panel
var showWorking = function(from) {
	from.show(false);
	AUTORUN.WORKING.parentView = from.parentView;
	target.currentView = AUTORUN.WORKING;
	target.currentView.show(true);
	target.AUTORUN_GROUP.status_.show(false);
};

//-----------------------------------------------------------------------------------------
// Actions (most actions have a corresponding menu item)
//-----------------------------------------------------------------------------------------
target.actions = {};
// "Performs" an action, taking care of error handling
var doPerform = function(action, from) {
	showWorking(from);
	try {
		WORKING.reset();
		target.actions[action].perform();
		WORKING.DONT_POWEROFF.show(false);
		WORKING.SUCCESS.show(true);
	} catch (e) {
		println("\n !!!ERROR!!! " + e);
		WORKING.DONT_POWEROFF.show(false);
		WORKING.FAILED.show(true);
		target.AUTORUN_GROUP.status_.show(true);
	}
};

target.actions.perform = function(action, from) {
	confirm(from, doPerform, L(this[action].confirmMessage), action);
};

target.actions.flashFsk = {
	confirmMessage : "CONFIRM_FLASH_FSK",
	perform: function() {
		initTools();
		print(L("COPYING_FLASH_IMAGE"));
		var path = FIRMWARE_PATH + versions.ebook.model + "/Fsk.img";
		var md5path = path + ".md5";
		copyFile(path, "/tmp/Fsk.img");
		print("OK\n " + L("FLASHING_FSK"));
		flashImage(getFileContent(md5path, "--error--"), "Fsk");
		println("OK");
	}
};

// Moves settings from the old version (if any)
target.actions.moveOldSettings = {
	confirmMessage : "",
	perform : function() {
		var i, n;
		initTools();

		if (FileSystem.getFileInfo(OLD_SETTINGS_FOLDER + "/")) {
			FileSystem.ensureDirectory(NEW_SETTINGS_FOLDER);
			copyFolder(OLD_SETTINGS_FOLDER, NEW_SETTINGS_FOLDER);
			deleteFolder(OLD_SETTINGS_FOLDER + "/");
			println("OK");
		}
		// Delete old files		
		deleteFolder(OLD_ADDONS_FOLDER + "/");
		for (i = 0, n = OLD_FILES; i < n; i++) {
			try {
				FileSystem.deleteFile(OLD_FILES[i]);
			} catch (ignore) {
			}
		}

		exec("sync");
		exec("sync");
		exec("sync");
		exec("sync");
	}
};

target.actions.installOrUpgrade = {
	confirmMessage : "CONFIRM_INSTALL",
	perform: function() {
		if (versions.firmwareInstallNeeded) {
			 target.actions.flashFsk.perform();
			target.actions.moveOldSettings.perform();
			target.actions.reboot.perform();
		} else {
			println(L("FIRMWARE_UP_TO_DATE"));
		}
	}
};

target.actions.reboot = {
	confirmMessage : "CONFIRM_REBOOT",
	perform : function() {
		initTools();
		print(L("REBOOTING"));
		exec("/sbin/reboot");
	}
};

target.actions.backup = {
	confirmMessage : "CONFIRM_BACKUP_ALL",
	perform : function() {
		initTools();
		var fskPath = getUnusedFilename("/Data/" + versions.ebook.firmware + ".fsk");
		var rootPath = getUnusedFilename("/Data/" + versions.ebook.firmware + ".root");
		var root2Path = getUnusedFilename("/Data/" + versions.ebook.firmware + ".root2");
		var bootPath = getUnusedFilename("/Data/" + versions.ebook.firmware + ".boot");

		print(L("SAVING") + " BootImg...");
		exec("cat /dev/mtdblock9 > " + bootPath);

		print("OK Rootfs2...");
		exec("cat /dev/mtdblock13 > " + root2Path);

		print("OK Rootfs...");
		exec("cat /dev/mtdblock14 > " + rootPath);

		print("OK Fsk...");
		exec("cat /dev/mtdblock15 > " + fskPath);

		println("OK \n " + L("ALL_PARTITIONS_SAVED"));
	}
};

target.actions.flashRoot = {
	confirmMessage : "CONFIRM_FLASH_ROOT",
	perform : function() {
		initTools();
		print(L("COPYING_IMAGE"));
		var path = FIRMWARE_PATH + versions.ebook.model + "/" + versions.installer.firmware + ".root";
		var md5path = path + ".md5";
		copyFile(path, "/tmp/Rootfs.img");
		print("OK");
		flashImage(getFileContent(md5path, "--error--"), "Rootfs");
	}
};

target.actions.installAnyway = {
	confirmMessage : "CONFIRM_OVERWRITE",
	perform : function() {
		target.actions.backup.perform();
		target.actions.copyScript.perform();
		WORKING.reset();
		target.actions.flashFsk.perform();
		WORKING.reset();
		// kartu: removed it for a while, was only causing problems
		//target.actions.flashRoot.perform();
		target.actions.reboot.perform();
	}
};

init();