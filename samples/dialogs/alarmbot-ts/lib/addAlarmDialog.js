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
        this.dialogs.add('addAlarm', [
            function (dc) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Initialize temp alarm and prompt for title
                    dc.activeDialog.state = {};
                    yield dc.prompt('titlePrompt', `What would you like to call your alarm?`);
                });
            },
            function (dc, title) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Save alarm title and prompt for time
                    const alarm = dc.activeDialog.state;
                    alarm.title = title;
                    yield dc.prompt('timePrompt', `What time would you like to set the "${alarm.title}" alarm for?`);
                });
            },
            function (dc, time) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Save alarm time
                    const alarm = dc.activeDialog.state;
                    alarm.time = time.toISOString();
                    // Alarm completed so set alarm.
                    const user = userState.get(dc.context);
                    user.alarms.push(alarm);
                    // Confirm to user
                    yield dc.context.sendActivity(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
                    yield dc.endDialog();
                });
            }
        ]);
        this.dialogs.add('titlePrompt', new botbuilder_dialogs_1.TextPrompt((context, value) => __awaiter(this, void 0, void 0, function* () {
            if (!value || value.length < 3) {
                yield context.sendActivity(`Title should be at least 3 characters long.`);
                return undefined;
            }
            else {
                return value.trim();
            }
        })));
        this.dialogs.add('timePrompt', new botbuilder_dialogs_1.DatetimePrompt((context, values) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!Array.isArray(values) || values.length < 0) {
                    throw new Error('missing time');
                }
                if (values[0].type !== 'datetime') {
                    throw new Error('unsupported type');
                }
                const value = new Date(values[0].value);
                if (value.getTime() < new Date().getTime()) {
                    throw new Error('in the past');
                }
                return value;
            }
            catch (err) {
                yield context.sendActivity(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
                return undefined;
            }
        })));
    }
}
exports.AddAlarmDialog = AddAlarmDialog;
//# sourceMappingURL=addAlarmDialog.js.map