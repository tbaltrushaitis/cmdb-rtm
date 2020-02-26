##  ------------------------------------------------------------------------  ##
##                                Build Project                               ##
##  ------------------------------------------------------------------------  ##

.SILENT:
.EXPORT_ALL_VARIABLES:
.IGNORE:
.ONESHELL:

# SHELL = /bin/sh

##  ------------------------------------------------------------------------  ##
$(shell if [ ! -f ./NODE_ENV ] 2>/dev/null; then cp -prv config/.NODE_ENV ./NODE_ENV; fi);
$(shell if [ ! -f ./.bowerrc ] 2>/dev/null; then cp -prv config/.bowerrc ./; fi);

APP_NAME := cmdb-rtm
APP_SLOG := "CMDB - RTM"
APP_LOGO := ./assets/BANNER
APP_REPO := $(shell git ls-remote --get-url)

APP_ENV := $(shell cat NODE_ENV)
CODE_VERSION := $(shell cat ./VERSION)

GIT_COMMIT := $(shell git rev-list --remove-empty --remotes --max-count=1 --date-order --reverse)

WD := $(shell pwd -P)
DT = $(shell date +'%Y%m%d%H%M%S')

include ./bin/Colors

##  ------------------------------------------------------------------------  ##

$(file > COMMIT,${GIT_COMMIT})
$(info [${Gray}${DT}${NC}] Created file [${BYellow}COMMIT${NC}:${BPurple}${GIT_COMMIT}${NC}]);

DIR_SRC := ${WD}/src
DIR_BUILD := ${WD}/build-${CODE_VERSION}
DIR_DIST := ${WD}/dist-${CODE_VERSION}
DIR_COMMIT := ${GIT_COMMIT}
DIR_WEB := ${WD}/web

APP_DIRS := $(addprefix ${WD}/,build-* dist-* web)

##  ------------------------------------------------------------------------  ##
# Query the default goal.

ifeq ($(.DEFAULT_GOAL),)
.DEFAULT_GOAL := default
endif

$(info [$(Gray)$(DT)$(NC)] $(BYellow)Default goal is$(NC): [$(BPurple)$(.DEFAULT_GOAL)]$(NC));

##  ------------------------------------------------------------------------  ##
##                                  INCLUDES                                  ##
##  ------------------------------------------------------------------------  ##

include ./bin/*.mk

##  ------------------------------------------------------------------------  ##

.PHONY: default

default: all;

##  ------------------------------------------------------------------------  ##

.PHONY: test

test: banner state help banner;
	@ NODE_ENV=${APP_ENV}; npm run test

##  ------------------------------------------------------------------------  ##

.PHONY: setup build deploy

setup:
	@ npm i -verbose
	@ bower i -V

build:
	@ NODE_ENV=${APP_ENV};

deploy:
	@  cp -prv ${DIR_SRC}/* ./ \
	&& sudo chmod a+x app/bin/*.sh ;

##  ------------------------------------------------------------------------  ##

.PHONY: rebuild redeploy

rebuild: build;

redeploy: rebuild deploy;

##  ------------------------------------------------------------------------  ##

.PHONY: all full cycle dev
#* means the word "all" doesn't represent a file name in this Makefile;
#* means the Makefile has nothing to do with a file called "all" in the same directory.

all: clean rights banner cycle;

full: clean-all all;

cycle: setup build deploy;

dev: redeploy banner

##  ------------------------------------------------------------------------  ##
