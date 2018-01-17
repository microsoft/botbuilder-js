"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_choices_1 = require("botbuilder-choices");
const textPrompt = require("./textPrompt");
const numberPrompt = require("./numberPrompt");
const choicePrompt = require("./choicePrompt");
const confirmPrompt = require("./confirmPrompt");
const attachmentPrompt = require("./attachmentPrompt");
const menuOptions = [
    'Text Prompt',
    'Number Prompt',
    'Choice Prompt',
    'Confirm Prompt',
    'Attachment Prompt'
];
exports.topicName = 'menu';
// Called for every activity that's received
function onActivity(context) {
    const utterance = context.request.text || '';
    if (/^menu/i.test(utterance)) {
        showMenu(context);
        return true;
    }
    return false;
}
exports.onActivity = onActivity;
// Called only when the menu is active
function continueTopic(context) {
    const utterance = context.request.text || '';
    const results = botbuilder_choices_1.recognizeChoices(utterance, menuOptions) || [];
    if (results.length > 0) {
        const choice = results[0].resolution.value;
        switch (choice) {
            case 'Text Prompt':
                return textPrompt.startTopic(context);
            case 'Number Prompt':
                return numberPrompt.startTopic(context);
            case 'Choice Prompt':
                return choicePrompt.startTopic(context);
            case 'Confirm Prompt':
                return confirmPrompt.startTopic(context);
            case 'Attachment Prompt':
                return attachmentPrompt.startTopic(context);
        }
    }
    else {
        context.reply(`That wasn't a valid menu option. You can enter the number of the option you'd like or type in its name.`);
        showMenu(context);
    }
}
exports.continueTopic = continueTopic;
// Can be called by other topics to return to the menu. 
function showMenu(context) {
    context.state.conversation.activeTopic = { name: exports.topicName };
    const msg = botbuilder_choices_1.ChoiceStyler.forChannel(context, menuOptions, `Select a prompt to demo`);
    context.reply(msg);
}
exports.showMenu = showMenu;
