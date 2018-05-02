/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IConnectedService, ServiceType } from '../schema';

export abstract class ConnectedService implements IConnectedService {
    public id = '';
    public name = '';
    public abstract readonly type: ServiceType;

    protected constructor(source: IConnectedService = {} as IConnectedService) {
        const { id = '', name = '' } = source;
        Object.assign(this, { id, name });
    }

    public abstract toJSON(): IConnectedService;
}
