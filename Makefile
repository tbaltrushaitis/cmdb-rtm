##  ------------------------------------------------------------------------  ##
$(shell set -x)

# Since we rely on paths relative to the makefile location,
# abort if make isn't being run from there.
$(if $(findstring /,$(MAKEFILE_LIST)),$(error Please only invoke this makefile from the directory it resides in))
THIS_FILE := $(lastword $(MAKEFILE_LIST))

##  ------------------------------------------------------------------------  ##
##                                Build Project                               ##
##  ------------------------------------------------------------------------  ##
##  Suppress display of executed commands
$(VERBOSE).SILENT:

.EXPORT_ALL_VARIABLES:
.IGNORE:
.ONESHELL:

##  ========================================================================  ##
# Set environment variables for the build
##  ========================================================================  ##

# The shell in which to execute make rules
SHELL = /bin/bash

# The CMake executable
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters
EQUALS = =

# The top-level source directory on which CMake was run
# CMAKE_SOURCE_DIR = /opt/git/tobbot/bin/td

# The top-level build directory on which CMake was run
# CMAKE_BINARY_DIR = /opt/git/tobbot/bin/td/build

##  ========================================================================  ##
# $(shell [ -f ./NODE_ENV ] || cp -prv config/.NODE_ENV "./";) ;
$(shell if [ ! -f ./.env ] 2>/dev/null; then cp -prv src/.env ./ ; fi;) ;
$(shell if [ ! -f ./.bowerrc ] 2>/dev/null; then cp -prv config/.bowerrc ./ ; fi;) ;

##  ------------------------------------------------------------------------  ##
APP_NAME := cmdb-rtm
APP_SLOG := "CMDB - RTM"
APP_LOGO := ./assets/BANNER

APP_REPO := $(shell git ls-remote --get-url)
GIT_COMMIT := $(shell git rev-list --remove-empty --remotes --max-count=1 --date-order --reverse)
CODE_VERSION := $(shell cat ./VERSION)

DT = $(shell date +'%Y%m%d%H%M%S')
WD := $(shell pwd -P)
BD := $(WD)/bin

##  ------------------------------------------------------------------------  ##
include $(BD)/Colors

##  ------------------------------------------------------------------------  ##
##  Shorthands
##  ------------------------------------------------------------------------  ##
ARGS = $(shell echo '$@' | tr [:upper:] [:lower:])
STG  = $(shell echo '$@' | tr [:lower:] [:upper:])

DAT = [${Gray}$(DT)${NC}]
BEGIN = $(Yellow)$(On_Blue)BEGIN$(NC) TARGET
RESULT = $(White)$(On_Purple)RESULT$(NC)
DONE = $(Cyan)$(On_Green)DONE$(NC) TARGET
FINE = $(Yellow)$(On_Green)FINISHED GOAL$(NC)
TARG = [$(Orange) $@ $(NC)]
THIS = [$(Red) $(THIS_FILE) $(NC)]
OKAY = [$(White) OK $(NC)]


##  ------------------------------------------------------------------------  ##
##                               ENVIRONMENT                                  ##
##  ------------------------------------------------------------------------  ##
APP_ENV := $(shell grep NODE_ENV ./.env | cut -d "=" -f 2)
ifeq ($(APP_ENV),)
$(info $(DAT) $(Orange)APP_ENV$(NC) is $(Yellow)$(On_Red)NOT DETECTED$(NC)!)
endif


##  ------------------------------------------------------------------------  ##
##  COMMIT information
##  ------------------------------------------------------------------------  ##
$(file > COMMIT,$(GIT_COMMIT));
$(info $(DAT) Created file [$(Yellow)COMMIT$(NC):$(Gray)$(GIT_COMMIT)$(NC)]);


##  ------------------------------------------------------------------------  ##
##                                 PATHS                                      ##
##  ------------------------------------------------------------------------  ##
DIR_SRC := $(WD)/src
DIR_BUILD := $(WD)/build-${CODE_VERSION}
DIR_DIST := $(WD)/dist-${CODE_VERSION}
DIR_COMMIT := $(GIT_COMMIT)
DIR_WEB := $(WD)/web

APP_DIRS := $(addprefix ${WD}/,build-* dist-* web)


##  ------------------------------------------------------------------------  ##
## Query the default goal
##  ------------------------------------------------------------------------  ##
ifeq ($(.DEFAULT_GOAL),)
.DEFAULT_GOAL := _default
endif
$(info $(DAT) $(Yellow)$(On_Purple)GOALS$(NC));
$(info $(DAT)   \-- $(Orange)DEFAULT$(NC): [$(White)$(.DEFAULT_GOAL)$(NC)]);
$(info $(DAT)   \-- $(Orange)CURRENT$(NC): [$(Blue)$(MAKECMDGOALS)$(NC)]);


##  ------------------------------------------------------------------------  ##
##                                  INCLUDES                                  ##
##  ------------------------------------------------------------------------  ##
include $(BD)/*.mk


##  ------------------------------------------------------------------------  ##
##                             SET DEFAULT GOAL                               ##
##  ------------------------------------------------------------------------  ##
PHONY := _default

_default: all ;

##  ------------------------------------------------------------------------  ##
PHONY += test

test: banner state help banner ;
	@ NODE_ENV=${APP_ENV}; npm run test

##  ------------------------------------------------------------------------  ##
PHONY += setup build deploy

setup: ;
	@ npm i --verbose
	@ bower i --verbose

build: banner ;
	@ NODE_ENV=${APP_ENV} ;

deploy: banner ;
	@  cp -prvf ${DIR_SRC}/* ${DIR_SRC}/.env ./ \
	&& sudo chmod a+x app/bin/*.sh ;

##  ------------------------------------------------------------------------  ##
# .PHONY: rebuild redeploy
PHONY += rebuild redeploy

rebuild: build ;

redeploy: rebuild deploy ;

##  ------------------------------------------------------------------------  ##
# .PHONY: all full cycle dev
PHONY += all full cycle dev
#* means the word "all" doesn't represent a file name in this Makefile;
#* means the Makefile has nothing to do with a file called "all" in the same directory.

all: banner clean rights cycle ;

full: clean-all all ;

cycle: setup build deploy ;

dev: redeploy banner ;

##  ------------------------------------------------------------------------  ##
##  Declare the contents of the .PHONY variable as phony. We keep that
##  information in a variable so we can use it in if_changed and friends.
.PHONY: $(PHONY)

##  ------------------------------------------------------------------------  ##
