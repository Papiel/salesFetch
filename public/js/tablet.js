'use strict';

var data = window.data;

var activePinButton = function() {
  return $('.snippet.active .pin-btn')[0];
};

var isTitlePinButton = function(elem) {
  return ($(elem).attr('id') === "doc-pin");
};

var isActivePinButton = function (elem) {
  return (activePinButton() === elem);
};

var updateActiveDocument = function(docUrl) {
  var pinnedSnippets = $('#pinned-list .snippet');
  var timelineSnippets = $('#timeline .snippet');

  var found = false;
  for (var i = 0; i < pinnedSnippets.length && !found; i += 1) {
    if ($(pinnedSnippets[i]).data('url') === docUrl) {
      $(pinnedSnippets[i]).addClass('active');
      found = true;
    }
  }

  found = false;
  for (var i = 0; i < timelineSnippets.length && !found; i += 1) {
    if ($(timelineSnippets[i]).data('url') === docUrl) {
      $(timelineSnippets[i]).addClass('active');
      found = true;
    }
  }
};

/**
 * fetchPinnedDocuments
 */
 var fetchPinnedDocuments = function() {

  var url = '/app/pinned';
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));

  $.get(urlWithData, function(res) {
    $('#pinned-list').html(res);
    updateActiveDocument();
  });

 };
fetchPinnedDocuments();

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
  }
};

var setPinned = function(elem, pinned) {
  if (isTitlePinButton(elem) || isActivePinButton(elem)) {
    setPinnedStyle($('#doc-pin'), pinned);
    setPinnedStyle(activePinButton(), pinned);
  } else {
    setPinnedStyle(elem, pinned);
  }
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
$(document).on('click', '.snippet', function(e) {
  e.preventDefault();

  $('#doc-pin').removeClass('hidden');
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

  updateActiveDocument($(this).data('url'));

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
$(document).on( 'click', '.pin-btn', function(e) {
  e.preventDefault();
  e.stopPropagation();

  var isPinned = $(this).hasClass('fa-star');
  var docId;

  var url;
  var linker;
  var urlWithData;

  if (isTitlePinButton(this)) {
    docId = $('.snippet.active .pin-btn').data('doc');
  } else {
    docId = $(this).data('doc');
  }

  if (isPinned) {
    setPinned(this, false);

    url = '/app/remove-pin/' + docId;
    linker = url.indexOf('?') !== -1 ? '&' : '?';
    urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
    $.get(urlWithData, function() {
      fetchPinnedDocuments();
    });
  } else {
    setPinned(this, true);

    url = '/app/add-pin/' + docId;
    linker = url.indexOf('?') !== -1 ? '&' : '?';
    urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
    $.get(urlWithData, function() {
      fetchPinnedDocuments();
    });
  }
});
