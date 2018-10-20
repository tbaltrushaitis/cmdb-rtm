##  ------------------------------------------------------------------------  ##
##                                 Clean Environment                          ##
##  ------------------------------------------------------------------------  #

.PHONY: clean clean-all
.PHONY: clean-deps clean-build clean-dist clean-files clean-web

clean-all: clean clean-dist

clean: clean-build clean-files

clean-deps:
	@ rm -rf \
		bower_modules/ \
		node_modules/ ;

clean-build:
	@ rm -rf ${DIR_BUILD}

clean-dist:
	@ rm -rf ${DIR_DIST}

clean-files:
	@ rm -rf COMMIT \
		*.md \
		bitbucket-pipelines.yml \
		codeclimate-config.patch \
		_config.yml \
		package-lock.json \
		yarn.lock \
		yarn-error.log ;

clean-web:
	@ rm -rf ${DIR_WEB}

##  ------------------------------------------------------------------------  ##
