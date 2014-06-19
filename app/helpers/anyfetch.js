'use strict';

var request = require('supertest');
var Mustache = require('mustache');
var async = require('async');
var crypto = require('crypto');
var _ = require("lodash");
var fs = require('fs');
var rarity = require('rarity');

var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');

var salesfetchHelpers = require('./salesfetch.js');

var config = require('../../config/configuration.js');
var fetchApiUrl = config.fetchApiUrl;

var cachedTemplates = {};
var getOverridedTemplates = function() {
  if (config.env !== 'development' && !_.isEmpty(cachedTemplates)) {
    return cachedTemplates;
  }

  var templatePath = __dirname + '/../views/templates';
  fs.readdirSync(templatePath).forEach(function(file) {
    var newPath = templatePath + '/' + file;
    var templateConfig = require(newPath);

    cachedTemplates[templateConfig.id] = templateConfig;
  });

  return cachedTemplates;
};
module.exports.getOverridedTemplates = getOverridedTemplates;

module.exports.findDocuments = function(params, user, cb) {
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

      request(fetchApiUrl).get(batchUrl)
        .set('Authorization', 'Bearer ' + user.anyFetchToken)
        .end(cb);
    },
    function templateResults(res, cb) {
      if (res.status === 401) {
        return cb(new Error('Invalid credentials'));
      }

      var body = res.body;

      var documentTypes = body[pages[0]];
      var providers = body[pages[1]];
      var docReturn = body[pages[2]];

      if (!docReturn.data) {
        return cb(null, docReturn);
      }

      // Render the templated data
      docReturn.data.forEach(function(doc) {
        var relatedTemplate;

        var overridedTemplate = getOverridedTemplates();
        if (overridedTemplate[doc.document_type]) {
          relatedTemplate = overridedTemplate[doc.document_type].templates.snippet;
        } else {
          relatedTemplate = documentTypes[doc.document_type].templates.snippet;
        }

        doc.snippet_rendered = Mustache.render(relatedTemplate, doc.data);

        doc.provider = providers[doc.provider].name;
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
      for (var provider in docReturn.facets.providers) {
        var p = {
          id: provider,
          count: docReturn.facets.providers[provider],
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
module.exports.findDocument = function(id, user, context, finalCb) {
  var pages = [
    '/document_types',
    '/providers',
    '/documents/' + id
  ];
  var batchParams = pages.map(encodeURIComponent).join('&pages=');

  async.waterfall([
    function sendBatchRequest(cb) {
      request(fetchApiUrl).get('/batch?pages=' + batchParams)
        .set('Authorization', 'Bearer ' + user.anyFetchToken)
        .end(rarity.carry(pages, cb));
    },
    function applyTemplate(typesUrl, providersUrl, docsUrl, res, cb) {
      if (res.status === 401) {
        return cb(new Error('Invalid credentials'));
      }

      var body = res.body;
      var documentTypes = body[typesUrl];
      var providers = body[providersUrl];
      var docReturn = body[docsUrl];

      var relatedTemplate;
      var titleTemplate;

      var overridedTemplate = getOverridedTemplates();
      if (overridedTemplate[docReturn.document_type]) {
        relatedTemplate = overridedTemplate[docReturn.document_type].templates.full;
        titleTemplate = overridedTemplate[docReturn.document_type].templates.title;
      } else {
        relatedTemplate = documentTypes[docReturn.document_type].templates.full;
        titleTemplate = documentTypes[docReturn.document_type].templates.title;
      }

      docReturn.full_rendered = Mustache.render(relatedTemplate, docReturn.data);
      docReturn.title_rendered = Mustache.render(titleTemplate, docReturn.data);

      docReturn.provider = providers[docReturn.provider].name;
      docReturn.document_type = documentTypes[docReturn.document_type].name;

      cb(null, docReturn);
    },
    function getPin(doc, cb) {
      salesfetchHelpers.getPin(context.recordId, doc.id, rarity.carry([doc], cb));
    },
    function markIdPinned(doc, pin, cb) {
      doc.pinned = !!pin;
      cb(null, doc);
    }
  ], finalCb);
};


/**
 * Create a subcompany and an admin on the FetchAPI
 * Store the linking informations btw Salesforce and FetchAPI
 */
module.exports.initAccount = function(data, done) {
  var user = data.user;
  var org = data.organization;


  async.waterfall([
    function checkIfCompanyAlreadyExist(cb) {
      Organization.findOne({'SFDCId': org.id}, function(err, existingOrg) {
        if (existingOrg && !existingOrg.deleted) {
          return done(null, existingOrg);
        }

        if (existingOrg && existingOrg.deleted) {
          existingOrg.deleted = false;
          return existingOrg.save(done);
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

      request(fetchApiUrl).post('/users')
        .set('Authorization', 'Basic ' + config.fetchApiCreds)
        .send({
          email: user.name,
          name: user.name,
          password: user.password,
          is_admin: true,
        })
        .end(cb);
    },
    function retrieveUserToken(res, cb) {
      if(res.status !== 200){
        return cb(new Error(res.body));
      }

      user.anyFetchId = res.body.id;
      user.basicAuth = new Buffer(user.name + ':' + user.password).toString('base64');

      request(fetchApiUrl).get('/token')
        .set('Authorization', 'Basic ' + user.basicAuth)
        .end(cb);
    },
    function createSubCompany(res, cb) {
      if(res.status !== 200){
        return cb(new Error(res.body));
      }

      user.token = res.body.token;

      request(fetchApiUrl).post('/subcompanies')
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

  async.waterfall([
    function createRandomPassword(cb) {
      crypto.randomBytes(20, function(ex, buf) {
        var password = buf.toString('base64');
        user.password = password;
        cb(null);
      });
    },
    function retrieveAdminToken(cb) {
      User.findOne({organization: organization._id, isAdmin: true}, cb);
    },
    function createNewUser(adminUser, cb) {
      if (!adminUser) {
        return cb(new Error('No admin for the comapny has been found'));
      }

      var adminToken = adminUser.anyFetchToken;
      request(fetchApiUrl).post('/users')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({
          email: user.name,
          name: user.name,
          password: user.password
        })
        .end(cb);
    },
    function retrieveUserToken(res, cb) {
      if(res.status !== 200){
        return cb(new Error(res.body));
      }

      user.anyFetchId = res.body.id;
      user.basicAuth = new Buffer(user.name + ':' + user.password).toString('base64');

      request(fetchApiUrl).get('/token')
        .set('Authorization', 'Basic ' + user.basicAuth)
        .end(cb);
    },
    function saveLocalUser(res, cb) {
      if(res.status !== 200){
        return cb(new Error(res.body));
      }
      var userToken = res.body.token;

      var localUser = new User({
        name: user.name,
        email: user.email,
        SFDCId: user.id,
        anyFetchId: user.anyFetchId,
        anyFetchToken: userToken,
        organization: organization
      });

      localUser.save(cb);
    }
  ], cb );
};

/**
 * Retrieve all providers
 */
module.exports.getProviders = function(cb) {
  var apiUrl = 'https://manager.anyfetch.com';

  async.waterfall([
    function retrieveProviders(cb) {
      request(apiUrl).get('/marketplace.json?trusted=true')
        .end(cb);
    },
    function setId(res, cb) {
      var providers = res.body;

      cb(null, providers);
    }
  ], cb);
};

/**
 * Retrieve all connect provider for an account
 */
module.exports.getConnectedProviders = function(user, cb) {
  request(fetchApiUrl).get('/providers')
    .set('Authorization', 'Bearer ' + user.anyFetchToken)
    .end(cb);
};

/**
 * Update the company documents
 */
module.exports.updateAccount = function(user, cb) {
  request(fetchApiUrl).post('/company/update')
    .set('Authorization', 'Bearer ' + user.anyFetchToken)
    .end(cb);
};
