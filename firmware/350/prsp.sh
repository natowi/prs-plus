mount -t cramfs -o loop,ro /opt1/dict/prsp/resources.img /opt/sony/ebook/application/resources
# Mount custom device config
cp /opt1/dict/prsp/deviceConfig.xml /tmp/deviceConfig.xml && mount --bind /tmp/deviceConfig.xml /opt/sony/ebook/application/deviceConfig.xml
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