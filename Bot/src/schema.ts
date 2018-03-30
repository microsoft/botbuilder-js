
interface BotEndpoint {
    // name of the endpoint
    name: string;

    // url for the endpoint
    url: string;
}

interface BotService {
    // type of the service (LUIS, QnA, etc.)
    type: string;

    // Friendly name for the service
    name: string;

    // unique Id for the service (appid, etc)
    id: string;
}


interface LuisService extends BotService {
    // Regions for this bot 
    regions: string[];
}

interface Bot {
    // botId 
    id: string;

    // name of the bot
    name: string;

    // ms appid for the bot
    appId: string;

    // Endpoints for the bot
    endpoints: BotEndpoint[];

    // connected services for the bot
    services: BotService[];
}
