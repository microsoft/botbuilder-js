/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when a MessageReactionActivity is received.
 */
export class OnMessageReactionActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnMessageReactionActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.MessageReaction, actions, condition);
    }
}