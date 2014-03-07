'use strict';

var jsforce = require('jsforce');

module.exports.loadObject = function(instanceUrl, oauthToken, objectType, recordId, cb) {
  // var conn = new jsforce.Connection({
  //   instanceUrl : instanceUrl,
  //   accessToken : oauthToken
  // });

  // conn
  //   .sobject(objectType)
  //   .retrieve(recordId, cb);

  cb(null, { attributes:
  { type: 'Contact',
    url: '/services/data/v29.0/sobjects/Contact/003b000000LHOj3AAH' },
 Id: '003b000000LHOj3AAH',
 IsDeleted: false,
 MasterRecordId: null,
 AccountId: '001b000000LByvcAAD',
 LastName: 'Einstein',
 FirstName: 'Albert',
 Salutation: null,
 Name: 'Albert Einstein',
 OtherStreet: null,
 OtherCity: null,
 OtherState: null,
 OtherPostalCode: null,
 OtherCountry: null,
 OtherLatitude: null,
 OtherLongitude: null,
 MailingStreet: '2334 N. Michigan Avenue, Suite 1500\r\nChicago, IL 60601, USA',
 MailingCity: 'Chicago',
 MailingState: 'IL',
 MailingPostalCode: null,
 MailingCountry: null,
 MailingLatitude: null,
 MailingLongitude: null,
 Phone: '(312) 596-1000',
 Fax: '(312) 596-1500',
 MobilePhone: null,
 HomePhone: null,
 OtherPhone: null,
 AssistantPhone: null,
 ReportsToId: null,
 Email: null,
 Title: null,
 Department: null,
 AssistantName: null,
 LeadSource: null,
 Birthdate: null,
 Description: null,
 OwnerId: '005b000000167GlAAI',
 CreatedDate: '2014-02-12T14:47:23.000+0000',
 CreatedById: '005b000000167GlAAI',
 LastModifiedDate: '2014-02-12T14:47:23.000+0000',
 LastModifiedById: '005b000000167GlAAI',
 SystemModstamp: '2014-02-12T14:47:23.000+0000',
 LastActivityDate: null,
 LastCURequestDate: null,
 LastCUUpdateDate: null,
 LastViewedDate: '2014-03-06T15:58:09.000+0000',
 LastReferencedDate: '2014-03-06T15:58:09.000+0000',
 EmailBouncedReason: null,
 EmailBouncedDate: null,
 IsEmailBounced: false,
 Jigsaw: null,
 JigsawContactId: null,
 Level__c: null,
 Languages__c: null });
};
