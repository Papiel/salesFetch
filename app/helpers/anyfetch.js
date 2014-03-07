'use strict';

var async = require('async');
var request = require('superagent');
var Mustache = require('mustache');


var baseRequest = function(method, url) {
  return request[method]("http://api.anyfetch.com" + url).set('Authorization', 'Basic ' + process.env.FETCHAPI_CREDS);
};


module.exports.findDocuments = function(params, cb) {
  async.parallel([
    function loadDocumentTypes(cb) {
      baseRequest('get', '/')
        .end(function(e, r) {cb(e,r);});
    },
    function loadDocuments(cb) {
      baseRequest('get', '/documents')
        .query(params)
        .end(function(e, r) {cb(e,r);});
    }
  ],
  function(err, data){
    if (err) {
      return cb(err);
    }

    var rootReturn = data[0].body;
    var docReturn = data[1].body;

    docReturn.datas.forEach(function(doc) {
      var relatedTemplate = rootReturn.document_types[doc.document_type].template_snippet;
      doc.snippet_rendered = Mustache.render(relatedTemplate, doc.datas);

      doc.provider = rootReturn.provider_status[doc.token].name;
      doc.document_type = rootReturn.document_types[doc.document_type].name;
    });

    cb(null, docReturn);
  });
};

module.exports.findDocument = function(id, cb) {
  async.parallel([
    function(cb) {
      baseRequest('get', '/').end(function(e, r) { cb(e,r);});
    },
    function(cb) {
      baseRequest('get', '/documents/' + id).end(function(e, r) { cb(e,r);});
    }
  ],
  function(err, data) {
    if (err) {
      return cb(err);
    }

    var rootReturn = data[0].body;
    var docReturn = data[1].body;

    var relatedTemplate = rootReturn.document_types[docReturn.document_type].template_full;
    docReturn.full_rendered = Mustache.render(relatedTemplate, docReturn.datas);

    docReturn.provider = rootReturn.provider_status[docReturn.token].name;
    docReturn.document_type = rootReturn.document_types[docReturn.document_type].name;

    cb(null, docReturn);
  });
};
