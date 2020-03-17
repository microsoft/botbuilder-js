/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { AdaptiveEventNames } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when an RepromptDialog event is emitted.
 */
export class OnRepromptDialog extends OnDialogEvent {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.repromptDialog, actions, condition);
    }
}