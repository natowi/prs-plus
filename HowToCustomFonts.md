### What you should know, before you start ###
There are 2 different sets of font in Sony PRS:

  1. Used for LRF, PDF, TXT (RTF, but I wouldn't use RTF unless I'm forced to). TXT files should be UTF-8 encoded.
> 2) Used by EPUB viewer

Standard fonts DO NOT CONTAIN ANY ALPHABETS besides western european in standard firmware (PRS+ comes with Cyrillic, Georgian, Greek alphabets, in addition to standard)

### To change fonts for LRF/TXT you need ###
  * Fonts with glyphs of your interest, named (font names are not the same as file names!!!) as [here](http://www.mobileread.com/forums/showthread.php?t=28447)
  * simple shell script file that will replace standard fonts using linux's "mount --bind" command, say if your fonts are in /fonts in the root memory, the command will look like (what's "READER E:" for you, is /Data for the system, don't be confused):
`mount --bind /Data/fonts /opt/sony/ebook/FONT`

put it into "/database/system/PRSPlus/prsp.sh" file (create missing directories) or grab existing file [here](http://wiki.prs-plus.googlecode.com/hg/resources/prsp.sh).

#### Remark for PRS-600 and x50 model: ####
Original font-folder holds a symlink to "SWNMTeb.ttc"
http://www.mobileread.com/forums/showpost.php?p=1808148&postcount=7

With this file/link missing dictionary will not show any result.

Solution due to Analogus post at MR http://www.mobileread.com/forums/showpost.php?p=1810185&postcount=18

A way to obtain mentioned file is described in post #9 of above MR thread

### To change EPUB fonts ###
  * Put [this file](http://prs-plus.googlecode.com/hg/installer/data/database/system/PRSPlus/epub/FontsAsInLRF.css) into /database/system/PRSPlus/epub folder on the reader. (create missing directories, if needed, path is CASE SENSITIVE (i.e. "prsplus" is not the same as "PRSPlus"). UPDATE starting from 2.0.1 version, this file is automatically installed.
  * Switch to "FontsAsInLRF" via settings => PRS+ Settings => Book Viewer Settings => EPUB Style (configuration path might be a bit different on different models)