/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const doesGlobalServerExist = new Function('try {return typeof Server !== "undefined" && Server !== null;}catch(e){ return false;}');
