'use strict';

/*===============
  GLOBAL
 ================*/

 var scrollToTop = function () {
 	$('#view-body').scrollTop(0);
 };

/*
 * Override Bootstrap actions
 * Do not close filters menu when click inside
 */
$('#filter-tabs .dropdown .filter-menu').on('click', function(e) {
	console.log('ok');
    e.stopPropagation();
});

/*
 * Replace bootstrap.js for opening dropdown buttons
 */
var activeDropdown = null;
$(document).click(function() {
	if (activeDropdown) {
		activeDropdown.removeClass('open');
	}
});
$('.dropdown-toggle').click(function(e) {
	e.stopPropagation();
	var isOpen = $(this).parent().hasClass('open');
	$('li.dropdown').removeClass('open');

	if (!isOpen) {
		activeDropdown = $(this).parent();
		activeDropdown.addClass('open');
	}
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
$('html.tablet .snippet-list').click(function() {
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
