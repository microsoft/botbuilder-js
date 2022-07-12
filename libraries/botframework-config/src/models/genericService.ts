/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IGenericService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines a generic service connection.
 *
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class GenericService extends ConnectedService implements IGenericService {
    /**
     * Deep link to service.
     */
    url: string;

    /**
     * Named/value configuration data.
     */
    configuration: { [key: string]: string };

    /**
     * Creates a new GenericService instance.
     *
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IGenericService = {} as IGenericService) {
        super(source, ServiceTypes.Generic);
    }

    /**
     * Encrypt properties on this service.
     *
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.configuration) {
            Object.keys(this.configuration).forEach((prop: string) => {
                this.configuration[prop] = encryptString(this.configuration[prop], secret);
            });
        }
    }

    /**
     * Decrypt properties on this service.
     *
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.configuration) {
            Object.keys(this.configuration).forEach((prop: string) => {
                this.configuration[prop] = decryptString(this.configuration[prop], secret);
            });
        }
    }
}
