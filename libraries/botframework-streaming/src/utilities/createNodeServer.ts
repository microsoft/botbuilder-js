/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 import { INodeServer, INodeSocket} from '../interfaces';

export const createNodeServer = function(callback?: (socket: INodeSocket) => void): INodeServer {
    if (callback && typeof callback !== 'function') {
        throw new TypeError(`Invalid callback; callback parameter must be a function to create Node 'net' Server.`);
    }

    return getNetServerConstructor()(callback);
}

export const getNetServerConstructor = function() {
    if (typeof require !== undefined) {
        return require('net').Server;
    }

    throw TypeError(`require is undefined. Must be in a Node module to require 'net' dynamically in order to fetch Server constructor.`)
}
