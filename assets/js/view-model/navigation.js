'use strict';

var scrollToTop = require('../helpers/scrollToTop.js');

/**
 * @file Navigation
 */
module.exports.goToTab = function(tab) {
  var client = this;

  client.activeTab(tab);

  if (client.bindInfiniteScroll) {
    client.bindInfiniteScroll();
  }
  if (client.isMobile) {
    client.activeDocument(null);
  }
};

module.exports.goToDocument = function(doc) {
  var client = this;

  if(client.activeDocument() !== doc || client.isDesktop) {
    if(client.shouldDisplayDocumentViewerDefaultMessage) {
      client.shouldDisplayDocumentViewerDefaultMessage(false);
    }
    client.activeDocument(doc);

    var cssBlock = document.createElement('style');
    cssBlock.type = 'text/css';
    cssBlock.innerHTML = 'body { padding: 20px } header { font-size: 25px; margin-bottom: 30px; } #spinner {width: 44px; height: 44px; position: absolute; margin: auto; top: 0; bottom: 0; right: 0; left: 0;}';
    var target;
    if(!client.isDesktop) {
      // TODO: check for browser compatibility
      var iframe = $('#full-iframe')[0];
      target = iframe.contentDocument;
      frames['full-iframe'].document.head.appendChild(cssBlock);
    }
    else {
      // We need to open the popup window right now (i.e. during event handling)
      // otherwise we'll get blocked
      var w = window.open(null, '_blank');
      target = w.document;
      target.head.appendChild(cssBlock);

      // TODO: do not include FontAwesome just for this
      var fontAwesomeLink = '<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">';
      var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

      $(target.body).html(fontAwesomeLink + spinnerHTML);
    }

    var writeFullView = function(html) {
      $(target.body).html(html);
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
