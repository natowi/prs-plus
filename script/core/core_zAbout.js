// Name: About
// Description: Adds PRS+ stuff to the about screen 
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-05 kartu - Added Core.version object.
//	2010-04-17 kartu - Moved global vars into local functions context
//	2010-05-20 kartu - Removed script reference from about string
//	2010-06-27 kartu - Fixed error log message (was refering to core-hook2, instead of lang)
//	2010-06-27 kartu - Adapted for 300
//	2011-01-29 kartu - Adapted for x50
//	2011-02-27 kartu - Fixed #69 PRS+ About information missing
//	2011-11-04 kartu - Added Dutch & Turkish translation credits
//	2011-11-25 Mark Nord - Added Available Space Info for 300/505/600
//	2011-12-02 Mark Nord - Fix to show Available Space also with English-locales

try {
	// dummy function, to avoid introducing global vars
	tmp = function() {
		var prspFirmwareVersion, initAbout, initAboutX50, aboutText;
		prspFirmwareVersion = Core.io.getFileContent(System.applyEnvironment("[prspVersionFile]"), "n/a");

		Core.version = {
			firmware: prspFirmwareVersion
		};

		aboutText = 
			"Author: Mikheil Sukhiashvili aka kartu (kartu3@gmail.com) using work of: " + 
			"igorsk, boroda, amutin, obelix, pepak, kravitz, Mark Nord, Ben Chenoweth, quisvir and others.\n" +
			"Translations by:\n" +
			"     Catalan: surquizu\n" +
			"     Czech: Hobogen, milanv\n" +
			"     Dutch: DrMerry\n" +
			"     French: VICTORSJG, Duglum, ronnn, dpierron\n" +
			"     Georgian: rawerfas, kartu\n" +
			"     German: Duglum, klawong, Mark Nord\n" +			
			"     Italian: Samhain, Salvatore Ingala\n" +
			"     Portuguese: Olympio Neto\n" +
			"     Russian: SLL, boroda, amutin, happyhgy\n" +
			"     Simplified Chinese: thawk, frank0734\n" +
			"     Spanish: surquizu, VICTORSJG, Carlos\n" +
			"     Turkish: Ugur Bulgan, Abdullah Demirci \n" +
			"     Ukrainian: Bookoman\n" +
			"© GNU Lesser General Public License. \n";

			
		initAbout = function() {
			var about, data, records, record, record1, record2, prspFirmwareVersion, oldAboutGetValue;

			// About insert record for PRS+
			about = kbook.model.container.sandbox.ABOUT_GROUP.sandbox.ABOUT;
			data = about.sandbox.data;
			records = data.records;
			record1 = data.getRecord(1);
			record = new Fskin.TableRecord(data, record1);
			prspFirmwareVersion = Core.io.getFileContent(System.applyEnvironment("[prspVersionFile]"), "n/a");
			record.sandbox.text = "PRS+ " + prspFirmwareVersion + "\n" + aboutText + "#SPACE#\n\n\n";
			record.sandbox.kind = 4;
			records.splice(0, 0, record);
			about.dataChanged();

			// hook getValue() from sandbox	
			oldAboutGetValue = about.getValue;

			about.getValue = function(record, field) {
			var	iterator, volume, info, result, text, L, L2, convUnitOfStrage,
				strageInternalCapacity = 0, strageInternalFree = 0, strageMsCapacity = 0,
				strageMsFree = 0, strageSDCapacity = 0, strageSDFree = 0,
				simulateNANDPath = 'C:/', simulateSDPath = 'b:/', simulateMSPath = 'a:/';

			L = Core.lang.getLocalizer("Screenshot");
			L2 = Core.lang.getLocalizer("StatusBar_PageIndex");

			convUnitOfStrage = function (data) {
				var strUnit, strRetVal, dataBuf, nCounter, dataBufInt;
				strUnit = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];
				dataBuf = data;
				nCounter = 0;
				while (dataBuf >= 1024 && nCounter < strUnit.length) {
					dataBuf = dataBuf / 1024;
					nCounter++;
				}
				if (nCounter == 0) {
					strRetVal = (dataBuf == 0)?'0':'1.0' + 'KB';
				}
				else {
					dataBufInt = Math.floor(dataBuf);
					if (dataBuf == dataBufInt || dataBufInt >= 1000) {
						strRetVal = dataBufInt + strUnit[nCounter];
					}
					else {
					strRetVal = dataBuf.toString().substring(0, 5) + strUnit[nCounter];
					}
				}
				return strRetVal;
			}; 

			// Available Space
			try{	
				if ((record.sandbox.kind === 4) && (field == "text")) {
					iterator = new FileSystem.Iterator();
					while (volume = iterator.getNext()) {
						info = FileSystem.getVolumeInfo(volume.id);
						if (volume.path === simulateNANDPath || volume.path === '/Data/') {
							strageInternalCapacity = info.capacity;
							strageInternalFree = info.free;
						}
						if (volume.path === simulateMSPath || volume.name === 'Memory Stick') {
							strageMsCapacity = info.capacity;
							strageMsFree = info.free;
						}
						if (volume.path === simulateSDPath || volume.name === 'SD Card') {
							strageSDCapacity = info.capacity;
							strageSDFree = info.free;
						}
					}
					result = record.sandbox.text;
					text = '\n' + L('AVAILABLESPACE') + ':\n';
					text += L('INTERNAL_MEMORY') + ': ' + convUnitOfStrage(strageInternalFree) + ' ' + L2('OF') + ' ' + 
						convUnitOfStrage(strageInternalCapacity) + '\n';
					if (strageMsCapacity > 0) {
						text += L('MEMORY_STICK') + ': ' + convUnitOfStrage(strageMsFree) + ' ' + L2('OF') + ' ' + 
						convUnitOfStrage(strageMsCapacity) + '\n';
					}	
					if (strageSDCapacity > 0) {
						text += L('SD_CARD') + ': ' + convUnitOfStrage(strageSDFree) + ' ' + L2('OF') + ' ' + 
						convUnitOfStrage(strageSDCapacity);
					}
					result = result.substring(0, result.lastIndexOf("#SPACE#")) + text;
					return result;
				}
				} catch (ignore) {} 
			return oldAboutGetValue.apply(this, arguments);
			};	
		};
		
		initAboutX50 = function() {
			var old = Fskin.kbookAbout.initialize;
			Fskin.kbookAbout.initialize = function() {
				var data, record, record1, versionText;
				try {
					data = this.data;
					record1 = data.getRecord(1);
					record = new Fskin.TableRecord(data, record1);
					versionText = "PRS+ " + prspFirmwareVersion;
					record.sandbox.kind = 6;
					record.sandbox.text = aboutText;
					data.records.splice(0, 0, record);
					record = new Fskin.TableRecord(data, record1);
					record.sandbox.text =  "PRS+ " + prspFirmwareVersion;
					record.sandbox.kind = 30;
					data.records.splice(0, 0, record);
				} catch (e) {
					log.error("Fskin.kbookAbout.initialize", e);
				}
				old.apply(this, arguments);
			};
		};
		
		switch (Core.config.model) {
			case "505":
			case "300":
			case "600":
			case "900":
				initAbout();
				break;
			default:
				initAboutX50();
		}
	};
	tmp();
	tmp = undefined;
} catch (e) {
	log.error("initializing core-about", e);
}