/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as msRest from "ms-rest-js";
import * as Models from "botframework-schema";
import * as Mappers from "../models/mappers";
import { ConnectorClient } from "../connectorClient";

const WebResource = msRest.WebResource;

/** Class representing a Attachments. */
export class Attachments {
  private readonly client: ConnectorClient;
  /**
   * Create a Attachments.
   * @param {ConnectorClient} client Reference to the service client.
   */
  constructor(client: ConnectorClient) {
    this.client = client;
  }

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
  async getAttachmentInfoWithHttpOperationResponse(attachmentId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (attachmentId === null || attachmentId === undefined || typeof attachmentId.valueOf() !== 'string') {
        throw new Error('attachmentId cannot be null or undefined and it must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/attachments/{attachmentId}';
    requestUrl = requestUrl.replace('{attachmentId}', encodeURIComponent(attachmentId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.AttachmentInfo;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

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
  async getAttachmentWithHttpOperationResponse(attachmentId: string, viewId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (attachmentId === null || attachmentId === undefined || typeof attachmentId.valueOf() !== 'string') {
        throw new Error('attachmentId cannot be null or undefined and it must be of type string.');
      }
      if (viewId === null || viewId === undefined || typeof viewId.valueOf() !== 'string') {
        throw new Error('viewId cannot be null or undefined and it must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/attachments/{attachmentId}/views/{viewId}';
    requestUrl = requestUrl.replace('{attachmentId}', encodeURIComponent(attachmentId));
    requestUrl = requestUrl.replace('{viewId}', encodeURIComponent(viewId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    httpRequest.rawResponse = true;
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;

      if (statusCode !== 200 && statusCode !== 301 && statusCode !== 302) {
        let error = new msRest.RestError(`Unexpected status code: ${statusCode}`);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }

    } catch(error) {
      return Promise.reject(error);
    }

    return Promise.resolve(operationRes);
  }

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
  getAttachmentInfo(attachmentId: string, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.AttachmentInfo>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.AttachmentInfo>;
    if (!callback) {
      return this.getAttachmentInfoWithHttpOperationResponse(attachmentId, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.AttachmentInfo);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.getAttachmentInfoWithHttpOperationResponse(attachmentId, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.AttachmentInfo;
        return cb(err, result, data.request, data.response);
      });
    }
  }

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
  getAttachment(attachmentId: string, viewId: string, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Response>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Response>;
    if (!callback) {
      return this.getAttachmentWithHttpOperationResponse(attachmentId, viewId, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.response);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.getAttachmentWithHttpOperationResponse(attachmentId, viewId, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.response;
        return cb(err, result, data.request, data.response);
      });
    }
  }

}
