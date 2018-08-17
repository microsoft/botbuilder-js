/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IFileService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class FileService extends ConnectedService implements IFileService {
    readonly type: ServiceTypes;
    filePath: string;
    constructor(source?: IFileService);
    toJSON(): IFileService;
    encrypt(secret: string): void;
    decrypt(secret: string): void;
}
