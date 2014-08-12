'use strict';

var call = require('../helpers/call.js');

module.exports = function Provider(json, total) {
  var self = this;
  self.isActive = ko.observable(false);

  if (json) {
    self.name = json.name ? json.name : json.client.name;
    self.id = json.id;
    self.redirect_uri = json.redirect_uri;
    self.trusted = json.trusted;
    self.featured = json.featured;
    self.description = json.description;
    self.developer = json.developer ? json.developer.name : 'unknown';
    self.accountName = json.account_name ? json.account_name : 'unknown';

    if (json.document_count) {
      self.queryCount = json.document_count;
    }
    if (json.total_count) {
      self.total_count = json.total_count;
    }
  }

  self.toggleActive = function() {
    this.isActive(!this.isActive());
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
    return this.name + ' (' + this.queryCount + ')';
  };
};
