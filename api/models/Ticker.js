/**
 * Ticker.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    symbol: {
      type: 'string',
      unique:true
    },

    // Add a reference to Messages
    messages: {
      collection: 'message',
      via: 'mentions',
      dominant: true
    }
  }
};
