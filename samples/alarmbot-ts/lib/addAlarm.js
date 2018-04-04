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
        // Set topic and initialize empty alarm
        const conversation = state.conversation(context);
        conversation.topic = 'addAlarm';
        conversation.alarm = {};
        // Prompt for first field
        yield nextField(context, state);
    });
}
exports.begin = begin;
function routeReply(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Handle users reply to prompt
        const conversation = state.conversation(context);
        const utterance = context.activity.text.trim();
        switch (conversation.prompt) {
            case 'title':
                // Validate reply and save to alarm
                if (utterance.length > 2) {
                    conversation.alarm.title = utterance;
                }
                else {
                    yield context.sendActivity(`I'm sorry. Your alarm should have a title at least 3 characters long.`);
                }
                break;
            case 'time':
                // TODO: validate time user replied with
                conversation.alarm.time = utterance;
                break;
        }
        // Prompt for next field
        yield nextField(context, state);
    });
}
exports.routeReply = routeReply;
function nextField(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prompt user for next missing field
        const conversation = state.conversation(context);
        const alarm = conversation.alarm;
        if (alarm.title === undefined) {
            conversation.prompt = 'title';
            yield context.sendActivity(`What would you like to call your alarm?`);
        }
        else if (alarm.time === undefined) {
            conversation.prompt = 'time';
            yield context.sendActivity(`What time would you like to set the "${alarm.title}" alarm for?`);
        }
        else {
            // Alarm completed so set alarm.
            const user = state.user(context);
            user.alarms.push(alarm);
            // TODO: set alarm
            // Notify user and cleanup topic state
            conversation.topic = undefined;
            conversation.alarm = undefined;
            conversation.prompt = undefined;
            yield context.sendActivity(`Your alarm named "${alarm.title}" is set for "${alarm.time}".`);
        }
    });
}
//# sourceMappingURL=addAlarm.js.map