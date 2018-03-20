/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var msRest = require("ms-rest-js");
var Models = require("botframework-schema");
var Mappers = require("../models/mappers");
var WebResource = msRest.WebResource;
/** Class representing a Attachments. */
var Attachments = (function () {
    /**
     * Create a Attachments.
     * @param {ConnectorClient} client Reference to the service client.
     */
    function Attachments(client) {
        this.readonly = client;
        /**
         * @summary GetAttachmentInfo
         *
         * Get AttachmentInfo structure describing the attachment views
         *
         * @param {string} attachmentId attachment id
         *
         * @param {RequestOptionsBase} [options] Optional Parameters.
         *
         * @returns {Promise} A promise is returned
         *
         * @resolve {HttpOperationResponse} - The deserialized result object.
         *
         * @reject {Error|ServiceError} - The error object.
         */
        this.async = getAttachmentInfoWithHttpOperationResponse(attachmentId, string, options ?  : msRest.RequestOptionsBase);
        /**
         * @summary GetAttachment
         *
         * Get the named view as binary content
         *
         * @param {string} attachmentId attachment id
         *
         * @param {string} viewId View id from attachmentInfo
         *
         * @param {RequestOptionsBase} [options] Optional Parameters.
         *
         * @returns {Promise} A promise is returned
         *
         * @resolve {HttpOperationResponse} - The deserialized result object.
         *
         * @reject {Error|ServiceError} - The error object.
         */
        this.async = getAttachmentWithHttpOperationResponse(attachmentId, string, viewId, string, options ?  : msRest.RequestOptionsBase);
        this.client = client;
    }
    Attachments.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (attachmentId === null || attachmentId === undefined || typeof attachmentId.valueOf() !== 'string') {
                throw new Error('attachmentId cannot be null or undefined and it must be of type string.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/attachments/{attachmentId}';
        requestUrl = requestUrl.replace('{attachmentId}', encodeURIComponent(attachmentId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'GET';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.AttachmentInfo;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b;
    };
    Attachments.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (attachmentId === null || attachmentId === undefined || typeof attachmentId.valueOf() !== 'string') {
                throw new Error('attachmentId cannot be null or undefined and it must be of type string.');
            }
            if (viewId === null || viewId === undefined || typeof viewId.valueOf() !== 'string') {
                throw new Error('viewId cannot be null or undefined and it must be of type string.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/attachments/{attachmentId}/views/{viewId}';
        requestUrl = requestUrl.replace('{attachmentId}', encodeURIComponent(attachmentId));
        requestUrl = requestUrl.replace('{viewId}', encodeURIComponent(viewId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'GET';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Send Request
        httpRequest.rawResponse = true;
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 301 && statusCode !== 302) {
                var error = new msRest.RestError("Unexpected status code: " + statusCode);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(operationRes);
        var _a;
    };
    Attachments.prototype.getAttachmentInfo = function (attachmentId, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.getAttachmentInfoWithHttpOperationResponse(attachmentId, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.AttachmentInfo);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.getAttachmentInfoWithHttpOperationResponse(attachmentId, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.AttachmentInfo;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Attachments.prototype.getAttachment = function (attachmentId, viewId, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.getAttachmentWithHttpOperationResponse(attachmentId, viewId, options).then(function (operationRes) {
                return Promise.resolve(operationRes.response);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.getAttachmentWithHttpOperationResponse(attachmentId, viewId, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.response;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    return Attachments;
})();
exports.Attachments = Attachments;
//# sourceMappingURL=attachments.js.map