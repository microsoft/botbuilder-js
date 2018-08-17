import { ILuisService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class LuisService extends ConnectedService implements ILuisService {
    type: ServiceTypes;
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
    constructor(source?: ILuisService);
    toJSON(): ILuisService;
    encrypt(secret: string, iv?: string): void;
    decrypt(secret: string, iv?: string): void;
}
