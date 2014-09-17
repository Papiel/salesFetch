'use strict';

var fs = require('fs');
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

    var cssBlock = document.createElement('style');
    cssBlock.type = 'text/css';
    // This ends up being statically replaced by the file's content by Browserify
    cssBlock.innerHTML = fs.readFileSync(__dirname + '/../../../public/dist/full-view.css', 'utf8');
    var fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.type = 'text/css';
    // TODO: include from the static server like all other resources (SalesForce or localhost)
    fontAwesomeLink.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css';
    var anyfetchStyleLink = document.createElement('link');
    anyfetchStyleLink.rel = 'stylesheet';
    anyfetchStyleLink.type = 'text/css';
    // TODO: include from the static server like all other resources (SalesForce or localhost)
    anyfetchStyleLink.href = 'https://cdn.rawgit.com/AnyFetch/anyfetch-snippet-style/master/dist/index.min.css';

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

      // Use the snippet without html tags for the new tab title
      target.title = $(doc.snippet).text();
      var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

      $(target.body).html(spinnerHTML);
    }
    target.head.appendChild(cssBlock);
    target.head.appendChild(fontAwesomeLink);
    target.head.appendChild(anyfetchStyleLink);

    var writeFullView = function(docHtml) {
      var html;
      if(client.isDesktop) {
        html = '<nav><ul>';

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
