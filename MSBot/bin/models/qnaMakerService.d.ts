import { IQnAService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class QnaMakerService extends ConnectedService implements IQnAService {
    readonly type: ServiceType;
    kbId: string;
    subscriptionKey: string;
    hostname: string;
    endpointKey: string;
    constructor(source?: IQnAService);
    toJSON(): IQnAService;
}
