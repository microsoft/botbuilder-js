/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export enum ServiceTypes {
    AppInsights = 'appInsights',
    Bot = 'abs',
    BlobStorage = 'blob',
    CosmosDB = 'cosmosdb',
    Generic = 'generic',
    Endpoint = 'endpoint',
    Luis = 'luis',
    QnA = 'qna',
    Dispatch = 'dispatch',
    File = 'file'
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IConnectedService {
    /**
     * (Optional) ServiceType of the service (LUIS, QnA, etc.)
     */
    readonly type?: ServiceTypes;

    /**
     * Friendly name for the service.
     */
    name: string;

    /**
     * (Optional) unique Id for the service.
     */
    id?: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IEndpointService extends IConnectedService {
    /**
     * MSA App ID.
     */
    appId: string;

    /**
     * MSA app password for the bot.
     */
    appPassword: string;

    /**
     * Endpoint of localhost service.
     */
    endpoint: string;

    /**
     * The channel service (Azure or US Government Azure) for the bot.
     * A value of 'https://botframework.azure.us' means the bot will be talking to a US Government Azure data center.
     * An undefined or null value means the bot will be talking to public Azure
     */
    channelService?: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IAzureService extends IConnectedService {
    /**
     * Tenant ID for azure.
     */
    tenantId: string;

    /**
     * Subscription ID for azure.
     */
    subscriptionId: string;

    /**
     * Resource group for azure.
     */
    resourceGroup: string;

    /**
     * Name of the service.
     */
    serviceName: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IBotService extends IAzureService {
    /**
     * MSA App ID for the bot.
     */
    appId: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IAppInsightsService extends IAzureService {
    /**
     * Instrumentation key for logging data to appInsights.
     */
    instrumentationKey: string;

    /**
     * (Optional) application ID used for programmatic access to AppInsights.
     */
    applicationId?: string;

    /**
     * (Optional) named api keys for programmatic access to AppInsights.
     */
    apiKeys?: { [key: string]: string };
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IBlobStorageService extends IAzureService {
    /**
     * Connection string for blob storage.
     */
    connectionString: string;

    /**
     * (Optional) container name.
     */
    container?: string | null;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface ICosmosDBService extends IAzureService {
    /**
     * Endpoint/uri for CosmosDB.
     */
    endpoint: string;

    /**
     * Key for accessing CosmosDB.
     */
    key: string;

    /**
     * Database name.
     */
    database: string;

    /**
     * Collection name.
     */
    collection: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface ILuisService extends IConnectedService {
    /**
     * Luis app ID.
     */
    appId: string;

    /**
     * Authoring key for using authoring api.
     */
    authoringKey: string;

    /**
     * Subscription key for using calling model api for predictions.
     */
    subscriptionKey: string;

    /**
     * Version of the application.
     */
    version: string;

    /**
     * Region for luis.
     */
    region: string;

    /**
     * getEndpoint() Returns the full region endpoint for the LUIS service.
     */
    getEndpoint(): string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IDispatchService extends ILuisService {
    /**
     * Service IDs that the dispatch model will dispatch across.
     */
    serviceIds: string[];
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IGenericService extends IConnectedService {
    /**
     * Deep link to service.
     */
    url: string;

    /**
     * Named/value configuration data.
     */
    configuration: { [key: string]: string };
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IQnAService extends IConnectedService {
    /**
     * Subscription key for calling admin api.
     */
    subscriptionKey: string;

    /**
     * Knowledge base id.
     */
    kbId: string;

    /**
     * hostname for private service endpoint Example: https://myqna.azurewebsites.net.
     */
    hostname: string;

    /**
     * Endpoint Key for querying the kb.
     */
    endpointKey: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IFileService extends IConnectedService {
    /**
     * File path.
     */
    path: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IBotConfiguration {
    /**
     * Name of the bot.
     */
    name: string;

    /**
     * Description of the bot.
     */
    description: string;

    /**
     * Encrypted GUID used to validate password is the same.
     *
     * @remarks
     * You need to be able to decrypt this key with a passed in secret before we will use the
     * secret to encrypt new values.
     */
    padlock: string;

    /**
     * Version of the schema of this file.
     */
    version: string;

    /**
     * Connected services for the bot.
     */
    services: IConnectedService[];
}
