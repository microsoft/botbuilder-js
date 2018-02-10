
// require nothing:-)

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

const store = function (state = [], action) {
    switch (action.type) {
        case 'message':
            state.push({ user: action.activity });
            state.push({ bot: echo(action.activity) });
            return state;
    }
};

module.exports = {
    store: store
};
