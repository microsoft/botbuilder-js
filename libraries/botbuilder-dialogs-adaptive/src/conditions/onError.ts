import { OnDialogEvent } from "./onDialogEvent";
import { Dialog } from "botbuilder-dialogs";
import { AdaptiveEventNames } from "../sequenceContext";

/**
 * Actions triggered when an error event has been emitted.
 */
export class OnError extends OnDialogEvent {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.error, actions, condition);
    }
}