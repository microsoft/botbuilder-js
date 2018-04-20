import { IBotConfig, IConnectedService } from './schema';
export declare enum ServiceType {
    Endpoint = "endpoint",
    AzureBotService = "abs",
    Luis = "luis",
    QnA = "qna",
    Dispatch = "dispatch",
    File = "file",
}
export declare class BotConfig implements IBotConfig {
    private internal;
    protected encryptedProperties: {
        [key: string]: string[];
    };
    name: string;
    secretKey: string;
    description: string;
    services: IConnectedService[];
    constructor(secret?: string);
    static LoadBotFromFolder(folder?: string, secret?: string): Promise<BotConfig>;
    static Load(botpath: string, secret?: string): Promise<BotConfig>;
    Save(botpath?: string): Promise<void>;
    clearSecret(): void;
    connectService(newService: IConnectedService): void;
    encryptAll(): void;
    decryptAll(): void;
    private encryptService(service);
    private decryptService(service);
    disconnectServiceByNameOrId(nameOrId: string): void;
    disconnectService(type: string, id: string): void;
    encryptValue(value: string): string;
    decryptValue(encryptedValue: string): string;
    validateSecretKey(): void;
    private internalEncrypt(value);
    private internalDecrypt(encryptedValue);
    getEncryptedProperties(type: ServiceType): string[];
}
