"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_choices_1 = require("botbuilder-choices");
const menu = require("./menu");
const styleChoices = [
    'automatic',
    'inline',
    'list',
    'suggestedAction'
];
const sampleChoices = [
    'option A',
    'option B',
    'option C'
];
exports.topicName = 'choicePrompt';
// Called by the menu
function startTopic(context) {
    context.state.conversation.activeTopic = { name: exports.topicName };
    context.reply(`Bot Builder includes a rich ChoiceStyler class that can be used to present choices to the user in a range of styles.`);
    // Prompt user for preferred style
    context.state.conversation.activeTopic.prompt = 'style';
    replyWithChoices(context, `Choice Prompt:\n\nWhich style would you like to see?`, styleChoices, 'automatic');
}
exports.startTopic = startTopic;
// Called for future messages after the topic has been started
function continueTopic(context) {
    switch (context.state.conversation.activeTopic.prompt) {
        case 'style':
            return stylePrompt(context);
        case 'choice':
            return choicePrompt(context);
    }
}
exports.continueTopic = continueTopic;
function stylePrompt(context) {
    const utterance = context.request.text || '';
    const results = botbuilder_choices_1.recognizeChoices(utterance, styleChoices) || [];
    if (results.length > 0) {
        // Save selected style to topic state
        const style = context.state.conversation.activeTopic.style = results[0].resolution.value;
        // Prompt for user to select a sample choice
        context.state.conversation.activeTopic.prompt = 'choice';
        replyWithChoices(context, `Choice Prompt:\n\nNow pick an option.`, sampleChoices, style);
    }
    else {
        replyWithChoices(context, `Choice Prompt:\n\nI didn't get that. Reply with either the name or number of the style?`, styleChoices, 'automatic');
    }
}
function choicePrompt(context) {
    const utterance = context.request.text || '';
    const results = botbuilder_choices_1.recognizeChoices(utterance, sampleChoices) || [];
    if (results.length > 0) {
        context.reply(`You chose "${results[0].resolution.value}"`);
        menu.showMenu(context);
    }
    else {
        const style = context.state.conversation.activeTopic.state;
        replyWithChoices(context, `Choice Prompt:\n\nI didn't get that. Reply with either the name or number of your choice?`, sampleChoices, style);
    }
}
function replyWithChoices(context, text, choices, style) {
    switch (style) {
        default:
        case 'automatic':
            context.reply(botbuilder_choices_1.ChoiceStyler.forChannel(context, choices, text));
            break;
        case 'inline':
            context.reply(botbuilder_choices_1.ChoiceStyler.inline(choices, text));
            break;
        case 'list':
            context.reply(botbuilder_choices_1.ChoiceStyler.list(choices, text));
            break;
        case 'suggestedActions':
            context.reply(botbuilder_choices_1.ChoiceStyler.suggestedAction(choices, text));
            break;
    }
}
