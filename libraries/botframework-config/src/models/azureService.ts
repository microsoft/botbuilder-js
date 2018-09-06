/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureService extends ConnectedService implements IAzureService {
    public tenantId: string;
    public subscriptionId: string;
    public resourceGroup: string;
    public serviceName: string;

    constructor(source: IAzureService = {} as IAzureService, type: ServiceTypes) {
        super(source, type);
    }
}
