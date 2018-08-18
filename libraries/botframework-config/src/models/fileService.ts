/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IFileService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class FileService extends ConnectedService implements IFileService {
    public readonly type = ServiceTypes.File;
    public filePath = '';

    constructor(source: IFileService = {} as IFileService) {
        super(source);
        const { filePath = '' } = source;
        this.id = filePath;
        this.filePath = filePath;
    }

    public toJSON(): IFileService {
        const { name = '', id = '', filePath = '' } = this;
        return { type: ServiceTypes.File, id: filePath, name, filePath, };
    }

    // encrypt keys in service
    public encrypt(secret: string): void {
    }

    // decrypt keys in service
    public decrypt(secret: string): void {
    }
}
