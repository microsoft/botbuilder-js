/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var msRest = require("ms-rest-js");
var Mappers = require("./models/mappers");
exports.ConnectorMappers = Mappers;
var operations = require("./operations");
var packageName = "botframework-connector";
var packageVersion = "4.0.0";
var ConnectorClient = (function (_super) {
    __extends(ConnectorClient, _super);
    /**
     * @class
     * Initializes a new instance of the ConnectorClient class.
     * @constructor
     *
     * @param {msRest.ServiceClientCredentials} credentials - Subscription credentials which uniquely identify client subscription.
     *
     * @param {string} [baseUri] - The base URI of the service.
     *
     * @param {object} [options] - The parameter options
     *
     * @param {Array} [options.filters] - Filters to be added to the request pipeline
     *
     * @param {object} [options.requestOptions] - The request options. Detailed info can be found at
     * {@link https://github.github.io/fetch/#Request Options doc}
     *
     * @param {boolean} [options.noRetryPolicy] - If set to true, turn off default retry policy
     *
     */
    function ConnectorClient(credentials, baseUri, options) {
        if (credentials === null || credentials === undefined) {
            throw new Error('\'credentials\' cannot be null.');
        }
        if (!options)
            options = {};
        _super.call(this, credentials, options);
        this.baseUri = baseUri;
        as;
        string;
        if (!this.baseUri) {
            this.baseUri = 'https://api.botframework.com';
        }
        this.credentials = credentials;
        this.addUserAgentInfo(packageName + "/" + packageVersion);
        this.attachments = new operations.Attachments(this);
        this.conversations = new operations.Conversations(this);
        this.serializer = new msRest.Serializer(Mappers);
    }
    return ConnectorClient;
})(msRest.ServiceClient);
exports.ConnectorClient = ConnectorClient;
//# sourceMappingURL=connectorClient.js.map