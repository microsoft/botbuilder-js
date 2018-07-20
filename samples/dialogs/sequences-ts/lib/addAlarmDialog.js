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
const titlePrompt_1 = require("./prompts/titlePrompt");
const timePrompt_1 = require("./prompts/timePrompt");
const moment = require("moment");
const ADD_ALARM_DLG = 'addAlarm';
const TITLE_PROMPT_DLG = 'titlePrompt';
const TIME_PROMPT_DLG = 'timePrompt';
class AddAlarmDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, userState) {
        super(dialogId);
        // Add control flow dialogs (first added is initial dialog)
        this.add(new botbuilder_dialogs_1.SequenceDialog(ADD_ALARM_DLG, [
            new botbuilder_dialogs_1.PromptStep('title', TITLE_PROMPT_DLG, `What would you like to call your alarm?`),
            new botbuilder_dialogs_1.PromptStep('time', TIME_PROMPT_DLG, `What time would you like to set the alarm for?`),
            new botbuilder_dialogs_1.CodeStep((dc, step) => __awaiter(this, void 0, void 0, function* () {
                // Convert to Alarm
                const alarm = {
                    title: step.values['title'],
                    time: step.values['time'].toISOString()
                };
                // Set alarm.
                const user = userState.get(dc.context);
                user.alarms.push(alarm);
                // Confirm to user
                yield dc.context.sendActivity(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
                return yield dc.end();
            }))
        ]));
        // Add prompts
        this.add(new titlePrompt_1.TitlePrompt(TITLE_PROMPT_DLG));
        this.add(new timePrompt_1.TimePrompt(TIME_PROMPT_DLG));
    }
}
exports.AddAlarmDialog = AddAlarmDialog;
//# sourceMappingURL=addAlarmDialog.js.map