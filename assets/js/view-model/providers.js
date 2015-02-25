'use strict';

var Provider = require('../models/Provider.js');

/**
 * @file Handle providers
 */

module.exports.setAvailableProviders = function(providers) {
  var client = this;
  var availableProviders = [];

  providers.forEach(function(providerInfo) {
    availableProviders.push(new Provider(providerInfo));
  });
  client.availableProviders(availableProviders);
};

module.exports.setConnectedProviders = function(providers) {
  var client = this;

  var connectedProviders = [];
  providers.forEach(function(provider) {
    // Prevents fetching the anonymous token
    if(!provider.is_basic_token && provider.client && !provider.client.oauth_app) {
      connectedProviders.push(new Provider(provider));
    }
  });
  client.connectedProviders(connectedProviders);
};

module.exports.setFacetsProviders = function(providers) {
  var client = this;

  var facetsProviders = [];
  providers.forEach(function(provider) {
    // Prevents fetching the anonymous token
    if(!provider.is_basic_token) {
      facetsProviders.push(new Provider(provider));
    }
  });
  client.facetsProviders(facetsProviders);
};
