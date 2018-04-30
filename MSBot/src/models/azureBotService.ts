import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureBotService extends ConnectedService implements IAzureBotService {
    public readonly type = ServiceType.AzureBotService;
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';

    constructor(source: Partial<IAzureBotService> = {}) {
        super(source);
        const { tenantId = '', subscriptionId = '', resourceGroup = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup });

        let { id } = this;
        Object.defineProperty(this, 'id', {
            get: function () {
                return id || tenantId;
            },
            set: function (value) {
                id = value;
            },
            enumerable: true
        });
    }

    public toJSON(): Partial<IAzureBotService> {
        let { name, id, tenantId, subscriptionId, resourceGroup } = this;
        return { type: ServiceType.AzureBotService, name, id, tenantId, subscriptionId, resourceGroup };
    }
}
