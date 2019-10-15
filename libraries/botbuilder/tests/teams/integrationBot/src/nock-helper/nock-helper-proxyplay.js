// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const assert = require('assert');
var https = require('https');
var http = require('http');
var restify = require('restify');
var OriginalClientRequest = http.ClientRequest; // HTTP ClientRequest before mocking by Nock
var OriginalHttpsRequest = https.request;
var OriginalHttpRequest = http.request;
var nock = require('nock');
var fs = require('fs')
var httpMocks = require('node-mocks-http');
var botbuilder = require('botbuilder');
var connector = require('botframework-connector');
var NockClientRequest = http.ClientRequest; // HTTP ClientRequest mocked by Nock
var NockHttpsRequest = https.request;
var  NockHttpRequest = http.request;
var nockhelper = require('./nock-helper');
var fetch = require('node-fetch');

const hostingCacheByClient = {};

exports.proxyPlay = async function(bot) {
    console.log('PLAY against proxy');
    const activityBundles = nockhelper.parseActivityBundles();
    if (activityBundles.length <= 0) {
        console.log('Nothing to replay, no recordings found.')
        return;
    }


    setupBot(bot);
    const requestUrl = process.env.PROXY_HOST + '/api/runtests';
    console.log('Using PROXY_HOST : ' + requestUrl);
    const res = fetch(requestUrl, {
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
        console.log(data)
    })
    .catch(err => console.log(err));


    // if (res.ok) {
    //     console.log('FETCH successful.')
    //     console.log(res.json());
    //     return true;
    // } else {
    //     throw new Error(`Test failed with status code: ${ res.status }`);
    // }

    // activityBundles.forEach((activityBundle, index) => {
    //     console.log(`\n -Item # ${index+1} of ${activityBundles.length} ---------\n`);
        
    //     console.log(JSON.stringify(activityBundle));
    // });
}

function setupBot(bot) {
    console.log('SETTING UP BOT..');
    // Create HTTP server.
    const server = restify.createServer();
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser({ mapParams: true }));
    server.listen(process.env.port || process.env.PORT || 3978, '0.0.0.0', () => {
        console.log(`\n${server.name} listening to ${server.url}`);
        console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
        console.log(`\nTo test your bot, see: https://aka.ms/debug-with-emulator`);
    });
    let adapter = new AdapterDisableAuth({ channelService: 'https://localhost:3979'});
    
    // Listen for incoming requests.
    server.post({
        path: '/api/messages',
        contentType: 'application/json'
    },
    async (req, res, next) => {
        console.log('RECEIVED BOT HIT.. ' + JSON.stringify(req.body));
        //console.log('    ' + req.toString());
        await adapter.processActivity(req, res, async (context) => {
            if (req.body.text == 'exit') {
                //graceful shutdown
                process.exit();
            }
            //nockHelper.logRequest(req, 'link-unfurling');
            // Route to main dialog.
            await bot.run(context);
            //nockHelper.logResponse(res, 'link-unfurling')
        });
    });
    console.log('BOT SETUP COMPLETE.')
}

class AdapterDisableAuth extends botbuilder.BotFrameworkAdapter {
    constructor(settings) {
        super(settings);
    }

    authenticateRequest(request, authHeader) {
        // Skip authentication
        return true;
    }
}


