/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const tokenRegExp = /({\w+})/g;

/**
 * Replaces parameterized strings with the value from the
 * corresponding source object's property.
 *
 * @param parameterizedString {string} The String containing parameters represented by braces
 * @param sourceObj {*} The object containing the properties to transfer.
 * @returns {string} The string containing the replaced parameters from the source object.
 */
function insertParametersFromObject(parameterizedString, sourceObj) {
    let result;
    let payload = parameterizedString;
    while ((result = tokenRegExp.exec(parameterizedString))) {
        const token = result[1];
        const propertyName = token.replace(/[{}]/g, '');
        if (!(propertyName in sourceObj)) {
            continue;
        }
        payload = payload.replace(token, '' + sourceObj[propertyName]);
    }
    return payload;
}

module.exports = {insertParametersFromObject};
