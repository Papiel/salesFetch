'use strict';

var call = require('../helpers/call.js');

module.exports = function Document(json) {
  var self = this;

  self.isStarred = ko.observable(json.pinned);
  self.id = json.id;
  self.snippet = json.rendered.snippet;
  self.url = json.document_url;
  self.creationDate = json.creation_date;
  self.actions = json.actions;

  // Will be bound to the corresponding model instance
  self.type;
  self.provider;
  self.title = ko.observable();
  self.full = ko.observable();

  self.toggleStarred = function() {
    var url = '/app/pins/' + self.id;

    // We can't use 'json' as data type,
    // otherwise empty responses (desired) get treated as an error
    var options = {
      dataType: 'text',
      type: (this.isStarred() ? 'delete' : 'post')
    };
    var noop = function() {};

    // We do not wait on request to display the new status
    // But we will reverse on error (i.e. ask forgiveness)
    var successState = !self.isStarred();
    self.isStarred(successState);

    call(url, options, noop, function error(res) {
      self.isStarred(!successState);
      console.log('Could not star/unstar document ' + self.id);
      console.log(res.responseText);
    });
  };

  self.openOriginal = function() {
    window.open(self.actions.show);
  };
};
