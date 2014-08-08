'use strict';

var idCounter = 0;
var noopFilter = function() {
    return true;
};

/**
 * @param {String} name
 * @param {String} display The font-awesome CSS class corresponding to the icon of this tab
 * @param {Boolean} pullRight
 * @param {Function} filter A function to use to filter the documents to be shown in this tab
 */
module.exports = function Tab(name, display, pullRight, filter) {
    var self = this;
    self.name = name;
    self.display = display;
    self.id = idCounter;
    idCounter += 1;
    self.pullRight = pullRight;
    self.filter = filter || noopFilter;
};
