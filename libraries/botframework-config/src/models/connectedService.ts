/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IConnectedService, ServiceTypes } from '../schema';

export class ConnectedService implements IConnectedService {
    public id: string;
    public name: string;

    public constructor(source: IConnectedService = {} as IConnectedService, public type?: ServiceTypes) {
        Object.assign(this, source);
        if (type) {
            this.type = type;
        }
    }

    public toJSON(): IConnectedService {
        return <IConnectedService>Object.assign({}, this);
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {

    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {

    }

}
