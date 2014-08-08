'use strict';

var SalesfetchViewModel = require('./view-model/SalesFetchViewModel.js');
var misc = require('./misc.js');

$(document).ready(function() {
  misc.addDropdownButtons();
  misc.addTabletBehaviors();

  // ----- Knockout init
  var client = new SalesfetchViewModel();
  ko.applyBindings(client);
  client.fetchDocuments();
  if(client.isDesktop) {
    client.fetchAvailableProviders();

    window.refreshProviders = function() {
      client.fetchAvailableProviders();
    };
  }
});
