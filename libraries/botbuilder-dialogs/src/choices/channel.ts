/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';

/**
 * @private
 */
export const channels: any = {
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

/**
 * @private
 * @param channelId the id of a channel
 * @param buttonCnt count of buttons allowed
 */
export function supportsSuggestedActions(channelId: string, buttonCnt: number = 100): boolean {
    switch (channelId) {
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

/**
 * @private
 * @param channelId the id of a channel
 * @param buttonCnt count of buttons allowed
 */
export function supportsCardActions(channelId: string, buttonCnt: number = 100): boolean {
    switch (channelId) {
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

/**
 * @private
 * @param channelId id of a channel
 */
export function hasMessageFeed(channelId: string): boolean {
    switch (channelId) {
        case channels.cortana:
            return false;
        default:
            return true;
    }
}

/**
 * @private
 * @param channelId id of a channel
 */
export function maxActionTitleLength(channelId: string): number {
    return 20;
}

/**
 * @private
 * @param context a TurnContext object representing an incoming message
 */
export function getChannelId(context: TurnContext): string {
    return context.activity.channelId || '';
}
