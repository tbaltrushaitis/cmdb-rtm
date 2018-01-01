/*!
 * Project: cmdb-rtm
 * File:    ./config/index.js
 * Author:  Tomas B. <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';

/**
 * DEPENDENCIES
 * @private
 */

const path  = require('path');
const nconf = require('nconf');


/**
 * DECLARATION
 * @void
 */

const appDir = path.dirname(require.main.filename);

nconf.argv().env({separator: '__'});
nconf.file(path.join(__dirname, 'config.json'));

//  Added flag --test-enabled to launch application in test environment
nconf.argv({
  'test:enabled': {
    alias:    'test-enabled',
    describe: 'Launch application with --test flag enabled to set test environment.',
    demand:   false,
    type:     'boolean',
    default:  false
  }
});

//  use test environment if it is launched from mocha or with --test-enabled
if (nconf.get('test:enabled') || (-1 !== process.argv[1].indexOf('mocha'))) {
  nconf.file(path.join(__dirname, 'config.test.json'));
  nconf.file(path.join(__dirname, 'config.test.local.json'));
}


/**
 * EXPOSE
 * @public
 */

module.exports = exports = nconf;
