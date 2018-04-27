"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class QnaMakerService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.QnA;
        this.id = '';
        this.name = '';
        this.kbId = '';
        this.subscriptionKey = '';
        this.hostname = '';
        this.endpointKey = '';
        const { kbId = '', name = '', subscriptionKey = '', endpointKey = '', hostname = '' } = source;
        Object.assign(this, { kbId, name, subscriptionKey, endpointKey, hostname });
    }
    toJSON() {
        let { kbId, id, name, subscriptionKey, endpointKey, hostname } = this;
        if (!id) {
            id = kbId;
        }
        return { kbId, name, type: schema_1.ServiceType.QnA, subscriptionKey, id, endpointKey, hostname };
    }
}
exports.QnaMakerService = QnaMakerService;
//# sourceMappingURL=qnaMakerService.js.map