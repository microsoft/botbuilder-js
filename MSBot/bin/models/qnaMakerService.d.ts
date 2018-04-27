import { IQnAService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class QnaMakerService extends ConnectedService implements IQnAService {
    readonly type: ServiceType;
    id: string;
    name: string;
    kbId: string;
    subscriptionKey: string;
    hostname: string;
    endpointKey: string;
    constructor(source?: Partial<IQnAService>);
    toJSON(): Partial<IQnAService>;
}
