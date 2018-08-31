/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IDispatchService, ServiceTypes } from '../schema';
import { LuisService } from './luisService';

export class DispatchService extends LuisService implements IDispatchService {
    public serviceIds: string[] = [];

    constructor(source: IDispatchService = {} as IDispatchService) {
        super(source);
        this.type = ServiceTypes.Dispatch;
        const { id, appId = '', authoringKey = '', serviceIds = [], subscriptionKey = '', version = '', region = '' } = source;
        Object.assign(this, { id, appId, authoringKey, serviceIds, subscriptionKey, version, region });
    }

    public toJSON(): IDispatchService {
        const { type, id, appId, authoringKey, name, serviceIds, subscriptionKey, version, region } = this;

        return { type, id, name, appId, authoringKey, serviceIds, subscriptionKey, version, region };
    }
}
