/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IFileService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines an file service connection.
 *
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class FileService extends ConnectedService implements IFileService {
    /**
     * File path.
     */
    path: string;

    /**
     * Creates a new FileService instance.
     *
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IFileService = {} as IFileService) {
        super(source, ServiceTypes.File);
    }

    /**
     * Encrypt properties on this service.
     *
     * @param _secret Secret to use to encrypt.
     * @param _encryptString Function called to encrypt an individual value.
     */
    encrypt(_secret: string, _encryptString: (value: string, secret: string) => string): void {
        return;
    }

    /**
     * Decrypt properties on this service.
     *
     * @param _secret Secret to use to decrypt.
     * @param _decryptString Function called to decrypt an individual value.
     */
    decrypt(_secret: string, _decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
