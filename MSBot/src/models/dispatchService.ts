import { IDispatchService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class DispatchService extends ConnectedService implements IDispatchService {
    public readonly type = ServiceType.Dispatch;
    public appId = '';
    public authoringKey = '';
    public serviceIds: string[] = [];
    public subscriptionKey = '';
    public version = '';

    constructor(source: Partial<IDispatchService> = {}) {
        super(source);
        const { appId = '', authoringKey = '', serviceIds = [], subscriptionKey = '', version = '' } = source;
        Object.assign(this, { appId, authoringKey, serviceIds, subscriptionKey, version });
    }

    public toJSON(): Partial<IDispatchService> {
        const { appId, id, authoringKey, name, serviceIds, subscriptionKey, version } = this;
        return { appId, id, authoringKey, name, serviceIds, subscriptionKey, type: ServiceType.Dispatch, version };
    }
}
