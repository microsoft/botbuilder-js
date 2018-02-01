import { ConnectorClient, BotCredentials, MicrosoftAppCredentials, BotAuthenticator } from 'botframework-connector';
import { Activity } from 'botbuilder-schema';
import * as restify from "restify";

const botCredentials: BotCredentials = {
    appId: '',
    appPassword: ''
};
const credentials = new MicrosoftAppCredentials(botCredentials);
const authenticator = new BotAuthenticator(botCredentials);

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

server.post('/api/messages', getListener());

function getListener(): HttpHandler {
    // handle activity when request body is ready
    function processReq(req, res) {
        console.log('processReq:', req.body);

        var activity = req.body;

        // authenticate request
        authenticator.authenticate(req.headers, activity.channelId, activity.serviceUrl).then(() => {

            // On message activity, reply with the same text
            if (activity.type === 'message') {
                var reply = createReply(activity, `You said: ${activity.text}`);
                const client = new ConnectorClient(credentials, activity.serviceUrl);
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
        } else {
            let requestData = '';
            req.on('data', (chunk: string) => {
                requestData += chunk
            });
            req.on('end', () => {
                req.body = JSON.parse(requestData);
                processReq(req, res);
            });
        }
    };
}

export interface HttpHandler {
    (req, res, next?: Function): void;
}

function createReply(activity: any, text: string, locale: string = null): Activity {
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
