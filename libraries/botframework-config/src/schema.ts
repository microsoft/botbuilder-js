/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Connected service types supported.
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
 * JSON description of a connected service.
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
 * JSON description of an endpoint service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.Endpoint`.
 * - [id](#id) SHOULD be set to the bots ID.
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
 * JSON description of an azure service.
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
 * JSON description of an Azure Bot Service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.Bot`.
 */
export interface IBotService extends IAzureService {
    /**
     * MSA App ID for the bot.
     */
    appId: string;
}

/**
 * JSON description of an App Insights service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.AppInsights`.
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
 * JSON description of a blob storage service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.BlobStorage`.
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
 * JSON description of a CosmosDB service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.CosmosDB`.
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
 * JSON description of a LUIS service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.Luis`.
 * - [id](#id) SHOULD be set to the LUIS appid.
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
 * JSON description of a dispatch service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.Dispatch`.
 */
export interface IDispatchService extends ILuisService {
    /**
     * Service IDs that the dispatch model will dispatch across.
     */
    serviceIds: string[];
}

/**
 * JSON description of a generic service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.Generic`.
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
 * JSON description of a QnA Maker service.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.QnA`.
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
 * JSON description of a file.
 *
 * @remarks
 * - [type](#type) SHOULD be set to `ServiceTypes.File`.
 */
export interface IFileService extends IConnectedService {
    /**
     * File path.
     */
    path: string;
}

/**
 * JSON description of a bot configuration file.
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
