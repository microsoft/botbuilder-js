import { IQnAService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class QnaMakerService extends ConnectedService implements IQnAService {
    public readonly type = ServiceType.QnA;
    public kbId = '';
    public subscriptionKey = '';
    public hostname = '';
    public endpointKey = '';

    constructor(source: Partial<IQnAService> = {}) {
        super(source);
        const { kbId = '', name = '', subscriptionKey = '', endpointKey = '', hostname = '' } = source;
        Object.assign(this, { kbId, name, subscriptionKey, endpointKey, hostname });
    }

    public toJSON(): Partial<IQnAService> {
        const { kbId, id, name, subscriptionKey, endpointKey, hostname } = this;
        return { kbId, name, type: ServiceType.QnA, subscriptionKey, id, endpointKey, hostname };
    }
}
