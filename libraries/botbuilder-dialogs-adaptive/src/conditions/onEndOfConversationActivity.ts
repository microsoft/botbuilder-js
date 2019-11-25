import { OnActivity } from "./onActivity";
import { Dialog } from "botbuilder-dialogs";
import { ActivityTypes } from "botbuilder-core";

/**
 * Actions triggered when EndOfConversationActivity is received.
 */
export class OnEndOfConversationActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.EndOfConversation, actions, condition);
    }
}