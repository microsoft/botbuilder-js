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
    constructor(dialogId, alarms) {
        super(dialogId);
        // Add control flow dialogs
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(START_DIALOG, [
            (dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Divert to appropriate dialog
                const list = yield alarms.get(dc.context, []);
                if (list.length > 1) {
                    return yield dc.begin(DELETE_MULTI_DIALOG);
                }
                else if (list.length === 1) {
                    return yield dc.begin(DELETE_SINGLE_DIALOG);
                }
                else {
                    yield dc.context.sendActivity(`No alarms set to delete.`);
                    return yield dc.end();
                }
            })
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(DELETE_MULTI_DIALOG, [
            (dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Compute list of choices based on alarm titles
                const list = yield alarms.get(dc.context);
                const choices = list.map((value) => value.title);
                // Prompt user to pick from list
                return yield dc.prompt(CHOOSE_ALARM_PROMPT, `Which alarm would you like to delete? Say "cancel" to quit.`, choices);
            }),
            (dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Delete alarm by position
                const choice = step.result;
                const list = yield alarms.get(dc.context);
                if (choice.index < list.length) {
                    list.splice(choice.index, 1);
                }
                // Notify user of delete
                yield dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
                return yield dc.end();
            })
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(DELETE_SINGLE_DIALOG, [
            (dc, step) => __awaiter(this, void 0, void 0, function* () {
                const alarm = alarms.get(dc.context)[0];
                return yield dc.prompt(CONFIRM_DELETE_PROMPT, `Are you sure you want to delete the "${alarm.title}" alarm?`);
            }),
            (dc, step) => __awaiter(this, void 0, void 0, function* () {
                if (step.result) {
                    yield alarms.delete(dc.context);
                    yield dc.context.sendActivity(`alarm deleted...`);
                }
                else {
                    yield dc.context.sendActivity(`ok...`);
                }
                return yield dc.end();
            })
        ]));
        // Add support prompts
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOOSE_ALARM_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_DELETE_PROMPT));
    }
}
exports.DeleteAlarmDialog = DeleteAlarmDialog;
//# sourceMappingURL=deleteAlarmDialog.js.map