import { OnActivity } from "./onActivity";
import { Dialog } from "botbuilder-dialogs";
import { ActivityTypes } from "botbuilder-core";

export class OnHandoffActivity extends OnActivity {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.Handoff, actions, condition);
    }
}