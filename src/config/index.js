/*!
 * Project: cmdb-rtm
 * File:    ./config/index.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';

/**
 * @_DEPENDENCIES
 */

const path  = require('path');
const nconf = require('nconf');


/**
 * @_DECLARATION
 * @void
 */

const appDir = path.dirname(require.main.filename);

nconf.argv().env({separator: '__'});
nconf.file(path.join(__dirname, 'config.json'));

//  Added flag --test-enabled to launch application in test environment
nconf.argv({
  'test:enabled': {
      alias:    'test-enabled'
    , type:     'boolean'
    , default:  false
    , demand:   false
    , describe: 'Launch application with --test flag enabled to set test environment.'
  }
});

//  use test environment if it is launched from mocha or with --test-enabled
if (nconf.get('test:enabled') || (-1 !== process.argv[1].indexOf('mocha'))) {
  nconf.file(path.join(__dirname, 'config.test.json'));
  nconf.file(path.join(__dirname, 'config.test.local.json'));
}


/**
 * @_EXPOSE
 */
exports = nconf;


/**
 * @_EXPORTS
 * @public
 */
module.exports = exports;
