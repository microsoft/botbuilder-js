// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Implements TEST_MODE=PLAY
//
// Loads all the recordings (json files) in the ./recordings directory
// and drives traffic to the bot.  It intercepts all external service calls 
// (captured in the recordings) and responds based on what's in the recording.
//
// Validates the traffic matches.

/* eslint-disable @typescript-eslint/no-var-requires */

var nockhelper = require('./nock-helper');
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
        code += `return nock('${ item.scope }')\n`;
        // Uncomment to debug matching logic.
        //code += `  .log(console.log)\n`;
        

        // Set up interceptor with some validation on properties.
        code += `  .matchHeader('content-type', '${ item.reqheaders['content-type'] }')\n`;
        if ('content-length' in item.reqheaders) {
            code += `  .matchHeader('accept', '${ item.reqheaders.accept }')\n`;
        }

        // Prepare URL
        code = prepareUrl(item, code);

        if (item.method.toLowerCase() == 'put') {
            code += `,\n    function(body) {\n`;
            // Validate contents
            var recordedBody = Object.getOwnPropertyNames(item.body);
            
            //console.log('ALL PROPERTIES: ' + JSON.stringify(recordedBody, null, 1));
            var excludedProperties = ['serviceUrl', 'replyToId', 'id', 'text']; // Filter proxy-altered properties
            recordedBody.forEach(function(prop) {
                if (excludedProperties.includes(prop)) {
                    return;
                }
                
                if (typeof item.body[prop] == 'string') {
                    //console.log('ALL PROPERTIES: PROCESSING: ' + prop + ' - \n' + item.body[prop]);
                    code += `      console.log('PROCESSING ${ prop }.');\n`;
                    code += `      if (${ JSON.stringify(item.body[prop]) } != body.${ prop }) {\n`;
                    code += `        console.error('Body ${ prop } does not match ${ JSON.stringify(item.body[prop]) } != ' + JSON.stringify(body.${ prop }));\n`;
                    code += `        return false;\n`;
                    code += `      }\n`;
                }
            });
            code += `      console.log('DONE PROCESSING PROPERTIES!');\n`;
            code += `      return true;\n`;
            code += `    })\n`;
            code += `  .reply(${ item.status }, ${ JSON.stringify(item.response) }, ${ formatHeaders(item.rawHeaders) });\n`;
        } else if (item.method.toLowerCase() == 'post') {
            code += `,\n    function(body) {\n`;
            // code += `       console.log('INSIDE BODY EVALUATION!!');\n`;

            // Validate body type
            if (item.body.hasOwnProperty('type')) { 
                code += `      if ('${ item.body.type }' != body.type) {\n`;
                code += `        console.log('Body type does not match ${ item.body.type } != ' + body.type);\n`;
                code += `        return false;\n`;
                code += `      }\n`;
            }
            // Validate Activity
            if (item.body.hasOwnProperty('activity')) { 
                code += `      if (${ item.body.activity.hasOwnProperty('type') } && '${ item.body.activity.type }' != body.activity.type) {\n`;
                code += `        console.log('Activity type does not match ${ item.body.activity.type } != ' + body.activity.type);\n`;
                code += `        return false;\n`;
                code += `      }\n`;
                // Validate Activity attachments
                if (item.body.activity.hasOwnProperty('attachments')) {
                    code += `      if ('${ JSON.stringify(item.body.activity.attachments) }' != JSON.stringify(body.activity.attachments)) {\n`;
                    code += `        console.log('Activity attachments do not match ${ JSON.stringify(item.body.activity.attachments) } != ' + JSON.stringify(body.activity.attachments));\n`;
                    code += `        return false;\n`;
                    code += `      }\n`;
                }
            }

            // Validate ChannelData
            if (item.body.hasOwnProperty('channelData') && item.body.channelData.hasOwnProperty('channel') 
                && item.body.channelData.channel.hasOwnProperty('id')) { 
                code += `      if ('${ item.body.channelData.channel.id }' != body.channelData.channel.id) {\n`;
                code += `        console.error('Channel data/channel id does not match ${ JSON.stringify(item.body.channelData) } != ' + JSON.stringify(body.channelData));\n`;
                code += `        return false;\n`;
                code += `      }\n`;
            }

            // Validate from.name 
            if (item.body.hasOwnProperty('from') && item.body.from.hasOwnProperty('name')) { 
                code += `      if ('${ item.body.from.name }' != body.from.name) {\n`;
                code += `        console.error('From name does not match');\n`;
                code += `        return false;\n`;
                code += `      }\n`;
            }
            code += `      return true;\n`;
            code += `    })\n`;
            code += `  .reply(${ item.status }, ${ JSON.stringify(item.response) }, ${ formatHeaders(item.rawHeaders) });\n`;
        }
        else {
            code += `)\n`;
            code += `  .reply(${ item.status }, ${ JSON.stringify(item.response) }, ${ formatHeaders(item.rawHeaders) })\n`;
        }
        
        // Uncomment to see generated Interceptor code.
        if (item.method.toLowerCase() == 'put') {
            console.log('NOCK INTERCEPTOR CODE (replies count = ' + replies.length + '):\n' + code);
        }
        var interceptor = null;
        try {
            interceptor = new Function('nock', code);
        }
        catch(ex) {
            console.error('NOCK INTERCEPTOR CODE (replies count = ' + replies.length + '):\n' + code);
            console.error(JSON.stringify(ex, null, 1));
            
            throw ex;
        }
        response.push(interceptor(nock));
    });
    return response;
}

// Process invoking bot locally.
// First sets up all the anticipated external calls (interceptors)
// and then calls the adapter to invoke the bot.
async function playRecordings(activityBundle, adapter, myBot) { 
    // eslint-disable-next-line @typescript-eslint/camelcase
    //await sleep(1000);
    const activityRecordingPth = activityBundle.activityPath;
    console.log('****PLAY RECORDINGS - activity contains ' + activityBundle.replies.length + ' replies. - ' + activityRecordingPth);
    nock_interceptors = setupInterceptorReplies(activityBundle.replies);
    const activity = activityBundle.activity;
    console.error('CURRENT INTERCEPTORS : ' + JSON.stringify(nock.pendingMocks(), null, 1));
    
    // Call bot
    var request  = httpMocks.createRequest({
        method: activity.method,
        url: activity.url,
        headers: activity.headers,
        body: activity.body,
    });   
    var response = httpMocks.createResponse();
    await sleep(1000);
    var adapt = new nockhelper.AdapterDisableAuth();
    await adapt.processActivity(request, response, async (context) => {
        // Route to main dialog.
        await myBot.run(context);

    });
    // Tear down interceptors
    
    
    await sleep(5000);
    if(!nock.isDone()) {
        
        console.error('NOT ALL NOCK INTERCEPTORS USED : ' + JSON.stringify(nock.pendingMocks()));
    }
    nock.cleanAll();
    console.log('****PLAY RECORDINGS - complete! - ' + activityRecordingPth);
    
}



// Parse all recordings (bundled up in activity/replies)
// and the play each bot invocation.
exports.processRecordings = async function(testName, adapter = null, myBot = null) {
    const activityBundles = nockhelper.parseActivityBundles();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activityBundles.forEach(async (activityBundle) =>  {
        await playRecordings(activityBundle, adapter, myBot, activityBundle.activityPath);
    });
    await sleep(10000);
    return 'Completed processing recordings.';
       
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function prepareUrl(item, code) {
    const method = item.method.toLowerCase();
    switch(method) {
        case 'post':
            //  Handle post token
            //    ie, `/amer/v3/conversations/../1569442142365`
            // Last token (1569442142365) is variable, must be pulled off.
            const lastToken = item.path.substring(item.path.lastIndexOf('/'));
            const truncateLastToken = (/^\d+$/.test(lastToken) && lastToken.length == 13);
            const pathNoLastElement = truncateLastToken ? item.path.substring(0, item.path.lastIndexOf('/')) : item.path;

            if (truncateLastToken) {
                code += `  .${ method }(uri => uri.includes('${ pathNoLastElement }'),\n`;
            }
            else {
                code += `  .${ method }('${ pathNoLastElement }'`;
            }
            break;

        case 'get':
            code += `  .${ method }('${ item.path }'`;
            break;

        case 'put':
            // /amer/v3/conversations/19%3A097e6717fd7245bdbeba6baa13840db8%40thread.skype%3Bmessageid%3D1571537152320/activities/1%3A1Zu8wK3u9-8LohH10diLSicoeHNSBwMtz2VNKrDCqPQc
            const levels = item.path.split('/');
            var path = item.path;
            if (levels.length == 7 && levels[5] == 'activities') {
                //levels[4] = '*';
                //path = RegExp('\/amer\/v3\/conversations\/.*\/activities\/.*$', 'g');
                //path = /amer\/v3\/conversations\/.*\/activities\/.*$/;
            }
            code += `  .${ method }(/amer\\/v3\\/conversations\\/.*\\/activities\\/.*$/g`;
            break;

        default:
            throw new Exception('ERROR unsupported HTTP verb : ' + method);
    }

    return code;

}
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

