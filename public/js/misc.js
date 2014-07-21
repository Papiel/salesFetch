'use strict';

/*===============
  GLOBAL
 ================*/

 var scrollToTop = function () {
 	$('#view-body').scrollTop(0);
 }

/*
 * Override Bootstrap actions
 * Do not close filters menu when click inside
 */
$('#filter-tabs .dropdown-menu a').click(function(e) {
    e.stopPropagation();
});

/*===============
  TABLET
 ================*/

/**
 * Toogle left panel
 */
$('#toggle-panel-btn').click(function() {
  $("#mainview").toggleClass('active');
  $("#toggle-panel-btn span").toggleClass('fa-toggle-left');
});

/**
 * Hide left bar on click snippet
 */
$('html.tablet.portrait .snippet').click(function() {
  $("#mainview").removeClass('active');
  $("#toggle-panel-btn span").removeClass('fa-toggle-left');
});

/**
 * Hide left bar on click subview
 */
$('html.tablet.portrait #subview').click(function() {
  $("#mainview").removeClass('active');
  $("#toggle-panel-btn span").removeClass('fa-toggle-left');
});
