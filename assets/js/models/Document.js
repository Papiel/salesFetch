'use strict';

var call = require('../helpers/call.js');

var openExternalUrl = function openExternalUrl(url) {
  /* global sforce */
  if((typeof sforce !== 'undefined') && (sforce !== null)) {
    sforce.one.navigateToURL(url);
  }
  else {
    window.open(url);
  }
};

/**
 * @param json
 * @param delegate
 *    Will be notified when isStarred changes.
 *    Must respond to `starredUpdate`.
 */
module.exports = function Document(json, delegate) {
  var self = this;

  self.isStarred = ko.observable(json.pinned);
  self.id = json.id;
  self.snippet = json.rendered.snippet;
  self.url = json.document_url;
  self.creationDate = json.creation_date;
  self.modificationDate = json.modification_date;
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
    var desiredStarredState = !self.isStarred();
    self.isStarred(desiredStarredState);

    if(delegate && delegate.starredUpdate) {
      delegate.starredUpdate(self);
    }

    call(url, options, noop, function error(res) {
      self.isStarred(!desiredStarredState);
      delegate.starredUpdate(self);

      console.log('Could not star/unstar document ' + self.id);
      console.log(res.responseText);
    });
  };

  self.openOriginal = function() {
    if(self.actions.show) {
      openExternalUrl(self.actions.show);
    }
  };
  self.download = function() {
    if(self.actions.download) {
      openExternalUrl(self.actions.download);
    }
  };
  self.reply = function() {
    if(self.actions.reply) {
      openExternalUrl(self.actions.reply);
    }
  };
};
