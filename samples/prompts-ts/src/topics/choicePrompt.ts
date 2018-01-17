import { ChoiceStyler, recognizeChoices } from 'botbuilder-choices';
import * as menu from './menu';

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

export const topicName = 'choicePrompt';

// Called by the menu
export function startTopic(context: BotContext) {
    context.state.conversation.activeTopic = { name: topicName };
    context.reply(`Bot Builder includes a rich ChoiceStyler class that can be used to present choices to the user in a range of styles.`);
    
    // Prompt user for preferred style
    context.state.conversation.activeTopic.prompt = 'style';
    replyWithChoices(context, `Choice Prompt:\n\nWhich style would you like to see?`, styleChoices, 'automatic');
}

// Called for future messages after the topic has been started
export function continueTopic(context: BotContext) {
    switch (context.state.conversation.activeTopic.prompt) {
        case 'style':
            return stylePrompt(context);
        case 'choice':
            return choicePrompt(context);
    }
}

function stylePrompt(context: BotContext) {
    const utterance = context.request.text || '';
    const results = recognizeChoices(utterance, styleChoices) || [];
    if (results.length > 0) {
        // Save selected style to topic state
        const style = context.state.conversation.activeTopic.style = results[0].resolution.value;

        // Prompt for user to select a sample choice
        context.state.conversation.activeTopic.prompt = 'choice';
        replyWithChoices(context, `Choice Prompt:\n\nNow pick an option.`, sampleChoices, style);
    } else {
        replyWithChoices(context, `Choice Prompt:\n\nI didn't get that. Reply with either the name or number of the style?`, styleChoices, 'automatic');
    }
}

function choicePrompt(context: BotContext) {
    const utterance = context.request.text || '';
    const results = recognizeChoices(utterance, sampleChoices) || [];
    if (results.length > 0) {
        context.reply(`You chose "${results[0].resolution.value}"`);
        menu.showMenu(context);
    } else {
        const style = context.state.conversation.activeTopic.state;
        replyWithChoices(context, `Choice Prompt:\n\nI didn't get that. Reply with either the name or number of your choice?`, sampleChoices, style);
    }
}

function replyWithChoices(context: BotContext, text: string, choices: string[], style: string) {
    switch(style) {
        default:
        case 'automatic':
            context.reply(ChoiceStyler.forChannel(context, choices, text));
            break;
        case 'inline':
            context.reply(ChoiceStyler.inline(choices, text));
            break;
        case 'list':
            context.reply(ChoiceStyler.list(choices, text));
            break;
        case 'suggestedActions':
            context.reply(ChoiceStyler.suggestedAction(choices, text));
            break;
    }
}
