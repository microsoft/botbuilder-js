import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when EndOfConversationActivity is received.
 */
export class OnEndOfConversationActivity extends OnActivity {

    public static declarativeType = 'Microsoft.OnEndOfConversationActivity';

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.EndOfConversation, actions, condition);
    }
}