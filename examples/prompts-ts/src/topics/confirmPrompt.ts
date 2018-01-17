import { ChoiceStyler } from 'botbuilder-choices';
import * as menu from './menu';

export const topicName = 'confirmPrompt';

// Called by the menu
export function startTopic(context: BotContext) {
    context.state.conversation.activeTopic = { name: topicName };
    context.reply(`The ChoiceStyler can be used to generate confirmation prompts with yes & no buttons.`)
           .reply(ChoiceStyler.suggestedAction(['yes', 'no'], `Confirm Prompt:\n\nAre you enjoying this demo?`));
}

// Called for future messages after the topic has been started
export function continueTopic(context: BotContext) {
    // The recognizer for boolean values hasn't been added to the Recognizers-Text library yet so 
    // for now we'll need to use regular expressions to recognize the users response.
    const utterance = context.request.text || '';
    if (/^(yes|yep|sure|y)$/i.test(utterance)) {
        context.reply(`Great! Glad you're enjoying it.`);
        menu.showMenu(context);
    } else if (/^(no|nope|n)$/i.test(utterance)) {
        context.reply(`Oh... That's too bad :(`);
        menu.showMenu(context);
    } else {
        context.reply(ChoiceStyler.suggestedAction(['yes', 'no'], `Confirm Prompt:\n\nPlease answer yes or no.`));
    }
}
