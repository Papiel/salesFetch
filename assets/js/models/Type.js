'use strict';

require('../helpers/string.js');

module.exports = function Type(json, client) {
  var self = this;
  self.isActive = ko.observable(false);

  if (json) {
    self.name = json.name;
    self.id = json.id;
    self.queryCount = json.document_count;
  }

  self.toggleActive = function() {
    this.isActive(!this.isActive());
    client.updateFilter();
  };

  self.imageURL = function() {
    return 'img/document_types-icons/' + self.name + '.png';
  };

  self.extendedName = function() {
    return this.name.capitalize() + ' (' + this.queryCount + ')';
  };
};
