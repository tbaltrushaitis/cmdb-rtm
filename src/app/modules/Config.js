/**
* @_Module modules/Config
*/

'use strict';

//  Reads configuration from .env file
require('dotenv').config();

/**
 * @_DEPENDENCIES
 */
const fs   = require('fs');
const path = require('path');

const rc   = require('read-config');
const { v4:uuid } = require('uuid');

/**
 * @_CONFIGURATION
 */
let cfgPath = path.join(process.cwd(), 'config');

//  Base Application Config
let ConfigDef = rc(`base.json`, {basedir: cfgPath});

//  Env-specific Config
let ConfigEnv = {};
let envConfigFile = path.join(cfgPath, `${process.env.NODE_ENV}.json`);
if (fs.existsSync(envConfigFile)) {
  ConfigEnv = rc(envConfigFile);
};


/**
 * @_CLASS Config
 */
const Config = class Config {

  /**
   * @_CONSTRUCTOR
   */
  constructor (defs) {
    this._Id      = uuid();
    this._instId  = uuid();
    this._config  = {};

    this._configDef = ConfigDef;
    this._configEnv = ConfigEnv;

    this._config = Object.assign({}, ConfigDef, ConfigEnv, defs || {});
  }


  get Config () {
    return this._config;
  }

};

/**
 * @_EXPOSE
 */
exports = ( (oConfig) => {
  return oConfig.Config;
})( new Config() );


/**
 * @_EXPORTS
 */
module.exports = exports;
