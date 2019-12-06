import { OnActivity } from "./onActivity";
import { ActivityTypes } from "botbuilder-core";
import { Dialog } from "botbuilder-dialogs";

/**
 * Actions triggered when ConversationUpdateActivity is received.
 */
export class OnConversationUpdateActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.ConversationUpdate, actions, condition);
    }
}