/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureBotService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class AzureBotService extends ConnectedService implements IAzureBotService {
    readonly type: ServiceType;
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
    constructor(source?: IAzureBotService);
    toJSON(): IAzureBotService;
}
