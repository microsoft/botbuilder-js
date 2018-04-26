import { IQnAService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class QnaMakerService extends ConnectedService implements IQnAService {
    readonly type: ServiceType;
    id: string;
    kbid: string;
    name: string;
    subscriptionKey: string;
    constructor(source?: Partial<IQnAService>);
    toJSON(): Partial<IQnAService>;
}
