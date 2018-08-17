import { IQnAService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class QnaMakerService extends ConnectedService implements IQnAService {
    readonly type: ServiceTypes;
    kbId: string;
    subscriptionKey: string;
    hostname: string;
    endpointKey: string;
    constructor(source?: IQnAService);
    toJSON(): IQnAService;
    encrypt(secret: string, iv?: string): void;
    decrypt(secret: string, iv?: string): void;
}
