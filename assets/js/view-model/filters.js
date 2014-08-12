'use strict';

/**
 * @file Functions use to filter lists (documents, types, etc)
 */

/**
 * @return {Array} List filtered by `isActive`
 */
var isActive = function(o) {
  return o.isActive();
};

/**
* @return {Array} providers which are active
*/
module.exports.activeProviders = function(client) {
  return function() {
    var activeProviders = client.connectedProviders().filter(isActive);

    // Update client.filterByProvider
    client.filterByProvider(activeProviders.length !== 0);

    return client.filterByProvider() ? activeProviders : client.connectedProviders();
  };
};

/**
 * @eturn {Array} types which are active
 */
module.exports.activeTypes = function(client) {
  return function() {
    var activeTypes = client.types().filter(isActive);

    // Update client.filterByType
    client.filterByType(activeTypes.length !== 0);

    return client.filterByType() ? activeTypes : client.types();
  };
};

/**
 * @param {Object} document
 * @return {Array} `documents` filtered by active providers and active types
 */
module.exports.providerAndType = function(client) {
  return function(document) {
    var providerFilter = document.provider.isActive() || !client.filterByProvider();
    var typeFilter = document.type.isActive() || !client.filterByType();
    return providerFilter && typeFilter;
  };
};

/**
 * @param {Object} document
 * @return {Array} Only the `documents` which are filtered
 */
module.exports.starredFilter = function() {
  return function(document) {
    return (document.isStarred() === true) && module.exports.providerAndType(document);
  };
};

/*
 * @param {SalesfetchViewModel} client
 * @return {Dict} representing filters for api request
 */
 module.exports.paramsForFilter = function(client) {
  var providerIDs = [];
  client.activeProviders().forEach(function(provider) {
    providerIDs.push(provider.id);
  });

  var typeIDs = [];
  client.activeTypes().forEach(function(type) {
    typeIDs.push(type.id);
  });

  return { provider: providerIDs, document_type: typeIDs};
 };

/**
 *
 **/
 module.exports.updateFilter = function() {
  if (this.filterByProvider() || this.filterByType()) {
    console.log(paramsForFilter(this));
  }
 };
