export declare enum ServiceType {
    Luis = "luis",
    QnA = "qna",
}
export declare class BotConfig implements IBotConfig {
    private location;
    id: string;
    appid: string;
    name: string;
    description: string;
    endpoints: IBotEndpoint[];
    services: IConnectedService[];
    constructor();
    static LoadBotFromFolder(folder?: string): Promise<BotConfig>;
    static Load(botpath: string): Promise<BotConfig>;
    Save(botpath?: string): Promise<void>;
    addService(newService: IConnectedService): void;
    removeServiceByNameOrId(nameOrId: string): void;
    removeService(type: string, id: string): void;
    addEndpoint(endpointUrl: string, name?: string): void;
    removeEndpoint(nameOrUrl: string): void;
}
