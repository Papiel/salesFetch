'use strict';

var scrollToTop = require('../helpers/scrollToTop.js');

/**
 * @file Navigation
 */
module.exports.goToTab = function(tab) {
  var client = this;

  if(client.activeTab() !== tab) {
    client.activeTab(tab);

    if(client.bindInfiniteScroll) {
      client.bindInfiniteScroll();
    }
    if(client.isMobile) {
      client.activeDocument(null);
    }
  }
};

module.exports.goToDocument = function(doc) {
  var client = this;

  if(client.activeDocument() !== doc || client.isDesktop) {
    if(client.shouldDisplayDocumentViewerDefaultMessage) {
      client.shouldDisplayDocumentViewerDefaultMessage(false);
    }
    client.activeDocument(doc);

    var target;
    if(!client.isDesktop) {
      // TODO: check for browser compatibility
      var iframe = $('#full-iframe')[0];
      target = iframe.contentDocument;
    }
    else {
      // We need to open the popup window right now (i.e. during event handling)
      // otherwise we'll get blocked
      var w = window.open(undefined, '_blank');
      target = w.document;

      // Use the snippet without html tags for the new tab title
      target.title = $(doc.snippet).text();
      var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

      $(target.body).html(spinnerHTML);
    }


    var writeFullView = function(docHtml) {
      var html;
      if(client.isDesktop) {
        html = '<nav><ul>';
        html += '<li class="title"><a>' + doc.title() + '</a></li>';

        if(doc.actions.show) {
          html += '<li class="pull-right"><a class="fa fa-external-link" href="' + doc.actions.show + '" target="_blank"></a></li>';
        }
        if(doc.actions.download) {
          html += '<li class="pull-right"><a class="fa fa-cloud-download" href="' + doc.actions.download + '" target="_blank"></a></li>';
        }
        if(doc.actions.reply) {
          html += '<li class="pull-right"><a class="fa fa-mail-reply" href="' + doc.actions.reply + '" target="_blank"></a></li>';
        }

        html += '</ul></nav><div id="document-container">' + docHtml + '</div>';
      } else {
        html = '<div id="document-container" class="anyfetch-mobile-scroll">' + docHtml + '</div>';
      }
      $(target.body).html(html);

      // needed by the about:blank window created on desktop
      // this allows links without host to work
      $(target.head).append('<base href="' + $.salesFetchUrl + '" />');

      $(target.head).append('<meta charset="utf-8">');

      $(target.head).append('<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" type="text/css">');
      $(target.head).append('<link rel="stylesheet" href="/dist/index.min.css" type="text/css">');
      $(target.head).append('<link rel="stylesheet" href="/dist/full-view.css" type="text/css">');
      window.anyfetchAssets.formatDates({document: target});

      // Copy class from current <html></html>
      $(target.documentElement).addClass($("html").attr("class"));
    };

    // Load document full document content (AJAX) if needed
    // and write the result in the viewer
    if(!doc.full()) {
      client.fetchFullDocument(doc, writeFullView);
    }
    else {
      writeFullView(doc.full());
    }
  }
};

module.exports.goBack = function() {
  var client = this;

  scrollToTop();
  client.activeDocument(null);
};
