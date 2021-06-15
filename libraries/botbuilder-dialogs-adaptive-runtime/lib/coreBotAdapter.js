"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreBotAdapter = void 0;
const botframework_connector_1 = require("botframework-connector");
const botbuilder_1 = require("botbuilder");
class CoreBotAdapter extends botbuilder_1.BotFrameworkAdapter {
    constructor(settings, conversationState, userState) {
        super(settings);
        this.conversationState = conversationState;
        // attach storage?
        botbuilder_1.useBotState(this, userState, conversationState);
        this.onTurnError = (turnContext, err) => __awaiter(this, void 0, void 0, function* () {
            console.error('[onTurnError] unhandled error', err);
            yield this.sendErrorMessage(turnContext, err);
            yield this.sendEoCToParentIfSkill(turnContext, err);
            yield this.clearConversationState(turnContext);
        });
    }
    sendErrorMessage(turnContext, error) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let errorMessageText = 'The bot encountered an error or bug';
                let errorMessage = botbuilder_1.MessageFactory.text(errorMessageText, errorMessageText, botbuilder_1.InputHints.IgnoringInput);
                yield turnContext.sendActivity(errorMessage);
                errorMessageText = 'To continue to run this bot, please fix the bot source code.';
                errorMessage = botbuilder_1.MessageFactory.text(errorMessageText, errorMessageText, botbuilder_1.InputHints.ExpectingInput);
                yield turnContext.sendActivity(errorMessage);
                yield turnContext.sendTraceActivity('OnTurnError Trace', error, 'https://www.botframework.com/schemas/error', 'TurnError');
            }
            catch (err) {
                console.error('Exception caught in sendErrorMessage', err);
            }
        });
    }
    sendEoCToParentIfSkill(turnContext, error) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isSkillBot(turnContext)) {
                return;
            }
            try {
                const endOfConversation = botbuilder_1.ActivityEx.createEndOfConversationActivity();
                endOfConversation.code = 'SkillError';
                endOfConversation.text = error.message;
                yield turnContext.sendActivity(endOfConversation);
            }
            catch (err) {
                console.error('Exception caught in sendEoCToParentIfSkill', err);
            }
        });
    }
    clearConversationState(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.conversationState.delete(turnContext);
            }
            catch (err) {
                console.error('Exception caught in clearConversationState', err);
            }
        });
    }
    isSkillBot(turnContext) {
        var _a;
        const claimsIdentity = turnContext.turnState.get(turnContext.adapter.BotIdentityKey);
        return botframework_connector_1.SkillValidation.isSkillClaim((_a = claimsIdentity === null || claimsIdentity === void 0 ? void 0 : claimsIdentity.claims) !== null && _a !== void 0 ? _a : []);
    }
}
exports.CoreBotAdapter = CoreBotAdapter;
//# sourceMappingURL=coreBotAdapter.js.map