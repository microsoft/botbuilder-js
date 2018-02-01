"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Export client
// // erxport { ConnectorClient } from './generated/connectorClient';
const ConnectorClient = require("./generated/connectorClient");
exports.ConnectorClient = ConnectorClient;
// Export Auth
__export(require("./auth"));
