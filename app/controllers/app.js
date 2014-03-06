/**
 * Salesfoce Canvas controller
 */
'use strict';

var async = require('async');
var request = require('request');
var Mustache = require('mustache');

var anyFetchRequest = function(url, params) {
  var translatedParameters = {};

  if (params && params.query) {
    translatedParameters.search = params.query;
  }

  return {
    url: url,
    qs: translatedParameters,
    headers: {
      'Authorization': 'Basic ' + process.env.FETCHAPI_CREDS
    }
  };
};

var retrieveDocuments = function(context, cb) {
  async.parallel([
    function(cb) {
      request(anyFetchRequest('http://api.anyfetch.com'), cb);
    },
    function(cb){
      request(anyFetchRequest('http://api.anyfetch.com/documents', context), cb);
    }
  ], function(err, data){
    if (err) {
      return cb(err);
    }
    var docReturn = JSON.parse(data[1][0].body);
    var rootReturn = JSON.parse(data[0][0].body);

    docReturn.datas.forEach(function(doc) {
      var relatedTemplate = rootReturn.document_types[doc.document_type].template_snippet;
      doc.snippet_rendered = Mustache.render(relatedTemplate, doc.datas);

      doc.provider = rootReturn.provider_status[doc.token].name;
      doc.document_type = rootReturn.document_types[doc.document_type].name;
    });

    cb(null, docReturn);
  });
};

var retrieveDocument = function(id, cb) {
  async.parallel([
    function(cb) {
      request(anyFetchRequest('http://api.anyfetch.com'), cb);
    },
    function(cb){
      request(anyFetchRequest('http://api.anyfetch.com/documents/' + id), cb);
    }
  ], function(err, data){
    if (err) {
      return cb(err);
    }

    var docReturn = JSON.parse(data[1][0].body);
    var rootReturn = JSON.parse(data[0][0].body);

    var relatedTemplate = rootReturn.document_types[docReturn.document_type].template_full;
    docReturn.full_rendered = Mustache.render(relatedTemplate, docReturn.datas);

    docReturn.provider = rootReturn.provider_status[docReturn.token].name;
    docReturn.document_type = rootReturn.document_types[docReturn.document_type].name;

    cb(null, docReturn);
  });
};

/**
 * Display Context page
 */
module.exports.context = function(req, res) {
  var params = req.session.context.environment.parameters;
  retrieveDocuments(params.record, function(err, datas) {
    //TODO: handle err
    res.render('canvas/timeline.html', {
      context: params.record,
      documents: datas
    });

  });
};

/**
 * Show full document
 */
module.exports.show = function(req, res) {
  //TODO: handle err
  retrieveDocument(req.params.documentId, function(err, datas) {

    res.render('canvas/show.html', {
      document: datas
    });

  });
};

/*
 * Display Search page
 */
module.exports.search = function(req, res) {
  res.render('canvas/search.html', {
    user: req.user
  });
};

/*
 * Retrieve a single document
 */
module.exports.document = function(req, res) {

};