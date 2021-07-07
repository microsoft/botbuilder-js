/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeServer, INodeSocket } from '../interfaces';

type ConnectionListener = (socket: INodeSocket) => void;

/**
 * Create a Node 'net' server
 *
 * @param callback Optional connection listener
 * @returns a Node 'net' server instance
 */
export function createNodeServer(callback?: ConnectionListener): INodeServer {
    if (callback && typeof callback !== 'function') {
        throw new TypeError("Invalid callback; callback parameter must be a function to create Node 'net' Server.");
    }

    const server = getServerFactory()(callback);
    if (!isNetServer(server)) {
        throw new Error("Unable to create Node 'net' server");
    }

    return server;
}

/**
 * Get a function that creates a Node 'net' server instance
 *
 * @returns a server factory function
 */
export function getServerFactory(): (callback?: ConnectionListener) => INodeServer {
    if (typeof require !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('net').Server;
    }

    throw TypeError(
        "require is undefined. Must be in a Node module to require 'net' dynamically in order to fetch Server factory."
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNetServer(o: any): o is INodeServer {
    return hasCloseMethod(o) && hasListenMethod(o);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasCloseMethod(o: any): o is INodeServer {
    return o.close && typeof o.close === 'function';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasListenMethod(o: any): o is INodeServer {
    return o.listen && typeof o.listen === 'function';
}
