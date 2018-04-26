"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class EndpointService extends connectedService_1.ConnectedService {
    constructor(source) {
        super(source);
        this.type = schema_1.ServiceType.Endpoint;
        this.appId = '';
        this.appPassword = '';
        this.endpoint = '';
        const { appId = '', appPassword = '', endpoint = '' } = source;
        Object.assign(this, { appId, appPassword, endpoint });
    }
    toJSON() {
        let { appId = '', id = '', appPassword = '', endpoint = '', name = '' } = this;
        if (!id) {
            id = appId;
        }
        return { appId, id, type: schema_1.ServiceType.Endpoint, appPassword, endpoint, name };
    }
}
exports.EndpointService = EndpointService;
//# sourceMappingURL=endpointService.js.map