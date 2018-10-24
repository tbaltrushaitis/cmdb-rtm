/*!
 * Project: cmdb-rtm
 * File:    ./app/server.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * License: MIT
 * Created: 2017-12-31
 */

'use strict';

/*
 * DEPENDENCIES
 * @private
 */

const path = require('path');
const util = require('util');
const utin = util.inspect;
const { spawn } = require('child_process');
const EE = require('events').EventEmitter;

const io = require('socket.io');
const _ = require('lodash');
const express = require('express');
const http = require('http');
const respTime = require('response-time');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');


/*
 * CONFIGURATION
 */

let ME = {};
const appPath = path.dirname(module.filename);
const modName = path.basename(module.filename, '.js');
const modPath = path.relative(appPath, path.dirname(module.filename));
const modsPath = path.join(appPath, 'modules', path.sep);
const libsPath = path.normalize(path.join(appPath, '..', 'lib', path.sep));
const webPath = path.normalize(path.join(appPath, '..', 'web'));
const confBase = path.normalize(path.join(appPath, '..', 'config', path.sep));
const Config = require(confBase);

utin.defaultOptions = Object.assign({}, Config.get('iopts'));

const aSpd = ['norm', 'fast', 'slow'];
const netErrors = ['EADDRINUSE', 'ECONNREFUSED', 'ECONNRESET'];


/**
 * DECLARATION
 * @class
 */

const Job = class Job extends EE {

  /**
   * CONSTRUCTOR
   * @special
   */

  constructor (jobId) {
    super();
    this.init(jobId);
  }

  /**
   * METHODS
   * @prototype
   */

  init (id) {
    this.id = id;
  }

  run () {
    console.log(`[${new Date().toISOString()}] RUN Job [${utin(this.id)}]`);

    let job = this;
    let rndJobSpeed = aSpd[parseInt(Math.floor(Math.random() * 3))];
    let shPath = path.join(__dirname, 'bin', 'job-' + rndJobSpeed + '.sh');
    let jobRun = spawn(shPath)
                  .stdout.on('data', function (output) {
                    // console.log(`[${new Date().toISOString()}] data = [${output.toString()}]`);
                    job.emit('progress', job.id, parseInt(output.toString(), 10), rndJobSpeed);
                  });

    jobRun.on('close', (code) => {
      console.log(`[${new Date().toISOString()}] Child process [${utin(this.id)}] exited with code [${utin(code)}]`);
    });

  }

};


/**
 * MIDDLEWARES
 */

let connections = {}
  , counter     = 0
  , spawnTime   = Math.floor(Math.random() * 4000) + 1500
;

console.log(`[${new Date().toISOString()}] [RAM:${utin(process.memoryUsage().rss)}] spawnTime: [${utin(spawnTime)}]`);

const app = express();
app.set('port', Config.get('app:port') || process.env.PORT || 8084);
app.set('trust proxy', 1);

app.use(compression());
app.use(respTime({digits: 3}));
app.use(express.query());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));


//  LOG ALL REQUESTS
app.use('*', function (req, res, next) {
  // console.log(`[${new Date().toISOString()}] RECV [${req.method} ${req.url}] [${req.path}] from [${req.ip}]`);
  next();
});


//  Create http server
const appServer = http.createServer(app);

const ioServer = require('socket.io')(appServer);
ioServer.on('connection', function (client) {
  console.log(`[${new Date().toISOString()}] CONNECTED
  User [${utin(client.conn.id)}]
  from [${utin(client.conn.remoteAddress)}]
  [ONLINE:${utin(client.conn.server.clientsCount)}]
`);
// by [${utin(Object.keys(client.conn))}]

  connections[client.conn.id] = client;

  client.on('disconnect', function () {
    console.log(`[${new Date().toISOString()}] DISCONNECTED
      User [${utin(client.conn.id)}]
      From [${utin(client.conn.remoteAddress)}]
      [ONLINE:${utin(client.conn.server.clientsCount)}]
    `);
    // by [${utin(Object.keys(client.conn.server))}]
    delete connections[client.conn.id];
  });

});

let optsStatic = {
    dotfiles:   'ignore'
  , etag:       true
  , extensions: ['htm', 'html']
  , index:      false
  , maxAge:     '1d'
  , redirect:   false
  , setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now());
    }
}
app.use(express.static(webPath, optsStatic));

app.post('/spawn', function (req, res) {

  let jobInstance = new Job(++counter);

  jobInstance.on('progress', function (id, progress, speed) {

    // console.log(`[${new Date().toISOString()}] JOB [${id}] Progress = [${progress}] at speed = [${speed}]`);

    _.each(connections, function (connection) {

      connection.send({
          "id": id
        , "progress": progress
        , "speed":    speed
        , "conn": {
            "domain":      connection.domain
          , "connected":   connection.connected
          , "handshaked":  connection.handshaked
          , "connections": connection.connections
          , "options":     connection.options
          , "_heartbeats": connection._heartbeats
          , "_maxListeners": connection._maxListeners
          , "sessionId":   connection.sessionId
        }
      })
    });

  });

  jobInstance.run();

  res.writeHead(202, {"Content-Type": "application/json"});
  res.end("OK\n");

});

appServer.listen(app.get('port'), app.get('host'), function (err) {
  if (err) {
    console.log(`[${new Date().toISOString()}] Error to listen:
  at [HOST:${utin(app.get('host'))}]
  of [NET:${utin(app.get('family'))}]
  on [PORT:${utin(app.get('port'))}]
  in [MODE:${utin(app.settings.env)}]
  messaged: [${utin(err)}]
`);
  } else {
    console.log(`[${new Date().toISOString()}] HTTP Server is listening:
  at [HOST:${utin(appServer.address().address)}]
  of [NET:${utin(appServer.address().family)}]
  on [PORT:${utin(appServer.address().port)}]
  in [MODE:${utin(app.settings.env)}]
  and accessible by [URL:${utin(appServer.address())}]
`);


    //  ROOT OF ROUTING
    app.get('/', function (req, res) {
      res.sendFile(path.join(webPath, 'index.html'));
    });

    var spawnJobsInterval = setInterval(function () {
      http.request({
          port:   app.get('port')
        , host:   app.get('host')
        , method: 'POST'
        , path:   '/spawn'
      })
      .end();
    }, spawnTime);

  }

  appServer.on('close', function () {
    console.log(`[${new Date().toISOString()}] HTTP Server STOP`);
    clearInterval(spawnJobsInterval);
    process.exit();
  });

});


//  Error handling
app.use(function (err, req, res, next) {
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
  appServer.close();
});


/**
 * EXPOSES
 * @public
 */

module.exports = exports = Job;
