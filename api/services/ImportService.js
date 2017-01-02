"use strict";

var events = require('events');
var EventSource = require('eventsource');
var moment = require('moment');

/**
 *
 */
class ImportService {

    /**
     *
     */
    constructor() {
    }

    /**
     *
     * @param row
     * @returns {{guid: *, authorName: *, message: *, published_date: *}}
     */
    messageObjectFromServerEntry(row) {

        return {
            authorId: row[1],
            authorName: row[2],
            message: row[3],
            published_date: row[4],
            authorAvatarUrl: row[5]
        }
    }

    createLinkToTickerSymbols(messageObject) {

        var tickerSymbolsFound = messageObject.message.match(/\$?([A-Z]{2,5})/g);
        _.each(tickerSymbolsFound, function(ticker){

            console.log("Starting to create links to ticker symbol: " + ticker);
            Ticker.findOne({
                symbol: ticker
            }).exec(function (err, tickerObject){
                if (err) {
                    console.log("Unable to search for ticker");
                    console.log(err);
                }
                if (!tickerObject) {
                    console.log("Couldn't find ticker, creating and linking");
                    messageObject.mentions.add({symbol:ticker});
                }
                else {
                    console.log("***** FOUND TICKER SYMBOL: " +  tickerObject.symbol);
                    messageObject.mentions.add(tickerObject.id);
                }

                return messageObject.save(function(err){
                    if(err) console.log(err);
                    else console.log("Saving message with association");
                });

            });
        });

    }
    /**
     *
     * @param resp
     * @returns {Array}
     */
    createMessagesFromResponse(resp) {

        var that = this;
        try{
            var data= JSON.parse(resp);

            if(!resp || !data.M) {
                sails.log.info("Couldn't find messages in array, skipping");
            }
            _.each(data.M, function (tmpMessage){

                if(tmpMessage.M && tmpMessage.M == 'userList') {
                    console.log("Found user list...");
                    //console.log(tmpMessage.A[0]);
                    sails.sockets.broadcast('message', 'userList', tmpMessage);
                    return;
                }
                var messagObject = that.messageObjectFromServerEntry(tmpMessage.A);

                if(tmpMessage.M && tmpMessage.M == 'broadcastMessage') {

                    //See if there are any stock references

                    Message.create(messagObject).exec(function (err, message) {

                        if(err) {
                            sails.log("Error creating message: ");
                            console.log(err);
                        }
                        else {
                            sails.log("Created message!");
                            message.createdSince = moment(message.createdAt).fromNow();
                            sails.sockets.broadcast('message', 'add', message);

                            //Create any ticker links if needed
                            that.createLinkToTickerSymbols(message);
                            //See if we have any

                        }
                    });
                }
            });

        }
        catch(e){console.log(e)}
        return;
    }

    /**
     * Parse a specific RSS feed
     * @param rrsFeedUrl The url of the rss feed to parse
     * @param callback The standard nodejs callback
     */
    startImporter(rrsFeedUrl, rssFeedCompletionCallback){
        sails.log.info("Starting to listen and import messages");

        //setInterval(function(){
        //
        //    console.log("Sending new message");
        //    sails.sockets.broadcast('message', 'add', {id:69,authorId: '5eae7745-5b6f-4261-af61-f5d7ef1b61fe',authorName:'andy',message:'weed!', isImportant:true});
        //
        //},30000);
        var that = this;
        var options = {
            headers: {
                'referer': 'https://www.optionsplayers.com/chat',
                'accept': 'text/event-stream',
                'cache-control': 'no-cache',
                'authority': 'www.optionsplayers.com',
            }
        }

        var eventSourceInitDict = {
            headers: {
                'Cookie': '.AspNet.ApplicationCookie=e_CR2LQytTqqEb_eEKaUncoEXZhi6Zbiy0igPsh5Yg5WkerzrT2DWyEh75K1X9L0OysQTYPmHOE2MSWWKhZnZPQzkeOQG5XAa02cQNjdxaKbdBSTqfDAZTaNeeOjkD6JxDLV4Tc8gi2fYMAvAVQcYQVP-o8q59XPXe-2LE_LWmsE7_833KCaBAE4FbR0HruQerDAM448lni_niC1fRQ2Uin1B7tBDbFdz4MhyDykKucaqgSgsS5xmKhZTZ8b9x03RBnxsH2kT1DDI7C2cG8NvB4Sr3dPoVdvY1al5mHZfK8Sp9s1nvWyB7XLbHAGdirh8EEH8N3pR4zT4w2RCdBxFCos-arr8niaFPrm4h4thbfDLqFQBVy9zOR0Ix0yZ5ULAtgBD14VpTYHXFnmJanG5mNzqXRSIIaDh9tGxAVb-5oscYoqrMdaoMGWzBKuJ9BOgl29ZiMbcGJZ0mYc0-wes1Xyqc9HP2od8y4W2Di-f0sbBYQdjovka37ZPTfB75wQo3mjuf-CzdVueqBfe-zSUQ; _gat=1; _ga=GA1.2.1319706048.1481149413'
            }

        };

        var host = 'https://www.optionsplayers.com';
        var path = '/signalr/connect?transport=serverSentEvents&clientProtocol=1.4&connectionToken=M0%2BZwFmEeVrN8sLMXKuLklOON1BwxXU1y%2B47TELKlrRZyx87q8hwr1NTpd0rpYzWO6vMGClR%2BxhIBJoMcJXBcJZn7EvuCy%2FZktID1FLpyHWvHAQR8A2FfVeD2jVttG0tX1%2FLp%2FRbWWhNXqrqM9nMP4URZ9rd3ieIMVz8fwiG0Os%3D&connectionData=%5B%7B%22name%22%3A%22chathub%22%7D%5D&tid=5';
        var es = new EventSource(host + path, eventSourceInitDict);


        es.addEventListener('error', function (e) {
            console.log("error: ");
            console.log(e);
        });

        es.addEventListener('message', function (e) {
            sails.log.info("Message received: " + e.data);
            that.createMessagesFromResponse(e.data);
        });
    }
}


module.exports = ImportService;

