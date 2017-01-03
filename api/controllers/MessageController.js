/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var events = require('events');
var moment = require('moment');

module.exports = {


    markFavorite: function(req, res) {

        var isFavorite = req.param('v') === 'true';
        Message.update({id:req.param('id')},{is_favorite:isFavorite}).exec(function afterwards(err, updated){

            if (err) {
                return res.serverError(err);
            }

            console.log('Marked as favorite');
            return res.ok(200);
        });

    },
    notification: function(req, res) {

        Message.findOne({
            id: req.param('id')
        }).exec(function (err, message){
            if (err) {
                return res.serverError(err);
            }
            if (!message) {
                return res.notFound('Could not find Finn, sorry.');
            }

            return res.view('notification', {message: message});
        });
    },
    homepage: function(req, res) {

        Message.find({limit: 100, sort: 'createdAt DESC' }).exec(function (err, messages) {

            _.each(messages, function(message) {
                message.isImportant = _.contains(sails.config.favoritePersonList, message.authorId);
                message.createdSince = moment(message.createdAt).fromNow();

            });

              Message.find({is_favorite: true, sort: 'createdAt ASC' }).exec(function (err, favoriteMessageList) {

                  _.each(favoriteMessageList, function(message) {
                      message.isImportant = _.contains(sails.config.favoritePersonList, message.authorId);
                      message.createdSince = moment(message.createdAt).fromNow();

                  });

                  //Get the stock mentions
                  Ticker.find()
                    .populate('messages', {
                      where: {
                          //color: 'purple'
                      },
                      sort: 'symbol DESC'
                  }).exec(function (err, stockMentionsList){
                      if (err) {
                          return res.serverError(err);
                      }

                      return res.view('homepage', {messages: messages,favoritePersonIdlist: sails.config.favoritePersonList, favoriteMessageList: favoriteMessageList, stockMentionsList: stockMentionsList});
                  });
              });
        });
    },
    /**
     *
     * @param req
     * @param res
     * @returns {*}
     */
    messageSubscribe: function(req, res){

        sails.log.info("Message subscribed");
        if (!req.isSocket) {
            return res.badRequest();
        }

        // Have the socket which made the request join the "funSockets" room.
        console.log("joining message room!");
        sails.sockets.join(req, 'message');

        return res.ok();
    },

    toggleSmsSettings: function(req, res) {

        sails.log.info("Toggling SMS Setting: " + sails.config.smsEnabled);
        sails.config.smsEnabled = !sails.config.smsEnabled;
        sails.log.info("New SMS Setting: " + sails.config.smsEnabled);
        res.json({ value: sails.config.smsEnabled });
    }
	
};

