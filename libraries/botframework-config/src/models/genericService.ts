/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IGenericService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class GenericService extends ConnectedService implements IGenericService {
    public url: string;
    public configuration: { [key: string]: string };

    constructor(source: IGenericService = {} as IGenericService) {
        super(source, ServiceTypes.Generic);
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        const that: GenericService = this;
        if (this.configuration) {
            Object.keys(this.configuration).forEach((prop: string) => {
                that.configuration[prop] = encryptString(that.configuration[prop], secret);
            });
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        const that: GenericService = this;
        if (this.configuration) {
            Object.keys(this.configuration).forEach((prop: string) => {
                that.configuration[prop] = decryptString(that.configuration[prop], secret);
            });
        }
    }
}
