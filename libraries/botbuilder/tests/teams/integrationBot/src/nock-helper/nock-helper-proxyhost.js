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
const assert = require('assert');
var restify = require('restify');
var nockhelper = require('./nock-helper');

const clientSessions = {};

exports.proxyRecordings = function() {
    const server = restify.createServer();
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser());
    server.listen(3979, '0.0.0.0', () => {
        console.log(`\n${server.name} listening to ${server.url}`);
        console.log(`\nHosting recordings.\n  To trigger begin of testing, hit ${server.url}/api/runtests.`);
        console.log(`  In another console, start test with TEST_MODE=PLAY_SERVER, PLAY_HOST=<ip addr>.`);
        console.log('  You may have collision on https port.  To mitigate that, ngrok http -host-header=rewrite 3979')
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
            const errorMsg = `FAIL: Session already running from client ${removeAddress}.`;
            console.log(errorMsg);

            // Send back to client.
            res.send(errorMsg);
            return next(false);
        }

        const session = new ProxySession(testName, remoteAddress);
        clientSessions[req.connection.remoteAddress] = session;
        await processHostRecordings(session);
        const response = { id: "1"};
        res.send(response);
        delete clientSessions[req.connection.remoteAddress];
        return next(false);
    });

    server.post({
        path: '/v3/conversations',
        contentType: 'application/json'
    },
    (req, res, next) => {
        //validateHeaders(req);
        processPostReply(req, res, clientSessions[req.connection.remoteAddress]);
        const response = { id: "1"};
        res.send(response);
        return next(false);
    });

    server.post({
        path: '/v3/conversations/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        //validateHeaders(req);
        processPostReply(req, res, clientSessions[req.connection.remoteAddress], true);
        const response = { id: "1"};
        res.send(response);
        return next(false);
    });
    
    server.get({
        path: '/v3/teams/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        processGetReply(req, res, clientSessions[req.connection.remoteAddress]);
        const response = { id: "1"};
        res.send(response);
        return next(false);
    });

    server.put({
        path: '/v3/conversations/*',
        contentType: 'application/json; charset=utf-8'
    },
    (req, res, next) => {
        //validateHeaders(req);
        processPutReply(req, res, clientSessions[req.connection.remoteAddress], true);
        const response = { id: "1"};
        res.send(response);
        return next(false);
    });

}

// Represents an active test session that's executing.
// Stores how far we've progressed in the recordings.
class ProxySession {
    constructor(testName, clientAddress) {
        this.testName = testName;
        this.clientAddress = clientAddress;
        this.recordedActivities = null;
        this.activityIndex = 0;
        this.reply_index = 0;
        this.start_date = Date();
    }
}

function processPostReply(req, res, clientSession, session = false) {
    const recordedActivity = clientSession.recordedActivities[clientSession.activityIndex];
    console.log(`Processing reply ${clientSession.reply_index + 1} of ${recordedActivity.replies.length}`);
    const recordedReply = recordedActivity.replies[clientSession.reply_index];
    const reply = recordedActivity.replies[clientSession.reply_index];

    if (session) {
        // Validating a session requires a little bit more finesse
        validatePostReply(req, reply);
    }
    else {
        const incomingReply = req.body;
        assert(JSON.stringify(incomingReply), JSON.stringify(recordedReply));
    }


    // Increment for next reply
    clientSession.reply_index = clientSession.reply_index + 1;
}

function processGetReply(req, res, clientSession) {
    const recordedActivity = clientSession.recordedActivities[clientSession.activityIndex];
    console.log(`Processing reply ${clientSession.reply_index + 1} of ${recordedActivity.replies.length}`);
    const reply = recordedActivity.replies[clientSession.reply_index];

    // Not much to validate here
    assert(reply.method.toLowerCase() == 'get');

    // Increment for next reply
    clientSession.reply_index = clientSession.reply_index + 1;
}

function processPutReply(req, res, clientSession) {
    const recordedActivity = clientSession.recordedActivities[clientSession.activityIndex];
    console.log(`Processing reply ${clientSession.reply_index + 1} of ${recordedActivity.replies.length}`);
    const reply = recordedActivity.replies[clientSession.reply_index];

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
    clientSession.reply_index = clientSession.reply_index + 1;
}


// Validate "reply" (which is the incoming request - confusing!)
function validatePostReply(req, replyFromRecording) {
    // console.log('VALIDATE REPLY: INCOMING REPLY: ' + JSON.stringify(req.body, null, 1) );
    // console.log('VALIDATE REPLY: RECORDING: ' + JSON.stringify(replyFromRecording.body, null, 1) );
    const reply = req.body;
    const recorded_reply = replyFromRecording.body;
    assert(reply.type == recorded_reply.type);
    assert(reply.channelId == recorded_reply.channelId);
    assert(reply.from.id == recorded_reply.from.id);
    assert(reply.from.name == recorded_reply.from.name);
    assert(reply.conversation.isGroup == recorded_reply.conversation.isGroup);
    assert(reply.conversation.conversationType == recorded_reply.conversation.conversationType);
    assert(reply.conversation.id == recorded_reply.conversation.id);
    assert(reply.conversation.tenantId == recorded_reply.conversation.tenantId);
    assert(reply.recipient.id == recorded_reply.recipient.id);
    assert(reply.recipient.name == recorded_reply.recipient.name);
    assert(reply.recipient.aadObjectId == recorded_reply.recipient.aadObjectId);
    assert(reply.text == recorded_reply.text);
    assert(reply.inputHint == recorded_reply.inputHint);
    assert(reply.replyToId == recorded_reply.replyToId);
}




async function processHostRecordings(clientSession) {
    const recordedActivities = nockhelper.parseActivityBundles();
    clientSession.recordedActivities = recordedActivities;
    
    await sleep(1000); // Give client time to set up.

    for (const recordedActivity of recordedActivities) {
        console.log(`\n - Processing Activity (${clientSession.clientAddress}) # ${clientSession.activityIndex+1} of ${recordedActivities.length} ---------\n`);

        const requestUrl = 'http://' + clientSession.clientAddress + ':3978/api/messages';
        console.log('Invoking: ' + requestUrl);

        // Modify the service URL to point at the proxy
        const tweakedActivity = recordedActivity.activity.body;
        tweakedActivity.serviceUrl = 'http://localhost:3979';

        // Reset reply index for this request
        clientSession.reply_index = 0;

        const res = await fetch(requestUrl, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(tweakedActivity),
        })
        .then(async response => {
            // Bundle complete - make sure we processed all the replies.
            assert(recordedActivity.replies.length == clientSession.reply_index);
            console.log('SUCCESS: Activity Request and replies validated.' );
        })
        .catch(err => console.log(`FAIL: ${err}`, null, 1));

        // Bump to process the next activity in the recorded activities.
        clientSession.activityIndex = clientSession.activityIndex + 1;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


