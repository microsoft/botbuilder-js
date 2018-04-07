interface IConnectedService {
    type: string;
    name: string;
    id?: string;
}
interface IEndpointService extends IConnectedService {
    appId: string;
    appPassword: string;
    endpoint: string;
}
interface IAzureBotService extends IConnectedService {
    appId: string;
    appPassword: string;
    endpoint: string;
}
interface ILuisService extends IConnectedService {
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
}
interface IQnAService extends IConnectedService {
    kbid: string;
    subscriptionKey: string;
}
interface IBotConfig {
    name: string;
    description: string;
    secretKey: string;
    services: IConnectedService[];
}
