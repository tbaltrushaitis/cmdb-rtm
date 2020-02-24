/*  web/assets/js/app/progress.js  */

$.fn.progressBar = function (oJob) {
  let Template      =   $(this)
    , Container     =   '#tasks-monitor'
    , ElTotal       =   $('#tasks-total')
    , jobName       =   `${oJob.id}: JOB-${(oJob.speed).toUpperCase()}`
    , selBar        =   '.progress-bar'
    , selTask       =   '.progress-task'
    , selData       =   '.progress-data'
    , seltext       =   '.progress-text span'
    , cssFontWhite  =   {color: '#fff', 'font-weight': '700'}
    , classPrimary  =   'progress-bar-primary'
    , classSuccess  =   'progress-bar-success'
    , classWarning  =   'progress-bar-warning'
    , classDanger   =   'progress-bar-danger'
    , classAnimate  =   'rotateOutUpLeft'
  ;

  $(`#job-${oJob.id}`).otherwise(function () {
    return  Template.children()
      .clone()
      .attr('id', `job-${oJob.id}`)
      .find(selTask)
      .text(jobName)
      .end()
      .find(selData)
      .text('0%')
      .end()
      .appendTo(Container)
    })
    .find(selData)
      .text(`${oJob.progress}%`)
      .end()
    .find(selBar)
      .css('width', `${oJob.progress}%`)
      .end()
    .tap(function () {
      if (100 === oJob.progress) {

        ElTotal.text( ++window.aStats['total'] );

        let ElTaskSpeed = $(`#tasks-${oJob.speed}`);
        ElTaskSpeed.text( ++window.aStats[oJob.speed] );

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

$.fn.after = function (milliseconds, cb) {
  let self = this;
  setTimeout(function () {
    if ('function' === typeof cb) {
      cb.apply(self);
    }
  }, milliseconds);
  return this;
}

$.fn.tap = function () {
  let fn = Array.prototype.shift.apply(arguments);
  fn.apply(this, arguments);
  return this;
}
