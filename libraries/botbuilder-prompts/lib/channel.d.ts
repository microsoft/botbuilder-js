/**
 * @module botbuilder-prompts
 */
/** second comment block */
export declare var channels: {
    facebook: string;
    skype: string;
    msteams: string;
    telegram: string;
    kik: string;
    email: string;
    slack: string;
    groupme: string;
    sms: string;
    emulator: string;
    directline: string;
    webchat: string;
    console: string;
    cortana: string;
};
export declare function supportsSuggestedActions(context: BotContext, buttonCnt?: number): boolean;
export declare function supportsCardActions(context: BotContext, buttonCnt?: number): boolean;
export declare function hasMessageFeed(context: BotContext): boolean;
export declare function maxActionTitleLength(context: BotContext): number;
export declare function getChannelId(context: BotContext): string;
