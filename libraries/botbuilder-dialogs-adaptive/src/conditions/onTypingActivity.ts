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
 * Actions triggered when a TypingActivity is received.
 */
export class OnTypingActivity extends OnActivity {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Typing, actions, condition);
    }
}