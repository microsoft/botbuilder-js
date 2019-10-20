/* eslint-disable @typescript-eslint/no-var-requires */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Implements TEST_MODE=PROXY_PLAY
//
// Initiates a REST call against the proxy which runs all the tests.  This
// essentially is just the plain bot running that happens to call a REST API
// after the bot is up and running.
// 

var restify = require('restify');
var nockhelper = require('./nock-helper');
var fetch = require('node-fetch');

exports.proxyPlay = async function(bot) {
    console.log('PLAY against proxy');
    const activityBundles = nockhelper.parseActivityBundles();
    if (activityBundles.length <= 0) {
        console.log('Nothing to replay, no recordings found.');
        return;
    }

    setupBot(bot);
    const requestUrl = process.env.PROXY_HOST + '/api/runtests';
    console.log('Using PROXY_HOST : ' + requestUrl);
    fetch(requestUrl, {
        method: 'GET',
        headers: {
            contentType: 'application/json',
        },
        params: { 
            TestName: 'mytest',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => console.log(err));
};

function setupBot(bot) {
    // Create HTTP server.
    const server = restify.createServer();
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser({ mapParams: true }));
    server.listen(process.env.port || process.env.PORT || 3978, '0.0.0.0', () => {
        console.log(`\n${ server.name } listening to ${ server.url }`);
        console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
        console.log(`\nTo test your bot, see: https://aka.ms/debug-with-emulator`);
    });
    let adapter = new nockhelper.AdapterDisableAuth({ channelService: 'https://localhost:3979'});
    
    // Listen for incoming requests.
    server.post({
        path: '/api/messages',
        contentType: 'application/json'
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (req, res, next) => {
        console.log('RECEIVED BOT HIT.. ');
        
        // Uncomment to see incomine requests.
        // console.log(JSON.stringify(req.body))

        await adapter.processActivity(req, res, async (context) => {
            if (req.body.text == 'exit') {
                //graceful shutdown
                console.log('Exit received.');
                process.exit();
            }
            // Route to main dialog.
            await bot.run(context);
        });
    });
    console.log('BOT SETUP COMPLETE.');
}
