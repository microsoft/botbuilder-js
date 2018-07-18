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
const addAlarmDialog_1 = require("./addAlarmDialog");
const deleteAlarmDialog_1 = require("./deleteAlarmDialog");
const showAlarmsDialog_1 = require("./showAlarmsDialog");
class AlarmBot extends botbuilder_dialogs_1.RootDialogContainer {
    constructor(userState) {
        super();
        // Add dialogs
        this.dialogs.add('addAlarm', new addAlarmDialog_1.AddAlarmDialog(userState));
        this.dialogs.add('deleteAlarm', new deleteAlarmDialog_1.DeleteAlarmDialog(userState));
        this.dialogs.add('showAlarms', new showAlarmsDialog_1.ShowAlarmsDialog(userState));
    }
    onInterruption(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            const utterance = (dc.context.activity.text || '').trim().toLowerCase();
            // Start addAlarm dialog
            if (utterance.includes('add alarm')) {
                yield dc.cancel();
                yield dc.begin('addAlarm');
                // Start deleteAlarm dialog
            }
            else if (utterance.includes('delete alarm')) {
                yield dc.cancel();
                yield dc.begin('deleteAlarm');
                // Start showAlarms
            }
            else if (utterance.includes('show alarms')) {
                yield dc.cancel();
                yield dc.begin('showAlarms');
                // Check for cancel
            }
            else if (utterance === 'cancel') {
                if (dc.activeDialog) {
                    yield dc.context.sendActivity(`Ok... Cancelled.`);
                    yield dc.cancel();
                }
                else {
                    yield dc.context.sendActivity(`Nothing to cancel.`);
                }
            }
        });
    }
    onFallback(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
        });
    }
}
exports.AlarmBot = AlarmBot;
//# sourceMappingURL=alarmBot.js.map