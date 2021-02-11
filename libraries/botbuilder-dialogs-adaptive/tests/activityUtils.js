const { Culture } = require('@microsoft/recognizers-text-suite');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE',
};

const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE',
};

const createMessageActivity = (text) => {
    return {
        type: 'message',
        text: text || 'test activity',
        recipient: user,
        from: bot,
        locale: Culture.English,
    };
};

const createContext = (text) => {
    const activity = createMessageActivity(text);
    return new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
};

module.exports = {
    createContext,
    createMessageActivity,
}
