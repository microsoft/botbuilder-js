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
 * Actions triggered when an MessageActivity is received.
 */
export class OnMessageActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnMessageActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Message, actions, condition);
    }
}