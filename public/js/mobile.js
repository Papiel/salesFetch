'use strict';

var salesFetch = window.salesFetchModule.init();
salesFetch.getPinnedDocuments(0, function(data) {
  $('#pinned-list').html(data);
});

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
 * Load more
 */
var isLoading = false;
// Can load more if 20 results templated in the rendred HTML
var canLoadMore = $('#timeline .snippet').length === 20;

var appendSnippets = function(data) {
  var convertedData = $(data);
  canLoadMore = $('.snippet', data).length === 20;

  // Check if recieved snippets need to be append in the the last section
  var firstRetrievedTimeSlice = $('#timeline .section-header legend', convertedData).first().innerHTML;
  var lastTimeSlice = $('#timeline .section-header legend').last().innerHTML;

  if (firstRetrievedTimeSlice === lastTimeSlice) {
    var sameTimeSnippets = $('.snippet', convertedData.first());
    $('#timeline  .section-content').last().append(sameTimeSnippets);
    convertedData = convertedData.slice(1);
  }

  // Append the remaining snippets
  $('#timeline .snippet-list').append(convertedData);
};

$(window).bind('scroll', function() {
  if($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !isLoading && canLoadMore) {
    isLoading = true;
    var start = $('#timeline .snippet').length;

    var loader = $("#loading-more").html();
    $('#timeline .snippet-list').append(loader);

    salesFetch.getContextSearch(start, function(data) {
      isLoading = false;
      $('#timeline .loader').remove();
      appendSnippets(data);
    });
  }
});

/**
 * Pin & un-Pin docs
 */
$(document).on( 'click', '.pin-btn', function(e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  var star = $(this);

  var isPinned = star.hasClass('fa-star');
  var docId = star.data('doc');

  if (!isPinned) {
    salesFetch.pinDocument(docId, function(data) {
      $('.pin-btn[data-doc=' + docId + ']').removeClass('fa-star-o');
      $('.pin-btn[data-doc=' + docId + ']').addClass('fa-star');
      $('#pinned-list').html(data);
    });
  } else {
    salesFetch.unpinDocument(docId, function(data) {
      $('.pin-btn[data-doc=' + docId + ']').addClass('fa-star-o');
      $('.pin-btn[data-doc=' + docId + ']').removeClass('fa-star');
      $('#pinned-list').html(data);
    });
  }
});


/**
 * Show full
 */
$(document).on('click', '[data-url]', function(e) {
  e.preventDefault();
  var url = $(this).data("url");
  salesFetch.goTo(url);
});
