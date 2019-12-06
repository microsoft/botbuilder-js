import { OnActivity } from "./onActivity";
import { Dialog } from "botbuilder-dialogs";
import { ActivityTypes } from "botbuilder-core";

/**
 * Actions triggered when a MessageDeleteActivity is received.
 */
export class OnMessageDeleteActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.MessageDelete, actions, condition);
    }
}