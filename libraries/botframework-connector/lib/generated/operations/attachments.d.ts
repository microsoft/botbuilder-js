/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as msRest from "ms-rest-js";
import * as Models from "botframework-schema";
import { ConnectorClient } from "../connectorClient";
/** Class representing a Attachments. */
export declare class Attachments {
    private readonly client;
    /**
     * Create a Attachments.
     * @param {ConnectorClient} client Reference to the service client.
     */
    constructor(client: ConnectorClient);
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
    getAttachmentInfoWithHttpOperationResponse(attachmentId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    getAttachmentWithHttpOperationResponse(attachmentId: string, viewId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
    /**
     * @summary GetAttachmentInfo
     *
     * Get AttachmentInfo structure describing the attachment views
     *
     * @param {string} attachmentId attachment id
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @param {ServiceCallback} callback - The callback.
     *
     * @returns {ServiceCallback} callback(err, result, request, response)
     *
     *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
     *
     *                      {Models.AttachmentInfo} [result]   - The deserialized result object if an error did not occur.
     *                      See {@link Models.AttachmentInfo} for more information.
     *
     *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
     *
     *                      {Response} [response] - The HTTP Response stream if an error did not occur.
     */
    getAttachmentInfo(attachmentId: string): Promise<Models.AttachmentInfo>;
    getAttachmentInfo(attachmentId: string, options: msRest.RequestOptionsBase): Promise<Models.AttachmentInfo>;
    getAttachmentInfo(attachmentId: string, callback: msRest.ServiceCallback<Models.AttachmentInfo>): void;
    getAttachmentInfo(attachmentId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.AttachmentInfo>): void;
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
     * @param {ServiceCallback} callback - The callback.
     *
     * @returns {ServiceCallback} callback(err, result, request, response)
     *
     *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
     *
     *                      {Response} [result]   - The deserialized result object if an error did not occur.
     *
     *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
     *
     *                      {Response} [response] - The HTTP Response stream if an error did not occur.
     */
    getAttachment(attachmentId: string, viewId: string): Promise<Response>;
    getAttachment(attachmentId: string, viewId: string, options: msRest.RequestOptionsBase): Promise<Response>;
    getAttachment(attachmentId: string, viewId: string, callback: msRest.ServiceCallback<Response>): void;
    getAttachment(attachmentId: string, viewId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Response>): void;
}
