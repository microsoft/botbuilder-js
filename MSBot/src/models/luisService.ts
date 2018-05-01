import { ILuisService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class LuisService extends ConnectedService implements ILuisService {
    public readonly type = ServiceType.Luis;
    public appId = '';
    public authoringKey = '';
    public subscriptionKey = '';
    public version = '';

    constructor(source: ILuisService = {} as ILuisService) {
        super(source);
        const { appId = '', authoringKey = '', subscriptionKey = '', version = '' } = source;
        Object.assign(this, { appId, authoringKey, subscriptionKey, version });
    }

    public toJSON(): ILuisService {
        const { appId, authoringKey, id, name, subscriptionKey, type, version } = this;
        return { id, type, name, version, appId, authoringKey, subscriptionKey };
    }
}
