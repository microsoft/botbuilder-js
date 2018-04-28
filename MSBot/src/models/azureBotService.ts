import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureBotService extends ConnectedService implements IAzureBotService {
    public readonly type = ServiceType.AzureBotService;
    public appId = '';
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';

    constructor(source: Partial<IAzureBotService> = {}) {
        super(source);
        const { appId = '', tenantId='', subscriptionId='', resourceGroup='' } = source;
        this.appId = appId;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.resourceGroup = resourceGroup;
    }

    public toJSON(): Partial<IAzureBotService> {
        let { name, appId, id, tenantId, subscriptionId, resourceGroup } = this;
        return { type: ServiceType.AzureBotService, name, appId, id, tenantId, subscriptionId, resourceGroup };
    }
}
