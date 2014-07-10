'use strict';

var should = require('should');

var customLogger = require('../../app/middlewares/logger.js').customLogger;

describe('Logger', function() {
  var req = {
    route: {
      path: '/'
    },
    method: 'post',
    _startTime: new Date()
  };

  it('should not return anything for OPTIONS calls', function() {
    var log = customLogger('', { method: 'OPTIONS' });
    should(log).not.be.ok;
  });

  it('should log 2xx calls', function() {
    var res = {
      statusCode: 200,
    };

    var log = customLogger('', req, res);
    log.should.match(/post \//i);
    log.should.match(/200/i);
  });

  // This is really for coverage only...
  it("should not print response's body on 3xx calls", function() {
    var res = {
      statusCode: 302,
      _body: 'Description of the error'
    };

    var log = customLogger('', req, res);
    log.should.match(/post \//i);
    log.should.match(/302/i);
    log.should.not.match(/description of the error/i);
  });

  it("should print response's body on 4xx and 5xx calls", function() {
    var res = {
      statusCode: 401,
      _body: 'Description of the error'
    };

    var log = customLogger('', req, res);
    log.should.match(/post \//i);
    log.should.match(/401/i);
    log.should.match(/description of the error/i);


    res.statusCode = 503;
    log = customLogger('', req, res);
    log.should.match(/post \//i);
    log.should.match(/503/i);
    log.should.match(/description of the error/i);
  });
});
