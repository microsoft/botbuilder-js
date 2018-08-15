/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IConnectedService, ServiceTypes } from '../schema';
export declare abstract class ConnectedService implements IConnectedService {
    id: string;
    name: string;
    readonly abstract type: ServiceTypes;
    protected constructor(source?: IConnectedService);
    abstract toJSON(): IConnectedService;
    abstract encrypt(secret: string, iv?: string): void;
    abstract decrypt(secret: string, iv?: string): void;
}
