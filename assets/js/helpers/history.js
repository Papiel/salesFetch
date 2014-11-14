'use strict';

/*
 * Register a history event, or simply change the url if skipHistory is true
 * @param state The state to register the history entry with
 * @param skipHistory If true, the current history entry will be replaced, therefore not creating a new entry
 */
module.exports.registerEvent = function registerEvent(state, skipHistory) {
  console.log('register', state);
  if(!skipHistory) {
    history.pushState(state, state.name, state.url);
  }
  else {
    history.replaceState(state, state.name, state.url);
  }
};

/*
 * Used to register a history entry with a Tab as parameter. Do not create a new entry
 * @param tab The tab to register
 */
module.exports.registerTabEvent = function registerTabEvent(tab) {
  var state = {
    name: tab.name,
    url: tab.url,
    doc: null
  };
  module.exports.registerEvent(state, true);
};

/*
 * Used to register a history entry with a Document as parameter. Do not create a new entry
 * @param tab The tab to register
 */
module.exports.registerDocumentEvent = function registerDocumentEvent(doc) {
  var state = history.state;
  state.doc = doc.id;
  module.exports.registerEvent(state);
};

/*
 * Event handler for history.onpopstate.
 * It will try to change to the tab registered in the event.state.name field, else do nothing.
 */
module.exports.handleHistoryEvent = function handleHistoryEvent(event) {
  var client = this;

  console.log('pop', event.state);
  var tab = client.getTabFromName(event.state && event.state.name);
  var doc;
  if(tab) {
    if(event.state.doc) {
      doc = client.getDocumentFromId(tab, event.state.doc);
    }
    // Close current document
    if(client.isMobile || client.isTablet) {
      client.activeDocument(null);
    }
    // Go to the tab
    client.showTab(tab);
    if(doc) {
      client.showDocument(doc);
    }
  }
};
