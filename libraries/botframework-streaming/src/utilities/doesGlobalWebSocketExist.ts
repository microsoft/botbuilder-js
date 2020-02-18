/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const doesGlobalWebSocketExist = new Function('try {return typeof WebSocket !== "undefined" && WebSocket !== null;}catch(e){ return false;}');
