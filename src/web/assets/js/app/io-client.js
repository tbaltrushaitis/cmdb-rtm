/*  web/assets/js/app/io-client.js  */

$(function () {

  let ioClient = io()
    , aSpds    = ['total', 'fast', 'norm', 'slow']
    , entries  = aSpds.map((x) => { return [[`${x}`], 0] })
    , P = '[ioClient]'
  ;

  window.aStats = Object.fromEntries(entries);

  console.log(`${P} window.aStats (${typeof window.aStats}):`, window.aStats);
  console.log(`${P} (${typeof ioClient}):`, ioClient);
  // console.log(`[ioClient] entries (${typeof entries}):`, entries);

  ioClient.on('connect', function () {
    console.info(`${P} Connected to ioServer as: [${ioClient.id}]`);
    $('#client-id').text( ioClient.id );
  });

  ioClient.on('disconnect', function () {
    console.log(`${P} Disconnected from ioServer!`);
  });

  ioClient.on('message', function (job) {
    // console.log(`[ioClient] RECV: message for [joId:${job.id}]:`, job);
    $('#template').progressBar(job);
  });

  ioClient.on('progress', function (job) {
    console.log(`${P} RECV progress for [JOB:${job.id}]`);
    $('#template').progressBar(job);
  });

  ioClient.connect();

});
