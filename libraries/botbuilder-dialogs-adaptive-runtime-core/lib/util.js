"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = void 0;
// Necessary to help coerce `keyof T` keys to strings. Only used internally to this class.
exports.stringify = (k) => typeof k === 'string' ? k : k.toString();
//# sourceMappingURL=util.js.map