import { OnActivity } from "./onActivity";
import { Dialog } from "botbuilder-dialogs";
import { ActivityTypes } from "botbuilder-core";

/**
 * Actions triggered when an MessageActivity is received.
 */
export class OnMessageActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Message, actions, condition);
    }
}