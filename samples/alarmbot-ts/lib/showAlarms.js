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
function begin(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete any existing topic
        state.conversation(context).topic = undefined;
        // Render alarms to user.
        // - No reply is expected so we don't set a new topic.
        yield renderAlarms(context, state);
    });
}
exports.begin = begin;
function renderAlarms(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get user state w/alarm list
        const user = state.user(context);
        // Build message
        let msg = `No alarms found.`;
        if (user.alarms.length > 0) {
            msg = `**Current Alarms**\n\n`;
            let connector = '';
            user.alarms.forEach((alarm) => {
                msg += connector + `- ${alarm.title} (${alarm.time})`;
                connector = '\n';
            });
        }
        // Send message to user and return alarm count
        yield context.sendActivity(msg);
        return user.alarms.length;
    });
}
exports.renderAlarms = renderAlarms;
//# sourceMappingURL=showAlarms.js.map