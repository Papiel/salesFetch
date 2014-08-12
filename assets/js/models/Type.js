'use strict';

module.exports = function Type(json) {
  var self = this;
  self.isActive = ko.observable(false);

  if (json) {
    self.name = json.name;
    self.id = json.id;
  }

  self.toggleActive = function() {
    this.isActive(!this.isActive());
  };

  self.imageURL = function() {
    return 'img/document_types-icons/' + self.name + '.png';
  };
};
