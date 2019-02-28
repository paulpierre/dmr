/*
=======================
DMR.js - by @paulpierre
=======================
A nodejs app built for docker and appengine that allows you to implement
your own version of Double Meta Refresh intended to maintain privacy when
linking to an external site. Also useful for affiliate marketing when you
don't want an advertiser to steal your traffic source and campaign.

Usage: http://localhost:8080/?r=https://www.whatismyreferer.com/

 You may add additional privacy by adding META no referrer tags in the
 DMR HTML, but I've not included this to maintain Voluum best practices.
 */

/** ===========================
 *  Set variables and constants
 *  ===========================
 */
const express = require('express');
const app = express();
const port = 8080;
var redirect_url;
var char_offset = 5;

/** =======================
 *  String encoder function
 *  =======================
 */
function dmr_encode(str)
{
    let _encode = Buffer.from(str).toString('base64');
    console.log('base64 string: ' + _encode);
    if(_encode.substring(_encode.length - 2,_encode.length) === '==')
        _encode = _encode.substring(_encode.length - 2, 0);
    else if(_encode.substring(_encode.length - 2,_encode.length) === '=')
        _encode = _encode.substring(_encode.length - 1, 0);
    //lets grab the X character(s) and tack it to the end so it can't be decoded
    return _encode.substring(char_offset, _encode.length) + _encode.substring(0,char_offset);
}
/** =======================
 *  String decoder function
 *  =======================
 */
function dmr_decode(str)
{
    let _decode = str.substring(str.length - char_offset) + str.substring(0, str.length - char_offset);
    return  Buffer.from(_decode,'base64').toString();
}

/** ======================
 *  Redirect logic for DMR
 *  ======================
 */

function redirect_user(req, res, step)
{

    /** ===========================
     *  No query provided, show 404
     *  ===========================
     */

    if( req.query.r == null || req.query == {}) {
        res.status(404).send('<html><head></head><body><h1>404</h1> <p>Not found</p></body></html>');
        return;
    }

    switch(step)
    {
        case 1:
            /** =========================================
             *  Let's encode it on the first Meta Refresh
             *  =========================================
             *  We do this because this is what Voluum does
             */
            //redirect_url = 'https://localhost/meta?r='  + req.query.r;
            redirect_url = '/meta?r='  + dmr_encode(req.query.r);
        break;

        case 2:
            /** ==========================================
             *  Let's decode it on the second Meta Refresh
             *  ==========================================
             */
            redirect_url =  dmr_decode(req.query.r);
        break;
    }

    /** ===============================
     *  Reattach any params for the app
     *  ===============================
     */
    for (var k in req.query)
        //let's skip "r" because that is ours!
        if(k !== 'r') redirect_url +='&' + k + '=' + req.query[k];

    /** =======================
     *  Let's redirect the user
     *  =======================
     */
    res.send(`<html><head><link rel="icon" type="image/gif" href="data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/><meta http-equiv="refresh" content="0;URL='${redirect_url}'" /></head><body><script>window.setTimeout(function(){window.location.replace('${redirect_url}');}, 0);</script></body></html>`).end();
    /**
     *  OLD REDIRECT
     *
     *
     <html><head>
     <meta name="referrer" content="none">
     <meta name="ROBOTS" content="NOINDEX, NOFOLLOW">
     <meta http-equiv="refresh" content="0;URL='${redirect_url}'"/>
     <!--
     <script>
     setTimeout(()=>{
                window.location="${redirect_url}";
            },500);

     </script>
     -->
     </head>
     <body>
     Redirecting ..
     </body></html>
     */
}

/** ===================
 *  Second Meta Refresh
 *  ===================
 */
app.get('/meta', (req, res) => redirect_user(req,res,2));

/** ==================
 *  First meta refresh
 *  ==================
 */
app.get('/*', (req, res) => redirect_user(req,res,1));

/** ==========================================
 *  Used for uptime services like uptime robot
 *  ==========================================
 */
app.get('/ping', (req, res) => {
    res.status(200).send("pong").end();
});

/** ===================================
 *  "Are you listening? Whoaaaaa ohhhh"
 *  ===================================
 *  ..yea that was a Jimmy Eat World reference alright.
 */
app.listen(port, () => {
    console.log(`DMR listening on port ${port}!`)
});
