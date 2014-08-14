'use strict';

require('../helpers/string.js');

module.exports = function Type(json) {
  var self = this;

  // Click binding with toggleActive will always run once on load,
  // it means isActive is initialy false if we set it to true
  self.isActive = ko.observable(true);

  if (json) {
    self.name = json.name;
    self.id = json.id;
    self.queryCount = json.document_count;
  }

  self.toggleActive = function(client) {
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
