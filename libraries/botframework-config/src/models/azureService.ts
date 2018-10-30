/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Base class for all azure service definitions.
 */
export class AzureService extends ConnectedService implements IAzureService {
    /**
     * Tenant ID for azure.
     */
    public tenantId: string;

    /**
     * Subscription ID for azure.
     */
    public subscriptionId: string;

    /**
     * Resource group for azure.
     */
    public resourceGroup: string;

    /**
     * Name of the service.
     */
    public serviceName: string;

    /**
     * Creates a new AzureService instance.
     * @param source (Optional) JSON based service definition.
     * @param type Type of service being defined.
     */
    constructor(source: IAzureService = {} as IAzureService, type: ServiceTypes) {
        super(source, type);
    }
}
