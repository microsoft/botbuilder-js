/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
export declare const channels: {
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
export declare function supportsSuggestedActions(channelId: string, buttonCnt?: number): boolean;
export declare function supportsCardActions(channelId: string, buttonCnt?: number): boolean;
export declare function hasMessageFeed(channelId: string): boolean;
export declare function maxActionTitleLength(channelId: string): number;
export declare function getChannelId(context: TurnContext): string;
