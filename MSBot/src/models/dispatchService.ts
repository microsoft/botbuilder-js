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

        let { id } = this;
        Object.defineProperty(this, 'id', {
            get: function () {
                return id || appId;
            },
            set: function (value) {
                id = value;
            },
            enumerable: true
        });
    }

    public toJSON(): Partial<IDispatchService> {
        let { appId, id, authoringKey, name, serviceIds, subscriptionKey, version } = this;
        if (!id) {
            id = appId;
        }
        return { appId, id, authoringKey, name, serviceIds, subscriptionKey, type: ServiceType.Dispatch, version };
    }
}
