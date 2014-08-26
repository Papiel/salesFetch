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
    cssBlock.innerHTML = 'body { margin: 0px; } #document-container { font-size: 13px; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', \'sans-serif\';padding: 20px; background: white; text-overflow: ellipsis; white-space: normal; word-wrap: break-word; } #document-container.desktop { margin-top: 50px; } nav { position: fixed; top: 0px; left: 0px; right: 0px; height: 60px; box-shadow: inset 0 -20px 30px -25px #000; background: #474747; } nav ul { list-style-type: none; } nav a { color: white; font-size: 20px; padding: 5px; text-decoration: none; } header { font-size: 16px; margin-bottom: 30px; color: #646464; } header h1 { font-size: 25px; color: #14A8E1; } header p { margin: 5px 0px; } header a { color: #14A8E1; text-decoration: none; } #spinner {width: 44px; height: 44px; position: absolute; margin: auto; top: 0; bottom: 0; right: 0; left: 0;} .hlt { background-color: rgba(255,242,138,.6); }';
    var fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.type = 'text/css';
    fontAwesomeLink.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css';
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
      var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

      $(target.body).html(spinnerHTML);
    }
    target.head.appendChild(fontAwesomeLink);
    target.head.appendChild(cssBlock);

    var writeFullView = function(docHtml) {
      if (client.isDesktop) {
        var html = fontAwesomeLink + '<nav><ul>';

        if (doc.actions.show) {
          html += '<li><a class="fa fa-external-link" href="' + doc.actions.show + '" target="_blank"></a></li>';
        }
        if (doc.actions.download) {
          html += '<li><a class="fa fa-cloud-download" href="' + doc.actions.download + '" target="_blank"></a></li>';
        }
        if (doc.actions.reply) {
          html += '<li><a class="fa fa-mail-reply" href="' + doc.actions.reply + '" target="_blank"></a></li>';
        }

        html += '</ul></nav><div id="document-container" class="desktop">' + docHtml + '</div>';
      } else {
        var html = '<div id="document-container">' + docHtml + '</div>';
      }
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
