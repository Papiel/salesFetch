'use strict';

var scrollToTop = require('../helpers/scrollToTop.js');

/**
 * @file Navigation
 */
module.exports.goToTab = function(tab) {
    var client = this;

    client.activeTab(tab);

    if (client.isMobile) {
        client.activeDocument(null);
    }
};

module.exports.goToDocument = function(doc) {
    var client = this;

    if(client.activeDocument() !== doc) {
        if(client.shouldDisplayDocumentViewerDefaultMessage) {
            client.shouldDisplayDocumentViewerDefaultMessage(false);
        }
        client.activeDocument(doc);

        var cssBlock = document.createElement('style');
        cssBlock.type = 'text/css';
        cssBlock.innerHTML = 'body { padding: 20px } header { font-size: 25px; margin-bottom: 30px; }';
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
        }

        var writeFullView = function(html) {
            if(!client.isDesktop) {
                frames['full-iframe'].document.head.appendChild(cssBlock);
                $(target.body).html(html);
            }
            else {
                target.head.appendChild(cssBlock);
                $(target.body).html(html);
            }
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
