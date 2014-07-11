/*===============
  GLOBAL
 ================*/

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
});

/**
 * Hide left bar on click snippet
 */
$('html.tablet.portrait .snippet').click(function(e) {
  $("#mainview").removeClass('active');
});
