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
 * Actions triggered when an InvokeActivity is received.
 */
export class OnInvokeActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnInvokeActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Invoke, actions, condition);
    }
}