import { OnActivity } from "./onActivity";
import { Dialog } from "botbuilder-dialogs";
import { ActivityTypes } from "botbuilder-core";

/**
 * Actions triggered when an EventActivity is received.
 */
export class OnEventActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Event, actions, condition);
    }
}