import { IDispatchService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class DispatchService extends ConnectedService implements IDispatchService {
    readonly type: ServiceType;
    appId: string;
    authoringKey: string;
    serviceIds: string[];
    subscriptionKey: string;
    version: string;
    constructor(source?: Partial<IDispatchService>);
    toJSON(): Partial<IDispatchService>;
}
