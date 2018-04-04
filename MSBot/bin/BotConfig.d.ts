export declare enum ServiceType {
    Localhost = "localhost",
    AzureBotService = "abs",
    Luis = "luis",
    QnA = "qna",
}
export declare class BotConfig implements IBotConfig {
    private location;
    cryptoPassword: string;
    name: string;
    description: string;
    services: IConnectedService[];
    constructor();
    static LoadBotFromFolder(folder?: string): Promise<BotConfig>;
    static Load(botpath: string): Promise<BotConfig>;
    Save(botpath?: string): Promise<void>;
    connectService(newService: IConnectedService): void;
    disconnectServiceByNameOrId(nameOrId: string): void;
    disconnectService(type: string, id: string): void;
    static boundary: string;
    encryptValue(value: string): string;
    decryptValue(encryptedValue: string): string;
}
