/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IConnectedService, ServiceTypes } from '../schema';

/**
 * Base class for all connected service definitions.
 *
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class ConnectedService implements IConnectedService {
    /**
     * Unique Id for the service.
     */
    public id: string;

    /**
     * Friendly name for the service.
     */
    public name: string;

    /**
     * Creates a new ConnectedService instance.
     *
     * @param source (Optional) JSON based service definition.
     * @param type (Optional) type of service being defined.
     */
    public constructor(source: IConnectedService = {} as IConnectedService, public type?: ServiceTypes) {
        Object.assign(this, source);
        if (type) {
            this.type = type;
        }
    }

    /**
     * Creates a JSON based version of the model for saving to disk.
     *
     * @returns An IConnectedService JSON.
     */
    public toJSON(): IConnectedService {
        return <IConnectedService>Object.assign({}, this);
    }

    /**
     * Encrypt properties on this service.
     *
     * @param _secret Secret to use to encrypt the keys in this service.
     * @param _encryptString Function called to encrypt an individual value.
     */
    public encrypt(_secret: string, _encryptString: (value: string, secret: string) => string): void {
        // noop
    }

    /**
     * Decrypt properties on this service.
     *
     * @param _secret Secret to use to decrypt the keys in this service.
     * @param _decryptString Function called to decrypt an individual value.
     */
    public decrypt(_secret: string, _decryptString: (value: string, secret: string) => string): void {
        // noop
    }
}
