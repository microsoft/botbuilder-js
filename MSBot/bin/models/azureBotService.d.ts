import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class AzureBotService extends ConnectedService implements IAzureBotService {
    readonly type: ServiceType;
    appId: string;
    constructor(source?: Partial<IAzureBotService>);
    toJSON(): Partial<IAzureBotService>;
}
