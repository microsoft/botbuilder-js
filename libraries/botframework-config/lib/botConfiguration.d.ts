import { ConnectedService } from './models';
import { IBotConfiguration, IConnectedService } from './schema';
export declare class BotConfiguration implements Partial<IBotConfiguration> {
    private internal;
    name: string;
    description: string;
    services: IConnectedService[];
    secretKey: string;
    constructor();
    static fromJSON(source?: Partial<IBotConfiguration>): BotConfiguration;
    toJSON(): Partial<IBotConfiguration>;
    static loadBotFromFolder(folder?: string, secret?: string): Promise<BotConfiguration>;
    static load(botpath: string, secret?: string): Promise<BotConfiguration>;
    save(botpath?: string, secret?: string): Promise<void>;
    clearSecret(): void;
    connectService(newService: IConnectedService): void;
    encrypt(secret: string): void;
    decrypt(secret?: string): void;
    disconnectServiceByNameOrId(nameOrId: string): IConnectedService;
    disconnectService(type: string, id: string): void;
    validateSecretKey(secret: string): void;
    private legacyDecrypt;
    static serviceFromJSON(service: IConnectedService): ConnectedService;
}
