/**
 * @module botbuilder-prompts
 */
/** second comment block */

export var channels = {
    facebook: 'facebook',
    skype: 'skype',
    msteams: 'msteams',
    telegram: 'telegram',
    kik: 'kik',
    email: 'email',
    slack: 'slack',
    groupme: 'groupme',
    sms: 'sms',
    emulator: 'emulator',
    directline: 'directline',
    webchat: 'webchat',
    console: 'console',
    cortana: 'cortana'
};

export function supportsSuggestedActions(context: BotContext, buttonCnt = 100) {
    switch (getChannelId(context)) {
        case channels.facebook:
        case channels.skype:
            return (buttonCnt <= 10);
        case channels.kik:
            return (buttonCnt <= 20);
        case channels.slack:
        case channels.telegram:
        case channels.emulator:
            return (buttonCnt <= 100);
        default:
            return false;
    }
}

export function supportsCardActions(context: BotContext, buttonCnt = 100) {
    switch (getChannelId(context)) {
        case channels.facebook:
        case channels.skype:
        case channels.msteams:
            return (buttonCnt <= 3);
        case channels.slack:
        case channels.emulator:
        case channels.directline:
        case channels.webchat:
        case channels.cortana:
            return (buttonCnt <= 100);
        default:
            return false;
    }
}

export function hasMessageFeed(context: BotContext) {
    switch (getChannelId(context)) {
        case channels.cortana:
            return false;
        default:
            return true;
    }
}

export function maxActionTitleLength(context: BotContext) {
    return 20;
}

export function getChannelId(context: BotContext): string {
    return context.conversationReference.channelId || '';
}
