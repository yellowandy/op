/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    console.log("Checking if we're authenticated");
    // If `req.session.me` exists, that means the user is logged in.
    if (req.session.me) {

        console.log('Session found user: ' + req.session.me);
        return next();
    }

    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a 401 response letting the user agent know they need to login to
    // access this endpoint.
    if (req.wantsJSON) {
        return res.send(401);
    }

    // Otherwise if this is an HTML-wanting browser, do a redirect.
    return res.redirect('/login');
};