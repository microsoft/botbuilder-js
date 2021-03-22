// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import fs from 'fs';
import path from 'path';
import { Configuration } from './configuration';
import { ok } from 'assert';

import { AdaptiveComponentRegistration } from 'botbuilder-dialogs-adaptive';
import { ApplicationInsightsTelemetryClient, TelemetryInitializerMiddleware } from 'botbuilder-applicationinsights';
import { AuthenticationConfiguration, SimpleCredentialProvider } from 'botframework-connector';
import { BlobsStorage, BlobsTranscriptStore } from 'botbuilder-azure-blobs';
import { ComponentRegistration } from 'botbuilder';
import { CoreBot } from './coreBot';
import { CoreBotAdapter } from './coreBotAdapter';
import { CosmosDbPartitionedStorage } from 'botbuilder-azure';
import { IServices, ServiceCollection, TPlugin } from 'botbuilder-runtime-core';
import { LuisComponentRegistration, QnAMakerComponentRegistration } from 'botbuilder-ai';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { SkillConversationIdFactory } from './skillConversationIdFactory';
import { allowedCallersClaimsValidator } from './allowedCallersClaimsValidator';

import {
    ConsoleTranscriptLogger,
    ConversationState,
    InspectionMiddleware,
    InspectionState,
    MemoryStorage,
    MiddlewareSet,
    NullTelemetryClient,
    ShowTypingMiddleware,
    SkillHandler,
    SkillHttpClient,
    TelemetryLoggerMiddleware,
    TranscriptLoggerMiddleware,
    UserState,
} from 'botbuilder';

function addFeatures(services: ServiceCollection<IServices>, configuration: Configuration): void {
    services.composeFactory(
        'middlewares',
        ['storage', 'conversationState', 'userState'],
        async ({ conversationState, storage, userState }, middlewareSet) => {
            if (await configuration.bool(['showTyping'])) {
                middlewareSet.use(new ShowTypingMiddleware());
            }

            if (await configuration.bool(['traceTranscript'])) {
                const blobsTranscript = await configuration.type(
                    ['blobTranscript'],
                    t.Record({
                        connectionString: t.String,
                        containerName: t.String,
                    })
                );

                middlewareSet.use(
                    new TranscriptLoggerMiddleware(
                        blobsTranscript
                            ? new BlobsTranscriptStore(blobsTranscript.connectionString, blobsTranscript.containerName)
                            : new ConsoleTranscriptLogger()
                    )
                );
            }

            if (await configuration.bool(['useInspection'])) {
                const inspectionState = new InspectionState(storage);
                middlewareSet.use(new InspectionMiddleware(inspectionState, userState, conversationState));
            }

            return middlewareSet;
        }
    );
}

function addTelemetry(services: ServiceCollection<IServices>, configuration: Configuration): void {
    services.addFactory('botTelemetryClient', async () => {
        const instrumentationKey = await configuration.string(['instrumentationKey']);

        return instrumentationKey
            ? new ApplicationInsightsTelemetryClient(instrumentationKey)
            : new NullTelemetryClient();
    });

    services.addFactory(
        'telemetryMiddleware',
        ['botTelemetryClient'],
        async ({ botTelemetryClient }) =>
            new TelemetryInitializerMiddleware(
                new TelemetryLoggerMiddleware(botTelemetryClient, await configuration.bool(['logPersonalInformation'])),
                await configuration.bool(['logActivities'])
            )
    );
}

function addStorage(services: ServiceCollection<IServices>, configuration: Configuration): void {
    services.addFactory('conversationState', ['storage'], ({ storage }) => new ConversationState(storage));
    services.addFactory('userState', ['storage'], ({ storage }) => new UserState(storage));

    services.addFactory('storage', async () => {
        const storage = await configuration.string(['runtimeSettings', 'storage']);

        switch (storage) {
            case 'BlobsStorage': {
                const blobsStorage = await configuration.type(
                    ['BlobsStorage'],
                    t.Record({
                        connectionString: t.String,
                        containerName: t.String,
                    })
                );

                ok(blobsStorage);

                return new BlobsStorage(blobsStorage.connectionString, blobsStorage.containerName);
            }

            case 'CosmosDbPartitionedStorage': {
                const cosmosOptions = await configuration.type(
                    ['CosmosDbPartitionedStorage'],
                    t.Record({
                        authKey: t.String.Or(t.Undefined),
                        compatibilityMode: t.Boolean.Or(t.Undefined),
                        containerId: t.String,
                        containerThroughput: t.Number.Or(t.Undefined),
                        cosmosDbEndpoint: t.String.Or(t.Undefined),
                        databaseId: t.String,
                        keySuffix: t.String.Or(t.Undefined),
                    })
                );

                ok(cosmosOptions);

                return new CosmosDbPartitionedStorage(cosmosOptions);
            }

            default:
                return new MemoryStorage();
        }
    });
}

function addSkills(services: ServiceCollection<IServices>, configuration: Configuration): void {
    services.addInstance('credentialProvider', new SimpleCredentialProvider('appId', 'appPassword'));

    services.addFactory(
        'skillConversationIdFactory',
        ['storage'],
        ({ storage }) => new SkillConversationIdFactory(storage)
    );

    services.addFactory(
        'skillClient',
        ['credentialProvider', 'skillConversationIdFactory'],
        ({ credentialProvider, skillConversationIdFactory }) =>
            new SkillHttpClient(credentialProvider, skillConversationIdFactory)
    );

    services.addFactory('authenticationConfiguration', async () => {
        const allowedCallers = (await configuration.type(['allowedCallers'], t.Array(t.String))) ?? [];

        return new AuthenticationConfiguration(
            undefined,
            allowedCallers.length ? allowedCallersClaimsValidator(allowedCallers) : undefined
        );
    });

    services.addFactory(
        'channelServiceHandler',
        ['adapter', 'bot', 'skillConversationIdFactory', 'credentialProvider', 'authenticationConfiguration'],
        (dependencies) =>
            new SkillHandler(
                dependencies.adapter,
                dependencies.bot,
                dependencies.skillConversationIdFactory,
                dependencies.credentialProvider,
                dependencies.authenticationConfiguration
            )
    );
}

function addCoreBot(services: ServiceCollection<IServices>, configuration: Configuration): void {
    services.addFactory(
        'bot',
        [
            'resourceExplorer',
            'userState',
            'conversationState',
            'skillClient',
            'skillConversationIdFactory',
            'botTelemetryClient',
        ],
        async (dependencies) =>
            new CoreBot(
                dependencies.resourceExplorer,
                dependencies.userState,
                dependencies.conversationState,
                dependencies.skillClient,
                dependencies.skillConversationIdFactory,
                dependencies.botTelemetryClient,
                (await configuration.string(['defaultLocale'])) ?? 'en-US',
                (await configuration.string(['defaultRootDialog'])) ?? 'main.dialog'
            )
    );

    services.addFactory(
        'adapter',
        ['authenticationConfiguration', 'conversationState', 'userState', 'middlewares', 'telemetryMiddleware'],
        (dependencies) => {
            const adapter = new CoreBotAdapter(
                dependencies.authenticationConfiguration,
                dependencies.conversationState,
                dependencies.userState
            );

            adapter.use(dependencies.middlewares);
            adapter.use(dependencies.telemetryMiddleware);

            return adapter;
        }
    );
}

async function addPlugins(services: ServiceCollection<IServices>, configuration: Configuration): Promise<void> {
    const loadPlugin = async (name: string): Promise<TPlugin | undefined> => {
        try {
            const plugin = (await import(name))?.default;

            if (plugin) {
                ok(typeof plugin === 'function', `Failed to load ${name}`);
                return plugin;
            }
        } catch (_err) {
            // no-op
        }

        return undefined;
    };

    const plugins =
        (await configuration.type(
            ['runtimeSettings', 'plugins'],
            t.Array(
                t.Record({
                    name: t.String,
                    settingsPrefix: t.String.Or(t.Undefined),
                })
            )
        )) ?? [];

    for (const { name, settingsPrefix } of plugins) {
        const plugin = await loadPlugin(name);
        ok(plugin);

        await Promise.resolve(plugin(services, configuration.bind([settingsPrefix ?? name])));
    }
}

async function normalizeConfiguration(configuration: Configuration, applicationRoot: string): Promise<void> {
    // Override applicationRoot setting
    await configuration.set(['applicationRoot'], applicationRoot);

    // Override root dialog setting
    await configuration.set(
        ['defaultRootDialog'],
        await new Promise<string | undefined>((resolve, reject) =>
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.readdir(applicationRoot, (err, files) =>
                err ? reject(err) : resolve(files.find((file) => file.endsWith('.dialog')))
            )
        )
    );
}

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
): Promise<[ServiceCollection<IServices>, Configuration]>;

/**
 * Construct all runtime services.
 *
 * @param applicationRoot absolute path to root of application
 * @param settingsDirectory directory where settings files are located
 * @returns service collection and configuration
 */
export async function getRuntimeServices(
    applicationRoot: string,
    settingsDirectory: string
): Promise<[ServiceCollection<IServices>, Configuration]>;

/**
 * @internal
 */
export async function getRuntimeServices(
    applicationRoot: string,
    configurationOrSettingsDirectory: Configuration | string
): Promise<[ServiceCollection<IServices>, Configuration]> {
    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new QnAMakerComponentRegistration());
    ComponentRegistration.add(new LuisComponentRegistration());

    // Resolve configuration
    let configuration: Configuration;
    if (typeof configurationOrSettingsDirectory === 'string') {
        configuration = new Configuration()
            .argv()
            .env()
            .file(path.join(configurationOrSettingsDirectory, 'appsettings.Development.json'))
            .file(path.join(configurationOrSettingsDirectory, 'appsettings.json'));
    } else {
        configuration = configurationOrSettingsDirectory;
    }

    await normalizeConfiguration(configuration, applicationRoot);

    const services = new ServiceCollection<IServices>({
        componentRegistration: ComponentRegistration,
        customAdapters: new Map(),
        middlewares: new MiddlewareSet(),
        resourceExplorer: new ResourceExplorer(),
    });

    services.composeFactory('resourceExplorer', ['componentRegistration'], async (_dependencies, resourceExplorer) => {
        const applicationRoot = await configuration.string(['applicationRoot']);
        if (applicationRoot) {
            resourceExplorer.addFolder(applicationRoot);
        }

        return resourceExplorer;
    });

    const runtimeSettings = configuration.bind(['runtimeSettings']);

    addCoreBot(services, configuration);
    addFeatures(services, runtimeSettings.bind(['features']));
    addSkills(services, runtimeSettings.bind(['skills']));
    addStorage(services, configuration);
    addTelemetry(services, runtimeSettings.bind(['telemetry']));
    await addPlugins(services, configuration);

    return [services, configuration];
}

export { Configuration };
