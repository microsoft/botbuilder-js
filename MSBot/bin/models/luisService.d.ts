import { ILuisService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class LuisService extends ConnectedService implements ILuisService {
    readonly type: ServiceType;
    appId: string;
    authoringKey: string;
    subscriptionKey: string;
    version: string;
    constructor(source?: ILuisService);
    toJSON(): ILuisService;
}
