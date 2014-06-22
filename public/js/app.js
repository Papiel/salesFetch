'use strict';

window.salesFetchModule = (function() {
  var _data = {};

  var _setDataInUrl = function(url) {
    var linker = url.indexOf('?') !== -1 ? '&' : '?';
    return url + linker + "data=" + encodeURIComponent(JSON.stringify(_data));
  };

  var ret = {};

  /**
   * Init the salesFetch module
   */
  ret.init = function() {
    if (!window.jQuery) {
      return new Error('jQuery hasn\'t been loaded');
    }

    if (!window.data) {
      return new Error('Inivalid data');
    }

    _data = window.data;
    return this;
  };

  /**
   * Retrieve the list of providers
   * @param cb(data) The callback containning the porviders
   */
  ret.getProviders = function(cb) {
    var url = _setDataInUrl('/app/providers');
    $.get(url, cb);
  };

  /**
   * Retrieve the list snippet documents linked in the context
   * @params {Integer} start The start index of documents
   * @param cb(data) The callback containning the HTML generated
   */
  ret.getContextSearch = function(start, cb) {
    var baseUrl = '/app/context-search';
    if (start) {
      baseUrl += '?start=' + start;
    }

    var url = _setDataInUrl(baseUrl);
    $.get(url, cb);
  };

  /**
   * Retrieve a single document
   * @params {String} docId The id of the document to retrieve
   */
  ret.getDocument = function(docId, cb) {
    if (!docId) {
      return new Error('No document to retrieve');
    }

    var url = _setDataInUrl('/app/docment/' + docId);
    $.get(url, cb);
  };

  /**
   * Retrieve the list of snippet pinned to the current context
   * @params {Integer} start The start index of pinned documents
   * @param cb(data) The callback containning the HTML generated
   */
  ret.getPinnedDocuments = function(start, cb) {
    var baseUrl = '/app/pinned';
    if (start) {
      baseUrl += '?start=' + start;
    }

    var url = _setDataInUrl(baseUrl);
    $.get(url, cb);
  };

  /**
   * Pin a document to the current context
   * @params {String} docId The document to pin
   * @param cb(err, data) The callback containning the HTML generated
   */
  ret.pinDocument = function(docId, cb) {
    if (!docId) {
      return new Error('No document to pin');
    }

    var baseUrl = '/app/add-pin/' + docId;
    var url = _setDataInUrl(baseUrl);

    $.get(url, function() {
      ret.getPinnedDocuments(0, cb);
    });
  };

  /**
   * Unpin a document of the current context
   * @params {String} docId The document to unpin
   * @param cb(err, data) The callback containning the HTML generated
   */
  ret.unpinDocument = function(docId, cb) {
    if (!docId) {
      return new Error('No document to unpin');
    }

    var baseUrl = '/app/remove-pin/' + docId;
    var url = _setDataInUrl(baseUrl);

    $.get(url, function() {
      ret.getPinnedDocuments(0, cb);
    });
  };

  /**
   * Go to the curent Context
   * @params {String} url URL to visit
   */
  ret.goTo = function(url) {
    window.location = _setDataInUrl(url);
  };

  return ret;
})();