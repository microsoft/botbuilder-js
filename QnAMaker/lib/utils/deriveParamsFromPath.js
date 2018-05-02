/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Derives required parameters from the
 * tokenized path
 *
 * @param {string} path The tokenized path
 * @returns {string[]} An array of named params
 */
module.exports = function deriveParamsFromPath(path) {
    const params = [];
    const reg = /(?:{)([\w]+)(?:})/g;
    let result;
    while ((result = reg.exec(path))) {
        params.push(result[1]);
    }
    return params;
};