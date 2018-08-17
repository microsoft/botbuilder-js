/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IConnectedService, ServiceTypes } from '../schema';
export declare abstract class ConnectedService implements IConnectedService {
    id: string;
    name: string;
    abstract readonly type: ServiceTypes;
    protected constructor(source?: IConnectedService);
    abstract toJSON(): IConnectedService;
    abstract encrypt(secret: string): void;
    abstract decrypt(secret: string): void;
}
