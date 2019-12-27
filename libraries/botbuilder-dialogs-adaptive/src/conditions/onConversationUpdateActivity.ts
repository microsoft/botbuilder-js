import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when ConversationUpdateActivity is received.
 */
export class OnConversationUpdateActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnConversationUpdateActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.ConversationUpdate, actions, condition);
    }
}