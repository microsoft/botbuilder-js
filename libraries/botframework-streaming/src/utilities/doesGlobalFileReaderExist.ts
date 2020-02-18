/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const doesGlobalFileReaderExist = new Function('try {return typeof FileReader !== "undefined" && FileReader !== null;}catch(e){ return false;}');
