'use strict';

require("should");

var async = require('async');
var request = require('supertest');

var anyfetchLib = require('../../app/helpers/anyfetch.js');

describe('<anyfetch.js helper script>', function() {

  describe('findDocuments', function() {

    it("should throw error on invalid user credentials", function(done) {

      var params = {
        testing: 'invalid_credentials'
      }

      var invalidUser = {
        anyFetchToken: 'some_invalid_token'
      }

      anyfetchLib.findDocuments(params, invalidUser, function(err) {
        err.should.be.an.Error;
        done();
      });
    });

  });

});