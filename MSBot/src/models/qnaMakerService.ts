import { IQnAService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class QnaMakerService extends ConnectedService implements IQnAService {
    public readonly type = ServiceType.QnA;
    public id = '';
    public kbid = '';
    public name = '';
    public subscriptionKey = '';

    constructor(source: Partial<IQnAService> = {}) {
        super(source);
        const { kbid = '', name = '', subscriptionKey = '' } = source;
        Object.assign(this, { kbid, name, subscriptionKey });
    }

    public toJSON(): Partial<IQnAService> {
        let { kbid, id, name, subscriptionKey } = this;
        if (!id) {
            id = kbid;
        }
        return { kbid, name, type: ServiceType.QnA, subscriptionKey, id };
    }
}
