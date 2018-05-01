"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class FileService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.File;
        this.filePath = '';
        const { filePath = '' } = source;
        this.filePath = filePath;
    }
    toJSON() {
        const { name = '', id = '', filePath = '' } = this;
        return { name, id, filePath, type: schema_1.ServiceType.File };
    }
}
exports.FileService = FileService;
//# sourceMappingURL=fileService.js.map