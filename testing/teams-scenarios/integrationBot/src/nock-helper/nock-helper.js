// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Implements TEST_MODE=RECORD
//
// Sets up nock http hooks to intercept and record the traffic (as json files)
// in the ./recordings directory and runs the bot as normal.
//
// You can send the bot "exit" and the bot will exit gracefully.
//
// The bottom of this file contains some common helper functions/class.
//
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */

var https = require('https');
var http = require('http');
var nock = require('nock');
var fs = require('fs');
var OriginalClientRequest = http.ClientRequest; // HTTP ClientRequest before mocking by Nock
var OriginalHttpsRequest = https.request;
var OriginalHttpRequest = http.request;
var NockClientRequest = http.ClientRequest; // HTTP ClientRequest mocked by Nock
var NockHttpsRequest = https.request;
var  NockHttpRequest = http.request;
var botbuilder = require('botbuilder');
var proxyhost = require('./nock-helper-proxyhost');
var proxyplay = require('./nock-helper-proxyplay');
var play = require('./nock-helper-play');

exports.nock = nock;
exports.testName = '';
exports.testMode = ''; // RECORD | PLAY | PROXY_HOST | PROXY_PLAY
exports.proxyRecordings = proxyhost.proxyRecordings;
exports.proxyPlay = proxyplay.proxyPlay;
exports.processRecordings = play.processRecordings;

exports.isRecording = function() {
    return process.env.TEST_MODE === 'RECORD' ? true : false;
};
exports.isPlaying = function() {
    return process.env.TEST_MODE === 'PLAY' ? true : false;
};
exports.isProxyHost = function() {
    return process.env.TEST_MODE === 'PROXY_HOST' ? true : false;
};
exports.isProxyPlay = function() {
    return process.env.TEST_MODE === 'PROXY_PLAY' ? true : false;
};

function fileName(reqType, testName) {
    var utcDate = new Date();
    return utcDate.getUTCFullYear().toString() + (utcDate.getUTCMonth()+1).toString().padStart(2, '0') +
        utcDate.getUTCDate().toString().padStart(2, '0') + utcDate.getUTCHours().toString().padStart(2, '0') + 
        utcDate.getUTCMinutes().toString().padStart(2, '0') + utcDate.getUTCSeconds().toString().padStart(2, '0') + 
        utcDate.getUTCMilliseconds().toString().padStart(3, '0') + '-' + reqType + '-' + testName + '.json';
}

function validateTestMode() {
    TEST_MODES = ['RECORD', 'PLAY', 'PROXY_HOST', 'PROXY_PLAY'];
    testMode = process.env.TEST_MODE;
    if (testMode) {
        if (!TEST_MODES.includes(testMode.toUpperCase())) {
            console.log(`ERROR: ${ testMode } is not a valid TEST_MODE.`);
            console.log(`'   Valid modes: ${ TEST_MODES }.`);
            throw 'Invalid mode set.';
        }
    }
    else {
        // Default to RECORD
        testMode = 'RECORD';
        process.env.TEST_MODE = testMode;
    }
    console.log(`TEST_MODE: ${ testMode }`);
}

exports.nockHttp = function(testNameDefault, recordingsPathRoot = './recordings') {
    validateTestMode();
    testName = testNameDefault;
    http.ClientRequest = NockClientRequest;
    http.request = NockHttpRequest;
    https.request = NockHttpsRequest;
    recordingsPathRoot = recordingsPathRoot;
    testName = testName;

    // Follow autorest environment variables
    // https://github.com/microsoft/botbuilder-js/blob/main/tools/framework/suite-base.js
    if (exports.isRecording()) { 
        const nock_output_recording = content => {
            const filterScopes = ['https://login.microsoftonline.com:443', 'https://login.botframework.com:443'];
            //const filter_scopes = [];
            if (filterScopes.indexOf(content.scope) > -1) {
                return;
            }
            fs.appendFileSync(recordingsPathRoot + '/' + fileName('reply', testName), JSON.stringify(content) );
        };

        nock.recorder.rec({output_objects: true,            
            dont_print: false,
            enable_reqheaders_recording: true,
            logging: nock_output_recording,
            use_separator: false,
        });
    }
};

exports.logRequest = function(req, testName, recordingsPathRoot = './recordings') {
    if (exports.isRecording()) {
        var record = { 'type': 'request', 'url': req.url, 'method': req.method, 'headers': req.headers, 'body': req.body };
        // console.log('HEADERS:'+Object.getOwnPropertyNames(req));
        fs.appendFileSync(recordingsPathRoot + '/' + fileName('request', testName), JSON.stringify(record));
    }
};

function isIncomingActivityRequest(req) {
    if ('type' in req && req.type == 'request') {
        return true;
    }
    return false;
}


exports.unNockHttp = function() {
    http.ClientRequest = OriginalClientRequest;
    http.request = OriginalHttpRequest;
    https.request = OriginalHttpsRequest;
};

// Parse all the sorted files and bundle them into Request/Replies
// Used in proxy and local playback..
exports.parseActivityBundles = function() {
    const sortedRecordings = fs.readdirSync('./recordings', 'utf8')
        .map(item => {
            const path = `./recordings/${ item }`;
            return { name: item, path: path, };
        })
        .sort((a, b) => a.name > b.name ? 1 : -1);
    var isFirstActivity = true;
    var currentActivity = null;
    var activityPath = null; // The file path of the current Activity
    var replies = [];
    var activities = [];
    
    async function processFile(data, index, recordingPath) {
        const req = JSON.parse(data);
        // Handle main activities coming into the bot (from Teams service)
        if (isIncomingActivityRequest(req)) {
            if (isFirstActivity == false) {
                // Process previous activity.
                activities.push({activity: currentActivity, replies: replies, activityPath: recordingPath});
            }
            else {
                isFirstActivity = false;
            }
            currentActivity = req;
            replies = [];
            activityPath = recordingPath;
        }
        // Handle replies from the bot back to the Teams service
        else {
            // Buffer the replies
            replies.push(req);
        }
        // If last request or reply, then drain.
        if (index >= sortedRecordings.length - 1 ) {
            activities.push({activity: currentActivity, replies: replies, activityPath: activityPath});
        }
    }

    sortedRecordings.forEach(async (item, index) => {
        data = fs.readFileSync(item.path, 'utf8');
        await processFile(data, index, item.path);
    });
    return activities;
};

// Adapter which disables authentication.  
// Used in proxy and local playback..
exports.AdapterDisableAuth = class AdapterDisableAuth extends botbuilder.BotFrameworkAdapter {
    constructor(settings) {
        super(settings);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    authenticateRequest(request, authHeader) {
        // Skip authentication
        return true;
    }
};


exports.unNockHttp(); // Revert the nock change so that tests by default run with the original, unmocked http request objects


