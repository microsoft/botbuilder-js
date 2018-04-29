import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureBotService extends ConnectedService implements IAzureBotService {
    public readonly type = ServiceType.AzureBotService;
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';

    constructor(source: Partial<IAzureBotService> = {}) {
        super(source);
        const {  tenantId='', subscriptionId='', resourceGroup='' } = source;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.resourceGroup = resourceGroup;
    }

    public toJSON(): Partial<IAzureBotService> {
        let { name, id, tenantId, subscriptionId, resourceGroup } = this;
        return { type: ServiceType.AzureBotService, name, id, tenantId, subscriptionId, resourceGroup };
    }
}
