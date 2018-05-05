/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ILuisService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class LuisService extends ConnectedService implements ILuisService {
    public readonly type = ServiceType.Luis;
    public appId = '';
    public authoringKey = '';
    public subscriptionKey = '';
    public versionId = '';

    constructor(source: ILuisService = {} as ILuisService) {
        super(source);
        const { appId = '', authoringKey = '', subscriptionKey = '', versionId = '' } = source;
        Object.assign(this, { appId, authoringKey, subscriptionKey, versionId });
    }

    public toJSON(): ILuisService {
        const { appId, authoringKey, id, name, subscriptionKey, type, versionId } = this;
        return { id, type, name, versionId, appId, authoringKey, subscriptionKey };
    }
}
