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
const showAlarms_1 = require("./showAlarms");
function begin(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete any existing topic
        const conversation = state.conversation(context);
        conversation.topic = undefined;
        // Render list of topics to user
        const count = yield showAlarms_1.renderAlarms(context, state);
        if (count > 0) {
            // Set topic and prompt user for alarm to delete.
            conversation.topic = 'deleteAlarm';
            yield context.sendActivity(`Which alarm would you like to delete?`);
        }
    });
}
exports.begin = begin;
function routeReply(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate users reply and delete alarm
        let deleted = false;
        const title = context.activity.text.trim();
        const user = state.user(context);
        for (let i = 0; i < user.alarms.length; i++) {
            if (user.alarms[i].title.toLowerCase() === title.toLowerCase()) {
                user.alarms.splice(i, 1);
                deleted = true;
                break;
            }
        }
        // Notify user of deletion or re-prompt
        if (deleted) {
            state.conversation(context).topic = undefined;
            yield context.sendActivity(`Deleted the "${title}" alarm.`);
        }
        else {
            yield context.sendActivity(`An alarm named "${title}" doesn't exist. Which alarm would you like to delete? Say "cancel" to quit.`);
        }
    });
}
exports.routeReply = routeReply;
//# sourceMappingURL=deleteAlarm.js.map