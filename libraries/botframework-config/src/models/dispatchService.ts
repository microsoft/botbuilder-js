/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IDispatchService, ServiceTypes } from '../schema';
import { LuisService } from './luisService';

export class DispatchService extends LuisService implements IDispatchService {
    public serviceIds: string[];

    constructor(source: IDispatchService = {} as IDispatchService) {
        super(source, ServiceTypes.Dispatch);
        this.serviceIds = this.serviceIds || [];
    }

}
