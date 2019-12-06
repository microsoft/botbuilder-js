import { OnDialogEvent } from "./onDialogEvent";
import { AdaptiveEventNames } from "../sequenceContext";
import { Dialog } from "botbuilder-dialogs";

/**
 * Actions triggered when an dialog was canceled.
 */
export class OnCancelDialog extends OnDialogEvent {
    constructor(actions: Dialog[] = [], condtion?: string) {
        super(AdaptiveEventNames.cancelDialog, actions, condtion);
    }
}