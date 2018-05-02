/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IDispatchService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class DispatchService extends ConnectedService implements IDispatchService {
    readonly type: ServiceType;
    appId: string;
    authoringKey: string;
    serviceIds: string[];
    subscriptionKey: string;
    version: string;
    constructor(source?: IDispatchService);
    toJSON(): IDispatchService;
}
