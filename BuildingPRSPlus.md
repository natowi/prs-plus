# Instructions for versions 2.0.0+ #
  1. install [Java](http://java.com)
  1. download/install [ant](http://ant.apache.org)
  1. install [mercurial](http://mercurial.selenic.com/)
  1. checkout default repository: `hg clone https://prs-plus.googlecode.com/hg/ .` if you want the latest version or (recommended way ;)) `hg clone -r <revision> https://prs-plus.googlecode.com/hg/ .`
  1. change any files you want
  1. rename  prsp.properties.sample to  prsp.properties and edit it's content. You have to choose eBook model and give a name to your release.
  1. start ant in "build" subfolder. Installer will be created in build/dist.

# Instructions for versions earlier than 2.0.0 #
  1. install [Java](http://java.com)
  1. download/install [ant](http://ant.apache.org)
  1. install [mercurial](http://mercurial.selenic.com/)
  1. checkout "build" repository: `hg clone https://build.prs-plus.googlecode.com/hg/ .` if you want the latest version or (recommended way ;)) `hg clone -r <revision> https://build.prs-plus.googlecode.com/hg/ .`
  1. rename  prsp.properties.sample to  prsp.properties and edit it's content. Note that "tip" is synonym to "the most actual revision"
  1. start ant in folder containing build.xml

## Modifying files ##

If you want to modify some files you could:
  1. execute command: ant download
  1. modify files in tmp subfolder
  1. execute command: ant dobuild


PRS+ Installer corresponding to the versions you've selected in prsp.properties will be created in "dist" subfolder.

## prsp.properties file ##
  * FW\_VER => PRS+ firwmare revision to be extracted from repository
  * SC\_VER => PRS+ script revision to be extracted from repository
  * PRSP\_VER => just a name (actually free text) that will be given to the current installation
  * INSTALLER\_VER => installer script revision to be extracted from repository

## Notes ##

Current version of the build script works only on Windows platform.

Normally all revisions (FW\_VER, SC\_VER, INSTALLER\_VER as well as checked out build revision) should match.