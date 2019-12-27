import { Dialog } from 'botbuilder-dialogs';
import { OnDialogEvent } from './onDialogEvent';
import { AdaptiveEventNames } from '../sequenceContext';

/**
 * Actions triggered when a dialog is started via BeginDialog().
 */
export class OnBeginDialog extends OnDialogEvent {

    public static declarativeType = 'Microsoft.OnBeginDialog';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.beginDialog, actions, condition);
    }
}