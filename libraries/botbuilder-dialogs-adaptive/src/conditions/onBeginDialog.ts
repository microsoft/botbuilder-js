import { OnDialogEvent } from "./onDialogEvent";
import { AdaptiveEventNames } from "../sequenceContext";
import { Dialog } from "botbuilder-dialogs";

/**
 * Actions triggered when a dialog is started via BeginDialog().
 */
export class OnBeginDialog extends OnDialogEvent {
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.beginDialog, actions, condition);
    }
}