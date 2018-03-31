
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

interface IAzureBotService extends IConnectedService {
    // botId 
    id: string;

    // ms appid for the bot
    appid: string;
}

interface ILuisService extends IConnectedService {
    // appid for the LUIS service
    appId: string;

    // Regions for this bot 
    regions: string[];
}

interface IQnAKnowledgebase extends IConnectedService {
    // appid for the QnA service
    appId: string;

    // region for the service
    region: string;
}

interface IBotConfig {
    // name of the bot
    name: string;

    // description of the bot
    description: string;

    // Endpoints for the bot
    endpoints: IBotEndpoint[];

    // connected services for the bot
    services: IConnectedService[];
}

