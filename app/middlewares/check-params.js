'use strict';

var restify = require('restify');

/**
 * - Checks that the received `data` object contains every necessary key
 */
module.exports = function(req, res, next) {
  // Weird, but it seems to be a string with value 'undefined'
  if(!req.query.data || req.query.data === 'undefined') {
    return next(new restify.InvalidCredentialsError('Bad Request: missing `data` query parameter'));
  }

  var data;
  try {
    data = JSON.parse(req.query.data);
  } catch(e) {
    return next(new restify.UnprocessableEntityError('Bad Request: malformed JSON in `data` query parameter'));
  }

  if(!data.organization || !data.organization.id) {
    return next(new restify.InvalidCredentialsError('Bad Request: missing organization id'));
  }

  if(!data.user || !data.user.id) {
    return next(new restify.InvalidCredentialsError('Bad Request: missing user id'));
  }

  if(!data.hash) {
    return next(new restify.InvalidCredentialsError('Bad Request: missing hash'));
  }

  req.data = data;
  next();
};
