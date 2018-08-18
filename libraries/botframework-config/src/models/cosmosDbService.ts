/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { decryptString, encryptString } from '../encrypt';
import { ICosmosDBService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

export class CosmosDbService extends AzureService implements ICosmosDBService {
    public connectionString = '';
    public database = '';
    public collection = '';

    constructor(source: ICosmosDBService = {} as ICosmosDBService) {
        super(source, ServiceTypes.CosmosDB);
        const { connectionString = '', database = '', collection = '' } = source;
        Object.assign(this, { connectionString, database, collection });
    }

    public toJSON(): ICosmosDBService {
        let { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName, connectionString, database, collection } = this;
        return { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName, connectionString, database, collection };
    }

    // encrypt keys in service
    public encrypt(secret: string): void {
        if (this.connectionString && this.connectionString.length > 0)
            this.connectionString = encryptString(this.connectionString, secret);
    }

    // decrypt keys in service
    public decrypt(secret: string): void {
        if (this.connectionString && this.connectionString.length > 0)
            this.connectionString = decryptString(this.connectionString, secret);
    }
}
