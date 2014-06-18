'use strict';

var data = window.data;

/**
 * fetchPinnedDocuments
 */
 var fetchPinnedDocuments = function() {

  var urlWithData = '/app/context-search?data=%7B%22user%22%3A%7B%22name%22%3A%22tanguy%40demo.salesfetch.com%22%2C%22email%22%3A%22tanguy.helesbeux%40insa-lyon.fr%22%2C%22id%22%3A%2200520000003AYhuAAG%22%7D%2C%22sessionId%22%3A%2200D20000000lnBG!ARcAQA0XClY31lUo.fsEzhIpJUspi9qRrbYWoIkMkmJ2E_ybKMbk.8fdhivRL2jz..5CbTSHOBtYvUiB83NpQvZ3LzlVE5Gl%22%2C%22salesFetchURL%22%3A%22https%3A%2F%2Flocalhost%3A3000%22%2C%22organization%22%3A%7B%22name%22%3A%22AnyFetch%22%2C%22id%22%3A%2200D20000000lnBGEAY%22%7D%2C%22instanceURL%22%3A%22https%3A%2F%2Feu0.salesforce.com%22%2C%22hash%22%3A%22tUjogcXtZJAjcELBWL0zHyDzKvk%3D%22%2C%22context%22%3A%7B%22templatedDisplay%22%3A%22Mehdi%20Bouheddi%22%2C%22templatedQuery%22%3A%22Mehdi%20Bouheddi%22%2C%22recordId%22%3A%220032000001ElnVEAAZ%22%2C%22recordType%22%3A%22Contact%22%7D%2C%22env%22%3A%7B%22width%22%3A1407%2C%22height%22%3A400%2C%22env%22%3A%22mobile%22%7D%7D#pf15';

  $.get(urlWithData, function(res) {
    $('#pinned-list').html(res);
  });

 };



/**
 * Switch class to pin documents
 */
var setPinnedStyle = function(elem, pinned) {
  if (pinned) {
    $(elem).removeClass('fa-star-o');
    $(elem).addClass('fa-star');
  } else {
    $(elem).removeClass('fa-star');
    $(elem).addClass('fa-star-o');
  };
};

var setPinned = function(elem, pinned) {
  var isTitlePinButton = ($(elem).attr('id') == "doc-pin");
  var activePinButton = $('.snippet.active .pin-btn')[0];
  var isActivePinButton = (activePinButton == elem);

  if (isTitlePinButton || isActivePinButton) {
    setPinnedStyle($('#doc-pin'), pinned);
    setPinnedStyle(activePinButton, pinned);
  } else {
    setPinnedStyle(elem, pinned);
  };
};


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
  var filters = {};

  var token = $('#provider').val();
  if (token.length > 0) {
    filters.token = token;
  }

  var dT = $('#type').val();
  if (dT.length > 0) {
    filters.document_type = dT;
  }

  var url = '/app/context-search?filters=' + encodeURIComponent(JSON.stringify(filters));
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
  window.location = urlWithData;
});

/**
 * Toogle left panel
 */
$('#left-toogle').click(function() {
  $("#left-panel").toggleClass('active');
});

/**
* Hide filters
*/
if (!$('#timeline').find('.section-top.hidden').length) {
  $('.snippet-list').scrollTop(60);
}

/**
 * Hide left bar on click snippet
 */
$('.snippet').click(function(e) {
  e.preventDefault();

  $('#empty-message').addClass('hidden');
  $('#full-container').html('<img id="doc-loading-indicator"  src="/img/ajax-loader.gif">');

  $("#left-panel").removeClass('active');
  $('#full-container .full').remove();

  /* Select snippet */
  $('.snippet.active').removeClass('active');
  $(this).addClass('active');
  var selectedSnippet = this;

  /* Change title */
  var title = $(this).find('.title').text();
  $('#doc-title').html(title);

  /* Update #doc-pin style */
  var pinButton = $(this).find('.pin-btn')[0];
  var isPinned = $(pinButton).hasClass('fa-star');
  setPinned(pinButton, isPinned);

  var url = $(this).data("url");
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
  $.get(urlWithData, function(res) {
    if ($(selectedSnippet).hasClass('active')) {
      $('#full-container').html('<div class="well full">' + res + '</div>');
    }
  });
});


/**
 * Pin & un-Pin docs
 */
$('.pin-btn').click(function(e) {
  e.preventDefault();

  var isPinned = $(this).hasClass('fa-star');
  console.log(isPinned);


  if (isPinned) {
    setPinned(this, false);

    var url = '#';
    $.get(url, function(res) {
    });
  } else {
    setPinned(this, true);

    var url = '#';
    $.get(url, function(res) {
    });
  };
});
