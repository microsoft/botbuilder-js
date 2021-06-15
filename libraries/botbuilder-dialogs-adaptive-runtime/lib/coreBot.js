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
exports.CoreBot = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
class CoreBot extends botbuilder_1.ActivityHandler {
    constructor(resourceExplorer, userState, conversationState, skillClient, skillConversationIdFactory, botTelemetryClient, defaultLocale, defaultRootDialog, memoryScopes, pathResolvers) {
        super();
        const rootResource = resourceExplorer.getResource(defaultRootDialog);
        const rootDialog = resourceExplorer.loadType(rootResource);
        const dialogManager = new botbuilder_dialogs_1.DialogManager(rootDialog).configure({
            conversationState,
            userState,
        });
        botbuilder_dialogs_adaptive_1.ResourceExtensions.useResourceExplorer(dialogManager, resourceExplorer);
        botbuilder_dialogs_adaptive_1.LanguageGeneratorExtensions.useLanguageGeneration(dialogManager);
        botbuilder_dialogs_adaptive_1.LanguageGeneratorExtensions.useLanguagePolicy(dialogManager, new botbuilder_dialogs_adaptive_1.LanguagePolicy(defaultLocale));
        botbuilder_dialogs_adaptive_1.SkillExtensions.useSkillClient(dialogManager, skillClient);
        botbuilder_dialogs_adaptive_1.SkillExtensions.useSkillConversationIdFactory(dialogManager, skillConversationIdFactory);
        botbuilder_dialogs_adaptive_1.useTelemetry(dialogManager, botTelemetryClient);
        /* TODO(jgummersall) reconcile:
         * _dialogManager.InitialTurnState.Set(botFrameworkClient);
         * _dialogManager.InitialTurnState.Set(conversationIdfactory);
         * _dialogManager.InitialTurnState.Set(_userState); (handled by useBotState?)
         * _dialogManager.InitialTurnState.Set(_conversationState); (handled by useBotState?)
         */
        if (memoryScopes.length) {
            dialogManager.initialTurnState.set('memoryScopes', memoryScopes);
        }
        if (pathResolvers.length) {
            dialogManager.initialTurnState.set('pathResolvers', pathResolvers);
        }
        this.onTurn((turnContext) => __awaiter(this, void 0, void 0, function* () {
            yield dialogManager.onTurn(turnContext);
            yield conversationState.saveChanges(turnContext, false);
            yield userState.saveChanges(turnContext, false);
        }));
    }
}
exports.CoreBot = CoreBot;
//# sourceMappingURL=coreBot.js.map