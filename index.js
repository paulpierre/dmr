/*
Double Meta Refresh
===================
dmr.kpigoals.com/r=https://www.whatismyreferer.com/
 */

const express = require('express');
const app = express();
const port = 80;
var redirect_url;




function redirect_user(req, res, step)
{
    switch(step)
    {
        case 1:
            //redirect_url = 'https://localhost/meta?r='  + req.query.r;
            redirect_url = 'https://dmr.kpigoals.com/meta?r='  + req.query.r;
        break;

        case 2:
            redirect_url = req.query.r;
        break;
    }



    if( req.query.r == null || req.query == {}) {
        res.status(404).send('Not found');
        return;
    }

    //lets attach the rest of the params to the end of this URL
    for (var k in req.query)
        if(k !== 'r') redirect_url +='&' + k + '=' + req.query[k];


    res.send(`
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
    `).end();

}
app.get('/meta', (req, res) => redirect_user(req,res,2));

app.get('/ping', (req, res) => {
    res.status(200).send("pong").end();
});

app.get('/*', (req, res) => redirect_user(req,res,1));

app.listen(port, () => {
    console.log(`DMR listening on port ${port}!`)
});

