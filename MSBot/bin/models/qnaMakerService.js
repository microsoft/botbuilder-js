"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class QnaMakerService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.QnA;
        this.id = '';
        this.kbid = '';
        this.name = '';
        this.subscriptionKey = '';
        const { kbid = '', name = '', subscriptionKey = '' } = source;
        Object.assign(this, { kbid, name, subscriptionKey });
    }
    toJSON() {
        let { kbid, id, name, subscriptionKey } = this;
        if (!id) {
            id = kbid;
        }
        return { kbid, name, type: schema_1.ServiceType.QnA, subscriptionKey, id };
    }
}
exports.QnaMakerService = QnaMakerService;
//# sourceMappingURL=qnaMakerService.js.map