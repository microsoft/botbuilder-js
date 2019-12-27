import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when a MessageUpdateActivity is received.
 */
export class OnMessageUpdateActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnMessageUpdateActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.MessageUpdate, actions, condition);
    }
}