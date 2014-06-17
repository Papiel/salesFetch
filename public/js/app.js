'use strict';

var attachedViewer = null;
var data = window.data;

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
 * Open documents URL in custom window
 */
$(function() {
  if ($('.document').length !== 0) {

    var isViewer = window.opener ? true : false;
    var isOnMobile = data.env.deviseType === "mobile";

    // Handle the full preview loading
    $(".snippet-list").on('click', '[data-document-url]', function(e) {
      e.preventDefault();

      var url = $(this).data("documentUrl");
      if (isOnMobile) {
        goToLocation(window, url);
      } else if (!isViewer) {
        displayFull(url);
      }

    });
  }
});

/**
 * Handle filters
 */
$(function() {
  $("#show-filters").click(function(e) {
    e.preventDefault();
    $("#about-string").addClass("hidden");
    $("#filters-container").removeClass("hidden");
  });

  $("#hide-filters").click(function(e) {
    e.preventDefault();
    $("#about-string").removeClass("hidden");
    $("#filters-container").addClass("hidden");
  });

  $("#send-filters").click(function(e) {
    e.preventDefault();

    var filters = {};

    var token = $('#token').val();
    if (token.length > 0) {
      filters.token = token;
    }

    var dT = $('#document_type').val();
    if (dT.length > 0) {
      filters.document_type = dT;
    }

    var url = '/app/context-search?filters=' + encodeURIComponent(JSON.stringify(filters));

    goToLocation(window, url);
  });
});

/**
 * Access pages
 */
$(function() {
  $(".link").click(function(e) {
    e.preventDefault();
    if ($(this).hasClass('link-popup')) {
      attachedViewer = window.open(null,"_blank","scrollbars=yes, resizable=yes, width=600, height=800");
      goToLocation(attachedViewer, e.target.href);
    } else {
      goToLocation(window, e.target.href);
    }
  });
});

/**
 * Infinite scroll
 */
$(function() {
  if($('#loading-documents')) {
    var loading = false;
    var currentCount = 20;
    var lastDocument = false;

    $(window).scroll(function(){
      if (!loading && !lastDocument && $(window).scrollTop() === $(document).height() - $(window).height()){

        loading = true;
        $('#loading-documents').removeClass('hidden');
        var loadingUrl = document.URL + '&start=' + currentCount;

        $.get(loadingUrl, function(res) {
          if (!res.length) {
            lastDocument = true;
          }

          $(res).insertBefore('#loading-documents');
          currentCount = $('.snippet-container').length;
          $('#loading-documents').addClass('hidden');
          loading = false;
        });
      }
    });
  }
});
