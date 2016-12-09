/**
 * Message.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    authorId: {
      type: 'string',
      required: true,
      unique: false
    },

    authorName: {
      type: 'string',
      required: true,
      unique: false
    },
    is_favorite: {
      type: 'boolean',
      required: false,
      defaultsTo: false
    },
    message: {
      type: 'string',
      required: true,
      unique: false
    },

    published_date: {
      type: 'date',
      required: false,
      unique: false
    },

  }
};

