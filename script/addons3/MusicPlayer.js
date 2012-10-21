// Name: MusicPlayer
// Description: Contains options related to the music player functionality
// 
// Author: Ben Chenoweth
//
// History:
//	2012-02-09 Ben Chenoweth - Initial version

tmp = function() {
	var L, log;
	log = Core.log.getLogger('MusicPlayer');
	
	if (Core.config.compat.hasVolumeButtons) {
		L = Core.lang.getLocalizer('MusicPlayer');
			
		// VOLUME CONTROL DOWN
		kbook.model.doQuiet = function () {
			var delta;
			delta = Number(MusicPlayer.options.VolumeIncrement)*-1;
			try {
				// only on x50
				this.clearTestModeKeyCount();
			} catch(ignore) {}
			this.setVolumeBy(delta);
			this.doBlinkVolume();
		};
		
		// VOLUME CONTROL UP
		kbook.model.doLoud = function () {
			var delta;
			delta = Number(MusicPlayer.options.VolumeIncrement);
			try {
				// only on x50
				this.clearTestModeKeyCount();
			} catch(ignore) {}
			this.setVolumeBy(delta);
			this.doBlinkVolume();
		};
		
		var MusicPlayer = {
			name: 'MusicPlayer',
			title: L('TITLE'),
			icon: 'AUDIO_ALT',
			optionDefs: [
				{
					name: 'VolumeIncrement',
					title: L("VOLUME_INCREMENT"),
					icon: 'ABOUT',
					defaultValue: '10',
					values: ['1', '2', '5', '10', '20']
				}
			]
		};

		Core.addAddon(MusicPlayer);
	}
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error('in MusicPlayer.js', e);
}
