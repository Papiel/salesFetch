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
    if(provider._type !== "AccessToken" || provider.client) {
      connectedProviders.push(new Provider(provider));
    }
  });
  client.connectedProviders(connectedProviders);
};

module.exports.updateConnectedProviders = function(providers) {
  var client = this;
  providers.forEach(function(p) {
    // Prevents fetching the anonymous token
    if(p._type !== "AccessToken" || p.client) {
      var provider = client.getConnectedProviderById(p.id);
        provider.totalCount(p.document_count);
    }
  });
};

module.exports.getConnectedProviderById = function(providerId) {
  var client = this;
  for(var i = 0; i < client.connectedProviders().length; i += 1) {
    var p = client.connectedProviders()[i];
    if(p.id === providerId) {
      return p;
    }
  }
};
