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
 * Actions triggered when an EventActivity is received.
 */
export class OnEventActivity extends OnActivity {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Event, actions, condition);
    }
}
