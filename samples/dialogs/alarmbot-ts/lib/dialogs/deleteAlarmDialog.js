"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const START_DIALOG = 'start';
const DELETE_MULTI_DIALOG = 'deleteMulti';
const DELETE_SINGLE_DIALOG = 'deleteSingle';
const CHOOSE_ALARM_PROMPT = 'chooseAlarm';
const CONFIRM_DELETE_PROMPT = 'confirmDelete';
class DeleteAlarmDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, alarmsProperty) {
        super(dialogId);
        this.alarmsProperty = alarmsProperty;
        this.chooseAlarmStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            // Compute list of choices based on alarm titles
            const list = yield this.alarmsProperty.get(dc.context);
            const choices = list.map((value) => value.title);
            // Prompt user to pick from list
            return yield dc.prompt(CHOOSE_ALARM_PROMPT, { prompt: `Which alarm would you like to delete? Say "cancel" to quit.`, choices: choices });
        });
        this.deleteChosenAlarmStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            // Delete alarm by position
            const choice = step.result;
            const list = yield this.alarmsProperty.get(dc.context);
            if (choice.index < list.length) {
                list.splice(choice.index, 1);
            }
            // Notify user of delete
            yield dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
            return yield dc.endDialog();
        });
        this.confirmDeleteSingleStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            const alarms = yield this.alarmsProperty.get(dc.context);
            return yield dc.prompt(CONFIRM_DELETE_PROMPT, `Are you sure you want to delete the "${alarms[0].title}" alarm?`);
        });
        this.confirmedDeleteSingleAlarmStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                yield this.alarmsProperty.delete(dc.context);
                yield dc.context.sendActivity(`alarm deleted...`);
            }
            else {
                yield dc.context.sendActivity(`ok...`);
            }
            return yield dc.endDialog();
        });
        // waterfall dialog for dealing with multiple dialogs
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(DELETE_MULTI_DIALOG, [
            this.chooseAlarmStep,
            this.deleteChosenAlarmStep
        ]));
        // waterfall dialog for deleting a single dialog
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(DELETE_SINGLE_DIALOG, [
            this.confirmDeleteSingleStep,
            this.confirmedDeleteSingleAlarmStep
        ]));
        // Add support prompts
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOOSE_ALARM_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_DELETE_PROMPT));
    }
    // NOTE: since waterfall steps are passed in as a function to the waterfall dialog 
    // it will be called from the context of the waterfall dialog.  With javascript/typescript
    // you need to write this function as using the lambda syntax so that it captures the context of the this pointer
    // if you don't do this, the this pointer will be incorrect for waterfall steps.
    // decide which of two waterfall flows to use
    onBeginDialog(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Divert to appropriate dialog
            const list = yield this.alarmsProperty.get(dc.context, []);
            if (list.length > 1) {
                return yield dc.beginDialog(DELETE_MULTI_DIALOG);
            }
            else if (list.length === 1) {
                return yield dc.beginDialog(DELETE_SINGLE_DIALOG);
            }
            else {
                yield dc.context.sendActivity(`No alarms set to delete.`);
                return yield dc.endDialog();
            }
        });
    }
}
exports.DeleteAlarmDialog = DeleteAlarmDialog;
//# sourceMappingURL=deleteAlarmDialog.js.map