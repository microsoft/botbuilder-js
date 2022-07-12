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
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class FileService extends ConnectedService implements IFileService {
    /**
     * File path.
     */
    path: string;

    /**
     * Creates a new FileService instance.
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IFileService = {} as IFileService) {
        super(source, ServiceTypes.File);
    }

    /**
     * Encrypt properties on this service.
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        return;
    }

    /**
     * Decrypt properties on this service.
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
