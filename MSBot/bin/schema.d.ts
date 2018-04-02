interface IBotEndpoint {
    name: string;
    url: string;
}
interface IConnectedService {
    type: string;
    name: string;
    id: string;
}
interface ILuisService extends IConnectedService {
    regions: string[];
}
interface IQnAService extends IConnectedService {
}
interface IBotConfig {
    id: string;
    name: string;
    description: string;
    appid: string;
    endpoints: IBotEndpoint[];
    services: IConnectedService[];
}
