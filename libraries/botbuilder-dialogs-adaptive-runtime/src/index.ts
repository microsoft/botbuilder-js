// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import fs from 'fs';
import path from 'path';
import { Configuration } from './configuration';

import LuisBotComponent from 'botbuilder-ai-luis';
import QnAMakerBotComponent from 'botbuilder-ai-qna';
import { AdaptiveBotComponent, LanguageGenerationBotComponent } from 'botbuilder-dialogs-adaptive';
import { ApplicationInsightsTelemetryClient, TelemetryInitializerMiddleware } from 'botbuilder-applicationinsights';
import { BlobsStorage, BlobsTranscriptStore } from 'botbuilder-azure-blobs';
import { ComponentDeclarativeTypes, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ConfigurationResourceExporer } from './configurationResourceExplorer';
import { CoreBot } from './coreBot';
import { CoreBotAdapter } from './coreBotAdapter';
import { CosmosDbPartitionedStorage } from 'botbuilder-azure';
import { DialogsBotComponent, MemoryScope, PathResolver } from 'botbuilder-dialogs';
import { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

import {
    AuthenticationConfiguration,
    AuthenticationConstants,
    allowedCallersClaimsValidator,
    BotFrameworkAuthentication,
    ServiceClientCredentialsFactory,
    ConnectorClientOptions,
} from 'botframework-connector';

import {
    ActivityHandlerBase,
    BotAdapter,
    BotComponent,
    BotFrameworkHttpAdapter,
    BotTelemetryClient,
    ChannelServiceHandler,
    ChannelServiceHandlerBase,
    ChannelServiceRoutes,
    CloudSkillHandler,
    ConsoleTranscriptLogger,
    ConversationState,
    InspectionMiddleware,
    InspectionState,
    MemoryStorage,
    Middleware,
    MiddlewareSet,
    NullTelemetryClient,
    SetSpeakMiddleware,
    ShowTypingMiddleware,
    SkillConversationIdFactory,
    SkillConversationIdFactoryBase,
    Storage,
    TelemetryLoggerMiddleware,
    TranscriptLoggerMiddleware,
    UserState,
    createBotFrameworkAuthenticationFromConfiguration,
} from 'botbuilder';

function addFeatures(services: ServiceCollection, configuration: Configuration): void {
    services.composeFactory<
        MiddlewareSet,
        {
            conversationState: ConversationState;
            storage: Storage;
            userState: UserState;
        }
    >(
        'middlewares',
        ['storage', 'conversationState', 'userState'],
        ({ conversationState, storage, userState }, middlewareSet) => {
            if (configuration.bool(['showTyping'])) {
                middlewareSet.use(new ShowTypingMiddleware());
            }

            const setSpeak = configuration.type(
                ['setSpeak'],
                z
                    .object({
                        voiceFontName: z.string().optional(),
                        fallbackToTextForSpeechIfEmpty: z.boolean(),
                    })
                    .nonstrict()
            );

            if (setSpeak) {
                middlewareSet.use(
                    new SetSpeakMiddleware(setSpeak.voiceFontName ?? null, setSpeak.fallbackToTextForSpeechIfEmpty)
                );
            }

            if (configuration.bool(['traceTranscript'])) {
                const blobsTranscript = configuration.type(
                    ['blobTranscript'],
                    z
                        .object({
                            connectionString: z.string(),
                            containerName: z.string(),
                            decodeTranscriptKey: z.boolean().optional(),
                        })
                        .nonstrict()
                );

                middlewareSet.use(
                    new TranscriptLoggerMiddleware(
                        blobsTranscript
                            ? new BlobsTranscriptStore(blobsTranscript.connectionString, blobsTranscript.containerName)
                            : new ConsoleTranscriptLogger()
                    )
                );
            }

            if (configuration.bool(['useInspection'])) {
                const inspectionState = new InspectionState(storage);
                middlewareSet.use(new InspectionMiddleware(inspectionState, userState, conversationState));
            }

            return middlewareSet;
        }
    );
}

function addTelemetry(services: ServiceCollection, configuration: Configuration): void {
    services.addFactory<BotTelemetryClient>('botTelemetryClient', () => {
        const telemetryOptions = configuration.type(
            ['options'],
            z
                .object({
                    connectionString: z.string(),
                    instrumentationKey: z.string(),
                })
                .partial()
                .nonstrict()
        );

        const setupString = telemetryOptions?.connectionString ?? telemetryOptions?.instrumentationKey;
        return setupString ? new ApplicationInsightsTelemetryClient(setupString) : new NullTelemetryClient();
    });

    services.addFactory<
        Middleware,
        {
            botTelemetryClient: BotTelemetryClient;
        }
    >(
        'telemetryMiddleware',
        ['botTelemetryClient'],
        ({ botTelemetryClient }) =>
            new TelemetryInitializerMiddleware(
                new TelemetryLoggerMiddleware(botTelemetryClient, configuration.bool(['logPersonalInformation'])),
                configuration.bool(['logActivities'])
            )
    );
}

function addStorage(services: ServiceCollection, configuration: Configuration): void {
    services.addFactory<ConversationState, { storage: Storage }>(
        'conversationState',
        ['storage'],
        ({ storage }) => new ConversationState(storage)
    );

    services.addFactory<UserState, { storage: Storage }>(
        'userState',
        ['storage'],
        ({ storage }) => new UserState(storage)
    );

    services.addFactory<Storage>('storage', () => {
        const storage = configuration.string(['runtimeSettings', 'storage']);

        switch (storage) {
            case 'BlobsStorage': {
                const blobsStorage = configuration.type(
                    ['BlobsStorage'],
                    z
                        .object({
                            connectionString: z.string(),
                            containerName: z.string(),
                        })
                        .nonstrict()
                );

                if (!blobsStorage) {
                    throw new TypeError('`BlobsStorage` missing in configuration');
                }

                return new BlobsStorage(blobsStorage.connectionString, blobsStorage.containerName);
            }

            case 'CosmosDbPartitionedStorage': {
                const cosmosOptions = configuration.type(
                    ['CosmosDbPartitionedStorage'],
                    z
                        .object({
                            authKey: z.string().optional(),
                            compatibilityMode: z.boolean().optional(),
                            containerId: z.string(),
                            containerThroughput: z.number().optional(),
                            cosmosDBEndpoint: z.string().optional(),
                            databaseId: z.string(),
                            keySuffix: z.string().optional(),
                        })
                        .nonstrict()
                );

                if (!cosmosOptions) {
                    throw new TypeError('`CosmosDbPartitionedStorage` missing in configuration');
                }

                const { cosmosDBEndpoint, ...rest } = cosmosOptions;
                return new CosmosDbPartitionedStorage({
                    ...rest,
                    cosmosDbEndpoint: cosmosDBEndpoint,
                });
            }

            default:
                return new MemoryStorage();
        }
    });
}

function addSkills(services: ServiceCollection, configuration: Configuration): void {
    services.addFactory<SkillConversationIdFactoryBase, { storage: Storage }>(
        'skillConversationIdFactory',
        ['storage'],
        ({ storage }) => new SkillConversationIdFactory(storage)
    );

    // If TenantId is specified in config, add the tenant as a valid JWT token issuer for Bot to Skill conversation.
    // The token issuer for MSI and single tenant scenarios will be the tenant where the bot is registered.
    const validTokenIssuers: string[] = [];
    const tenantId = configuration.type(['runtimeSettings', 'MicrosoftAppTenantIdKey'], z.string()) ?? '';

    if (tenantId) {
        // For SingleTenant/MSI auth, the JWT tokens will be issued from the bot's home tenant.
        // So, these issuers need to be added to the list of valid token issuers for authenticating activity requests.
        validTokenIssuers.push(`${AuthenticationConstants.ValidTokenIssuerUrlTemplateV1}${tenantId}/`);
        validTokenIssuers.push(`${AuthenticationConstants.ValidTokenIssuerUrlTemplateV2}${tenantId}/v2.0`);
        validTokenIssuers.push(`${AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV1}${tenantId}/`);
        validTokenIssuers.push(`${AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV2}${tenantId}/v2.0`);
    }

    services.addFactory<AuthenticationConfiguration>('authenticationConfiguration', () => {
        const allowedCallers =
            configuration.type(['runtimeSettings', 'skills', 'allowedCallers'], z.array(z.string())) ?? [];

        const skills = Object.values(
            configuration.type(
                ['skills'],
                z.record(
                    z
                        .object({
                            msAppId: z.string(),
                        })
                        .nonstrict()
                )
            ) ?? {}
        );

        if (skills.length) {
            // If the config entry for "skills" is present then we are a consumer and the entries under
            // runtimeSettings.sills are ignored
            return new AuthenticationConfiguration(
                undefined,
                allowedCallersClaimsValidator(skills.map((skill) => skill.msAppId)),
                validTokenIssuers
            );
        } else {
            // If the config entry for runtimeSettings.skills.allowedCallers contains entries, then we are a skill and
            // we validate caller against this list
            return new AuthenticationConfiguration(
                undefined,
                allowedCallers.length ? allowedCallersClaimsValidator(allowedCallers) : undefined,
                validTokenIssuers
            );
        }
    });

    services.addFactory<
        ChannelServiceHandlerBase,
        {
            adapter: BotAdapter;
            bot: ActivityHandlerBase;
            botFrameworkAuthentication: BotFrameworkAuthentication;
            skillConversationIdFactory: SkillConversationIdFactoryBase;
        }
    >(
        'channelServiceHandler',
        ['adapter', 'bot', 'botFrameworkAuthentication', 'skillConversationIdFactory'],
        (dependencies) =>
            new CloudSkillHandler(
                dependencies.adapter,
                (context) => dependencies.bot.run(context),
                dependencies.skillConversationIdFactory,
                dependencies.botFrameworkAuthentication
            )
    );

    services.addFactory<ChannelServiceRoutes, { channelServiceHandler: ChannelServiceHandler }>(
        'channelServiceRoutes',
        ['channelServiceHandler'],
        (dependencies) => new ChannelServiceRoutes(dependencies.channelServiceHandler)
    );
}

function addCoreBot(services: ServiceCollection, configuration: Configuration): void {
    services.addFactory<
        BotFrameworkAuthentication,
        {
            authenticationConfiguration: AuthenticationConfiguration;
            botFrameworkClientFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
            connectorClientOptions?: ConnectorClientOptions;
            serviceClientCredentialsFactory?: ServiceClientCredentialsFactory;
        }
    >(
        'botFrameworkAuthentication',
        [
            'authenticationConfiguration',
            'botFrameworkClientFetch',
            'connectorClientOptions',
            'serviceClientCredentialsFactory',
        ],
        (dependencies) =>
            createBotFrameworkAuthenticationFromConfiguration(
                configuration,
                dependencies.serviceClientCredentialsFactory,
                dependencies.authenticationConfiguration,
                dependencies.botFrameworkClientFetch,
                dependencies.connectorClientOptions
            )
    );

    services.addFactory<
        ActivityHandlerBase,
        {
            botTelemetryClient: BotTelemetryClient;
            conversationState: ConversationState;
            memoryScopes: MemoryScope[];
            pathResolvers: PathResolver[];
            resourceExplorer: ResourceExplorer;
            botFrameworkAuthentication: BotFrameworkAuthentication;
            skillConversationIdFactory: SkillConversationIdFactoryBase;
            userState: UserState;
        }
    >(
        'bot',
        [
            'botTelemetryClient',
            'conversationState',
            'memoryScopes',
            'pathResolvers',
            'resourceExplorer',
            'botFrameworkAuthentication',
            'skillConversationIdFactory',
            'userState',
        ],
        (dependencies) =>
            new CoreBot(
                dependencies.resourceExplorer,
                dependencies.userState,
                dependencies.conversationState,
                dependencies.botFrameworkAuthentication,
                dependencies.skillConversationIdFactory,
                dependencies.botTelemetryClient,
                configuration.string(['defaultLocale']) ?? 'en-us',
                configuration.string(['defaultRootDialog']) ?? 'main.dialog',
                dependencies.memoryScopes,
                dependencies.pathResolvers
            )
    );

    services.addFactory<
        BotFrameworkHttpAdapter,
        {
            botFrameworkAuthentication: BotFrameworkAuthentication;
            conversationState: ConversationState;
            middlewares: MiddlewareSet;
            telemetryMiddleware: Middleware;
            userState: UserState;
        }
    >(
        'adapter',
        ['botFrameworkAuthentication', 'conversationState', 'userState', 'middlewares', 'telemetryMiddleware'],
        (dependencies) =>
            new CoreBotAdapter(
                dependencies.botFrameworkAuthentication,
                dependencies.conversationState,
                dependencies.userState
            )
                .use(dependencies.middlewares)
                .use(dependencies.telemetryMiddleware)
    );
}

async function addSettingsBotComponents(services: ServiceCollection, configuration: Configuration): Promise<void> {
    const loadBotComponent = async (name: string): Promise<BotComponent> => {
        const Export = await import(name);
        if (!Export) {
            throw new Error(`Unable to import ${name}`);
        }

        const DefaultExport = Export.default;
        if (!DefaultExport) {
            throw new Error(`${name} has no default export`);
        }

        const instance = new DefaultExport();

        try {
            return BotComponent.z.parse(instance);
        } catch (err) {
            throw new Error(`${name} does not extend BotComponent: ${err}`);
        }
    };

    const components =
        configuration.type(
            ['runtimeSettings', 'components'],
            z.array(
                z
                    .object({
                        name: z.string(),
                        settingsPrefix: z.string().optional(),
                    })
                    .nonstrict()
            )
        ) ?? [];

    const loadErrors: Array<{ error: Error; name: string }> = [];

    for (const { name, settingsPrefix } of components) {
        try {
            const botComponent = await loadBotComponent(name);

            botComponent.configureServices(services, configuration.bind([settingsPrefix ?? name]));
        } catch (error) {
            loadErrors.push({ error, name });
        }
    }

    if (loadErrors.length) {
        loadErrors.forEach(({ name, error }) =>
            console.warn(
                `${name} failed to load. Consider removing this component from the list of components in your application settings.`,
                error
            )
        );
    }
}

// Notes:
// - Liberal `||` needed as many settings are initialized as `""` and should still be overridden
// - Any generated files take precedence over `appsettings.json`.
function addComposerConfiguration(configuration: Configuration): void {
    const botRoot = configuration.string(['bot']) || '.';
    configuration.set(['BotRoot'], botRoot);

    const luisRegion =
        configuration.string(['LUIS_AUTHORING_REGION']) ||
        configuration.string(['luis', 'authoringRegion']) ||
        configuration.string(['luis', 'region']) ||
        'westus';

    const luisEndpoint =
        configuration.string(['luis', 'endpoint']) || `https://${luisRegion}.api.cognitive.microsoft.com`;
    configuration.set(['luis', 'endpoint'], luisEndpoint);

    const userName = process.env.USERNAME || process.env.USER;

    let environment = configuration.string(['luis', 'environment']) || userName;
    if (environment === 'Development') {
        environment = userName;
    }

    configuration.file(path.join(botRoot, 'generated', `luis.settings.${environment}.${luisRegion}.json`), true);

    const qnaRegion = configuration.string(['qna', 'qnaRegion']) || 'westus';
    configuration.file(path.join(botRoot, 'generated', `qnamaker.settings.${environment}.${qnaRegion}.json`), true);

    configuration.file(path.join(botRoot, 'generated', 'orchestrator.settings.json'), true);
}

async function normalizeConfiguration(configuration: Configuration, applicationRoot: string): Promise<void> {
    // Override applicationRoot setting
    configuration.set(['applicationRoot'], applicationRoot);

    // Override root dialog setting
    configuration.set(
        ['defaultRootDialog'],
        await new Promise<string | undefined>((resolve, reject) =>
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.readdir(applicationRoot, (err, files) =>
                err ? reject(err) : resolve(files.find((file) => file.endsWith('.dialog')))
            )
        )
    );

    addComposerConfiguration(configuration);
}

function registerAdaptiveComponents(services: ServiceCollection, configuration: Configuration): void {
    new AdaptiveBotComponent().configureServices(services, configuration);
    new LanguageGenerationBotComponent().configureServices(services, configuration);
}

function registerDialogsComponents(services: ServiceCollection, configuration: Configuration): void {
    new DialogsBotComponent().configureServices(services, configuration);
}

function registerLuisComponents(services: ServiceCollection, configuration: Configuration): void {
    new LuisBotComponent().configureServices(services, configuration);
}

function registerQnAComponents(services: ServiceCollection, configuration: Configuration): void {
    new QnAMakerBotComponent().configureServices(services, configuration);
}

/**
 * Construct all runtime services.
 *
 * @param applicationRoot absolute path to root of application
 * @param settingsDirectory directory where settings files are located
 * @returns service collection and configuration
 *
 * @remarks
 * While the full set of dependencies is designed to be sufficient to run Adaptive Dialogs,
 * the `"bot"` dependency can actually be any [ActivityHandler](xref:botbuilder-core.ActivityHandler)
 * implementation and is not constrained to one that uses Adaptive Dialogs. Any Bot Framework project
 * can therefore be simplified by just using this function along with a custom
 * [ActivityHandler](xref:botbuilder-core.ActivityHandler) implementation.
 *
 * Aspects of the behavior of a number of these dependencies, including those that can be overriden,
 * can be controlled through configuration.
 *
 * The default [ResourceExplorer](xref:botbuilder-dialogs-declarative.ResourceExplorer) uses the file
 * system. The `applicationRoot` folder is used as the root directory.
 *
 * If not overridden, the exact type of [Storage](xref:botbuilder-core.Storage) added depends on configuration.
 * With no configuration, the default is memory storage. It should be noted that
 * [MemoryStorage](xref:botbuilder-core.MemoryStorage) is designed primarily for testing with a single host
 * running the bot and no durable storage.
 *
 * The default Skills implementation can be constrained in terms of allowed callers through configuration.
 * Refer to the product documentation for further details.
 *
 * The default [BotTelemetryClient](xref:botbuilder-core.BotTelemetryClient) implementation uses AppInsights
 * and aspects of what is included in the telemetry data recorded can be controller through configuration.
 * Refer to the product documentation for further details.
 *
 * A number of the features of the runtime are implemented through middleware. Various feature flags in
 * configuration determine whether these middleware are added at runtime, the settings include:
 * UseInspection, ShowTyping and SetSpeak.
 *
 * These control the addition of:
 * [InspectionMiddleware](xref:botbuilder.InspectionMiddleware),
 * [ShowTypingMiddleware](xref:botbuilder-core.ShowTypingMiddleware), and
 * [SetSpeakMiddleware](xref:botbuilder.SetSpeakMiddleware) respectively.
 */
export async function getRuntimeServices(
    applicationRoot: string,
    settingsDirectory: string
): Promise<[ServiceCollection, Configuration]>;

/**
 * Construct all runtime services.
 *
 * @param applicationRoot absolute path to root of application
 * @param configuration a fully initialized configuration instance to use
 * @returns service collection and configuration
 */
export async function getRuntimeServices(
    applicationRoot: string,
    configuration: Configuration
): Promise<[ServiceCollection, Configuration]>;

/**
 * @internal
 */
export async function getRuntimeServices(
    applicationRoot: string,
    configurationOrSettingsDirectory: Configuration | string
): Promise<[ServiceCollection, Configuration]> {
    // Resolve configuration
    let configuration: Configuration;
    if (typeof configurationOrSettingsDirectory === 'string') {
        configuration = new Configuration().argv().env();

        const files = ['appsettings.json'];

        const { NODE_ENV: nodeEnv } = process.env;
        if (nodeEnv) {
            files.unshift(`appsettings.${nodeEnv}.json`);
        }

        files.forEach((file) => configuration.file(path.join(configurationOrSettingsDirectory, file)));

        await normalizeConfiguration(configuration, applicationRoot);
    } else {
        configuration = configurationOrSettingsDirectory;

        await normalizeConfiguration(configuration, applicationRoot);
    }

    const services = new ServiceCollection({
        botFrameworkClientFetch: undefined,
        connectorClientOptions: undefined,
        customAdapters: new Map(),
        declarativeTypes: [],
        memoryScopes: [],
        middlewares: new MiddlewareSet(),
        pathResolvers: [],
        serviceClientCredentialsFactory: undefined,
    });

    services.addFactory<ResourceExplorer, { declarativeTypes: ComponentDeclarativeTypes[] }>(
        'resourceExplorer',
        ['declarativeTypes'],
        ({ declarativeTypes }) => new ConfigurationResourceExporer(configuration, declarativeTypes)
    );

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
    await addSettingsBotComponents(services, configuration);

    return [services, configuration];
}

export { Configuration };
