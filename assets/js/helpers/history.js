'use strict';

/*
 * Register a history event, or simply change the url if skipHistory is true
 * @param state The state to register the history entry with
 * @param skipHistory If true, the current history entry will be replaced, therefore not creating a new entry
 */
module.exports.registerEvent = function registerEvent(state, skipHistory) {
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
    url: tab.url
  };
  module.exports.registerEvent(state, true);
};

/*
 * Event handler for history.onpopstate.
 * It will try to change to the tab registered in the event.state.name field, else do nothing.
 */
module.exports.handleHistoryEvent = function handleHistoryEvent(event) {
  var client = this;

  var tab = client.getTabFromName(event.state && event.state.name);
  if(tab) {
    // Close current document
    if(client.isMobile || client.isTablet) {
      client.activeDocument(null);
    }
    // Go to the tab
    client.goToTab(tab);
  }
};
