"use strict";

var accountSid = 'AC356d9c0539d38da27067a53d0ced0e60'; // Your Account SID from www.twilio.com/console
var authToken = '71810b4309cf0df8e145e7dae9bd0bbc';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio.RestClient(accountSid, authToken);

/**
 *
 */
class TwilioService {

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
  static sendMessage(message) {

    client.messages.create({
      body: message,
      to: '+14083290293',  // Text this number
      from: '+16697219707' // From a valid Twilio number
    }, function(err, message) {
      console.log("Twillio finished sending txt message: " + message);
      console.log(message.sid);
    });

  }
}


module.exports = TwilioService;

