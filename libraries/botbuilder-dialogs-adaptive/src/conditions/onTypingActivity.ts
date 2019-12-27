import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when a TypingActivity is received.
 */
export class OnTypingActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnTypingActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Typing, actions, condition);
    }
}