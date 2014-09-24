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
        html += '<li><a>' + doc.title() + '</a></li>';

        if(doc.actions.show) {
          html += '<li><a class="fa fa-external-link" href="' + doc.actions.show + '" target="_blank"></a></li>';
        }
        if(doc.actions.download) {
          html += '<li><a class="fa fa-cloud-download" href="' + doc.actions.download + '" target="_blank"></a></li>';
        }
        if(doc.actions.reply) {
          html += '<li><a class="fa fa-mail-reply" href="' + doc.actions.reply + '" target="_blank"></a></li>';
        }

        html += '</ul></nav><div id="document-container" class="desktop">' + docHtml + '</div>';
      } else {
        html = '<div id="document-container">' + docHtml + '</div>';
      }
      $(target.body).html(html);
      $(target.head).append('<link rel="stylesheet" href="https://cdn.rawgit.com/AnyFetch/anyfetch-snippet-style/v0.2.9/dist/index.min.css" type="text/css">');
      $(target.head).append($('<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">'));
      $(target.head).append('<link rel="stylesheet" href="/dist/full-view.css" type="text/css">');
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
