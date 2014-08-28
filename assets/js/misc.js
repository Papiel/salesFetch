'use strict';

/*
  ____ _       _           _
 / ___| | ___ | |__   __ _| |
| |  _| |/ _ \| '_ \ / _` | |
| |_| | | (_) | |_) | (_| | |
 \____|_|\___/|_.__/ \__,_|_|
*/

/*
 * Replace bootstrap.js for opening dropdown buttons
 */
module.exports.addDropdownButtons = function() {
  /*
   * Override Bootstrap actions
   * Do not close filters menu when click inside
   */
  $('#filter-tabs .dropdown .filter-menu').on('click', function(e) {
    e.stopPropagation();
  });

  var activeDropdown = null;
  $(document).click(function() {
    if(activeDropdown) {
      activeDropdown.removeClass('open');
    }
  });
  $('.dropdown-toggle').click(function(e) {
    e.stopPropagation();
    var isOpen = $(this).parent().hasClass('open');
    $('li.dropdown').removeClass('open');

    if(!isOpen) {
      activeDropdown = $(this).parent();
      activeDropdown.addClass('open');
    }
  });
};

module.exports.bindInfiniteScroll = function() {
  var client = this;
  var selector = client.isDesktop ? ".snippet-list" : "#view-body";
  $(selector).scroll(function() {
    if($(this).scrollTop() === this.scrollHeight - $(this).innerHeight()) {
      client.activeTab().fetchMoreDocuments();
    }
  });
};

/*
 _____     _     _      _
|_   _|_ _| |__ | | ___| |_
  | |/ _` | '_ \| |/ _ \ __|
  | | (_| | |_) | |  __/ |_
  |_|\__,_|_.__/|_|\___|\__|

*/
module.exports.addTabletBehaviors = function() {
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
};
