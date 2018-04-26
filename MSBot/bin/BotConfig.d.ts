import { BotConfigModel } from './models';
import { IConnectedService, ServiceType } from './schema';
export declare class BotConfig extends BotConfigModel {
    private internal;
    protected encryptedProperties: {
        [key: string]: string[];
    };
    constructor(secret?: string);
    static LoadBotFromFolder(folder?: string, secret?: string): Promise<BotConfig>;
    static Load(botpath: string, secret?: string): Promise<BotConfig>;
    save(botpath?: string): Promise<void>;
    clearSecret(): void;
    connectService(newService: IConnectedService): void;
    encryptAll(): void;
    decryptAll(): void;
    private encryptService(service);
    private decryptService(service);
    disconnectServiceByNameOrId(nameOrId: string): IConnectedService;
    disconnectService(type: string, id: string): void;
    encryptValue(value: string): string;
    decryptValue(encryptedValue: string): string;
    validateSecretKey(): void;
    private internalEncrypt(value);
    private internalDecrypt(encryptedValue);
    getEncryptedProperties(type: ServiceType): string[];
}
