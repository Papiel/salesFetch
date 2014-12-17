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
  var selector = ".snippet-list";
  $(selector).scroll(function() {
    if($(this).scrollTop() >= this.scrollHeight - $(this).innerHeight()) {
      client.activeTab().fetchMoreDocuments();
    }
  });
};
