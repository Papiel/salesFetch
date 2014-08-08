'use strict';

var Tab = require('../models/Tab.js');
var filters = require('./filters.js');

/**
 * @file Tabs
 */

/**
 * @return {Array} The visible tabs. First tab of the list should be the default tab.
 */
 module.exports.getTabs = function(client) {
  var timelineTab = new Tab('Timeline', 'fa-list', true, false, filters.providerAndType(client));
  var starredTab = new Tab('Starred', 'fa-star-o', true, false, filters.starredFilter(client));
  var providerTab = new Tab('Providers', 'fa-link');

  // TODO: re-enable when feature exists
  //var searchTab = new Tab('Search', 'fa-search', true);

  var tabs = [timelineTab, starredTab]; // and `searchTab`

  // Desktop has an additional 'Providers' tab
  if(client.isDesktop) {
    tabs.push(providerTab);
  }

  return tabs;
};
