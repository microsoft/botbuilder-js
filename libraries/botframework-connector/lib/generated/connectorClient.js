"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const msRest = require("ms-rest-js");
const Models = require("botframework-schema");
exports.ConnectorModels = Models;
const Mappers = require("./models/mappers");
exports.ConnectorMappers = Mappers;
const operations = require("./operations");
const packageName = "botframework-connector";
const packageVersion = "4.0.0";
class ConnectorClient extends msRest.ServiceClient {
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
    constructor(credentials, baseUri, options) {
        if (credentials === null || credentials === undefined) {
            throw new Error('\'credentials\' cannot be null.');
        }
        if (!options)
            options = {};
        super(credentials, options);
        this.baseUri = baseUri;
        if (!this.baseUri) {
            this.baseUri = 'https://api.botframework.com';
        }
        this.credentials = credentials;
        this.addUserAgentInfo(`${packageName}/${packageVersion}`);
        this.attachments = new operations.Attachments(this);
        this.conversations = new operations.Conversations(this);
        this.serializer = new msRest.Serializer(Mappers);
    }
}
exports.ConnectorClient = ConnectorClient;
//# sourceMappingURL=connectorClient.js.map