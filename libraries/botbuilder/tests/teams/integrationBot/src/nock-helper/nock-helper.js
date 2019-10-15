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
var proxyhost = require('./nock-helper-proxyhost');
var proxyplay = require('./nock-helper-proxyplay');

exports.nock = nock;
exports.testName = '';
exports.testMode = ''; // RECORD | PLAY | PROXY_HOST | PROXY_PLAY
exports.proxyRecordings = proxyhost.proxyRecordings;
exports.proxyPlay = proxyplay.proxyPlay;

// $env:AZURE_NOCK_RECORD="true"
exports.isRecording = function() {
    return process.env.TEST_MODE === 'RECORD' ? true : false;
}

exports.isPlaying = function() {
    return process.env.TEST_MODE === 'PLAY' ? true : false;
}
exports.isProxyHost = function() {
    return process.env.TEST_MODE === 'PROXY_HOST' ? true : false;
}
exports.isProxyPlay = function() {
    return process.env.TEST_MODE === 'PROXY_PLAY' ? true : false;
}

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
            console.log(`ERROR: ${testMode} is not a valid TEST_MODE.`);
            console.log(`'   Valid modes: ${TEST_MODES}.`);
            throw "Invalid mode set.";
        }
    }
    else {
        // Default to RECORD
        testMode = 'RECORD';
        process.env.TEST_MODE = testMode;
    }
    console.log(`TEST_MODE: ${testMode}`)
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
    // https://github.com/microsoft/botbuilder-js/blob/master/tools/framework/suite-base.js#L66
    if (exports.isRecording()) { 
        const nock_output_recording = content => {
            const filter_scopes = ['https://login.microsoftonline.com:443', 'https://login.botframework.com:443'];
            //const filter_scopes = [];
            if (filter_scopes.indexOf(content.scope) > -1) {
                return;
            }
            fs.appendFileSync(recordingsPathRoot + '/' + fileName('reply', testName), JSON.stringify(content) );
        }

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

function setupInterceptorReplies(replies) {
    if (replies == null || replies.length <= 0) {
        return null;
    }
    var response = [];
    replies.forEach((item) => {
        var code = ``;
        itemScopeNoPort = item.scope.substring(0, item.scope.lastIndexOf(':'));
        code += `return nock('${item.scope}')\n`;
        // Uncomment to debug matching logic.
        //code += `  .log(console.log)\n`;
        

        // Set up interceptor with some validation on properties.
        code += `  .matchHeader('content-length', '${item.reqheaders['content-length']}')\n`;
        code += `  .matchHeader('content-type', '${item.reqheaders['content-type']}')\n`;
        code += `  .matchHeader('accept', '${item.reqheaders.accept}')\n`;

        // Prepare URL
        //    ie, `/amer/v3/conversations/../1569442142365`
        // Last token (1569442142365) is variable, must be pulled off.
        const pathNoLastElement = item.path.substring(0, item.path.lastIndexOf('/'))

        code += `  .${item.method.toLowerCase()}(uri => uri.includes('${pathNoLastElement}'),\n`;
        code += `    function(body) {\n`;
        code += `      if ('${item.body.type}' != body.type) {\n`;
        code += `        console.log('Body type does not match');\n`;
        code += `        return false;\n`;
        code += `      }\n`;
        code += `      if ('${item.body.from.name}' != body.from.name) {\n`;
        code += `        console.log('From name does not match');\n`;
        code += `        return false;\n`;
        code += `      }\n`;
        code += `      return true;\n`;
        code += `    })\n`;
        code += `  .reply(${item.status}, ${JSON.stringify(item.response)}, ${JSON.stringify(item.rawHeaders)});\n`;

        // console.log('NOCK INTERCEPTOR CODE (replies count = ' + replies.length + '):\n' + code);
        var interceptor = new Function('nock', code);
        response.push(interceptor(nock))
    });
    return response;
}

// Process Activities locally.
async function playRecordings(activity, replies, adapter, myBot) { 
    // Setup interceptor(s)
    nock_interceptors = setupInterceptorReplies(replies);
    
    // Call bot
    var request  = httpMocks.createRequest({
        method: activity.method,
        url: activity.url,
        headers: activity.headers,
        body: activity.body,
    });   
    var response = httpMocks.createResponse();

    var adapt = new AdapterDisableAuth();
    await adapt.processActivity(request, response, async (context) => {
        // Route to main dialog.
        await myBot.run(context);
    });
}

exports.parseActivityBundles = function () {
    const sortedRecordings = fs.readdirSync("./recordings", "utf8")
                                .map(item => {
                                    const path = `./recordings/${item}`;
                                    return { name: item, path: path, };
                                })
                                .sort((a, b) => a.name > b.name ? 1 : -1);
    var isFirstActivity = true;
    var currentActivity = null;
    var replies = [];
    var activities = [];
    
    async function processFile(data, index) {
        const req = JSON.parse(data);
        // Handle main activities coming into the bot (from Teams service)
        if (isIncomingActivityRequest(req)) {
            if (isFirstActivity == false) {
                // Process previous activity.
                activities.push({activity: currentActivity, replies: replies});
            }
            else {
                isFirstActivity = false;
            }
            currentActivity = req;
            replies = [];
        }
        // Handle replies from the bot back to the Teams service
        else {
            // Buffer the replies
            replies.push(req);
        }
        // If last request or reply, then drain.
        if (index >= sortedRecordings.length - 1 ) {
            activities.push({activity: currentActivity, replies: replies});
        }
    }

    sortedRecordings.forEach(async (item, index) => {
        data = fs.readFileSync(item.path, 'utf8');
        await processFile(data, index);
    });
    return activities;
}


exports.processRecordings = function(testName, adapter = null, myBot = null) {
    const activityBundles = parseActivityBundles();
    activityBundles.forEach(async (activityBundle, index) => {
        await playRecordings(activityBundle.activity, activityBundle.replies, adapter, myBot);
    });
};

exports.unNockHttp = function() {
  http.ClientRequest = OriginalClientRequest;
  http.request = OriginalHttpRequest;
  https.request = OriginalHttpsRequest;
};


class AdapterDisableAuth extends botbuilder.BotFrameworkAdapter {
    constructor(settings) {
        super(settings);
    }

    authenticateRequest(request, authHeader) {
        // Skip authentication
        return true;
    }
}

exports.unNockHttp(); // Revert the nock change so that tests by default run with the original, unmocked http request objects


