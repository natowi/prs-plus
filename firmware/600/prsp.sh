mount -t cramfs -o loop,ro /opt1/dict/prsp/resources.img /opt/sony/ebook/application/resources
mount -t cramfs -o loop,ro /opt1/dict/prsp/FONT.img /opt/sony/ebook/FONT
# Fix for dictionary files
cp /opt1/dict/prsp/kconfig_1.0.02.13180.xml /tmp
/bin/grep -q "CDUS125D0000101Y" /opt1/dict/LIBRARY.MBF
if [ $? == 0 ]; then
   /bin/mount --bind /tmp/kconfig_1.0.02.13180.xml /opt/sony/ebook/application/kconfig.xml
fi

# Mount modified ebookSystem.so with more key-actions
if [ -f /opt1/dict/prsp/ebookSystem.so ]
then
	cp /opt1/dict/prsp/ebookSystem.so /tmp
	mount --bind /tmp/ebookSystem.so /opt/sony/ebook/application/ebookSystem.so
fi

# Run prsp.sh shell script located in internal memory
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