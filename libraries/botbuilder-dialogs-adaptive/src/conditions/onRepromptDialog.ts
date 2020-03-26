/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { OnDialogEvent } from './onDialogEvent';
import { AdaptiveEvents } from '../adaptiveEvents';

/**
 * Actions triggered when an RepromptDialog event is emitted.
 */
export class OnRepromptDialog extends OnDialogEvent {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.repromptDialog, actions, condition);
    }
}