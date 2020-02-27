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

    const server = getServerFactory()(callback);
    if (isNetServer(server)) return server;

    throw new TypeError(`Invalid server type. Could not create a Node Server with the given createNodeServer() arguments.`);
}

export const getServerFactory = function(): Function {
    if (typeof require !== undefined) {
        return require('net').Server;
    }

    throw TypeError(`require is undefined. Must be in a Node module to require 'net' dynamically in order to fetch Server factory.`)
}

function isNetServer(o: any): o is INodeServer {
    return (hasCloseMethod && hasListenMethod) ? true : false;
}

function hasCloseMethod(o: any): o is INodeServer {
    if (o.close && typeof o.close === 'function') return true;
}

function hasListenMethod(o: any): o is INodeServer {
    if(o.listen && typeof o.listen === 'function') return true;
}
