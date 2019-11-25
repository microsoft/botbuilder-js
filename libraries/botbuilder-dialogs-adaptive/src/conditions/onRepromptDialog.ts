import { OnDialogEvent } from "./onDialogEvent";
import { AdaptiveEventNames } from "../sequenceContext";
import { Dialog } from "botbuilder-dialogs";

/**
 * Actions triggered when an RepromptDialog event is emitted.
 */
export class OnRepromptDialog extends OnDialogEvent {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.repromptDialog, actions, condition);
    }
}