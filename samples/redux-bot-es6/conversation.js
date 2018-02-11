
// require nothing:-)

// Redux asks the application developer to think carefully about state
// this has a lot of benefits - not least of which is testability (the store is pure function)

// More details on Redux can be found here https://redux.js.org/

// The Bot Framework contains helper code for dealing with conversation Activities
// but for the benefit of the curious, here is some raw implementation...

const echo = function (requestActivity) {
    const responseActivity = {
        type: 'message',
        text: '((((' + requestActivity.text + '))))',
        channelId: requestActivity.channelId,
        serviceUrl: requestActivity.serviceUrl,
        conversation: requestActivity.conversation,
        from: { id: 'default-bot', name: 'Bot' },
        recipient: requestActivity.from,
        replyToId: requestActivity.id
    };
    return responseActivity;
};

// A Redux store is a pure function

const store = function (state = [], action) {
    switch (action.type) {
        // this state change came from the bot framework channel
        case 'message':
            state.push({ user: action.activity });
            state.push({ bot: echo(action.activity) });
            break;
        // this state change was generated interanlly in our bot logic
        case 'interval': {
            // a smarter implementation might keep tabs on the current conversation users
            // however, here we are just looking at the tail of our conversation log 
            const last = state[state.length - 1];
            if (last && last.bot) {
                state.push({ bot: Object.assign({}, last.bot, { text: 'The time is: ' + action.now.toUTCString() }) });
            }
        }
    }
    return state;
};

module.exports = {
    store: store
};
