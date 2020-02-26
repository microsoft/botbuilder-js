/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const getNetServerConstructor = function() {
    const currentModule = module;
    const getNet = currentModule.require('net');
    const netServerCtor = getNet.Server;
    return netServerCtor;
}