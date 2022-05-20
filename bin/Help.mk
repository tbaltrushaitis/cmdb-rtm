##  ------------------------------------------------------------------------  ##
##                              Show help topic                               ##
##  ------------------------------------------------------------------------  ##

include ./bin/.bash_colors

##  ------------------------------------------------------------------------  ##

.PHONY: help

help: banner
	@ echo ${Cyan}---------------------------------------------------------${NC};
	@ echo ${BBlue}Commands:${NC};
	@ echo "\t" make ${BGreen}clean${NC} "\t" - CLEAN directories and delete files;
	@ echo "\t" make ${BGreen}setup${NC} "\t" - Check for php, node and bower installations;
	@ echo "\t" make ${BGreen}build${NC} "\t" - BUILD project from sources;
	@ echo "\t" make ${BGreen}release${NC} "\t" - COMPILE project distro;
	@ echo "\t" make ${BGreen}deploy${NC} "\t" - DEPLOY compiled project to \"webroot\" directory;
	@ echo "\t" make ${White}all${NC} "\t" - Run ${BGreen}all${NC} operations for current stage [${Red}${APP_ENV}${NC}] from ${Purple}NODE_ENV${NC} file;
	@ echo "\t" make ${Yellow}rebuild${NC} "\t" - Execute [${BGreen}build, release, deploy${NC}] tasks;
	@ echo "\t" make ${Yellow}redeploy${NC} " " - Execute [${BGreen}rebuild, deploy${NC}] tasks;
	@ echo ${Cyan}---------------------------------------------------------${NC};

##  ------------------------------------------------------------------------  ##
