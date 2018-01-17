"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Recognizers = require("recognizers-text-number");
const menu = require("./menu");
const numberModel = Recognizers.NumberRecognizer.instance.getNumberModel("en-us");
exports.topicName = 'numberPrompt';
// Called by the menu
function startTopic(context) {
    context.state.conversation.activeTopic = { name: exports.topicName };
    context.reply(`The 'recognizers-text-number' library can be used to perform rich natural language recognition of numbers.`)
        .reply(`Number Prompt:\n\nSend me a number between 1 and 100.`);
}
exports.startTopic = startTopic;
// Called for future messages after the topic has been started
function continueTopic(context) {
    const utterance = context.request.text || '';
    const results = numberModel.parse(utterance) || [];
    if (results.length > 0) {
        const value = results[0].resolution.value;
        if (value >= 1 && value <= 100) {
            context.reply(`You chose "${value}"`);
            menu.showMenu(context);
        }
        else {
            context.reply(`Number Prompt:\n\nThat was outside the range so try again. Pick a number between 1 and 100.`);
        }
    }
    else {
        context.reply(`Number Prompt:\n\nI didn't recognize that as a number. Try again. Pick a number between 1 and 100.`);
    }
}
exports.continueTopic = continueTopic;
