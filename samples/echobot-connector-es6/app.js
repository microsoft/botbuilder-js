/// The Bot Builder SDK is layered and this sample illustrates using some of the
/// lowest level components directly. Although there is less code to write when 
/// using the higher level components, there are many occasions when it is helpful 
/// for the advanced programmer to understand how things work further down the stack. 

/// Additionally there can be circumstances, particularly when integrating new 
/// functionality into existing application code, where it can be useful to be 
/// able to use aspects of the framework in isolation.

const { ConnectorClient, MicrosoftAppCredentials,  SimpleCredentialProvider, JwtTokenValidation } = require('botframework-connector');
const { Activity, ActivityTypes } = require('botframework-schema');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const botCredentials = {
    appId: '',
    appPassword: ''
};
const authenticator = new SimpleCredentialProvider(botCredentials.appId, botCredentials.appPassword);
const credentials = new MicrosoftAppCredentials(botCredentials.appId, botCredentials.appPassword);;

server.post('/api/messages', (req, res, next) => {
    console.log('processReq:', req.body);

    let activity = req.body;

    // authenticate request
    JwtTokenValidation.assertValidActivity(activity, req.headers.authorization, authenticator).then(() => {

        // On message activity, reply with the same text
        if (activity.type ===  ActivityTypes.Message) {
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
});

function createReply(activity, text, locale = null) {
    return {
        type: ActivityTypes.Message,
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