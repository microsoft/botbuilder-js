/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IDispatchService, ServiceTypes } from '../schema';
import { LuisService } from './luisService';

/**
 * Defines a dispatch service connection.
 */
export class DispatchService extends LuisService implements IDispatchService {
    /**
     * Service IDs that the dispatch model will dispatch across.
     */
    public serviceIds: string[];

    /**
     * Creates a new DispatchService instance.
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IDispatchService = {} as IDispatchService) {
        super(source, ServiceTypes.Dispatch);
        this.serviceIds = this.serviceIds || [];
    }

}
