'use strict';

module.exports = function sliceInTime(documents) {
  var timeSlices = [{
    label: 'Today',
    maxDate: moment().startOf('day'),
    documents: []
  }, {
    label: 'Yesterday',
    maxDate: moment().startOf('day').subtract('day', 1),
    documents: []
  }, {
    label: 'Earlier this Week',
    maxDate: moment().startOf('week'),
    documents: []
  }, {
    label: 'Last Week',
    maxDate: moment().startOf('week').subtract('week', 1),
    documents: []
  }, {
    label: 'Earlier this Month',
    maxDate: moment().startOf('month'),
    documents: []
  }, {
    label: 'Last Month',
    maxDate: moment().startOf('month').subtract('month', 1),
    documents: []
  }, {
    label: 'Earlier this Year',
    maxDate: moment().startOf('year'),
    documents: []
  }, {
    label: 'Last Year',
    maxDate: moment().startOf('year').subtract('year', 1),
    documents: []
  }, {
    label: 'Older',
    documents: []
  }];

  documents.forEach(function(doc) {
    var creationDate = moment(doc.creationDate);
    var found = false;
    for (var i = 0; i < timeSlices.length && !found; i+=1) {
      if (i === 0 && creationDate.isAfter(timeSlices[i].maxDate)) {
        found = true;
        timeSlices[i].documents.push(doc);
      }

      if(!found && (!timeSlices[i].maxDate || creationDate.isAfter(timeSlices[i].maxDate))) {
        found = true;
        timeSlices[i].documents.push(doc);
      }
    }
  });

  return timeSlices;
};
