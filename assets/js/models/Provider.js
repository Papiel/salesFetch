'use strict';

require('../helpers/string.js');
var call = require('../helpers/call.js');

module.exports = function Provider(json) {
  var self = this;
  self.isActive = ko.observable(false);

  if(json) {
    self.name = json.name ? json.name : json.client.name;
    self.id = json.id;
    self.client_id = json.client ? json.client.id : null;
    self.redirect_uri = json.redirect_uri;
    self.trusted = json.trusted;
    self.featured = json.featured;
    self.description = json.description;
    self.developer = json.developer ? json.developer.name : 'unknown';
    self.accountName = json.account_name ? json.account_name : 'unknown';
    self.documentCount = json.document_count;
  }

  // Knock out will run every binding once on load.
  // It is important to encapsulate toggleActive in an anonymous function in data-bindings
  self.toggleActive = function(client) {
    this.isActive(!this.isActive());
    client.updateFilter();
  };

  self.connect = function () {
    var url = '/app/providers/' + self.id ;
    var options = {
      type: 'post'
    };

    var w = window.open(null, '_blank');

    call(url, options, function success(data) {
      w.location = data.url;
    });
  };

  self.extendedName = function() {
    return this.name.capitalize() + ' (' + this.documentCount + ')';
  };
};
