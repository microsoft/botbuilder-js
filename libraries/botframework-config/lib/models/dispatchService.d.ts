/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IDispatchService } from '../schema';
import { LuisService } from './luisService';
export declare class DispatchService extends LuisService implements IDispatchService {
    serviceIds: string[];
    constructor(source?: IDispatchService);
    toJSON(): IDispatchService;
}
