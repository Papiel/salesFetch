'use strict';

var data = window.data;

/**
 *  Left panel management
 */
var hideLeftPanel = function () {
  $("#shadow-background").fadeOut(500, function() {
    $("#shadow-background").unbind("click");
  });

  $("#right-panel").removeClass('open');
  $("html").removeClass('stop-scroll');
};

var showLeftPanel = function (content) {
  $("#right-panel").html(content);

  $("#shadow-background").fadeIn(500, function() {
    $("#shadow-background").bind("click", hideLeftPanel);
  });

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

/**
 * Navigation
 */
$("span.info").click(function(e) {
  e.preventDefault();
  showLeftPanel("<h1>Fake meta data</h1>");
});

$("[data-url]").click(function(e) {
  e.preventDefault();

  var url = $(this).data("url");
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
  window.location = urlWithData;
});

/**
 * Hide filters
 */
// $(document).ready( function() {
//   if (!$('#timeline').find('.section-top.hidden').length) {
//     $('body').scrollTop(60);
//     $('.navbar').removeClass('navbar-hidden');
//     $('.navbar').addClass('navbar-fixed');
//   }
// });
