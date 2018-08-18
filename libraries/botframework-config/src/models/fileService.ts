/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IFileService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class FileService extends ConnectedService implements IFileService {
    public filePath = '';

    constructor(source: IFileService = {} as IFileService) {
        super(source, ServiceTypes.File);
        const { filePath = '' } = source;
        this.filePath = filePath;
    }

    public toJSON(): IFileService {
        const { type, id, name = '', filePath = '' } = this;
        return { type, id, name, filePath, };
    }

    // encrypt keys in service
    public encrypt(secret: string): void {
    }

    // decrypt keys in service
    public decrypt(secret: string): void {
    }
}
