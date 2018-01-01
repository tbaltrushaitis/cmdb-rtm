/*  web/assets/js/progress.js  */

$.fn.progressBar = function (oJob) {
  var $template =   $(this)
    , jobName   =   oJob.id + ': JOB-' + (oJob.speed).toUpperCase()
    , Container =   '#tasks-monitor'
    , selBar    =   '.progress-bar'
    , selTask   =   '.progress-task'
    , selData   =   '.progress-data'
    , seltext   =   '.progress-text span'
    , cssFontWhite  =   {"color": "#fff", "font-weight": "700"}
    , classPrimary  =   "progress-bar-primary"
    , classSuccess  =   "progress-bar-success"
    , classWarning  =   "progress-bar-warning"
    , classDanger   =   "progress-bar-danger"
    , classAnimate  =   "rotateOutUpLeft"
    , legTotal      =   "#tasks-total";

  $('#job-' + oJob.id).otherwise(function () {
    return  $template.children().clone()
              .attr('id', 'job-' + oJob.id)
              .find(selTask)
                .text(jobName)
                .end()
              .find(selData)
                .text('0%')
                .end()
              .appendTo(Container)
    })
    .find(selData)
      .text(oJob.progress + '%')
      .end()
    .find(selBar)
      .css('width', oJob.progress + '%')
      .end()
    .tap(function () {
      if (100 === oJob.progress) {
        var $legTotal = $(legTotal);

        // ++aStats[oJob.speed];
        // $legTotal.text( aStats[oJob.speed] );

        $(this)
          .removeClass('active')
          .find(selBar)
            .addClass(classSuccess)
            .removeClass(classPrimary)
            .end()
          .find(seltext)
            .css(cssFontWhite)
            .end()
          .find(selData)
            .text('DONE!')
            .end()
          .after(2500, function () {
            $(this)
              .find(selBar)
                .addClass(classWarning)
                .removeClass(classSuccess)
                .end()
              .find(selData)
                .text('CLEARING ...')
                .end()
            ;
          })
          .after(4000, function () {
            $(this)
              .find(selBar)
                .addClass(classDanger)
                .removeClass(classWarning)
                .end()
              .addClass(classAnimate);
          })
          .after(5000, function () {
            $(this).remove();
          })
      }
    })
}

$.fn.otherwise = function (ifNotFound) {
  if (0 === this.length) {
    return ifNotFound();
  }
  return this;
}

$.fn.after = function (milliseconds, doSomething) {
  var self = this;
  setTimeout(function () {
    doSomething.apply(self)
  }, milliseconds);
  return this;
}

$.fn.tap = function () {
  var fn = Array.prototype.shift.apply(arguments);
  fn.apply(this, arguments);
  return this;
}
