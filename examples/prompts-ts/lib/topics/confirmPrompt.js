"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_choices_1 = require("botbuilder-choices");
const menu = require("./menu");
exports.topicName = 'confirmPrompt';
// Called by the menu
function startTopic(context) {
    context.state.conversation.activeTopic = { name: exports.topicName };
    context.reply(`The ChoiceStyler can be used to generate confirmation prompts with yes & no buttons.`)
        .reply(botbuilder_choices_1.ChoiceStyler.suggestedAction(['yes', 'no'], `Confirm Prompt:\n\nAre you enjoying this demo?`));
}
exports.startTopic = startTopic;
// Called for future messages after the topic has been started
function continueTopic(context) {
    // The recognizer for boolean values hasn't been added to the Recognizers-Text library yet so 
    // for now we'll need to use regular expressions to recognize the users response.
    const utterance = context.request.text || '';
    if (/^(yes|yep|sure|y)$/i.test(utterance)) {
        context.reply(`Great! Glad you're enjoying it.`);
        menu.showMenu(context);
    }
    else if (/^(no|nope|n)$/i.test(utterance)) {
        context.reply(`Oh... That's too bad :(`);
        menu.showMenu(context);
    }
    else {
        context.reply(botbuilder_choices_1.ChoiceStyler.suggestedAction(['yes', 'no'], `Confirm Prompt:\n\nPlease answer yes or no.`));
    }
}
exports.continueTopic = continueTopic;
