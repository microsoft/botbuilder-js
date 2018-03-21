
// This sample demonstrates how easy it can be to combine the BotFramework with
// other frameworks. As an example of that we are using Redux to take
// a state-centric view of our bot design.

// In our example, once a conversation has started and messages have been exchanged this bot will
// start to proactively report the current time to the conversation - every 10 seconds!

const { ConnectorClient, MicrosoftAppCredentials,  SimpleCredentialProvider, JwtTokenValidation } = require('botframework-connector');
const restify = require('restify');
const redux = require('redux');
const createLogger = require('redux-logger').createLogger;

const conversation = require('./conversation.js');

// Create server
let server = restify.createServer();

server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Example redux middleware: lower case the activity text
const lowerCase = store => next => action => {
    if (action.type === 'message') {
        action.activity.text = action.activity.text.toLowerCase();
    }
    return next(action);
}

// Create store
const store = redux.createStore(conversation.store, 
    redux.applyMiddleware(
        // our custom Redux middleware
        lowerCase,
        // and a popular piece of Redux middleware from npm
        createLogger()
));

// Create the authenticator (for inbound activities) and the credentials (for outbound activities)
const botCredentials = {
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};
const authenticator = new SimpleCredentialProvider(botCredentials.appId, botCredentials.appPassword);
const credentials = new MicrosoftAppCredentials(botCredentials.appId, botCredentials.appPassword);;

// Redux provides a simple pub-sub model that we can use to help organize our application logic in a decoupled way

server.post('/api/messages', (req, res) => {

    console.log('processReq:', req.body);

    let activity = req.body;

    // authenticate request
    JwtTokenValidation.assertValidActivity(activity, req.headers.authorization, authenticator).then(() => {

        // dispatch the inbound activity to redux
        store.dispatch({ type: activity.type, activity: activity });

        res.send(202);
    }).catch(err => {
        console.log('Could not authenticate request:', err);
        res.send(401);
    });
});

// subscribe to redux and send an activity on the connector
store.subscribe(() => {
    const state = store.getState();
    if (state) {
        const last = state[state.length - 1];
        if (last && last.bot) {
            const activity = last.bot;

            const client = new ConnectorClient(credentials, activity.serviceUrl);

            if (last.replyToId) {
                // in this case we know this was a reply to an inbound activity
                client.conversations.replyToActivity(activity.conversation.id, last.replyToId, activity)
                .then(() => {
                    console.log('reply send with id: ' + last.replyToId);
                });
            }
            else {
                // otherwise just send the activity to teh conversation
                client.conversations.sendToConversation(activity.conversation.id, activity)
                    .then(() => {
                        console.log('sent activity to conversation');
                    });
            }
        }
    }
});

// and now let's have another source of conversation state change...
setInterval(() => {
    store.dispatch({ type: 'interval', now: new Date() });
}, 10000);

// and, of course, we might have other aspects of our implementation subscribed to the state
