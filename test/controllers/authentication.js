'use strict';

require('should');
var request = require('supertest');
var crypto = require('crypto');

var app = require('../../app.js');
var cleaner = require('../hooks/cleaner');
var checkUnauthenticated = require('../helpers/access').checkUnauthenticated;
var consumerSecret = require('../../config/index').consumer_secret;

var createAuthHash = function(obj) {
  var encodedContent = new Buffer(JSON.stringify(obj)).toString("base64");
  return crypto.createHmac("sha256", consumerSecret).update(encodedContent).digest("base64");
};

var obj = {
  context: {
    user: {
      userId: 'userId',
      fullName: 'Walter White',
      email: 'walter.white@breakingbad.com'
    },
    organization: {
      organizationId: 'companyId',
      name: 'breakingbad',
      currencyIsoCode: 'USD'
    },
    environment: {
      parameters: {
        url: '/app/context',
        record: {
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

describe('<user controller>', function() {
  beforeEach(function(done) {
    cleaner(done);
  });

  describe('/authenticate endpoint', function() {
    checkUnauthenticated(app, 'post', '/authenticate');

    it('should authenticate user with valid credentials', function(done) {
      var postBody = createAuthHash(obj) + '.' + new Buffer(JSON.stringify(obj)).toString("base64");

      request(app)
        .post('/authenticate')
        .send({signed_request: postBody})
        .expect(302)
        .expect(function(res) {
          res.should.have.header('set-cookie');
          res.headers['set-cookie'][0].should.match(/connect.sid/);
        })
        .end(done);
    });

    it('should redirect to the context path', function(done) {
      var contextObj = obj;
      contextObj.context.environment.parameters.mode = 'context';
      var postBody = createAuthHash(contextObj) + '.' + new Buffer(JSON.stringify(contextObj)).toString("base64");

      request(app)
        .post('/authenticate')
        .send({signed_request: postBody})
        .expect(302)
        .expect(function(res) {
          res.headers.location.should.equal('/app/context');
        })
        .end(done);
    });
  });
});
