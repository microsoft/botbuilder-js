/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IGenericService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class GenericService extends ConnectedService implements IGenericService {
    public url = '';
    public configuration: { [key: string]: string } = {};

    constructor(source: IGenericService = {} as IGenericService) {
        super(source, ServiceTypes.Generic);
        const { url = '', configuration } = source;
        Object.assign(this, { configuration, url });
    }

    public toJSON(): IGenericService {
        let { id, type, name, url, configuration } = this;
        return { type, id, name, url, configuration };
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret:string) => string): void {
        if (this.configuration) {
            for (let prop in this.configuration) {
                this.configuration[prop] = encryptString(this.configuration[prop], secret);
            }
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret:string) => string): void {
        if (this.configuration) {
            for (let prop in this.configuration) {
                this.configuration[prop] = decryptString(this.configuration[prop], secret);
            }
        }
    }
}
