'use strict';

var restify = require('restify');
var request = require('supertest');
var Mustache = require('mustache');
var async = require('async');
var crypto = require('crypto');
var _ = require("lodash");
var fs = require('fs');
var rarity = require('rarity');
var AnyFetch = require('anyfetch');

var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');

var salesfetchHelpers = require('./salesfetch.js');
var config = require('../../config/configuration.js');

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
  async.waterfall([
    function executeBatchRequest(cb) {
      var anyfetch = new AnyFetch(user.anyFetchToken);
      anyfetch.getDocumentsWithInfo(params, cb);
    },
    function templateResults(docs, cb) {
      if (!docs.data) {
        return cb(null, docs);
      }

      // Render the templated data
      // At the same time, gather info about the providers and document types
      // TODO: use `docs.facets` directly, no need for a new key
      docs.document_types = {};
      docs.providers = {};
      docs.data.forEach(function(doc) {
        var relatedTemplate;

        var overridedTemplate = getOverridedTemplates();
        if (overridedTemplate[doc.document_type]) {
          relatedTemplate = overridedTemplate[doc.document_type.id].templates.snippet;
        } else {
          relatedTemplate = doc.document_type.templates.snippet;
        }

        doc.snippet_rendered = Mustache.render(relatedTemplate, doc.data);

        // We encounter a new document_type
        var id;
        if(!(doc.document_type.id in docs.document_types)) {
          id = doc.document_type.id;
          docs.document_types[id] = {
            id: id,
            count: docs.facets.document_types[id],
            name: doc.document_type.name
          };
        }
        // We encounter a new provider
        if(!(doc.provider.id in docs.providers)) {
          id = doc.provider.id;
          docs.providers[id] = {
            id: id,
            count: docs.facets.providers[id],
            name: doc.provider.name
          };
        }
      });

      cb(null, docs);
    }
  ], cb);
};

/**
 * Find and return a single templated document
 */
module.exports.findDocument = function(id, user, context, finalCb) {
  async.waterfall([
    function sendBatchRequest(cb) {
      var anyfetch = new AnyFetch(user.anyFetchToken);
      var query = { search: context.templatedQuery };
      anyfetch.getDocumentWithInfo(id, query, cb);
    },
    function applyTemplate(doc, cb) {
      if(!doc || !doc.data) {
        return cb(new restify.NotFoundError('Document not found'));
      }

      var relatedTemplate;
      var titleTemplate;
      var overridedTemplate = getOverridedTemplates();
      if (overridedTemplate[doc.document_type.id]) {
        relatedTemplate = overridedTemplate[doc.document_type.id].templates.full;
        titleTemplate = overridedTemplate[doc.document_type.id].templates.title;
      } else {
        relatedTemplate = doc.document_type.templates.full;
        titleTemplate = doc.document_type.templates.title;
      }

      doc.full_rendered = Mustache.render(relatedTemplate, doc.data);
      doc.title_rendered = Mustache.render(titleTemplate, doc.data);
      doc.provider = doc.provider.name;
      doc.document_type = doc.document_type.name;

      cb(null, doc);
    },
    function getPin(doc, cb) {
      salesfetchHelpers.getPin(context.recordId, doc.id, rarity.carry([doc], cb));
    },
    function markIfPinned(doc, pin, cb) {
      doc.pinned = !!pin;
      cb(null, doc);
    }
  ], function(err, doc) {
    if(err && err.message && err.message.indexOf(404) !== -1) {
      err = new restify.NotFoundError('Document not found');
    }
    finalCb(err, doc);
  });
};

/**
 * Create a subcompany and an admin on the FetchAPI
 * Store the linking informations btw Salesforce and FetchAPI
 */
module.exports.initAccount = function(data, done) {
  var user = data.user;
  var org = data.organization;

  var anyfetch = new AnyFetch(config.fetchApiCreds);

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
    function createAccountAndSubcompany(cb) {
      // Avoid collision with production
      if (config.env === 'development') {
        user.name = 'dev-' + user.name;
      }

      var subcompany = {
        user: user.anyFetchId,
        name: org.name
      };
      var fetchUser = {
        email: user.name,
        name: user.name,
        password: user.password
      };
      anyfetch.createSubcompanyWithAdmin(subcompany, fetchUser, cb);
    },
    function retrieveUserToken(company, admin, cb) {
      user.anyFetchId = admin.id;
      var anyfetchUser = new AnyFetch(user.email, user.password);
      anyfetchUser.getToken(rarity.carry(company, cb));
    },
    function saveLocalCompany(company, res, cb) {
      user.token = res.body.token;

      var localOrg = new Organization({
        name: org.name,
        SFDCId: org.id,
        anyFetchId: company.id
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
  ], function(err, res) {
    if(res && res.status && res.status !== 200){
      var e = new Error(res.text);
      e.statusCode = res.status;
      return done(e);
    }

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
        return cb(new restify.InvalidCredentialsError('No admin for the company has been found'));
      }

      var anyfetchAdmin = new AnyFetch(adminUser.anyFetchToken);
      var newUser = {
        email: user.name,
        name: user.name,
        password: user.password
      };
      anyfetchAdmin.postUser(newUser, cb);
    },
    function retrieveUserToken(res, cb) {
      if(res.status !== 200){
        var e = new Error(res.text);
        e.statusCode = res.status;
        return cb(e);
      }

      user.anyFetchId = res.body.id;
      var anyfetchUser = new AnyFetch(user.email, user.password);
      anyfetchUser.getToken(cb);
    },
    function saveLocalUser(res, cb) {
      if(res.status !== 200){
        var e = new Error(res.text);
        e.statusCode = res.status;
        return cb(e);
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
  ], cb);
};

/**
 * Retrieve all trusted providers from the Manager app
 */
module.exports.getProviders = function(cb) {
  async.waterfall([
    function retrieveProviders(cb) {
      request(config.managerUrl)
        .get('/marketplace.json?trusted=true')
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
  var anyfetch = new AnyFetch(user.anyFetchToken);
  anyfetch.getProviders(cb);
};

/**
 * Update the company documents
 */
module.exports.updateAccount = function(user, cb) {
  var anyfetch = new AnyFetch(user.anyFetchToken);
  anyfetch.postCompanyUpdate(cb);
};
