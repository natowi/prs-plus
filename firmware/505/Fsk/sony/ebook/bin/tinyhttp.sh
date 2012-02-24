#!/bin/sh
# History:
# 2010-03-04 kartu - Added prsp.sh call  from SD card
# 2010-03-05 kartu - Removed prsp.sh call from SD card, added . call to Internal Memory call
# 2010-03-05 kartu - Added porkupan's (aka boroda) "is usb connected"check, if reader is not connected via USB, neither prsp.sh is called, nor LD_PRELOAD is set
# 2010-03-05 kartu - Fixed LD_PRELOAD error (the problem was wrong path: Latin1ToUTF8.so instead of Latin1toUTF8.so)
# 2010-04-24 kartu - Amended settings path (/opt0/prsp/TextEncoding.config)
# 2010-04-24 kartu - /tmp/safemode file is created, if USB is connected on startup (for JS to sniff)
# 2011-03-12 kartu - added /Data/runonce.sh support

#ldconfig
PATH="/usr/local/bin:/usr/bin:/bin:/usr/bin/X11:/usr/games:/usr/local/sony/bin:/usr/sbin"
LD_LIBRARY_PATH="/opt/sony/ebook/application:/lib:/usr/lib:/usr/local/sony/lib:/opt/sony/ebook/lib"
export PATH LD_LIBRARY_PATH

# set initial date
/bin/date 0101000007

#PRS+ call runonce script, if it could be deleted
/usr/local/sony/bin/mtdmount -t vfat -o utf8 -o shortname=winnt Data /Data
if [ -f /Data/runonce.sh ]
then
	#run runonce if it can be deleted
	mv /Data/runonce.sh /tmp && chmod oug+x /tmp/runonce.sh && /tmp/runonce.sh
fi
# Call custom script if ebook is not connected to USB
USBCONN=`/bin/cat /proc/usbtg/connect`
if [ "$USBCONN" == 0 ]
then

	# win1251 to UTF8 hack, replacing standard FskTextLatin1ToUTF8
	TEXT_ENCODING_FILE=/opt0/prsp/TextEncoding.config
	if [ -f  ${TEXT_ENCODING_FILE} ]
	then
		export LD_PRELOAD=/opt/sony/ebook/application/Latin1toUTF8.so
	fi

	# Run prsp.sh shell script located in internal mem
	if [ -f /Data/database/system/PRSPlus/prsp.sh ]
	then
		. /Data/database/system/PRSPlus/prsp.sh
	fi

	# Mount custom kconfig
	if [ -f /opt0/prsp/kconfig.xml ]
	then
		cp /opt0/prsp/kconfig.xml /tmp
		mount --bind /tmp/kconfig.xml /opt/sony/ebook/application/kconfig.xml
	fi
else
	touch /tmp/safemode	
fi
/bin/umount /Data

#start kbook application
/opt/sony/ebook/application/tinyhttp
if [ $? == 0 ]; then
	if [ -r /tmp/exitcode ]; then
		CODE=`/bin/cat /tmp/exitcode`
		/bin/rm /tmp/exitcode
		if [ $CODE == 3 ]; then
			NUM=`grep Data /proc/mtd | awk -F: '{print $1}' | awk -Fd '{print$2}'`
			/usr/local/sony/bin/mkdosfs /dev/mtdblock$NUM
			/bin/grep Data /etc/mtab > /dev/null
			if [ $? == 0 ]; then
				/sbin/reboot
			else
				exec /opt/sony/ebook/bin/tinyhttp.sh
			fi
		fi
	fi
	/sbin/shutdown -h now
else
	/sbin/reboot
fi
