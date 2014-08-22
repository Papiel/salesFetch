'use strict';

var scrollToTop = require('../helpers/scrollToTop.js');

/**
 * @file Navigation
 */
module.exports.goToTab = function(tab) {
  var client = this;

  if (client.activeTab() !== tab) {
    client.activeTab(tab);

    if (client.bindInfiniteScroll) {
      client.bindInfiniteScroll();
    }
    if (client.isMobile) {
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

    var cssBlock = document.createElement('style');
    cssBlock.type = 'text/css';
    cssBlock.innerHTML = 'body { font-size: 13px; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', \'sans-serif\';padding: 20px; background: white; text-overflow: ellipsis; white-space: normal; word-wrap: break-word; } header { font-size: 16px; margin-bottom: 30px; color: #646464; } header h1 { font-size: 25px; color: #14A8E1; } header p { margin: 5px 0px; } header a { color: #14A8E1; text-decoration: none; } #spinner {width: 44px; height: 44px; position: absolute; margin: auto; top: 0; bottom: 0; right: 0; left: 0;}';
    var target;
    if(!client.isDesktop) {
      // TODO: check for browser compatibility
      var iframe = $('#full-iframe')[0];
      target = iframe.contentDocument;
    }
    else {
      // We need to open the popup window right now (i.e. during event handling)
      // otherwise we'll get blocked
      var w = window.open(null, '_blank');
      target = w.document;

      // TODO: do not include FontAwesome just for this
      var fontAwesomeLink = '<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">';
      var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

      $(target.body).html(fontAwesomeLink + spinnerHTML);
    }

    var writeFullView = function(html) {
      $(target.body).html(html);
      target.head.appendChild(cssBlock);
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
