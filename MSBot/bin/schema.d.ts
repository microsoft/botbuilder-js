export interface IConnectedService {
    type: string;
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
    appPassword: string;
    endpoint: string;
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
}
export interface IQnAService extends IConnectedService {
    kbid: string;
    subscriptionKey: string;
}
export interface IBotConfig {
    name: string;
    description: string;
    secretKey: string;
    services: IConnectedService[];
}
