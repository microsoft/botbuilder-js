// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Implements TEST_MODE=PLAY
//
// Loads all the recordings (json files) in the ./recordings directory
// and drives traffic to the bot.  It intercepts all external service calls 
// (captured in the recordings) and responds based on what's in the recording.
//
// Validates the traffic matches.

var nockhelper = require('./nock-helper');
var https = require('https');
var http = require('http');
var nock = require('nock');
var httpMocks = require('node-mocks-http');

// Dynamically sets up interceptors based on recorded reply.
// This is called preceding an invocation of a bot request.  
// It sets up all anticipated "replies" (http calls to external service(s)) 
// that are made during the bot request.
//
// We could explore making this more mechanical (ie, just compare raw stringify)
// later.
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
        if ('content-length' in item.reqheaders) {
            code += `  .matchHeader('content-length', '${item.reqheaders['content-length']}')\n`;
        }

        code += `  .matchHeader('content-type', '${item.reqheaders['content-type']}')\n`;
        if ('content-length' in item.reqheaders) {
            code += `  .matchHeader('accept', '${item.reqheaders.accept}')\n`;
        }

        // Prepare URL
        //    ie, `/amer/v3/conversations/../1569442142365`
        // Last token (1569442142365) is variable, must be pulled off.
        const lastToken = item.path.substring(item.path.lastIndexOf('/'));
        const truncateLastToken = (/^\d+$/.test(lastToken) && lastToken.length == 13);
        const pathNoLastElement = truncateLastToken ? item.path.substring(0, item.path.lastIndexOf('/')) : item.path;

        if (truncateLastToken) {
            code += `  .${item.method.toLowerCase()}(uri => uri.includes('${pathNoLastElement}'),\n`;
        }
        else {
            code += `  .${item.method.toLowerCase()}('${pathNoLastElement}'`;
        }

        if (item.method.toLowerCase() == 'post') {
            code += `,\n    function(body) {\n`;
            // code += `       console.log('INSIDE BODY EVALUATION!!');\n`;

            // Validate body type
            if (item.body.hasOwnProperty('type')) { 
                code += `      if ('${item.body.type}' != body.type) {\n`;
                code += `        console.log('Body type does not match ${item.body.type} != ' + body.type);\n`;
                code += `        return false;\n`;
                code += `      }\n`;
            }
            // Validate Activity
            if (item.body.hasOwnProperty('activity')) { 
                code += `      if (${item.body.activity.hasOwnProperty('type')} && '${item.body.activity.type}' != body.activity.type) {\n`;
                code += `        console.log('Activity type does not match ${item.body.activity.type} != ' + body.activity.type);\n`;
                code += `        return false;\n`;
                code += `      }\n`;
                // Validate Activity attachments
                if (item.body.activity.hasOwnProperty('attachments')) {
                    code += `      if ('${JSON.stringify(item.body.activity.attachments)}' != JSON.stringify(body.activity.attachments)) {\n`;
                    code += `        console.log('Activity attachments do not match ${JSON.stringify(item.body.activity.attachments)} != ' + JSON.stringify(body.activity.attachments));\n`;
                    code += `        return false;\n`;
                    code += `      }\n`;
                }
            }

            // Validate ChannelData
            if (item.body.hasOwnProperty('channelData') && item.body.channelData.hasOwnProperty('channel') 
                && item.body.channelData.channel.hasOwnProperty('id')) { 
                code += `      if ('${item.body.channelData.channel.id}' != body.channelData.channel.id) {\n`;
                code += `        console.log('Channel data/channel id does not match ${JSON.stringify(item.body.channelData)} != ' + JSON.stringify(body.channelData));\n`;
                code += `        return false;\n`;
                code += `      }\n`;
            }

            // Validate from.name 
            if (item.body.hasOwnProperty('from') && item.body.from.hasOwnProperty('name')) { 
                code += `      if ('${item.body.from.name}' != body.from.name) {\n`;
                code += `        console.log('From name does not match');\n`;
                code += `        return false;\n`;
                code += `      }\n`;
            }
            code += `      return true;\n`;
            code += `    })\n`;
            code += `  .reply(${item.status}, ${JSON.stringify(item.response)}, ${formatHeaders(item.rawHeaders)});\n`;
        }
        else {
            code += `)\n`;
            code += `  .reply(${item.status}, ${JSON.stringify(item.response)}, ${formatHeaders(item.rawHeaders)})\n`;
        }
        
        // Uncomment to see generated Interceptor code.
        //console.log('NOCK INTERCEPTOR CODE (replies count = ' + replies.length + '):\n' + code);
        var interceptor = new Function('nock', code);
        response.push(interceptor(nock));
    });
    return response;
}

// Process invoking bot locally.
// First sets up all the anticipated external calls (interceptors)
// and then calls the adapter to invoke the bot.
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

    var adapt = new nockhelper.AdapterDisableAuth();
    await adapt.processActivity(request, response, async (context) => {
        // Route to main dialog.
        await myBot.run(context);
    });
}


// Parse all recordings (bundled up in activity/replies)
// and the play each bot invocation.
exports.processRecordings = function(testName, adapter = null, myBot = null) {
    const activityBundles = nockhelper.parseActivityBundles();
    activityBundles.forEach(async (activityBundle, index) => {
        await playRecordings(activityBundle.activity, activityBundle.replies, adapter, myBot);
    });
    console.log('Process Recordings complete!');
};

// Format headers from recordings
function formatHeaders(rawHeaders) {
    var headers = '{';
    for (let i=0; i< rawHeaders.length-2; i=i+2) {
        if (rawHeaders[i] == 'Content-Length') {
            continue;
        }
        headers += '"' + rawHeaders[i] + '"' + ':' + '"' + rawHeaders[i+1] + '"';
        if (i < rawHeaders.length - 4) {
            headers += ',';
        }
    }
    headers += '}';
    return headers;
}

