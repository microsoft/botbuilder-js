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
// Create adapter
const adapter = new botbuilder_1.ConsoleAdapter();
// Add conversation state middleware
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
adapter.use(conversationState);
// Greet user
console.log(`Hi... I'm an echobot. Whatever you say I'll echo back.`);
// Listen for incoming requests 
adapter.listen((context) => __awaiter(this, void 0, void 0, function* () {
    if (context.activity.type === 'message') {
        const state = conversationState.get(context);
        const count = state.count === undefined ? state.count = 0 : ++state.count;
        yield context.sendActivity(`${count}: You said "${context.activity.text}"`);
    }
    else {
        yield context.sendActivity(`[${context.activity.type} event detected]`);
    }
}));
