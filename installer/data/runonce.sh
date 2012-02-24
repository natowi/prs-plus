# Remove PRSPInstaller
rm -R /Data/PRSPInstaller
# Run prsp.sh, if present
if [ -f /opt1/dict/prsp/prsp.sh ]
then
	. /opt1/dict/prsp/prsp.sh
fi
