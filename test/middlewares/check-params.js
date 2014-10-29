'use strict';

var should = require('should');

var cleaner = require('../hooks/cleaner');
var mock = require('../helpers/mock.js');
var authMiddleware  = require('../../app/middlewares/check-params');

describe('<Params check middleware>', function() {
  beforeEach(cleaner);
  after(mock.restore);

  it('should reject empty calls', function(done) {
    var req = {query: []};
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/missing `data` query parameter/i);
      done();
    });
  });

  it('should err on missing organization id', function(done) {
    var params = {
      organization: {id: null},
      user: {id: '1234'},
      hash: '1234'
    };

    var req = {query: {data: JSON.stringify(params)}};
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/missing organization id/i);
      done();
    });
  });

  it('should err on missing user id', function(done) {
    var params = {
      organization: {id: '1234'},
      user: {id: null},
      hash: '1234'
    };

    var req = {query: {data: JSON.stringify(params)}};
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/missing user id/i);
      done();
    });
  });

  it('should err on missing hash', function(done) {
    var params = {
      organization: {id: '1234'},
      user: {id: '1234'},
      hash: null
    };

    var req = {query: {data: JSON.stringify(params)}};
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/missing hash/i);
      done();
    });
  });

  it('should pass data in `req` object', function(done) {
    var data = {
      organization: {id: '1234'},
      user: {id: '1234'},
      hash: '1234'
    };

    var req = {query: {data: JSON.stringify(data)}};
    authMiddleware(req, null, function(err) {
      should(err).not.be.ok;
      should(req).have.properties('data');
      req.data.should.have.keys('hash', 'user', 'organization');
      done();
    });
  });
});
