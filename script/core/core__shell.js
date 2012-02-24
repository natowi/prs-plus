// Name: Shell
// Description: Linux shell related methods
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-17 kartu - Moved global vars into local functions context
//	2010-07-09 kartu - Renamed file so that it is loaded before other modules
//	2010-11-21 kartu - Moved libfsk to resources/prsp subfolder
//	2011-04-25 kartu - Updated mount/umount to support x50/600 models
//	2011-10-09 kartu - 600: Fixed #197 "SD/MS card via mount" doesn't handle non-latin characters

try {
	// dummy function, to avoid introducing global vars
	tmp = function() {
		Core.shell = {};
		
		// In 505 SD/MS start with r5c807 in 600/650/950 (probably others) sdms
		var CARD_DEVICE = "/dev/sdmscard/";
		switch (Core.config.model) {
			case "505":
				CARD_DEVICE += "r5c807";
				break;
			default:
				CARD_DEVICE += "sdms";
				break;
		}
		
		// CONSTANTS
		var MOUNT_PATH = "/opt/mnt";
		var MS_MOUNT_PATH = MOUNT_PATH + "/ms";
		var SD_MOUNT_PATH = MOUNT_PATH + "/sd";
		var CMD_MOUNT_SD = "mount -t vfat -o shortname=mixed,utf8 " + CARD_DEVICE + "a1 " + SD_MOUNT_PATH;
		var CMD_MOUNT_MS = "mount -t vfat -o shortname=mixed,utf8 " + CARD_DEVICE + "b1 " + MS_MOUNT_PATH;
		var CMD_UMOUNT_SD = "umount " + SD_MOUNT_PATH;
		var CMD_UMOUNT_MS = "umount " + MS_MOUNT_PATH;
		var SCRIPT_HEADER = "#!/bin/sh\n"+
			"PATH=\"/usr/local/bin:/usr/bin:/sbin:/bin:/usr/bin/X11:/usr/games:/usr/local/sony/bin:/usr/sbin\"\n" +
			"LD_LIBRARY_PATH=\"/opt/sony/ebook/application:/lib:/usr/lib:/usr/local/sony/lib:/opt/sony/ebook/lib\"\n" +
			"export PATH LD_LIBRARY_PATH\n";
		var VM_FILE = "/opt/sony/ebook/application/resources/prsp/prspVM.xml";	
		var RESULT_FILE = "/tmp/__result__";
		
		Core.shell.SD = 0;
		Core.shell.MS = 1;
		Core.shell.MOUNT_PATH = MOUNT_PATH;
		Core.shell.MS_MOUNT_PATH = MS_MOUNT_PATH;
		Core.shell.SD_MOUNT_PATH = SD_MOUNT_PATH;
		
		
		// Executes shell command
		// Arguments:
		//	cmd - linux command to execute
		// Throws exception, if command results with result other than zero
		Core.shell.exec = function (cmd) {
			try {
				FileSystem.deleteFile(RESULT_FILE);
			} catch (ignore) {
			}
		
			// Create script file
			Core.io.setFileContent("/tmp/script.sh", SCRIPT_HEADER + cmd + "\necho -n $?>" + RESULT_FILE);
		
			// Call script
			var myvm = FskInclude.load(VM_FILE);
			try {
				myvm.load();
			} catch(e) {
				throw "vm load error: " + e;
			}
		
			var result = Core.io.getFileContent(RESULT_FILE, "222");
			if(result !== "0") {
				throw "Failed to execute " + cmd + ", exit code: " + result;
			}
		};
		
		// Mounts SD or MS card
		// Arguments:
		//	card - MS or SD
		Core.shell.mount = function (card) {
			if (card === this.MS) {
				log.trace("mounting MS");
				this.exec(CMD_MOUNT_MS);
			} else if (card === this.SD) {
				log.trace("mounting SD");
				this.exec(CMD_MOUNT_SD);
			}
		};
		
		// Mounts SD or MS card
		// Arguments:
		//	card - MS or SD
		Core.shell.umount = function (card) {
			if (card === this.MS) {
				log.trace("Umounting MS");
				this.exec(CMD_UMOUNT_MS);
			} else if (card === this.SD) {
				log.trace("Umounting SD");
				this.exec(CMD_UMOUNT_SD);
			}
		};
	};
	tmp();
} catch (e) {
	log.error("initializing core-shell", e);
}
