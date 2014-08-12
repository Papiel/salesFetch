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

      // change value's name in order not to override the queryCount
      provider.total_count = provider.document_count;
      provider.document_count = null;
      connectedProviders.push(new Provider(provider));
    }
  });
  client.connectedProviders(connectedProviders);
};
