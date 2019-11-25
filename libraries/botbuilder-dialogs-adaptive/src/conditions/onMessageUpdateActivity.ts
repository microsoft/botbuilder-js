import { OnActivity } from "./onActivity";
import { Dialog } from "botbuilder-dialogs";
import { ActivityTypes } from "botbuilder-core";

/**
 * Actions triggered when a MessageUpdateActivity is received.
 */
export class OnMessageUpdateActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.MessageUpdate, actions, condition);
    }
}