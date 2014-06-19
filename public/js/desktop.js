'use strict';

var data = window.data;

/**
 * fetchPinnedDocuments
 */
 var fetchPinnedDocuments = function() {

  var url = '/app/pinned';
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithData = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));

  $.get(urlWithData, function(res) {
    $('#pinned-list').html(res);
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
	setPinnedStyle(elem, pinned);
};


/**
 * Pin & un-Pin docs
 */
$(document).on( 'click', '.pin-btn', function(e) {
  e.preventDefault();
  e.stopPropagation();

  var isPinned = $(this).hasClass('fa-star');
  var docId = docId = $(this).data('doc');

  var url;
  var linker;
  var urlWithData;

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
