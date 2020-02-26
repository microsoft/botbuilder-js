import { INodeSocket2 } from "../interfaces/INodeSocket2";

/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 // What type hint should I put, if not importing 'net'?
export const createNodeServer = function(callback?: (socket: INodeSocket2) => void) {
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

// require is NOT globally defined, therefore Function() cannot access require() 
// https://stackoverflow.com/questions/51164425/require-inside-new-function
// export const getNetServerConstructor = new Function(`if (typeof require !== undefined) { return require('net').Server; } throw new Error('Not in a Node environment. Must use Node in order to create a Node Server.')`);