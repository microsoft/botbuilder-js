"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botframework_connector_1 = require("botframework-connector");
const restify = require("restify");
const botCredentials = {
    appId: '',
    appPassword: ''
};
const credentials = new botframework_connector_1.MicrosoftAppCredentials(botCredentials);
const authenticator = new botframework_connector_1.BotAuthenticator(botCredentials);
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
server.post('/api/messages', getListener());
function getListener() {
    // handle activity when request body is ready
    function processReq(req, res) {
        console.log('processReq:', req.body);
        var activity = req.body;
        // authenticate request
        authenticator.authenticate(req.headers, activity.channelId, activity.serviceUrl).then(() => {
            // On message activity, reply with the same text
            if (activity.type === 'message') {
                var reply = createReply(activity, `You said: ${activity.text}`);
                const client = new botframework_connector_1.ConnectorClient(credentials, activity.serviceUrl);
                client.conversations.replyToActivity(activity.conversation.id, activity.id, reply)
                    .then((reply) => {
                    console.log('reply send with id: ' + reply.id);
                });
            }
            res.send(202);
        }).catch(err => {
            console.log('Could not authenticate request:', err);
            res.send(401);
        });
    }
    // support streamed and chuncked responses
    return (req, res) => {
        if (req.body) {
            processReq(req, res);
        }
        else {
            let requestData = '';
            req.on('data', (chunk) => {
                requestData += chunk;
            });
            req.on('end', () => {
                req.body = JSON.parse(requestData);
                processReq(req, res);
            });
        }
    };
}
function createReply(activity, text, locale = null) {
    return {
        type: "message",
        timestamp: new Date(),
        from: { id: activity.recipient.id, name: activity.recipient.name },
        recipient: { id: activity.from.id, name: activity.from.name },
        replyToId: activity.id,
        serviceUrl: activity.serviceUrl,
        channelId: activity.channelId,
        conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
        text: text || '',
        locale: locale || activity.locale
    };
}
//# sourceMappingURL=app.js.map