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
const moment = require("moment");
class AddAlarmDialog extends botbuilder_dialogs_1.DialogContainer {
    constructor(userState) {
        super('addAlarm');
        this.dialogs.add('addAlarm', new botbuilder_dialogs_1.Sequence([
            new botbuilder_dialogs_1.PromptStep('title', 'titlePrompt', `What would you like to call your alarm?`),
            new botbuilder_dialogs_1.PromptStep('time', 'timePrompt', `What time would you like to set the alarm for?`),
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
        this.dialogs.add('titlePrompt', new botbuilder_dialogs_1.TextPrompt((context, prompt) => __awaiter(this, void 0, void 0, function* () {
            const result = (prompt.result || '').trim();
            if (result.length < 3) {
                yield context.sendActivity(`Title should be at least 3 characters long.`);
            }
            else {
                prompt.end(result);
            }
        })));
        this.dialogs.add('timePrompt', new botbuilder_dialogs_1.DatetimePrompt((context, prompt) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = prompt.result || [];
                if (result.length < 0) {
                    throw new Error('missing time');
                }
                if (result[0].type !== 'datetime') {
                    throw new Error('unsupported type');
                }
                const value = new Date(result[0].value);
                if (value.getTime() < new Date().getTime()) {
                    throw new Error('in the past');
                }
                prompt.end(result);
            }
            catch (err) {
                yield context.sendActivity(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
            }
        })));
    }
}
exports.AddAlarmDialog = AddAlarmDialog;
//# sourceMappingURL=addAlarmDialog.js.map