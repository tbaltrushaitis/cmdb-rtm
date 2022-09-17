/*!
 * Project: cmdb-rtm
 * File:    ./app/server.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';

//  Reads configuration from .env file
require('dotenv').config()


/**
 * @_DEPENDENCIES
 */
const atob = require('atob')
const path = require('path')
const utin = require('util').inspect

const { spawn } = require('child_process')

const _             = require('lodash')
const io            = require('socket.io')
const express       = require('express')
const http          = require('http')
const respTime      = require('response-time')
const bodyParser    = require('body-parser')
const compression   = require('compression')
const cookieParser  = require('cookie-parser')
const rc            = require('read-config')


/**
 * @_CONFIGURATION
 */
let ME = {}

const CWD     = process.cwd()
const appPath = path.join(CWD, 'app')
const modPath = path.join(appPath, 'modules')
const webPath = path.join(CWD, 'web')
// const cfgPath = path.join(CWD, 'config')
// const libPath = path.join(CWD, 'lib')

//  Base Application Config
const Config = require(`${modPath}/Config`);
let C = Config.colors;

utin.defaultOptions = Object.assign({}, Config.iopts)

const aSpd      = ['norm', 'fast', 'slow']
const netErrors = ['EADDRINUSE', 'ECONNREFUSED', 'ECONNRESET']

const AbstractModule = require(`${modPath}/Abstract.module`)


/**
 * @_DECLARATION
 * @class
 */
const Job = class Job extends AbstractModule {

  /**
   * @_CONSTRUCTOR
   */
  constructor (jobId) {
    super();
    this.init(jobId);
  }


  /**
   * @_METHODS
   */

  init (id) {
    this.id = id;
  }


  run () {
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] Job [${utin(this.id)}] START`);

    let job = this;
    let rndJobSpeed = aSpd[parseInt(Math.floor(Math.random() * 3))];
    let shPath = path.join(__dirname, 'bin', `job-${rndJobSpeed}.sh`);
    let jobRun = spawn(shPath)
                  .stdout.on('data', function (output) {
                    // console.log(`[${new Date().toISOString()}] data = [${output.toString()}]`);
                    job.emit('progress', job.id, parseInt(output.toString(), 10), rndJobSpeed);
                  });

    jobRun.on('close', (code) => {
      console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] Job [${utin(this.id)}] DONE`);
    });

  }

};


/**
 * @_MIDDLEWARES
 */
let connections = {}
  , counter     = 0
  , spawnTime   = Math.floor(Math.random() * 4000) + 1500
;

console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] [RAM:${utin(process.memoryUsage().rss)}] spawnTime: [${utin(spawnTime)}]`);

const App = express();
App.set('port', Config.app.port || process.env.APP_PORT || 8084);
App.set('host', Config.app.host || process.env.APP_HOST || '0.0.0.0');
App.set('trust proxy', 1);

App.use(compression());
App.use(respTime({digits: 3}));
App.use(express.query());
App.use(cookieParser());
App.use(bodyParser.urlencoded({extended: false}));


//  LOG ALL REQUESTS
App.use('*', function (req, res, next) {
  // console.log(`[${new Date().toISOString()}] RECV [${req.method} ${req.url}] [${req.path}] from [${req.ip}]`);
  next();
});


//  Create http server
const AppServer = http.createServer(App);
const IoServer  = io(AppServer);

IoServer.on('connection', function (client) {

  console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] ${C.Y}${C.OnG}CONNECTED${C.N}
  User [${C.Cyan}${client.conn.id}${C.N}]
  From [${C.White}${client.request.socket._peername.address}${C.N}:${utin(client.request.socket._peername.port)}]
  [ONLINE:${utin(client.conn.server.clientsCount)}]
`);

  // console.log(`${utin(client)}`);

// From [${client.request.headers['x-real-ip']}]
// from [${client.conn.remoteAddress}]
// by [${utin(Object.keys(client.conn))}]

  connections[client.conn.id] = client;

  client.on('disconnect', function () {
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] ${C.Y}${C.OnBlue}DISCONNECTED${C.N}
  User [${C.Cyan}${client.conn.id}${C.N}]
  From [${C.White}${client.request.socket._peername.address}${C.N}:${utin(client.request.socket._peername.port)}]
  [ONLINE:${utin(client.conn.server.clientsCount)}]`);
    // by [${utin(Object.keys(client.conn.server))}]
    delete connections[client.conn.id];
  });

});

let optsStatic = {
    dotfiles:   'ignore'
  , etag:       true
  , extensions: ['htm', 'html', 'png', 'jpg', 'jpeg', 'ico', 'gif', 'js', 'css']
  , index:      false
  , maxAge:     '15d'
  , redirect:   false
  , setHeaders: function (res, path, stat) {
      res.set('X-Powered-By', atob('dGJhbHRydXNoYWl0aXNAZ21haWwuY29t'));
      res.set('X-Timestamp', Date.now());
    }
}

App.use(express.static(webPath, optsStatic));

App.post('/spawn', function (req, res) {

  let jobInstance = new Job(++counter);

  jobInstance.on('progress', function (id, progress, speed) {

    // console.log(`[${new Date().toISOString()}] JOB [${id}] Progress = [${progress}] at speed = [${speed}]`);

    _.each(connections, function (connection) {

      connection.send({
          id:       id
        , progress: progress
        , speed:    speed
        , conn: {
            domain:         connection.domain
          , connected:      connection.connected
          , handshaked:     connection.handshaked
          , connections:    connection.connections
          , options:        connection.options
          , _heartbeats:    connection._heartbeats
          , _maxListeners:  connection._maxListeners
          , sessionId:      connection.sessionId
        }
      })

    });

  });

  jobInstance.run();

  res.writeHead(202, {'Content-Type': 'application/json'});
  res.end('OK\n');

});

AppServer.listen(App.get('port'), App.get('host'), function (err) {
  if (err) {
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] Error to listen:
  at [HOST:${C.C}${App.get('host')}${C.N}]
  of [NET:${C.W}${App.get('family')}${C.N}]
  on [PORT:${utin(App.get('port'))}]
  in [MODE:${C.R}${App.settings.env}${C.N}]
  Message: [${utin(err)}]
`);
  } else {
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] HTTP Server is listening:
  at [HOST:${C.C}${AppServer.address().address}${C.N}]
  of [NET:${C.W}${AppServer.address().family}${C.N}]
  on [PORT:${utin(AppServer.address().port)}]
  in [MODE:${C.R}${App.settings.env}${C.N}]
`);
// and accessible by [${utin(AppServer.address())}]


    //  ROOT OF ROUTING
    App.get('/', function (req, res) {
      res.sendFile(path.join(webPath, 'index.html'));
    });

    var spawnJobsInterval = setInterval(function () {
      http.request({
          port:   App.get('port')
        , host:   App.get('host')
        , method: 'POST'
        , path:   '/spawn'
      })
      .end();
    }, spawnTime);

  }

  AppServer.on('close', function () {
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] HTTP Server STOP`);
    clearInterval(spawnJobsInterval);
    // process.exit();
  });

});


//  Error handling
App.use(function (err, req, res, next) {
  const status = err.statusCode || 500;

  //  Log exception
  console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] Application server error [${utin(status)}] [${utin(err.message)}]:
    stack: ${err.stack ? utin(err.stack) : 'N/A'}
  `);

  //  Set server error status
  res.status(status);

  //  Return json
  res.send({
      status:   'error'
    , code:     err.code
    , errno:    err.errno
    , message:  err.message
  });

});


//  Uncaught Exception
process.on('uncaughtException', function (err) {

  //  Log exception
  // if (err.message.indexOf('EADDRINUSE') > -1) {
  //   console.log(`[${new Date().toISOString()}] Catched [EADDRINUSE] Error: Shutting down immediately`);
  //   process.exit();
  // }

  let isNetError = /[netErrors.join('|')]/.test(err.message);
  console.log(`[${C.Gr}${new Date().toISOString()}${C.N}][UncaughtException] isNetError = [${utin(isNetError)}]`);
  if (isNetError) {
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] Catched [NETWORK] Error: [${utin(err.message)}]`);
    console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] Shutting down immediately`);
    process.exit();
  }

  // console.error(`[${new Date().toISOString()}][${Noty.pref}] UncaughtException [${err.message}]:`, {
  console.log(`[${C.Gr}${new Date().toISOString()}${C.N}][UncaughtException] [${utin(err.message)}]:
    stack: ${err.stack ? utin(err) : 'N/A'}
  `);
  process.exit();

});

process.on('SIGINT', function (data) {

  // console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] ${C.R}SIGINT${C.N} received with [data] = [${utin(data)}]`);
  console.log(`\n`);
  console.log(`[${C.Gr}${new Date().toISOString()}${C.N}] ${C.R}SIGINT${C.N} received`);
  AppServer.close();
  process.exit();

});


/**
 * @_EXPOSE
 */
exports = Job;


/**
 * @_EXPORTS
 */
module.exports = exports;
