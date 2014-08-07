var sliceInTime = require('../helpers/sliceInTime.js');

var tabTotalNumer = 0;
module.exports = function TabModel(name, display, pullRight, client) {
    var self = this;
    self.name = name;
    self.display = display;
    self.id = tabTotalNumer;
    tabTotalNumer += 1;
    self.pullRight = pullRight;
    self.filter = null;

    self.timeSlices = ko.computed(function() {
        var docs = self.filter ? client.documents().filter(self.filter) : client.documents();
        return sliceInTime(docs);
    });
};
