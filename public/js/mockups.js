'use strict';

/*===============
  COMMON
 ================*/

/**
 * Switch mode
 */
$('#context-switch a').click(function() {
  $("#context-switch a").removeClass('btn-primary');
  $("#context-switch a").addClass('btn-default');
  $(this).addClass('btn-primary');
  $(this).removeClass('btn-default');
});

/*===============
  TABLET
 ================*/
if ($('body.tablet').length) {
  /**
   * Filtering
   */
  $("#filter").popover({
    placement : 'bottom',
    html: true,
    container: '.navbar-result',
    content : $('#filter-template').html()
  });

  $('#filter').on('hidden.bs.popover', function () {
    $('body').unbind('click');
  });

  $('#filter').on('shown.bs.popover', function () {
    $('body').bind('click', function(e) {
      if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
        $('#filter').popover('hide');
      }
    });
  });

  $("#left-panel").on('click', '.dismiss', function(e) {
    e.preventDefault();
    $('#filter').popover('hide');
  });

  $("#left-panel").on('click', '.execute', function(e) {
    e.preventDefault();
    location.reload();
  });

  /**
   * Toogle left panel
   */
  $('#left-toogle').click(function() {
    $("#left-panel").toggleClass('active');
  });

  /**
   * Hide left bar on click snippet
   */
  $('.snippet').click(function(e) {
    e.preventDefault();
    $("#left-panel").removeClass('active');
  });
}



/*===============
  MOBILE
 ================*/
if ($('body.mobile').length) {

  var hideLeftPanel = function () {
    $("#shadow-background").addClass('hidden');
    $("#shadow-background").unbind("click");

    $("#right-panel").removeClass('open');
    $("html").removeClass('stop-scroll');
  };

  var showLeftPanel = function (content) {
    $("#right-panel").html(content);

    $("#shadow-background").removeClass('hidden');
    $("#shadow-background").bind("click", hideLeftPanel);

    $("#right-panel").addClass('open');
    $('.navbar').addClass('navbar-hidden');
    $("html").addClass('stop-scroll');
  };

  /**
   * Show navbar on scroll-down and hide-it on scroll-up
   */
  var navbarHeight = $('.navbar').height();
  var lastPostion = 0;

  $(window).scroll(function() {
    var newPosition = $(window).scrollTop();
    var toBottom =  newPosition - lastPostion > 0;

    if ((newPosition > navbarHeight)) {
      $('.navbar').addClass('navbar-hidden');
      $('.navbar').addClass('navbar-fixed');
    }

    if (!toBottom && (newPosition > navbarHeight)) {
      $('.navbar').removeClass('navbar-hidden');
      $('.navbar').addClass('navbar-fixed');
    } else if(toBottom && (newPosition > navbarHeight)) {
      $('.navbar').addClass('navbar-hidden');
    } else if(newPosition === 0) {
      $('.navbar').removeClass('navbar-fixed');
    }

    lastPostion = $(window).scrollTop();
  });

  /**
   * Filtering
   */
  $("#filter").click(function(e) {
    e.preventDefault();
    showLeftPanel($("#filter-template").html());
  });

  $("#right-panel").on('click', '.dismiss', function(e) {
    e.preventDefault();
    hideLeftPanel();
  });

  $("#right-panel").on('click', '.execute', function(e) {
    e.preventDefault();

    // Reload the page with right parameters
    location.reload();
  });



  $("span.info").click(function(e) {
    e.preventDefault();
    showLeftPanel("<h1>Fake meta data</h1>");
  });
}
