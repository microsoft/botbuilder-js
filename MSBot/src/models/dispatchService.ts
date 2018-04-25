import { IDispatchService, ServiceType } from '../types';
import { ConnectedService } from './connectedService';

export class DispatchService extends ConnectedService implements IDispatchService {
    public readonly type = ServiceType.Dispatch;
    public appId: string;
    public authoringKey: string;
    public serviceIds: string[];
    public subscriptionKey: string;
    public version: string;

    constructor(source: Partial<IDispatchService> = {}) {
        super(source);
        const { appId = '', authoringKey = '', serviceIds = '', subscriptionKey = '', version = '' } = source;
        Object.assign(this, { appId, authoringKey, serviceIds, subscriptionKey, version });
    }

    public toJSON(): Partial<IDispatchService> {
        let { appId, id, authoringKey, name, serviceIds, subscriptionKey, version } = this;
        if (!id) {
            id = appId;
        }
        return { appId, id, authoringKey, name, serviceIds, subscriptionKey, type: ServiceType.Dispatch, version };
    }
}
