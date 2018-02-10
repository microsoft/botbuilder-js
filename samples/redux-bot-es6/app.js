
const services = require('botbuilder-services');
const restify = require('restify');
const redux = require('redux');
const createLogger = require('redux-logger').createLogger;

const conversation = require('./conversation.js');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Example middleware: lower case the activity text
const lowerCase = store => next => action => {
    action.activity.text = action.activity.text.toLowerCase();
    return next(action);
}

// Create store
const store = redux.createStore(conversation.store, 
    redux.applyMiddleware(
        lowerCase,
        createLogger()
));

// Create adapter
const adapter = new services.BotFrameworkAdapter(process.env.MICROSOFT_APP_ID, process.env.MICROSOFT_APP_PASSWORD);
server.post('/api/messages', adapter.listen());

// tie the adapter to the store
adapter.onReceive = function (activity) {
    store.dispatch({ type: activity.type, activity: activity });
    return Promise.resolve();
};

// tie the store to the adapter
store.subscribe(() => {
    const state = store.getState();
    if (state) {
        adapter.post([ state[state.length - 1].bot ]);
    }
});

