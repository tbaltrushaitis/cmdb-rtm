/*!
 * Project: cmdb-rtm
 * File:    ./modules/Abstract.module.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';


/**
 * @_DEPENDENCIES
 * @private
 */
const fs        = require('fs');
const path      = require('path');
const utin      = require('util').inspect;
const inherits  = require('util').inherits;

const _     = require('lodash');
const md5   = require('md5');
const uuid  = require('uuid').v4;


/**
 * @_CONFIGURATION
 */

let ME          = global.ME || {};
const CWD       = process.cwd();
const appPath = path.join(CWD, 'app')
const cfgPath = path.join(CWD, 'config')
const modPath = path.join(appPath, 'modules')

// const appPath   = path.dirname(require.main.filename);
// const modName   = path.basename(module.filename, '.js');
// const modPath   = path.relative(appPath, path.dirname(module.filename));
// const modsPath  = path.join(appPath, 'modules', path.sep);
// const libsPath  = path.normalize(path.join(appPath, '..', 'lib', path.sep));
// const confBase  = path.join(appPath, 'config');
// const appPath   = path.dirname(require.main.filename);
// const modName   = path.basename(module.filename, '.js');
// const modPath   = path.relative(appPath, path.dirname(module.filename));
// const modsPath  = path.join(appPath, 'modules', path.sep);
const libsPath  = path.normalize(path.join(appPath, '..', 'lib', path.sep));
const confBase  = path.join(appPath, 'config');
// const Config    = require(confBase);
const Config    = require(cfgPath);

utin.defaultOptions = Object.assign({}, Config.get('iopts'));

// const Abstract = require(path.join(libsPath, 'Abstract.class'));
const Abstract = require(`${modPath}/Abstract.class`);


/**
 * @_DECLARATION
 * @class
 */
const AbstractModule = class AbstractModule extends Abstract {

  /**
   * CONSTRUCTOR
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
     * EVENTS
     * @prototype
     */

  }


  /**
   * METHODS
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
