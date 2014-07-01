'use strict';

var data = window.data;
var attachedViewer = null;

var goToLocation = function(window, url) {
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
  window.location = urlWithData;
};

var displayFull = function(url) {
  if (!attachedViewer) {
    // Create a new viewer and display the right Url
    attachedViewer = window.open(null,"_blank","toolbar=yes, scrollbars=yes, resizable=yes, width=800, height=1000");
    attachedViewer.document.write('loading...');
    goToLocation(attachedViewer, url);

    var interval = window.setInterval(function() {
        try {
          if (attachedViewer === null || attachedViewer.closed) {
            window.clearInterval(interval);
            attachedViewer = null;
          }
        }
        catch (e) {
        }
      }, 200);
  } else {
    attachedViewer.document.write('loading...');
    goToLocation(attachedViewer, url);
    attachedViewer.focus();
  }
};

/**
 * fetchPinnedDocuments
 */
var fetchPinnedDocuments = function() {
  var url = '/app/pins';
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));

  $.get(urlWithData, function(res) {
    $('#pinned-list').html(res);
  });

};
fetchPinnedDocuments();

/**
 * fetchPinnedDocuments
 */
var fetchProviders = function() {

  var url = '/app/providers';
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));

  $.get(urlWithData, function(res) {
    $('#provider-list').html(res);
  });

};
fetchProviders();


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
	setPinnedStyle(elem, pinned);
};

/**
 * Open documents URL in custom window
 */
var isViewer = window.opener ? true : false;

// Handle the full preview loading
$(".snippet-list").on('click', '.snippet', function(e) {
  e.preventDefault();

  var url = $(this).data("url");
  if (!isViewer) {
    displayFull(url);
  }

});


/**
 * Pin & un-Pin docs
 */
$(document).on('click', '.pin-btn', function(e) {
  e.preventDefault();
  e.stopPropagation();

  var isPinned = $(this).hasClass('fa-star');
  var docId = $(this).data('doc');

  var url;
  var linker;
  var urlWithData;

  if (isPinned) {
    setPinned(this, false);

    url = '/app/pins/' + docId;
    linker = url.indexOf('?') !== -1 ? '&' : '?';
    urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
    $.ajax({
      url: urlWithData,
      type: 'DELETE',
      success: function() {
        fetchPinnedDocuments();
      }
    });
  } else {
    setPinned(this, true);

    url = '/app/pins/' + docId;
    linker = url.indexOf('?') !== -1 ? '&' : '?';
    urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
    $.ajax({
      url: urlWithData,
      type: 'POST',
      success: function() {
        fetchPinnedDocuments();
      }
    });
  }
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function () {
  fetchPinnedDocuments();
});

/**
 * Provider linking
 */
$('#provider-list').on( 'click', '.link', function(e) {
  e.preventDefault();
  var url = $(this).attr("href");
  var attachedViewer = window.open(null,"_blank","toolbar=yes, scrollbars=yes, resizable=yes, width=800, height=1000");
  goToLocation(attachedViewer, url);
});
