'use strict';

var Provider = require('../models/Provider.js');

/**
 * @file Handle providers
 */

module.exports.setAvailableProviders = function(client, providers) {
  var availableProviders = [];
  providers.forEach(function(providerInfo) {
    availableProviders.push(new Provider(providerInfo));
  });
  client.availableProviders(availableProviders);
};

module.exports.setConnectedProviders = function(client, providers) {
  var connectedProviders = [];
  providers.forEach(function(provider) {
    // Prevents fetching the anonymous token
    if (provider._type !== "AccessToken" || provider.client) {
      connectedProviders.push(new Provider(provider));
    }
  });
  client.connectedProviders(connectedProviders);
};

module.exports.updateConnectedProviders = function(client, providers) {
  providers.forEach(function(p) {
    // Prevents fetching the anonymous token
    if (p._type !== "AccessToken" || p.client) {

      var provider = client.connectedProviderWithID(p.id);
      provider.totalCount(p.document_count);
    }
  });

  // client.connectedProviders(client.connectedProviders());
};

module.exports.connectedProviderWithID = function(providerID) {
  var provider = null;
  this.connectedProviders().every(function(p) {
    if (p.id === providerID) {
      provider = p;
      return false; // stop loop
    } else {
      return true; // continue loop
    }
  });
  return provider;
};
