/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IFileService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines an file service connection.
 */
export class FileService extends ConnectedService implements IFileService {
    /**
     * File path.
     */
    public path: string;

    /**
     * Creates a new FileService instance.
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IFileService = {} as IFileService) {
        super(source, ServiceTypes.File);
    }

    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        return;
    }

    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
