"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
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
const assert = require("assert");
const botframework_connector_1 = require("botframework-connector");
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const botbuilder_1 = require("botbuilder");
const lib_1 = require("../lib");
describe('AdaptiveDialogBot Tests', function () {
    let storage;
    let conversationState;
    let userState;
    let skillConversationIdFactory;
    let languagePolicy;
    let resourceExplorer;
    let telemetryClient;
    let resourceProvider;
    this.beforeEach(function () {
        storage = new botbuilder_1.MemoryStorage();
        conversationState = new botbuilder_1.ConversationState(storage);
        userState = new botbuilder_1.UserState(storage);
        skillConversationIdFactory = new botbuilder_1.SkillConversationIdFactory(storage);
        languagePolicy = new lib_1.LanguagePolicy('en-US');
        resourceExplorer = new botbuilder_dialogs_declarative_1.ResourceExplorer();
        telemetryClient = new botbuilder_1.NullTelemetryClient();
        resourceExplorer.registerType('Microsoft.AdaptiveDialog', lib_1.AdaptiveDialog);
        resourceProvider = new MockResourceProvider(resourceExplorer);
    });
    it('adds the correct parameters to TurnState', function () {
        return __awaiter(this, void 0, void 0, function* () {
            resourceProvider.add('main.dialog', new MockResource(JSON.stringify({
                $kind: 'Microsoft.AdaptiveDialog',
            })));
            resourceExplorer.addResourceProvider(resourceProvider);
            const activity = {
                type: botbuilder_1.ActivityTypes.Message,
                channelId: 'test-channel',
                conversation: {
                    id: 'test-conversation-id',
                },
                from: {
                    id: 'test-id',
                },
            };
            const turnContext = new botbuilder_1.TurnContext(new botbuilder_1.TestAdapter(), activity);
            const bot = new lib_1.AdaptiveDialogBot('main.dialog', 'main.lg', resourceExplorer, conversationState, userState, skillConversationIdFactory, languagePolicy, new MockBotFrameworkAuthentication(), telemetryClient);
            yield bot.run(turnContext);
            assert.ok(turnContext.turnState.get(botframework_connector_1.BotFrameworkClientKey));
            assert.ok(turnContext.turnState.get(lib_1.skillConversationIdFactoryKey));
            assert.ok(turnContext.turnState.get('ConversationState'));
            assert.ok(turnContext.turnState.get('UserState'));
            assert.ok(turnContext.turnState.get(lib_1.resourceExplorerKey));
            assert.ok(turnContext.turnState.get(lib_1.languageGeneratorKey));
            assert.ok(turnContext.turnState.get(lib_1.languageGeneratorManagerKey));
            assert.ok(turnContext.turnState.get(lib_1.languagePolicyKey));
            assert.ok(turnContext.turnState.get('memoryScopes'));
            assert.ok(turnContext.turnState.get('pathResolvers'));
            assert.ok(turnContext.turnState.get(botbuilder_1.BotTelemetryClientKey));
            assert.ok(turnContext.turnState.get(botbuilder_1.BotCallbackHandlerKey));
        });
    });
    it('should throw an error when no resource', function () {
        return __awaiter(this, void 0, void 0, function* () {
            resourceExplorer.addResourceProvider(resourceProvider);
            const activity = {
                type: botbuilder_1.ActivityTypes.Message,
                channelId: 'test-channel',
                conversation: {
                    id: 'test-conversation-id',
                },
                from: {
                    id: 'test-id',
                },
            };
            const turnContext = new botbuilder_1.TurnContext(new botbuilder_1.TestAdapter(), activity);
            const telemetryClient = new botbuilder_1.NullTelemetryClient();
            const bot = new lib_1.AdaptiveDialogBot('main.dialog', 'main.lg', resourceExplorer, conversationState, userState, skillConversationIdFactory, languagePolicy, new MockBotFrameworkAuthentication(), telemetryClient);
            yield assert.rejects(bot.run(turnContext), new Error('The ResourceExplorer could not find a resource with id "main.dialog"'));
        });
    });
    it('setTestOptions', function () {
        return __awaiter(this, void 0, void 0, function* () {
            resourceProvider.add('main.dialog', new MockResource(JSON.stringify({
                $kind: 'Microsoft.AdaptiveDialog',
            })));
            resourceExplorer.addResourceProvider(resourceProvider);
            const activity = {
                type: botbuilder_1.ActivityTypes.Event,
                name: 'setTestOptions',
                channelId: 'test-channel',
                conversation: {
                    id: 'test-conversation-id',
                },
                from: {
                    id: 'test-id',
                },
                value: {
                    randomSeed: 123,
                    randomValue: 456,
                },
            };
            const turnContext = new botbuilder_1.TurnContext(new botbuilder_1.TestAdapter(), activity);
            const bot = new lib_1.AdaptiveDialogBot('main.dialog', 'main.lg', resourceExplorer, conversationState, userState, skillConversationIdFactory, languagePolicy, new MockBotFrameworkAuthentication(), telemetryClient);
            yield bot.run(turnContext);
            const testOptionsAccessor = conversationState.createProperty('testOptions');
            assert.strictEqual(123, (yield testOptionsAccessor.get(turnContext)).randomSeed);
            assert.strictEqual(456, (yield testOptionsAccessor.get(turnContext)).randomValue);
        });
    });
});
class MockBotFrameworkAuthentication {
    createBotFrameworkClient() {
        return {};
    }
}
class MockResourceProvider extends botbuilder_dialogs_declarative_1.ResourceProvider {
    constructor(resourceExplorer) {
        super(resourceExplorer);
        this.resources = {};
    }
    getResource(id) {
        return this.resources[id];
    }
    getResources(_extension) {
        return Object.values(this.resources);
    }
    refresh() {
        return;
    }
    add(id, resource) {
        this.resources[id] = resource;
    }
}
class MockResource extends botbuilder_dialogs_declarative_1.Resource {
    constructor(json) {
        super();
        this.json = json;
        this._id = 'main.dialog';
    }
    openStream() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not Implemented');
        });
    }
    readText() {
        return this.json;
    }
}
//# sourceMappingURL=adaptiveDialogBot.test.js.map