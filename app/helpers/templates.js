'use strict';

/**
 * @file The AnyFetch API serves us default templates for each document type,
 * but in some cases we want to override them. This module loads overrided templates
 * and caches them for all future uses.
 * At each Mustache render of a document, we use the overrided template if any,
 * and fallback on the default AnyFetch API template.
 */

var _ = require('lodash');
var fs = require('fs');
var mustache = require('mustache');

var config = require('../../config/configuration.js');
var logError = require('../../config/services.js').logError;

/**
 * Document type id => template
 */
var cachedTemplates = {};

/**
 * Obtain the overrided templates (handling cache transparently)
 * @warning Templates are not cached in dev environment
 */
var getOverridedTemplates = function() {
  if (config.env !== 'development' && !_.isEmpty(cachedTemplates)) {
    return cachedTemplates;
  }

  var templateDirectory = __dirname + '/../templates';
  fs.readdirSync(templateDirectory).forEach(function(file) {
    if(file.indexOf('.json') !== -1) {
      var templatePath = templateDirectory + '/' + file;
      var template = require(templatePath);

      cachedTemplates[template.id] = template;
    }
  });

  return cachedTemplates;
};

var formatDate = function() {
  return function(isoDate, render) {
    var d = new Date(render(isoDate));
    return d.toLocaleDateString() + d.toLocaleTimeString();
  };
};

/**
 * Render a document through a Mustache template.
 * @param {Object} data The document to render (as returned by the AnyFetch API)
 * @param {String} name Which template to render (each document type may have several templates, e.g. 'title', 'snippet', 'full', ...)
 * @param {ObjectId} [documentType] The document type's id (if ommitted, we default to `data.document_type.id`)
 * @return {HTML}
 */
module.exports.render = function render(doc, name, documentType) {
  var documentTypeId = documentType || doc.document_type.id;

  var overrided = getOverridedTemplates();
  var template;
  // Use the overrided template if any
  if(overrided[documentTypeId]) {
    template = overrided[documentTypeId].templates[name];
  }
  // Otherwise, use the template provided by the API
  else if(doc.document_type && doc.document_type.templates) {
    template = doc.document_type.templates[name];
  }
  // In last resort, use the default generic template
  if(!template) {
    var err = new Error('No template `' + name + '` is available for document type ' + documentTypeId);

    logError(err, {
      statusCode: 200,
      doc: doc,
      templateName: name
    });
    template = overrided.default.templates[name] || overrided.default.templates.default;
  }

  // Add formatting functions
  doc.data.formatDate = formatDate;

  return mustache.render(template, doc.data);
};
