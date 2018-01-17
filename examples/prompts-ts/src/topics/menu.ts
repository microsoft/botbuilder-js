import { ChoiceStyler, recognizeChoices } from 'botbuilder-choices';
import * as textPrompt from './textPrompt';
import * as numberPrompt from './numberPrompt';
import * as choicePrompt from './choicePrompt';
import * as confirmPrompt from './confirmPrompt';
import * as attachmentPrompt from './attachmentPrompt';

const menuOptions = [
    'Text Prompt',
    'Number Prompt',
    'Choice Prompt',
    'Confirm Prompt',
    'Attachment Prompt'
];

export const topicName = 'menu';

// Called for every activity that's received
export function onActivity(context: BotContext): boolean {
    const utterance = context.request.text || '';
    if (/^menu/i.test(utterance)) {
        showMenu(context);
        return true;
    }
    return false;
}

// Called only when the menu is active
export function continueTopic(context: BotContext) {
    const utterance = context.request.text || '';
    const results = recognizeChoices(utterance, menuOptions) || [];
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
    } else {
        context.reply(`That wasn't a valid menu option. You can enter the number of the option you'd like or type in its name.`);
        showMenu(context);
    }
}

// Can be called by other topics to return to the menu. 
export function showMenu(context: BotContext) {
    context.state.conversation.activeTopic = { name: topicName };
    const msg = ChoiceStyler.forChannel(context, menuOptions, `Select a prompt to demo`);
    context.reply(msg);
}

