export declare enum ServiceType {
    Endpoint = "endpoint",
    AzureBotService = "abs",
    Luis = "luis",
    QnA = "qna",
    Dispatch = "dispatch",
    File = "file",
}
export interface IConnectedService {
    readonly type: ServiceType;
    name: string;
    id?: string;
}
export interface IEndpointService extends IConnectedService {
    appId: string;
    appPassword: string;
    endpoint: string;
}
export interface IAzureBotService extends IConnectedService {
    appId: string;
}
export interface ILuisService extends IConnectedService {
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
}
export interface IDispatchService extends IConnectedService {
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
    serviceIds: string[];
}
export interface IQnAService extends IConnectedService {
    kbid: string;
    subscriptionKey: string;
}
export interface IFileService extends IConnectedService {
    filePath: string;
}
export interface IBotConfig {
    name: string;
    description: string;
    secretKey: string;
    services: IConnectedService[];
}
