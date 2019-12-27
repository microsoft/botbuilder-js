import { Dialog } from 'botbuilder-dialogs';
import { AdaptiveEventNames } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when an dialog was canceled.
 */
export class OnCancelDialog extends OnDialogEvent {
    
    public static declarativeType = 'Microsoft.OnCancelDialog';

    public constructor(actions: Dialog[] = [], condtion?: string) {
        super(AdaptiveEventNames.cancelDialog, actions, condtion);
    }
}