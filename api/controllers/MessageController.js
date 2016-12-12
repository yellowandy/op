/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var events = require('events');
var moment = require('moment');
var favoritelist = ['5eae7745-5b6f-4261-af61-f5d7ef1b61fe', 'b5faa5b0-7255-43d3-9a02-46fdc1bc36a8'];

module.exports = {


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

        Message.find({limit: 25, sort: 'createdAt ASC' }).exec(function (err, messages) {


            _.each(messages, function(message) {
                message.isImportant = _.contains(favoritelist, message.authorId);
                message.createdAt = moment(message.createdAt).fromNow();

            });

            return res.view('homepage', {messages: messages, favoritelist: favoritelist});

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
    }
	
};

