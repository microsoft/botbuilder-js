import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when a MessageDeleteActivity is received.
 */
export class OnMessageDeleteActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnMessageDeleteActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.MessageDelete, actions, condition);
    }
}