'use strict';

var request = require('supertest');
var Mustache = require('mustache');
var async = require('async');
var crypto = require('crypto');

var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');

var config = require('../../config/configuration.js');

/**
 * Execute query and return a list of templated sinppets
 */
var baseRequest = function(url, endpoint, cb) {
  return request(url).get(endpoint)
    .set('Authorization', 'Basic ' + config.fetchApiCreds)
    .end(function(e, r) {cb(e,r);});
};


module.exports.findDocuments = function(url, params, cb) {
  var pages = [];

  async.waterfall([
    function executeBatchRequest(cb) {
      var query = [];
      for(var key in params) {
        query.push(key + "=" + encodeURIComponent(params[key]));
      }

      pages = [
        '/document_types',
        '/providers',
        '/documents?' + query.join('&')
      ];

      var batchParams = pages.map(encodeURIComponent).join('&pages=');
      var batchUrl = '/batch?pages=' + batchParams;

      baseRequest(url, batchUrl, cb);
    },
    function templateResults(res, cb) {

      var body = res.body;

      var documentTypes = body[pages[0]];
      var providers = body[pages[1]];
      var docReturn = body[pages[2]];

      if (!docReturn.datas) {
        return cb(null, docReturn);
      }

      // Render the templated datas
      docReturn.datas.forEach(function(doc) {
        var relatedTemplate = documentTypes[doc.document_type].template_snippet;
        doc.snippet_rendered = Mustache.render(relatedTemplate, doc.datas);

        doc.provider = providers[doc.token].name;
        doc.document_type = documentTypes[doc.document_type].name;
      });

      // Return all the documents types
      var tempDocTypes = {};
      for (var docType in docReturn.facets.document_types) {
        var dT = {
          id: docType,
          count: docReturn.facets.document_types[docType],
          name: documentTypes[docType].name
        };

        tempDocTypes[docType] = dT;
      }
      docReturn.document_types = tempDocTypes;

      // Return all the providers
      var tempProviders = {};
      for (var provider in docReturn.facets.tokens) {
        var p = {
          id: provider,
          count: docReturn.facets.tokens[provider],
          name: providers[provider].name
        };

        tempProviders[provider] = p;
      }
      docReturn.providers = tempProviders;

      cb(null, docReturn);

    }
  ], cb);
};

/**
 * Find and return a single templated document
 */
module.exports.findDocument = function(url, id, cb) {
  var pages = [
    '/document_types',
    '/providers',
    '/documents/' + id
  ];

  var batchParams = pages.map(encodeURIComponent).join('&pages=');
  baseRequest(url, '/batch?pages=' + batchParams, function(err, res) {
    if (err) {
      return cb(err);
    }

    var body = res.body;

    var documentTypes = body[pages[0]];
    var providers = body[pages[1]];
    var docReturn = body[pages[2]];

    var relatedTemplate = documentTypes[docReturn.document_type].template_full;
    var titleTemplate = documentTypes[docReturn.document_type].template_title;

    docReturn.full_rendered = Mustache.render(relatedTemplate, docReturn.datas);
    docReturn.title_rendered = Mustache.render(titleTemplate, docReturn.datas);

    docReturn.provider = providers[docReturn.token].name;
    docReturn.document_type = documentTypes[docReturn.document_type].name;

    cb(null, docReturn);
  });
};


/**
 * Create a subcompany and an admin on the FetchAPI
 * Store the linking informations btw Salesforce and FetchAPI
 */
module.exports.initAccount = function(data, done) {
  var url = config.fetchApiUrl;

  var user = data.user;
  var org = data.organization;


  async.waterfall([
    function checkIfCompanyAlreadyExist(cb) {
      Organization.findOne({'SFDCId': org.id}, function(err, existingOrg) {
        if (existingOrg) {
          return done(null, existingOrg);
        }

        cb(null);
      });
    },
    function createRandomPassword(cb) {
      crypto.randomBytes(20, function(ex, buf) {
        var password = buf.toString('base64');
        user.password = password;
        cb(null);
      });
    },
    function createAccount(cb) {
      // Avoid collision with production
      if (config.env === 'development') {
        user.name = 'dev-' + user.name;
      }

      request(url).post('/users')
        .set('Authorization', 'Basic ' + config.fetchApiCreds)
        .send({
          email: user.name,
          name: user.name,
          password: user.password,
          is_admin: true,
        })
        .expect(200)
        .end(cb);
    },
    function retrieveUserToken(res, cb) {
      user.anyFetchId = res.body.id;
      user.basicAuth = new Buffer(user.name + ':' + user.password).toString('base64');

      request(url).get('/token')
        .set('Authorization', 'Basic ' + user.basicAuth)
        .expect(200)
        .end(cb);
    },
    function createSubCompany(res, cb) {
      user.token = res.body.token;

      request(url).post('/subcompanies')
        .set('Authorization', 'Bearer ' + user.token)
        .send({
          name: org.name
        })
        .end(cb);
    },
    function saveLocalCompany(res, cb) {
      var localOrg = new Organization({
        name: org.name,
        SFDCId: org.id,
        anyFetchId: res.body.id
      });

      localOrg.save(cb);
    },
    function saveLocalUser(localOrganization, count, cb) {
      org = localOrganization;

      var localUser = new User({
        name: user.name,
        email: user.email,
        SFDCId: user.id,
        anyFetchId: user.anyFetchId,
        anyFetchToken: user.token,
        organization: localOrganization,
        isAdmin: true
      });

      localUser.save(cb);
    }
  ], function(err) {
    done(err, org);
  });
};

/**
 * Create a user attached to the existing subcompany
 * and store it on the local DB
 */
module.exports.addNewUser = function(user, organization, cb) {
  var url = config.fetchApiUrl;

  async.waterfall([
    function createRandomPassword(cb) {
      crypto.randomBytes(20, function(ex, buf) {
        var password = buf.toString('base64');
        user.password = password;
        cb(null);
      });
    },
    function retrieveAdminToken(cb) {
      User.findOne({organization: organization, admin: true}, cb);
    },
    function createNewUser(adminUser, cb) {
      var adminToken = adminUser.token;
      request(url).post('/users')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({
          email: user.email,
          name: user.name,
          password: user.password
        })
        .end(cb);
    },
    function retrieveUserToken(anyFetchUser, cb) {
      user.anyFetchId = anyFetchUser.id;

      request(url).get('/token')
        .set('Authorization', 'Basic ' + new Buffer(user.email + ':' + user.password).toString('base64'))
        .end(cb);
    },
    function saveLocalUser(res, cb) {
      var userToken = res.token;

      var localUser = new User({
        name: user.name,
        email: user.email,
        SFDCId: user.id,
        anyFetchId: user.anyFetchId,
        token: userToken,
        organization: organization._id
      });

      localUser.save(cb);
    }
  ], cb );
};