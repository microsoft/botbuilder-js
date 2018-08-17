/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
export declare enum ServiceTypes {
    AppInsights = "appInsights",
    AzureBot = "abs",
    AzureStorage = "azureStorage",
    Endpoint = "endpoint",
    Luis = "luis",
    QnA = "qna",
    Dispatch = "dispatch",
    File = "file"
}
export interface IConnectedService {
    readonly type: ServiceTypes;
    name: string;
    id?: string;
}
export interface IEndpointService extends IConnectedService {
    appId: string;
    appPassword: string;
    endpoint: string;
}
export interface IAzureBotService extends IConnectedService {
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
}
export interface IAppInsightsService extends IConnectedService {
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
    instrumentationKey: string;
}
export interface IAzureStorageService extends IConnectedService {
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
    connectionString: string;
}
export interface ILuisService extends IConnectedService {
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
    region: string;
}
export interface IDispatchService extends IConnectedService {
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
    serviceIds: string[];
    region: string;
}
export interface IQnAService extends IConnectedService {
    subscriptionKey: string;
    kbId: string;
    hostname: string;
    endpointKey: string;
}
export interface IFileService extends IConnectedService {
    filePath: string;
}
export interface IBotConfiguration {
    name: string;
    description: string;
    secretKey: string;
    services: IConnectedService[];
}
