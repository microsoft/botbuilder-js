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
const DELETE_ALARM_DLG = 'deleteAlarm';
const DELETE_ALARM_MULTI_DLG = 'deleteAlarmMulti';
const DELETE_ALARM_SINGLE_DLG = 'deleteAlarmSingle';
const CHOICE_PROMPT_DLG = 'choicePrompt';
const CONFIRM_PROMPT_DLG = 'confirmPrompt';
class DeleteAlarmDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, userState) {
        super(dialogId);
        // Add control flow dialogs (first added is initial dialog)
        this.add(new botbuilder_dialogs_1.SequenceDialog(DELETE_ALARM_DLG, [
            new botbuilder_dialogs_1.CodeStep((dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Divert to appropriate dialog
                const user = userState.get(dc.context);
                if (user.alarms.length > 1) {
                    return yield dc.begin(DELETE_ALARM_MULTI_DLG);
                }
                else if (user.alarms.length === 1) {
                    return yield dc.begin(DELETE_ALARM_SINGLE_DLG);
                }
                else {
                    yield dc.context.sendActivity(`No alarms set to delete.`);
                    return yield dc.end();
                }
            }))
        ]));
        this.add(new botbuilder_dialogs_1.SequenceDialog(DELETE_ALARM_MULTI_DLG, [
            new botbuilder_dialogs_1.CodeStep('choice', (dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Compute list of choices based on alarm titles
                const user = userState.get(dc.context);
                const choices = user.alarms.map((value) => value.title);
                // Prompt user for choice (force use of "list" style)
                const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
                return yield dc.prompt(CHOICE_PROMPT_DLG, prompt, choices);
            })),
            new botbuilder_dialogs_1.CodeStep((dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Delete alarm by position
                const choice = step.values['choice'];
                const user = userState.get(dc.context);
                if (choice.index < user.alarms.length) {
                    user.alarms.splice(choice.index, 1);
                }
                // Notify user of delete
                yield dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
                return yield dc.end();
            }))
        ]));
        this.add(new botbuilder_dialogs_1.SequenceDialog(DELETE_ALARM_SINGLE_DLG, [
            new botbuilder_dialogs_1.CodeStep('confirm', (dc, step) => __awaiter(this, void 0, void 0, function* () {
                const user = userState.get(dc.context);
                const alarm = user.alarms[0];
                return yield dc.prompt(CONFIRM_PROMPT_DLG, `Are you sure you want to delete the "${alarm.title}" alarm?`);
            })),
            new botbuilder_dialogs_1.CodeStep((dc, step) => __awaiter(this, void 0, void 0, function* () {
                const confirm = step.values['confirm'];
                if (confirm) {
                    const user = userState.get(dc.context);
                    user.alarms = [];
                    yield dc.context.sendActivity(`alarm deleted...`);
                }
                else {
                    yield dc.context.sendActivity(`ok...`);
                }
                return yield dc.end();
            }))
        ]));
        // Add prompts
        this.add(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT_DLG));
        this.add(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT_DLG));
    }
}
exports.DeleteAlarmDialog = DeleteAlarmDialog;
//# sourceMappingURL=deleteAlarmDialog.js.map