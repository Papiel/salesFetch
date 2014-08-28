'use strict';

require('../helpers/string.js');

module.exports = function Type(json) {
  var self = this;
  self.isActive = ko.observable(false);

  if(json) {
    self.name = json.name;
    self.id = json.id;
    self.queryCount = json.document_count;
  }

  // Knock out will run every binding once on load.
  // It is important to encapsulate toggleActive in an anonymous function in data-bindings
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
