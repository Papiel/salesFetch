'use strict';

var scrollToTop = require('../helpers/scrollToTop.js');
var historyHelper = require('../helpers/history.js');

/**
 * @file Navigation
 */

/**
 * Get tab from name, returns null if not found
 * @param tabName The name of the tab to find
 * @returns Tab if found, or null
 */
module.exports.getTabFromName = function(tabName) {
  var client = this;

  if(!client.tabs) {
    return null;
  }

  var foundTab;
  client.tabs.some(function(tab) {
    if(tab.name.toLowerCase() === tabName.toLowerCase()) {
      foundTab = tab;
      return true;
    }
    return false;
  });
  return foundTab || null;
};


/**
 * Navigate to tab, creating a history entry, and closing the document full view if mobile mode.
 */

module.exports.showTab = function(tab) {
  var client = this;

  if(client.isMobile || client.isTablet) {
    client.activeDocument(null);
  }

  if(client.activeTab() !== tab) {
    client.activeTab(tab);

    if(client.bindInfiniteScroll) {
      client.bindInfiniteScroll();
    }
  }
};

module.exports.goToTab = function(tab) {
  var client = this;

  if(client.activeTab() !== tab) {
    historyHelper.registerTabEvent(tab);
    module.exports.showTab.bind(client)(tab);
  }
};

/**
 * Get tab from name, returns null if not found
 * @param tabName The name of the tab to find
 * @returns Tab if found, or null
 */
module.exports.getDocumentFromId = function(tab, id) {
  return tab.documents()[id] || null;
};

module.exports.showDocument = function(doc) {
  var client = this;

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
    var w = window.open('', '_blank');
    target = w.document;

    // Use the snippet without html tags for the new tab title
    target.title = $(doc.snippet).text();
    var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

    $(target.body).html(spinnerHTML);
  }


  var writeFullView = function(docHtml) {
    var html;

    if(client.isDesktop) {
      html = '<nav class="navbar"><ul>';
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
    }
    else {
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
};

module.exports.goToDocument = function(doc) {
  var client = this;
  if(client.activeDocument() !== doc || client.isDesktop) {
    module.exports.showDocument.bind(client)(doc);
  }
  if(!client.isDesktop) {
    historyHelper.registerDocumentEvent(doc);
  }
};

module.exports.goBack = function() {
  var client = this;

  if(!(device.ios() && client.isSF1)) {
    history.back();
  }
  client.activeDocument(null);
};
