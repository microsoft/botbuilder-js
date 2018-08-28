/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IConnectedService, ServiceTypes } from '../schema';

export abstract class ConnectedService implements IConnectedService {
    public id: string = '';
    public name: string = '';

    protected constructor(source: IConnectedService = {} as IConnectedService, public type: ServiceTypes) {
        const { id = '', name = '' } = source;
        Object.assign(this, { type, id, name });
    }

    public abstract toJSON(): IConnectedService;

    // encrypt keys in service
    public abstract encrypt(secret: string, encryptString: (value: string, secret: string) => string): void;

    // decrypt keys in service
    public abstract decrypt(secret: string, decryptString: (value: string, secret: string) => string): void;

}
