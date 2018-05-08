/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureBotService extends ConnectedService implements IAzureBotService {
    public readonly type = ServiceType.AzureBotService;
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';

    constructor(source: IAzureBotService = {} as IAzureBotService) {
        super(source);
        const { tenantId = '', subscriptionId = '', resourceGroup = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup });
    }

    public toJSON(): IAzureBotService {
        let { id, name, tenantId, subscriptionId, resourceGroup } = this;
        return { type: ServiceType.AzureBotService, id, name, tenantId, subscriptionId, resourceGroup };
    }
}
