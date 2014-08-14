'use strict';

var SalesfetchViewModel = require('./view-model/SalesFetchViewModel.js');
var misc = require('./misc.js');

// ----- Knockout init
var client = new SalesfetchViewModel();
ko.applyBindings(client);
client.fetchDocuments();
if(client.isDesktop) {
  window.refreshProviders = function() {
    client.fetchAvailableProviders();
  };
}

$(document).ready(function() {
  misc.addDropdownButtons();
  misc.addTabletBehaviors();
  misc.bindInfiniteScroll(client);
});
