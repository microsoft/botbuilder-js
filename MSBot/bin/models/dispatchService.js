"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class DispatchService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.Dispatch;
        this.appId = '';
        this.authoringKey = '';
        this.serviceIds = [];
        this.subscriptionKey = '';
        this.version = '';
        const { appId = '', authoringKey = '', serviceIds = [], subscriptionKey = '', version = '' } = source;
        Object.assign(this, { appId, authoringKey, serviceIds, subscriptionKey, version });
    }
    toJSON() {
        const { appId, id, authoringKey, name, serviceIds, subscriptionKey, version } = this;
        return { appId, id, authoringKey, name, serviceIds, subscriptionKey, type: schema_1.ServiceType.Dispatch, version };
    }
}
exports.DispatchService = DispatchService;
//# sourceMappingURL=dispatchService.js.map