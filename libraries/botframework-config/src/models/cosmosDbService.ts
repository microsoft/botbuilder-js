/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ICosmosDBService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

/**
 * Defines a CosmosDB service connection.
 */
export class CosmosDbService extends AzureService implements ICosmosDBService {
    /**
     * Endpoint/uri for CosmosDB.
     */
    public endpoint: string;

    /**
     * Key for accessing CosmosDB.
     */
    public key: string;

    /**
     * Database name.
     */
    public database: string;

    /**
     * Collection name.
     */
    public collection: string;

    /**
     * Creates a new CosmosDBService instance.
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: ICosmosDBService = {} as ICosmosDBService) {
        super(source, ServiceTypes.CosmosDB);
    }

    /**
     * Encrypt properties on this service.
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.key && this.key.length > 0) {
            this.key = encryptString(this.key, secret);
        }
    }

    /**
     * Decrypt properties on this service.
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.key && this.key.length > 0) {
            this.key = decryptString(this.key, secret);
        }
    }
}
