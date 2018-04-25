import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureBotService extends ConnectedService implements IAzureBotService {
    public readonly type = ServiceType.AzureBotService;
    public appId = '';

    constructor(source: Partial<IAzureBotService> = {}) {
        super(source);
        const { appId = '' } = source;
        this.appId = appId;
    }

    public toJSON(): Partial<IAzureBotService> {
        let { name, appId, id } = this;
        if (!id) {
            id = appId;
        }
        return { type: ServiceType.AzureBotService, name, appId, id };
    }
}
