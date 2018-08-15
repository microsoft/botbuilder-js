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
const addAlarmDialog_1 = require("./dialogs/addAlarmDialog");
const deleteAlarmDialog_1 = require("./dialogs/deleteAlarmDialog");
const showAlarmsDialog_1 = require("./dialogs/showAlarmsDialog");
const ALARMS_PROPERTY = 'alarms';
const DIALOG_STATE_PROPERTY = 'dialogState';
const ADD_ALARM_DIALOG = 'addAlarm';
const DELETE_ALARM_DIALOG = 'deleteAlarm';
const SHOW_ALARMS_DIALOG = 'showAlarms';
class Bot {
    constructor(convoState, userState) {
        // Define state properties
        this.alarms = userState.createProperty(ALARMS_PROPERTY);
        this.dialogState = convoState.createProperty(DIALOG_STATE_PROPERTY);
        // Create top level dialogs
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new addAlarmDialog_1.AddAlarmDialog(ADD_ALARM_DIALOG, this.alarms));
        this.dialogs.add(new deleteAlarmDialog_1.DeleteAlarmDialog(DELETE_ALARM_DIALOG, this.alarms));
        this.dialogs.add(new showAlarmsDialog_1.ShowAlarmsDialog(SHOW_ALARMS_DIALOG, this.alarms));
    }
    dispatchActivity(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create dialog context
            const dc = yield this.dialogs.createContext(context);
            // Check for interruptions
            const isMessage = context.activity.type === 'message';
            if (isMessage) {
                const utterance = (context.activity.text || '').trim().toLowerCase();
                // Check for add
                if (utterance.includes('add alarm')) {
                    yield dc.cancelAll();
                    yield dc.begin(ADD_ALARM_DIALOG);
                    // Check for delete
                }
                else if (utterance.includes('delete alarm')) {
                    yield dc.cancelAll();
                    yield dc.begin(DELETE_ALARM_DIALOG);
                    // Check for show
                }
                else if (utterance.includes('show alarms')) {
                    yield dc.cancelAll();
                    yield dc.begin(SHOW_ALARMS_DIALOG);
                    // Check for cancel
                }
                else if (utterance === 'cancel') {
                    if (dc.activeDialog) {
                        yield dc.cancelAll();
                        yield dc.context.sendActivity(`Ok... Cancelled.`);
                    }
                    else {
                        yield dc.context.sendActivity(`Nothing to cancel.`);
                    }
                }
            }
            // Route activity to current dialog if not interrupted
            if (!context.responded) {
                yield dc.continue();
            }
            // Perform fallback logic if no active dialog or interruption
            if (!context.responded && isMessage) {
                yield dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
            }
        });
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map