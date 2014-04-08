'use strict';

var attachedViewer = null;
var data = window.data;

var goToLocation = function(window, url) {
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithDatas = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
  window.location = urlWithDatas;
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
    $("[data-document-url]").click(function(e) {
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
 * Admin panel functions
 */
$(function() {
  $("[data-admin-url]").click(function(e) {
    e.preventDefault();

    var url = $(this).data("adminUrl");
    goToLocation(window, url);
  });

  $("#form").submit(function(e) {
    e.preventDefault();
    var url = $("#form").attr("action") + "?data=" + encodeURIComponent(JSON.stringify(data));

    $.post(url, $("#form").serialize(), function(data, status) {
      if(status === "nocontent") {
        goToLocation(window, '/admin');
      }
    });
  });
});


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
 * Display the right size for pdf viewer
 */
$(function() {
  var getPdfZoom = function() {
    var containerWidth = $('#page-container').width();
    $('[data-page-no]').each(function() {
      var pageWidth = $(this).width();
      var ratio = containerWidth / pageWidth - 0.005;
      $(this).css("zoom", ratio);
      $(this).css("-moz-transform", ratio);
    });
  };

  if ($('#page-container')) {
    $( window ).resize(function() {
      getPdfZoom();
    });

    getPdfZoom();
  }
});
