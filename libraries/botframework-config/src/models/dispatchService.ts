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
        const { appId = '', authoringKey = '', serviceIds = [], subscriptionKey = '', version = '', region = '' } = source;
        this.id = appId;
        Object.assign(this, { appId, authoringKey, serviceIds, subscriptionKey, version, region });
    }

    public toJSON(): IDispatchService {
        const { appId, authoringKey, name, serviceIds, subscriptionKey, version, region } = this;
        return { type: ServiceTypes.Dispatch, id: appId, name, appId, authoringKey, serviceIds, subscriptionKey, version, region };
    }
}
