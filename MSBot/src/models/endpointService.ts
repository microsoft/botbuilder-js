/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IEndpointService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class EndpointService extends ConnectedService implements IEndpointService {
    public readonly type = ServiceType.Endpoint;

    public appId = '';
    public appPassword = '';
    public endpoint = '';

    constructor(source: IEndpointService) {
        super(source);
        const { appId = '', appPassword = '', endpoint = '' } = source;
        this.id = endpoint;
        Object.assign(this, { appId, appPassword, endpoint });
    }

    public toJSON(): IEndpointService {
        const { appId = '', id = '', appPassword = '', endpoint = '', name = '' } = this;
        return { type: ServiceType.Endpoint, name, id: endpoint, appId, appPassword, endpoint };
    }
}
