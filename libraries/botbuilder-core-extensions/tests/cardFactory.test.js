const assert = require('assert');
const { BotContext } = require('botbuilder-core');
const { CardFactory } = require('../');

const receivedMessage = { text: 'received', type: 'message', channelId: 'test', conversation: { id: 'convo' } };

describe(`CardFactory`, function () {
    this.timeout(5000);

    it(`should map array of string actions() to CardActions.`, function () {
        const actions = CardFactory.actions(['a', 'b', 'c']);
        assert(Array.isArray(actions), `didn't return an array.`);
        assert(actions.length === 3, `wrong number of actions returned.`);
        assert(typeof actions[0] === 'object', `didn't map into card actions.`);
        assert(actions[0].title === 'a', `title missing or invalid`);
        assert(actions[0].type, `type missing`);
        assert(actions[0].value, `value missing`);
    });
});
