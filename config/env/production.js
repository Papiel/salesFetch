'use strict';

module.exports = {
  mongo_url: process.env.MONGOHQ_URL || process.env.MONGO_URL,

  swig: {
    cache: 'memory'
  },

  less: {
    cache: true
  }
};