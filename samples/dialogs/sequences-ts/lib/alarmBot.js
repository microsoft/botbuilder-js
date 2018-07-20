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
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const addAlarmDialog_1 = require("./addAlarmDialog");
const deleteAlarmDialog_1 = require("./deleteAlarmDialog");
const showAlarmsDialog_1 = require("./showAlarmsDialog");
const ADD_ALARM_DLG = 'addAlarm';
const DELETE_ALARM_DLG = 'deleteAlarm';
const SHOW_ALARMS_DLG = 'slowAlarms';
class AlarmBot extends botbuilder_dialogs_1.DialogDispatcher {
    constructor(storage) {
        super();
        // Initialize state
        this.userState = new botbuilder_1.UserState(storage);
        this.convoState = new botbuilder_1.ConversationState(storage);
        // Add dialogs for top level tasks
        this.add(new addAlarmDialog_1.AddAlarmDialog(ADD_ALARM_DLG, this.userState));
        this.add(new deleteAlarmDialog_1.DeleteAlarmDialog(DELETE_ALARM_DLG, this.userState));
        this.add(new showAlarmsDialog_1.ShowAlarmsDialog(SHOW_ALARMS_DLG, this.userState));
    }
    dispatch(context) {
        // Ensure user properly initialized
        const user = this.userState.get(context);
        if (!user.alarms) {
            user.alarms = [];
        }
        // Dispatch activity
        const state = this.convoState.get(context);
        return super.dispatch(context, state);
    }
    onMessage(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            const utterance = (dc.context.activity.text || '').trim().toLowerCase();
            // Start addAlarm dialog
            if (utterance.includes('add alarm')) {
                yield dc.cancelAll();
                yield dc.begin(ADD_ALARM_DLG);
                // Start deleteAlarm dialog
            }
            else if (utterance.includes('delete alarm')) {
                yield dc.cancelAll();
                yield dc.begin(DELETE_ALARM_DLG);
                // Start showAlarms
            }
            else if (utterance.includes('show alarms')) {
                yield dc.cancelAll();
                yield dc.begin(SHOW_ALARMS_DLG);
                // Check for cancel
            }
            else if (utterance === 'cancel') {
                if (dc.activeDialog) {
                    yield dc.context.sendActivity(`Ok... Cancelled.`);
                    yield dc.cancelAll();
                }
                else {
                    yield dc.context.sendActivity(`Nothing to cancel.`);
                }
            }
        });
    }
    onNoResponse(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
        });
    }
}
exports.AlarmBot = AlarmBot;
//# sourceMappingURL=alarmBot.js.map