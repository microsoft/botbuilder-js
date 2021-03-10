const { Culture } = require('@microsoft/recognizers-text-suite');
const { ActivityTypes, TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE',
};

const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE',
};

const createMessageActivity = (text, locale = Culture.English) => ({
    type: ActivityTypes.Message,
    text: text || 'test activity',
    recipient: user,
    from: bot,
    locale: locale,
});

const createContext = (text, locale = Culture.English) => {
    const activity = createMessageActivity(text, locale);
    return new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
};

module.exports = {
    createContext,
    createMessageActivity,
};
