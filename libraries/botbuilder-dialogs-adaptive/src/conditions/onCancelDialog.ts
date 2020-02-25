/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { AdaptiveEvents } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when an dialog was canceled.
 */
export class OnCancelDialog extends OnDialogEvent {
    
    public static declarativeType = 'Microsoft.OnCancelDialog';

    public constructor(actions: Dialog[] = [], condtion?: string) {
        super(AdaptiveEvents.cancelDialog, actions, condtion);
    }
}