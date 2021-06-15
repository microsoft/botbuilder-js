"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = exports.getRuntimeServices = void 0;
const t = __importStar(require("runtypes"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const configuration_1 = require("./configuration");
Object.defineProperty(exports, "Configuration", { enumerable: true, get: function () { return configuration_1.Configuration; } });
const botbuilder_ai_luis_1 = __importDefault(require("botbuilder-ai-luis"));
const botbuilder_ai_qna_1 = __importDefault(require("botbuilder-ai-qna"));
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_applicationinsights_1 = require("botbuilder-applicationinsights");
const botbuilder_azure_blobs_1 = require("botbuilder-azure-blobs");
const configurationResourceExplorer_1 = require("./configurationResourceExplorer");
const coreBot_1 = require("./coreBot");
const coreBotAdapter_1 = require("./coreBotAdapter");
const botbuilder_azure_1 = require("botbuilder-azure");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_dialogs_adaptive_runtime_core_1 = require("botbuilder-dialogs-adaptive-runtime-core");
const botframework_connector_1 = require("botframework-connector");
const botbuilder_1 = require("botbuilder");
function addFeatures(services, configuration) {
    services.composeFactory('middlewares', ['storage', 'conversationState', 'userState'], ({ conversationState, storage, userState }, middlewareSet) => {
        var _a;
        if (configuration.bool(['showTyping'])) {
            middlewareSet.use(new botbuilder_1.ShowTypingMiddleware());
        }
        const setSpeak = configuration.type(['setSpeak'], t.Record({
            voiceFontName: t.String.Or(t.Undefined),
            fallbackToTextForSpeechIfEmpty: t.Boolean,
        }));
        if (setSpeak) {
            middlewareSet.use(new botbuilder_1.SetSpeakMiddleware((_a = setSpeak.voiceFontName) !== null && _a !== void 0 ? _a : null, setSpeak.fallbackToTextForSpeechIfEmpty));
        }
        if (configuration.bool(['traceTranscript'])) {
            const blobsTranscript = configuration.type(['blobTranscript'], t.Record({
                connectionString: t.String,
                containerName: t.String,
            }));
            middlewareSet.use(new botbuilder_1.TranscriptLoggerMiddleware(blobsTranscript
                ? new botbuilder_azure_blobs_1.BlobsTranscriptStore(blobsTranscript.connectionString, blobsTranscript.containerName)
                : new botbuilder_1.ConsoleTranscriptLogger()));
        }
        if (configuration.bool(['useInspection'])) {
            const inspectionState = new botbuilder_1.InspectionState(storage);
            middlewareSet.use(new botbuilder_1.InspectionMiddleware(inspectionState, userState, conversationState));
        }
        return middlewareSet;
    });
}
function addTelemetry(services, configuration) {
    services.addFactory('botTelemetryClient', () => {
        var _a;
        const telemetryOptions = configuration.type(['options'], t
            .Record({
            connectionString: t.String,
            instrumentationKey: t.String,
        })
            .asPartial());
        const setupString = (_a = telemetryOptions === null || telemetryOptions === void 0 ? void 0 : telemetryOptions.connectionString) !== null && _a !== void 0 ? _a : telemetryOptions === null || telemetryOptions === void 0 ? void 0 : telemetryOptions.instrumentationKey;
        return setupString ? new botbuilder_applicationinsights_1.ApplicationInsightsTelemetryClient(setupString) : new botbuilder_1.NullTelemetryClient();
    });
    services.addFactory('telemetryMiddleware', ['botTelemetryClient'], ({ botTelemetryClient }) => new botbuilder_applicationinsights_1.TelemetryInitializerMiddleware(new botbuilder_1.TelemetryLoggerMiddleware(botTelemetryClient, configuration.bool(['logPersonalInformation'])), configuration.bool(['logActivities'])));
}
function addStorage(services, configuration) {
    services.addFactory('conversationState', ['storage'], ({ storage }) => new botbuilder_1.ConversationState(storage));
    services.addFactory('userState', ['storage'], ({ storage }) => new botbuilder_1.UserState(storage));
    services.addFactory('storage', () => {
        const storage = configuration.string(['runtimeSettings', 'storage']);
        switch (storage) {
            case 'BlobsStorage': {
                const blobsStorage = configuration.type(['BlobsStorage'], t.Record({
                    connectionString: t.String,
                    containerName: t.String,
                }));
                if (!blobsStorage) {
                    throw new TypeError('`BlobsStorage` missing in configuration');
                }
                return new botbuilder_azure_blobs_1.BlobsStorage(blobsStorage.connectionString, blobsStorage.containerName);
            }
            case 'CosmosDbPartitionedStorage': {
                const cosmosOptions = configuration.type(['CosmosDbPartitionedStorage'], t.Record({
                    authKey: t.String.Or(t.Undefined),
                    compatibilityMode: t.Boolean.Or(t.Undefined),
                    containerId: t.String,
                    containerThroughput: t.Number.Or(t.Undefined),
                    cosmosDBEndpoint: t.String.Or(t.Undefined),
                    databaseId: t.String,
                    keySuffix: t.String.Or(t.Undefined),
                }));
                if (!cosmosOptions) {
                    throw new TypeError('`CosmosDbPartitionedStorage` missing in configuration');
                }
                const { cosmosDBEndpoint } = cosmosOptions, rest = __rest(cosmosOptions, ["cosmosDBEndpoint"]);
                return new botbuilder_azure_1.CosmosDbPartitionedStorage(Object.assign(Object.assign({}, rest), { cosmosDbEndpoint: cosmosDBEndpoint }));
            }
            default:
                return new botbuilder_1.MemoryStorage();
        }
    });
}
function addSkills(services, configuration) {
    services.addFactory('skillConversationIdFactory', ['storage'], ({ storage }) => new botbuilder_1.SkillConversationIdFactory(storage));
    services.addFactory('credentialProvider', () => {
        var _a, _b;
        return new botframework_connector_1.SimpleCredentialProvider((_a = configuration.string(['MicrosoftAppId'])) !== null && _a !== void 0 ? _a : '', (_b = configuration.string(['MicrosoftAppPassword'])) !== null && _b !== void 0 ? _b : '');
    });
    services.addFactory('skillClient', ['credentialProvider', 'skillConversationIdFactory'], ({ credentialProvider, skillConversationIdFactory }) => new botbuilder_1.SkillHttpClient(credentialProvider, skillConversationIdFactory));
    services.addFactory('authenticationConfiguration', () => {
        var _a;
        const allowedCallers = (_a = configuration.type(['runtimeSettings', 'skills', 'allowedCallers'], t.Array(t.String))) !== null && _a !== void 0 ? _a : [];
        return new botframework_connector_1.AuthenticationConfiguration(undefined, allowedCallers.length ? botframework_connector_1.allowedCallersClaimsValidator(allowedCallers) : undefined);
    });
    services.addFactory('channelServiceHandler', ['adapter', 'bot', 'skillConversationIdFactory', 'credentialProvider', 'authenticationConfiguration'], (dependencies) => new botbuilder_1.SkillHandler(dependencies.adapter, dependencies.bot, dependencies.skillConversationIdFactory, dependencies.credentialProvider, dependencies.authenticationConfiguration));
    services.addFactory('channelServiceRoutes', ['channelServiceHandler'], (dependencies) => new botbuilder_1.ChannelServiceRoutes(dependencies.channelServiceHandler));
}
function addCoreBot(services, configuration) {
    services.addFactory('bot', [
        'botTelemetryClient',
        'conversationState',
        'memoryScopes',
        'pathResolvers',
        'resourceExplorer',
        'skillClient',
        'skillConversationIdFactory',
        'userState',
    ], (dependencies) => {
        var _a, _b;
        return new coreBot_1.CoreBot(dependencies.resourceExplorer, dependencies.userState, dependencies.conversationState, dependencies.skillClient, dependencies.skillConversationIdFactory, dependencies.botTelemetryClient, (_a = configuration.string(['defaultLocale'])) !== null && _a !== void 0 ? _a : 'en-us', (_b = configuration.string(['defaultRootDialog'])) !== null && _b !== void 0 ? _b : 'main.dialog', dependencies.memoryScopes, dependencies.pathResolvers);
    });
    services.addFactory('adapter', ['authenticationConfiguration', 'conversationState', 'userState', 'middlewares', 'telemetryMiddleware'], (dependencies) => {
        const appId = configuration.string(['MicrosoftAppId']);
        const appPassword = configuration.string(['MicrosoftAppPassword']);
        const adapter = new coreBotAdapter_1.CoreBotAdapter({ appId, appPassword, authConfig: dependencies.authenticationConfiguration }, dependencies.conversationState, dependencies.userState);
        adapter.use(dependencies.middlewares);
        adapter.use(dependencies.telemetryMiddleware);
        return adapter;
    });
}
function addSettingsBotComponents(services, configuration) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const loadBotComponent = (name) => __awaiter(this, void 0, void 0, function* () {
            const Export = yield Promise.resolve().then(() => __importStar(require(name)));
            if (!Export) {
                throw new Error(`Unable to import ${name}`);
            }
            const DefaultExport = Export.default;
            if (!DefaultExport) {
                throw new Error(`${name} has no default export`);
            }
            const instance = new DefaultExport();
            botbuilder_1.assertBotComponent(instance, [`import(${name})`, 'default']);
            return instance;
        });
        const components = (_a = configuration.type(['runtimeSettings', 'components'], t.Array(t.Record({
            name: t.String,
            settingsPrefix: t.String.Or(t.Undefined),
        })))) !== null && _a !== void 0 ? _a : [];
        const errs = [];
        for (const { name, settingsPrefix } of components) {
            try {
                const botComponent = yield loadBotComponent(name);
                botComponent.configureServices(services, configuration.bind([settingsPrefix !== null && settingsPrefix !== void 0 ? settingsPrefix : name]));
            }
            catch (err) {
                errs.push(err);
            }
        }
        if (errs.length) {
            throw new Error(errs.map((err) => `[${err}]`).join(', '));
        }
    });
}
// Notes:
// - Liberal `||` needed as many settings are initialized as `""` and should still be overridden
// - Any generated files take precedence over `appsettings.json`.
function addComposerConfiguration(configuration) {
    const botRoot = configuration.string(['bot']) || '.';
    configuration.set(['BotRoot'], botRoot);
    const luisRegion = configuration.string(['LUIS_AUTHORING_REGION']) ||
        configuration.string(['luis', 'authoringRegion']) ||
        configuration.string(['luis', 'region']) ||
        'westus';
    const luisEndpoint = configuration.string(['luis', 'endpoint']) || `https://${luisRegion}.api.cognitive.microsoft.com`;
    configuration.set(['luis', 'endpoint'], luisEndpoint);
    const userName = process.env.USERNAME || process.env.USER;
    let environment = configuration.string(['luis', 'environment']) || userName;
    if (environment === 'Development') {
        environment = userName;
    }
    configuration.file(path_1.default.join(botRoot, 'generated', `luis.settings.${environment}.${luisRegion}.json`), true);
    const qnaRegion = configuration.string(['qna', 'qnaRegion']) || 'westus';
    configuration.file(path_1.default.join(botRoot, 'generated', `qnamaker.settings.${environment}.${qnaRegion}.json`), true);
    configuration.file(path_1.default.join(botRoot, 'generated', `orchestrator.settings.json`), true);
}
function normalizeConfiguration(configuration, applicationRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        // Override applicationRoot setting
        configuration.set(['applicationRoot'], applicationRoot);
        // Override root dialog setting
        configuration.set(['defaultRootDialog'], yield new Promise((resolve, reject) => 
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs_1.default.readdir(applicationRoot, (err, files) => err ? reject(err) : resolve(files.find((file) => file.endsWith('.dialog'))))));
        addComposerConfiguration(configuration);
    });
}
function registerAdaptiveComponents(services, configuration) {
    new botbuilder_dialogs_adaptive_1.AdaptiveBotComponent().configureServices(services, configuration);
    new botbuilder_dialogs_adaptive_1.LanguageGenerationBotComponent().configureServices(services, configuration);
}
function registerDialogsComponents(services, configuration) {
    new botbuilder_dialogs_1.DialogsBotComponent().configureServices(services, configuration);
}
function registerLuisComponents(services, configuration) {
    new botbuilder_ai_luis_1.default().configureServices(services, configuration);
}
function registerQnAComponents(services, configuration) {
    new botbuilder_ai_qna_1.default().configureServices(services, configuration);
}
/**
 * @internal
 */
function getRuntimeServices(applicationRoot, configurationOrSettingsDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        // Resolve configuration
        let configuration;
        if (typeof configurationOrSettingsDirectory === 'string') {
            configuration = new configuration_1.Configuration().argv().env();
            const files = ['appsettings.json'];
            const { NODE_ENV: nodeEnv } = process.env;
            if (nodeEnv) {
                files.unshift(`appsettings.${nodeEnv}.json`);
            }
            files.forEach((file) => configuration.file(path_1.default.join(configurationOrSettingsDirectory, file)));
            yield normalizeConfiguration(configuration, applicationRoot);
        }
        else {
            configuration = configurationOrSettingsDirectory;
            yield normalizeConfiguration(configuration, applicationRoot);
        }
        const services = new botbuilder_dialogs_adaptive_runtime_core_1.ServiceCollection({
            customAdapters: new Map(),
            declarativeTypes: [],
            memoryScopes: [],
            middlewares: new botbuilder_1.MiddlewareSet(),
            pathResolvers: [],
        });
        services.addFactory('resourceExplorer', ['declarativeTypes'], ({ declarativeTypes }) => new configurationResourceExplorer_1.ConfigurationResourceExporer(configuration, declarativeTypes));
        registerAdaptiveComponents(services, configuration);
        registerDialogsComponents(services, configuration);
        registerLuisComponents(services, configuration);
        registerQnAComponents(services, configuration);
        const runtimeSettings = configuration.bind(['runtimeSettings']);
        addCoreBot(services, configuration);
        addFeatures(services, runtimeSettings.bind(['features']));
        addSkills(services, configuration);
        addStorage(services, configuration);
        addTelemetry(services, runtimeSettings.bind(['telemetry']));
        yield addSettingsBotComponents(services, configuration);
        return [services, configuration];
    });
}
exports.getRuntimeServices = getRuntimeServices;
//# sourceMappingURL=index.js.map