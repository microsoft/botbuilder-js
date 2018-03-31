
interface BotEndpoint {
    // name of the endpoint
    name: string;

    // url for the endpoint
    url: string;
}

interface ConnectedService {
    // type of the service (LUIS, QnA, etc.)
    type: string;

    // Friendly name for the service
    name: string;

    // unique Id for the service (appid, etc)
    id: string;
}

interface AzureBotService extends ConnectedService {
    // ms appid for the bot
    appId: string;
}

interface LuisService extends ConnectedService {
    // appid for the LUIS service
    appId: string;

    // Regions for this bot 
    regions: string[];
}

interface QnAKnowledgebase extends ConnectedService {
    // appid for the QnA service
    appId: string;

    // region for the service
    region: string;
}


interface Bot {
    // botId 
    id: string;

    // name of the bot
    name: string;

    // Endpoints for the bot
    endpoints: BotEndpoint[];

    // connected services for the bot
    services: ConnectedService[];
}


