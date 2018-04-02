
interface IBotEndpoint {
    // name of the endpoint
    name: string;

    // url for the endpoint
    url: string;
}

interface IConnectedService {
    // type of the service (LUIS, QnA, etc.)
    type: string;

    // Friendly name for the service
    name: string;

    // unique Id for the service (appid, etc)
    id: string;
}


interface ILuisService extends IConnectedService {
    // type = ServiceTypes.Luis
    // id = appid

    // Regions for this bot
    regions: string[];
}

interface IQnAService extends IConnectedService {
    // type=Servicestypes.QnA
    // id = appid for the QnA service
}

interface IBotConfig {
    // bot id
    id: string;

    // name of the bot
    name: string;

    // description of the bot
    description: string;

    // ms appid for the bot
    appid: string;

    // Endpoints for the bot
    endpoints: IBotEndpoint[];

    // connected services for the bot
    services: IConnectedService[];
}
