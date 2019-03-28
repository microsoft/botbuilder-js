import { Dialog } from "botbuilder-dialogs";
import { SlotDetails } from "./slotDetails";
export declare class SlotFillingDialog extends Dialog {
    slots: SlotDetails[];
    /**
     * SlotFillingDialog is a Dialog class for offering slot filling features to a bot.
     * Given multiple slots to fill, the dialog will walk a user through all of them
     * until all slots are filled with user responses.
     * @param {string} dialogId A unique identifier for this dialog.
     * @param {Array} slots An array of SlotDetails that define the required slots.
     */
    constructor(dialogId: string, slots: SlotDetails[]);
    beginDialog(dc: any, options: any): Promise<any>;
    continueDialog(dc: any): Promise<any>;
    resumeDialog(dc: any, reason: any, result: any): Promise<any>;
    runPrompt(dc: any): Promise<any>;
}
