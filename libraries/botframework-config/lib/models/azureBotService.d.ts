/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureBotService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class AzureBotService extends ConnectedService implements IAzureBotService {
    readonly type: ServiceTypes;
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
    constructor(source?: IAzureBotService);
    toJSON(): IAzureBotService;
    encrypt(secret: string, iv?: string): void;
    decrypt(secret: string, iv?: string): void;
}
