/*!
 * Project: cmdb-rtm
 * File:    ./app/server.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';

/**
 * @_DEPENDENCIES
 */

const atob = require('atob');
const path = require('path');
const utin = require('util').inspect;

const { spawn } = require('child_process');
const EE        = require('events').EventEmitter;

const _             = require('lodash');
const io            = require('socket.io');
const express       = require('express');
const http          = require('http');
const respTime      = require('response-time');
const bodyParser    = require('body-parser');
const compression   = require('compression');
const cookieParser  = require('cookie-parser');


/**
 * @_CONFIGURATION
 */

let ME          = {};
const appPath   = path.dirname(module.filename);
const modName   = path.basename(module.filename, '.js');
const modPath   = path.relative(appPath, path.dirname(module.filename));
const modsPath  = path.join(appPath, 'modules', path.sep);
const libsPath  = path.normalize(path.join(appPath, '..', 'lib', path.sep));
const webPath   = path.normalize(path.join(appPath, '..', 'web'));
const confBase  = path.normalize(path.join(appPath, '..', 'config', path.sep));
const Config    = require(confBase);

utin.defaultOptions = Object.assign({}, Config.get('iopts'));

const aSpd      = ['norm', 'fast', 'slow'];
const netErrors = ['EADDRINUSE', 'ECONNREFUSED', 'ECONNRESET'];


/**
 * @_DECLARATION
 * @class
 */
const Job = class Job extends EE {

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
    console.log(`[${new Date().toISOString()}] START Job [${utin(this.id)}]`);

    let job = this;
    let rndJobSpeed = aSpd[parseInt(Math.floor(Math.random() * 3))];
    let shPath = path.join(__dirname, 'bin', `job-${rndJobSpeed}.sh`);
    let jobRun = spawn(shPath)
                  .stdout.on('data', function (output) {
                    // console.log(`[${new Date().toISOString()}] data = [${output.toString()}]`);
                    job.emit('progress', job.id, parseInt(output.toString(), 10), rndJobSpeed);
                  });

    jobRun.on('close', (code) => {
      console.log(`[${new Date().toISOString()}] DONE Job [${utin(this.id)}]`);
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

console.log(`[${new Date().toISOString()}] [RAM:${utin(process.memoryUsage().rss)}] spawnTime: [${utin(spawnTime)}]`);

const App = express();
App.set('port', Config.get('app:port') || process.env.PORT || 8084);
App.set('host', Config.get('app:host') || process.env.HOST || '0.0.0.0');
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

const IoServer = require('socket.io')(AppServer);

IoServer.on('connection', function (client) {
  console.log(`[${new Date().toISOString()}] CONNECTED
  User [${client.conn.id}]
  From [${client.request.socket._peername.address}:${utin(client.request.socket._peername.port)}]
  [ONLINE:${utin(client.conn.server.clientsCount)}]
`);

  // console.log(`${utin(client)}`);

// From [${client.request.headers['x-real-ip']}]
// from [${client.conn.remoteAddress}]
// by [${utin(Object.keys(client.conn))}]

  connections[client.conn.id] = client;

  client.on('disconnect', function () {
    console.log(`[${new Date().toISOString()}] DISCONNECTED
      User [${client.conn.id}]
      From [${client.request.socket._peername.address}:${utin(client.request.socket._peername.port)}]
      [ONLINE:${utin(client.conn.server.clientsCount)}]
    `);
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
    console.log(`[${new Date().toISOString()}] Error to listen:
  at [HOST:${utin(App.get('host'))}]
  of [NET:${utin(App.get('family'))}]
  on [PORT:${utin(App.get('port'))}]
  in [MODE:${utin(App.settings.env)}]
  message: [${utin(err)}]
`);
  } else {
    console.log(`[${new Date().toISOString()}] HTTP Server is listening:
  at [HOST:${utin(AppServer.address().address)}]
  of [NET:${utin(AppServer.address().family)}]
  on [PORT:${utin(AppServer.address().port)}]
  in [MODE:${utin(App.settings.env)}]
  and accessible by [URL:${utin(AppServer.address())}]
`);


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
    console.log(`[${new Date().toISOString()}] HTTP Server STOP`);
    clearInterval(spawnJobsInterval);
    process.exit();
  });

});


//  Error handling
App.use(function (err, req, res, next) {
  const status = err.statusCode || 500;

  //  Log exception
  console.log(`[${new Date().toISOString()}] Application server error [${utin(status)}] [${utin(err.message)}]:
    stack: ${err.stack ? utin(err.stack) : 'N/A'}
  `);

  //  Set server error status
  res.status(status);

  //  Return json
  res.send({
      status: 'error'
    , code: err.code
    , errno: err.errno
    , message: err.message
  });

});

//  Unhandled exception
process.on('uncaughtException', function (err) {

  //  Log exception
  // if (err.message.indexOf('EADDRINUSE') > -1) {
  //   console.log(`[${new Date().toISOString()}] Catched [EADDRINUSE] Error: Shutting down immediately`);
  //   process.exit();
  // }

  let isNetError = /[netErrors.join('|')]/.test(err.message);
  console.log(`isNetError = [${utin(isNetError)}]`);
  if (isNetError) {
    console.log(`[${new Date().toISOString()}] Catched [NETWORK] Error: [${utin(err.message)}]`);
    console.log(`[${new Date().toISOString()}] Shutting down immediately`);
    process.exit();
  }

  // console.error(`[${new Date().toISOString()}][${Noty.pref}] UncaughtException [${err.message}]:`, {
  console.log(`[${new Date().toISOString()}] UncaughtException [${utin(err.message)}]:
    stack: ${err.stack ? utin(err) : 'N/A'}
  `);
  process.exit();

});

process.on('SIGINT', function () {
  AppServer.close();
});


/**
 * @_EXPOSE
 */
exports = Job;


/**
 * @_EXPORTS
 */
module.exports = exports;
