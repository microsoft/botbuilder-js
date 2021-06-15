"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.noOpConfiguration = void 0;
/**
 * Useful for shimming BotComponents into ComponentRegistrations
 */
exports.noOpConfiguration = {
    get(_path) {
        return undefined;
    },
    set(_path, _value) {
        // no-op
    },
};
//# sourceMappingURL=configuration.js.map