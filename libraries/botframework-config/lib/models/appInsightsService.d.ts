import { IAppInsightsService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class AppInsightsService extends ConnectedService implements IAppInsightsService {
    readonly type: ServiceTypes;
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
    instrumentationKey: string;
    constructor(source?: IAppInsightsService);
    toJSON(): IAppInsightsService;
    encrypt(secret: string): void;
    decrypt(secret: string): void;
}
