/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
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

export interface IConnectedService {
    // ServiceType of the service (LUIS, QnA, etc.)
    readonly type?: ServiceTypes;

    // Friendly name for the service
    name: string;

    // unique Id for the service
    id?: string;
}

export interface IEndpointService extends IConnectedService {
    // type = ServiceTypes.Endpoint
    // id = bot id

    // MSA Appid
    appId: string;

    // MSA app password for the bot
    appPassword: string;

    // endpoint of localhost service
    endpoint: string;

}

export interface IAzureService extends IConnectedService {
    // tenantId for azure
    tenantId: string;

    // subscriptionId for azure
    subscriptionId: string;

    // resourceGroup for azure
    resourceGroup: string;

    // name of the service
    serviceName: string;
}

export interface IBotService extends IAzureService {
    // type = ServiceTypes.AzureBotService

    // MSA Appid for the bot
    appId: string;
}

export interface IAppInsightsService extends IAzureService {
    // type = ServiceTypes.AppInsights

    // instrumentationKey for logging data to appInsights
    instrumentationKey: string;

    // (OPTIONAL) applicationId is used for programmatic acccess to AppInsights
    applicationId?: string;

    // (OPTIONAL) named apiKeys for programatic access to AppInsights
    apiKeys?: { [key: string]: string };
}

export interface IBlobStorageService extends IAzureService {
    // type = ServiceTypes.AzureStorage

    // connectionstring for blob storage
    connectionString: string;

    // (OPTIONAL) container name
    container?: string | null;
}

export interface ICosmosDBService extends IAzureService {
    // type = ServiceTypes.CosmosDB

    // endpoint/uri for CosmosDB
    endpoint: string;
    
    // key for accessing CosmosDB
    key: string;

    // database name
    database: string;

    // collection anme
    collection: string;
}

export interface ILuisService extends IConnectedService {
    // type = ServiceTypes.Luis
    // id = appid

    // luis appid
    appId: string;

    // authoring key for using authoring api
    authoringKey: string;

    // subscription key for using calling model api for predictions
    subscriptionKey: string;

    // version of the application
    version: string;

    // region for luis
    region: string;
}

export interface IDispatchService extends ILuisService {
    // type = ServiceTypes.Dispatch

    // service Ids that the dispatch model will dispatch across
    serviceIds: string[];
}

export interface IGenericService extends IConnectedService {
    // type = ServiceTypes.Generic

    // deep link to service
    url: string;

    // named/value configuration data
    configuration: { [key: string]: string };
}

export interface IQnAService extends IConnectedService {
    // type=Servicestypes.QnA

    // subscriptionkey for calling admin api
    subscriptionKey: string;

    // kb id
    kbId: string;

    // hostname for private service endpoint Example: https://myqna.azurewebsites.net
    hostname: string;

    // endpointKey for querying the kb
    endpointKey: string;
}

export interface IFileService extends IConnectedService {
    // type = ServiceTypes.File

    // filePath
    path: string;
}

export interface IBotConfiguration {
    // name of the bot
    name: string;

    // description of the bot
    description: string;

    // encrypted guid used to validate password is the same,
    // you need to be able to decrypt this key with passed in secret before we will use the secret to encrypt new values
    padlock: string;

    // version of the schema of this file
    version: string;

    // connected services for the bot
    services: IConnectedService[];
}
