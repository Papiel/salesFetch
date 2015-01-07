'use strict';

var SalesfetchViewModel = require('./view-model/SalesFetchViewModel.js');
var misc = require('./misc.js');
var historyHelper = require('./helpers/history.js');

var getUrlParameter = require('./helpers/getUrlParameter.js');

// ----- Retrieve client data
// Either it is provided through `$.clientData` (standard app loading mechanism)
// Or it is passed as a GET argument (in dev mode)
if(!$.clientData) {
  try {
    var json = decodeURIComponent(getUrlParameter('data'));
    $.clientData = JSON.parse(json);
  }
  catch(e) {
    console.warn('Enable to parse `data` JSON GET parameter');
  }
}

// ----- Knockout init
var client = new SalesfetchViewModel();
client.bindInfiniteScroll = misc.bindInfiniteScroll;
ko.applyBindings(client);
client.fetchDocuments(true);
client.fetchAvailableProviders();

window.onpopstate = historyHelper.handleHistoryEvent.bind(client);

$(document).ready(function() {
  misc.addDropdownButtons();
  client.bindInfiniteScroll();

  var isiPad = navigator.userAgent.match(/iPad/i) !== null;
  if(isiPad) {
    // Ugly hack to fix scroll issue on shitty iPad.
    $('#document-container').style('height', '10px');
    $('#document-container').style('width', '10px');
  }
});
