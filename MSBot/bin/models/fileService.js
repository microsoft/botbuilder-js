"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class FileService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.File;
        this.filePath = '';
        const { filePath = '' } = source;
        this.id = filePath;
        this.filePath = filePath;
    }
    toJSON() {
        const { name = '', id = '', filePath = '' } = this;
        return { type: schema_1.ServiceType.File, id: filePath, name, filePath, };
    }
}
exports.FileService = FileService;
//# sourceMappingURL=fileService.js.map