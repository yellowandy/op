"use strict";

var EventSource = require('eventsource');

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
        }
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
                    console.log("Found user list, ignoring");
                    return;
                }
                var messagObject = that.messageObjectFromServerEntry(tmpMessage.A);

                Message.create(messagObject).exec(function (err, episode) {

                    if(err) {
                        sails.log("Error creating message: ");
                        console.log(err);
                    }
                    else {
                        sails.log("Created message!");
                    }
                });
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
                'Cookie': '__cfduid=d9b0a0656daeba6cfdd1591ce54f58e8c1481149411; __RequestVerificationToken=m1okNxZGbZbNEBJEiH7j8rcqyaHyIMeHG4CW2BLVjbkEiDAqwieUVxQlTIPUmtDJbXuicqJAzMy8erAxWqMTUoW_kr7MuP2CkHDlhPgHlRU1; opmybb[lastvisit]=1481150149; opmybb[lastactive]=1481150180; oploginattempts=1; opsid=ea5040b07189ad59c9d5ca50ac0f7c10; opmybbuser=410_fsvOiB1mmofkeo6; opcollapsed=; .AspNet.ApplicationCookie=Tu9VtTocQ2xFJ4Z70Norpuy8uc-TbuPzgEf3oYvS5WXfNMGfBEBzD2-6poeTjurFDCMzZSTFVgvkqJyFXY36mLLCSExi7AUjUwQtK1iE6TOIQpLvS0cy8FrualXGFuMQu5MtKisoZrp81Sv3dIqzPfZxI6tHUNgd8wnPbc1jeGrfMnJMFZzfg4kd-IlhMP7CefWE1koZS4tgW4oBYoha5TYC1iDKCumogvoM5_ka1EpqPbzCHC_5vfw0NaTsZwUvFFUEOYEFw_RTIR85GM2AVqozIpDnpnbNpMIUEmMNCNqJoyg04tqEEflBOq_D7T_efxFyVEaK9DbZ99ZBb443GYcnfZzricBD5fZxuEOCzrJTI13Rk6jFYrU-iJ0rZxIDZ50lnGIYBa4U13nel-q-0X7fIn40M3xgbV2RmELS3b6qhPtrCGdIo5yLZNgUN25TC4JxIh12-24NjeiROOweYJz9_ZssdQARSo3oB4UKV4dN4SgVvc2sGZqCC30J-TiShYwZD9-lOhXQZbVbgt0Evw; _gat=1; _ga=GA1.2.1319706048.1481149413'
            }

        };

        var host = 'https://www.optionsplayers.com';
        var path = '/signalr/connect?transport=serverSentEvents&clientProtocol=1.4&connectionToken=HfEk9vBG5L70Cw46NaICmj%2FK8BsF4vT6Fg2yQyJG5E6O33kch02B864F%2FwV7L60%2BWMDgw5WFWGd3OGhiVvPiF6tlIfEHZAIB4QeRbsg6MUX51WFDUs6sn24g2ctz%2BG1mWGfHQLKlOKn9Ggw4emNRv%2F%2BjEN%2BGdxsggC5TxGAx07w%3D&connectionData=%5B%7B%22name%22%3A%22chathub%22%7D%5D&tid=9';

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

