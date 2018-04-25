"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConnectedService {
    constructor(source = {}) {
        this.id = '';
        this.name = '';
        const { id = '', name = '' } = source;
        Object.assign(this, { id, name });
    }
}
exports.ConnectedService = ConnectedService;
//# sourceMappingURL=connectedService.js.map