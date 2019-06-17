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
    console: 'console',
    cortana: 'cortana',
    directline: 'directline',
    email: 'email',
    emulator: 'emulator',
    facebook: 'facebook',
    groupme: 'groupme',
    kik: 'kik',
    line: 'line',
    msteams: 'msteams',
    skype: 'skype',
    skypeforbusiness: 'skypeforbusiness',
    slack: 'slack',
    sms: 'sms',
    telegram: 'telegram',
    webchat: 'webchat'
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
        case channels.line:
            return (buttonCnt <= 13);
        case channels.kik:
            return (buttonCnt <= 20);
        case channels.slack:
        case channels.telegram:
        case channels.emulator:
        case channels.directline:
        case channels.webchat:
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
        case channels.line:
            return (buttonCnt <= 99);
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
