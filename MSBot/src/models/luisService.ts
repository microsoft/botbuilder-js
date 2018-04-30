import { ILuisService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class LuisService extends ConnectedService implements ILuisService {
    public readonly type = ServiceType.Luis;
    public appId = '';
    public authoringKey = '';
    public subscriptionKey = '';
    public version = '';

    constructor(source: Partial<ILuisService> = {}) {
        super(source);
        const { appId = '', authoringKey = '', subscriptionKey = '', version = '' } = source;
        Object.assign(this, { appId, authoringKey, subscriptionKey, version });

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

    public toJSON(): Partial<ILuisService> {
        let { appId, authoringKey, id, name, subscriptionKey, type, version } = this;
        if (!id) {
            id = appId;
        }

        return { id, type, name, version, appId, authoringKey, subscriptionKey };
    }
}
