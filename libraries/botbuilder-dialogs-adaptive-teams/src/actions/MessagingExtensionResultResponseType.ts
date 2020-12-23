/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Enum representing Messaging Extension Result Response types.
 */
export enum MessagingExtensionResultResponseType {
    /**
     * Result response type.
     */
    result = 'result',
    /**
     * Auth response type.
     */
    auth = 'auth',
    /**
     * Config response type.
     */
    config = 'config',
    /**
     * Message response type.
     */
    message = 'message',
    /**
     * BotMessagePreview response type.
     */
    botMessagePreview = 'botMessagePreview',
}
