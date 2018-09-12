/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ICosmosDBService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

export class CosmosDbService extends AzureService implements ICosmosDBService {
    public endpoint: string;
    public key: string;
    public database: string;
    public collection: string;

    constructor(source: ICosmosDBService = {} as ICosmosDBService) {
        super(source, ServiceTypes.CosmosDB);
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.key && this.key.length > 0) {
            this.key = encryptString(this.key, secret);
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.key && this.key.length > 0) {
            this.key = decryptString(this.key, secret);
        }
    }
}
