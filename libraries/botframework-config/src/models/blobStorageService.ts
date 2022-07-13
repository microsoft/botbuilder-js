/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IBlobStorageService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

/**
 * Defines an blob storage service connection.
 *
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class BlobStorageService extends AzureService implements IBlobStorageService {
    /**
     * Connection string for blob storage.
     */
    connectionString: string;

    /**
     * (Optional) container name.
     */
    container: string;

    /**
     * Creates a new BlobStorageService instance.
     *
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IBlobStorageService = {} as IBlobStorageService) {
        super(source, ServiceTypes.BlobStorage);
    }

    /**
     * Encrypt properties on this service.
     *
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.connectionString && this.connectionString.length > 0) {
            this.connectionString = encryptString(this.connectionString, secret);
        }
    }

    /**
     * Decrypt properties on this service.
     *
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.connectionString && this.connectionString.length > 0) {
            this.connectionString = decryptString(this.connectionString, secret);
        }
    }
}
