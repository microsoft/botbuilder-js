// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Implements TEST_MODE=PROXY_HOST
//
// Emulates the Teams Server to initiate traffic to a remote bot.
// Since traffic is normally initiated from the Teams->Server to the
// bot somethign is required to begin the bot traffic.  This is done by
// exposing a GET /api/runtests REST call which synchronously runs all
// the tests.
//
// This proxy host simply loads the JSON recordings and invokes the same
// traffic pattern in order.  Also validates the traffic matches.
//
// The proxy also exposes all the endpoints that the Teams Server does
// to capture and respond to replies from the Bot with the recorded data.
//
// Note: Authentication not supported.
//

/* eslint-disable @typescript-eslint/no-var-requires */

const assert = require('assert');
var restify = require('restify');
var nockhelper = require('./nock-helper');

const clientSessions = {};

// Start the http server and listen for test run requests.
// Also expose all endpoints to simulate the Teams server.
exports.proxyRecordings = function() {
    const server = restify.createServer();
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser());
    server.listen(3979, '0.0.0.0', () => {
        console.log(`\n${ server.name } listening to ${ server.url }`);
        console.log(`\nHosting recordings.\n  To trigger begin of testing, hit ${ server.url }/api/runtests.`);
        console.log(`  In another console, start test with TEST_MODE=PLAY_SERVER, PLAY_HOST=<ip addr>.`);
        console.log('  You may have collision on https port.  To mitigate that, ngrok http -host-header=rewrite 3979');
    });
    
    // Listen for incoming requests.
    // GET /api/runtests?TestName=link-unfurl
    server.get({
        path: '/api/runtests',
        contentType: 'application/json'
    },
    async (req, res, next) => {
        console.log('RECEIVED NEW TEST RUN FROM: ' + req.connection.remoteAddress);
        const testName = req.params.TestName;
        const remoteAddress = req.connection.remoteAddress;

        // Only one test running per client host.
        if (remoteAddress in clientSessions) {
            const errorMsg = `FAIL: Session already running from client ${ removeAddress }.`;
            console.log(errorMsg);

            // Send back to client.
            res.send(errorMsg);
            return next(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const session = new ProxySession(testName, remoteAddress);
        clientSessions[req.connection.remoteAddress] = session;
        await processHostRecordings(session);
        const response = { id: '1'};
        res.send(response);
        
        delete clientSessions[req.connection.remoteAddress];
        console.log('---------------------------');
        console.log('TEST RUN SESSION COMPLETED!');
        console.log('---------------------------');
        return next(false);
    });

    server.post({
        path: '/v3/conversations',
        contentType: 'application/json'
    },
    (req, res, next) => {
        const session = clientSessions[req.connection.remoteAddress];
        const response = session.response();
        processPostReply(req, res, session);
        res.send(response); 
        return next(false);
    });

    server.post({
        path: '/v3/conversations/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        const session = clientSessions[req.connection.remoteAddress];
        const response = session.response();
        processPostReply(req, res, session, true);
        res.send(response);
        return next(false);
    });
    
    server.get({
        path: '/v3/teams/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        const session = clientSessions[req.connection.remoteAddress];
        const response = session.response();
        processGetReply(req, res, session);
        res.send(response);
        return next(false);
    });

    server.get({
        path: '/v3/conversations/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        const session = clientSessions[req.connection.remoteAddress];
        const response = session.response();
        processGetConversationReply(req, res, session);
        res.send(response);
        return next(false);
    });


    server.put({
        path: '/v3/conversations/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        const session = clientSessions[req.connection.remoteAddress];
        const response = session.response();
        processPutReply(req, res, session, true);
        res.send(response);
        return next(false);
    });

};

// Represents an active test session that's executing.
// Stores how far we've progressed in the recordings.
class ProxySession {
    constructor(testName, clientAddress) {
        this.testName = testName;
        this.clientAddress = clientAddress;
        this.recordedActivities = null;
        this.activityIndex = 0;
        this.replyIndex = 0;
        this.startDate = Date();
    }
    response() {
        const recordedActivity = this.recordedActivities[this.activityIndex];
        const reply = recordedActivity.replies[this.replyIndex];
        return reply.response;
    }
    reply() {
        const recordedActivity = this.recordedActivities[this.activityIndex];
        const reply = recordedActivity.replies[this.replyIndex];
        return reply;
    }
    activity() {
        return this.recordedActivities[this.activityIndex];
    }
}

function processPostReply(req, res, clientSession, session = false) {
    
    console.log(`Processing reply ${ clientSession.replyIndex + 1 } of ${ clientSession.activity().replies.length }`);
    const reply = clientSession.reply();

    if (session) {
        // Validating a session requires a little bit more finesse
        validatePostReply(req, reply);
    }
    else {
        const incomingReply = req.body;
        assert(JSON.stringify(incomingReply), JSON.stringify(reply));
    }


    // Increment for next reply
    clientSession.replyIndex = clientSession.replyIndex + 1;
}

function processGetReply(req, res, clientSession) {

    console.log(`Processing reply ${ clientSession.replyIndex + 1 } of ${ clientSession.activity().replies.length }`);
    const reply = clientSession.reply();

    // Not much to validate here
    assert(reply.method.toLowerCase() == 'get');

    // Increment for next reply
    clientSession.replyIndex = clientSession.replyIndex + 1;
}

function processGetConversationReply(req, res, clientSession) {
    const recordedActivity = clientSession.recordedActivities[clientSession.activityIndex];
    console.log(`Processing reply ${ clientSession.replyIndex + 1 } of ${ recordedActivity.replies.length }`);
    const reply = recordedActivity.replies[clientSession.replyIndex];

    // Not much to validate here
    assert(reply.method.toLowerCase() == 'get');


    // Increment for next reply
    clientSession.replyIndex = clientSession.replyIndex + 1;
}

function processPutReply(req, res, clientSession) {
    const recordedActivity = clientSession.recordedActivities[clientSession.activityIndex];
    console.log(`Processing reply ${ clientSession.replyIndex + 1 } of ${ recordedActivity.replies.length }`);
    const reply = recordedActivity.replies[clientSession.replyIndex];

    // Validate contents
    var recordedBody = Object.getOwnPropertyNames(reply.body);
    var excludedProperties = ['id', 'serviceUrl']; // Filter proxy-altered properties
    for (prop in recordedBody) {
        if (prop in excludedProperties) {
            continue;
        }
        assert(JSON.stringify(req.body[prop]) == JSON.stringify(reply.body[prop]));
    }

    // Increment for next reply
    clientSession.replyIndex = clientSession.replyIndex + 1;
}


// Validate "reply" (which is the incoming request - confusing!)
function validatePostReply(req, replyFromRecording) {
    // console.log('VALIDATE REPLY: INCOMING REPLY: ' + JSON.stringify(req.body, null, 1) );
    // console.log('VALIDATE REPLY: RECORDING: ' + JSON.stringify(replyFromRecording.body, null, 1) );
    const reply = req.body;
    const recordedReply = replyFromRecording.body;
    assert(reply.type == recordedReply.type);
    assert(reply.channelId == recordedReply.channelId);
    assert(reply.from.id == recordedReply.from.id);
    assert(reply.from.name == recordedReply.from.name);
    assert(reply.conversation.isGroup == recordedReply.conversation.isGroup);
    assert(reply.conversation.conversationType == recordedReply.conversation.conversationType);
    assert(reply.conversation.id == recordedReply.conversation.id);
    assert(reply.conversation.tenantId == recordedReply.conversation.tenantId);
    assert(reply.recipient.id == recordedReply.recipient.id);
    assert(reply.recipient.name == recordedReply.recipient.name);
    assert(reply.recipient.aadObjectId == recordedReply.recipient.aadObjectId);
    if (reply.text != recordedReply.text) {
        console.log('ERROR: Text does not match:');
        console.log('   EXPECTED:' + recordedReply.text);
        console.log('   OBSERVED:' + reply.text);
    }
    assert(reply.text == recordedReply.text);
    assert(reply.inputHint == recordedReply.inputHint);
    assert(reply.replyToId == recordedReply.replyToId);
}




async function processHostRecordings(clientSession) {
    const recordedActivities = nockhelper.parseActivityBundles();
    clientSession.recordedActivities = recordedActivities;
    
    await sleep(1000); // Give client time to set up.

    for (const recordedActivity of recordedActivities) {
        console.log(`\n - Processing Activity (${ clientSession.clientAddress }) # ${ clientSession.activityIndex+1 } of ${ recordedActivities.length } ---------\n`);

        const requestUrl = 'http://' + clientSession.clientAddress + ':3978/api/messages';
        console.log('Invoking: ' + requestUrl);

        // Modify the service URL to point at the proxy
        const tweakedActivity = recordedActivity.activity.body;
        tweakedActivity.serviceUrl = 'http://localhost:3979';

        // Reset reply index for this request
        clientSession.replyIndex = 0;

        res = await fetch(requestUrl, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(tweakedActivity),
        })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .then(async response => {
                // Bundle complete - make sure we processed all the replies.
                assert(recordedActivity.replies.length == clientSession.replyIndex);
                console.log('SUCCESS: Activity Request and replies validated.' );
            })
            .catch(err => console.log(`FAIL: ${ err }`, null, 1));

        // Bump to process the next activity in the recorded activities.
        clientSession.activityIndex = clientSession.activityIndex + 1;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
