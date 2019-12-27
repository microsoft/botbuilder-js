import { Dialog } from 'botbuilder-dialogs';
import { AdaptiveEventNames } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when an error event has been emitted.
 */
export class OnError extends OnDialogEvent {

    public static declarativeType = 'Microsoft.OnError';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.error, actions, condition);
    }
}