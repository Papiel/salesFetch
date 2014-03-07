'use strict';

/**
 * Login helpers
 */

var request = require('supertest');
var agent = request.agent();
var crypto = require('crypto');
var consumerSecret = require('../../config/index').consumer_secret;


var getDefaultPayload = function() {
  var obj = {
    context: {
      user: {
        userId: 'userId',
        fullName: 'Walter White',
        email: 'walter.white@breakingbad.com'
      },
      organization: {
        organizationId: 'companyId'
      },
      environment: {
        parameters: {
          url: '/app/context',
          parameters: {
            record_type: 'Contact',
            record_id: '003b000000LHOj3'
          }
        }
      }
    },
    client: {
      instanceUrl: 'https://eu2.salesforce.com',
      oauth_token: 'random_token'
    }
  };

  return obj;
};


/**
 * Create an envelope to use for authenticating call
 */
var createAuthHash = function(obj) {
  var encodedContent = new Buffer(JSON.stringify(obj)).toString("base64");
  return crypto.createHmac("sha256", consumerSecret).update(encodedContent).digest("base64");
};


/**
 * Log the user in and return to the callback the user agent for futher calls
 */
var authenticateCall = function(request, done) {
  var obj = getDefaultPayload();
  var postBody = createAuthHash(obj) + '.' + new Buffer(JSON.stringify(obj)).toString("base64");

  request
    .post('/authenticate')
    .send({signed_request: postBody})
    .expect(302)
    .end(function(err, res) {
      if (err) {
        throw err;
      }

      agent.saveCookies(res);
      done(agent);
    });
};


module.exports.getDefaultPayload = getDefaultPayload;
module.exports.createAuthHash = createAuthHash;
module.exports.authenticateCall = authenticateCall;
