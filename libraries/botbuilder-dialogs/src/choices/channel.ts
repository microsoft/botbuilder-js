/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Channels, TurnContext } from 'botbuilder-core';

/**
 * @private
 * @param channelId the id of a channel
 * @param buttonCnt count of buttons allowed
 */
export function supportsSuggestedActions(channelId: string, buttonCnt: number = 100): boolean {
    switch (channelId) {
        case Channels.Facebook:
        case Channels.Skype:
            return (buttonCnt <= 10);
        case Channels.Line:
            return (buttonCnt <= 13);
        case Channels.Kik:
            return (buttonCnt <= 20);
        case Channels.Telegram:
        case Channels.Emulator:
        case Channels.Directline:
        case Channels.Webchat:
        case Channels.DirectlineSpeech:
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
        case Channels.Facebook:
        case Channels.Skype:
        case Channels.Msteams:
            return (buttonCnt <= 3);
        case Channels.Line:
            return (buttonCnt <= 99);
        case Channels.Slack:
        case Channels.Emulator:
        case Channels.Directline:
        case Channels.DirectlineSpeech:
        case Channels.Webchat:
        case Channels.Cortana:
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
        case Channels.Cortana:
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
