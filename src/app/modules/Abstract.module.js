/*!
 * Project: cmdb-rtm
 * File:    ./modules/Abstract.module.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';

//  Reads configuration from .env file
require('dotenv').config();


/**
 * @_DEPENDENCIES
 * @private
 */
const path  = require('path');
const utin  = require('util').inspect;

const _ = require('lodash');


/**
 * @_CONFIGURATION
 */
let ME        = globalThis.ME || {};
const CWD     = globalThis.CWD || process.cwd();
const appPath = path.join(CWD, 'app')
const cfgPath = path.join(CWD, 'config')
const modPath = path.join(appPath, 'modules')

const Config    = require(cfgPath);
const Abstract  = require(`${modPath}/Abstract.class`);

utin.defaultOptions = Object.assign({}, Config.get('iopts'));



/**
 * @_DECLARATION
 * @class
 */
const AbstractModule = class AbstractModule extends Abstract {

  /**
   * @_CONSTRUCTOR
   * @special
   */

  constructor (defs) {

    let p = Object.assign({}, {
      base: path.relative(path.dirname(require.main.filename), path.dirname(module.filename))
    }, defs);
    super(p);

    this.m._promises = [];
    this.m._datas = [];

    /**
     * @_EVENTS
     * @prototype
     */

  }


  /**
   * @_METHODS
   * @prototype
   */

  //  MODULE INIT
  init () {
    super.init();
    let self = this;
    // self.m.pref = self.m._opts.base;

    return Promise.resolve().then(function () {
      return new Promise(function (resolve, reject) {

        Promise.all([
          self.initModules()
        ])
        .then(function (resp) {
          // self.noty(`[INFO] Instance and subclasses INITIALIZED`);
          resolve(self);
        })
        .catch(function (e) {
          self.noty(`[ERROR] [${self.m._entity}:${self.m._instId}] NOT INITIALIZED: [${utin(e)}]`);
          reject(self);
        });

      });
    })
    .catch(function (err) {
      self.noty(`[ERROR] Failed to initialize [${self.m.pref}]: ${utin(err)}`);
      return self;
    });

  }

  //  SECTION 'subs' of MODULE's CONFIG KEEPS LIST of SUB-MODULES GROUPED BY SECTIONS
  //  e.g.
  //    subs: {
  //      modules: ['mod_1', 'mod_2'],
  //      helpers: ['mod_7'],
  //      checkers: ['mod_4', 'mod_8']
  //    }

  //  CONSTRUCT SUB-MODULES
  initModules () {
    let self = this;
    // self.noty(`[CONSTRUCT:MODULES]`);
    self.m._promises = [];

    return Promise.resolve().then(function () {

      _.keys(self._selfConfig.subs).forEach(function (group, icn) {

        //  LIST of SUB-MODULES in GROUP
        let groupMods = self._selfConfig.subs[`${group}`];
        if (_.isArray(groupMods) && !_.isEmpty(groupMods)) {
          self[`_${group}`] = [];
          groupMods.forEach(function (iam, idx) {
            let iName = _.isObject(iam) ? iam.name : iam;
            let Iam = require( _.isObject(iam)
                        ? path.join(appPath, iam.path)
                        // : path.join(libsPath, iName)
                        : `${modPath}/${iName}`
                      );
            let Me = Reflect.construct(Iam, [iName]);
            self[`_${group}`][`${iName}`] = Me;
            // self.noty(`[CONSTRUCTED:_${group}:${iName}]`);
            self.m._promises.push(Me.init());
          });
        }

      });

      return new Promise(function (resolve, reject) {

        Promise
          .all(self.m._promises)
          .then(function (resp) {
            if (_.size(resp) > 0) {
              self.noty(`[${utin(_.size(resp))}] SUB-Modules Initialized`);
            }
            resolve(self);
          })
          .catch(function (e) {
            self.noty(`[WARNING] Cannot Initialize SUB-Modules: [${self.m._entity}:${self.m._instId}]: [${utin(e)}]`);
            reject(self);
          });

      });
    })
    .catch((e) => {
      self.noty(`[ERROR] Failed to Initialize SUB-Modules: [${self.m._entity}:${self.m._instId}]: [${utin(e)}]`);
      return self;
    });

  }

};


/**
 * @_EXPOSE
 * @public
 */
exports = AbstractModule;


/**
 * @_EXPORTS
 * @public
 */
module.exports = exports;
