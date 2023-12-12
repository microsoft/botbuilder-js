/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RequestOptionsBase, ServiceCallback, OperationSpec, Serializer } from "@azure/core-http";
import { ConnectorClientContext } from "../connectorClientContext";
import * as Models from "../models";
import * as Mappers from "../models/attachmentsMappers";
import * as Parameters from "../models/parameters";

/** Class representing a Attachments. */
export class Attachments {
  private readonly client: ConnectorClientContext;

  /**
   * Create a Attachments.
   * @param {ConnectorClientContext} client Reference to the service client.
   */
  constructor(client: ConnectorClientContext) {
    this.client = client;
  }

  /**
   * Get AttachmentInfo structure describing the attachment views
   * @summary GetAttachmentInfo
   * @param attachmentId attachment id
   * @param [options] The optional parameters
   * @returns Promise<Models.AttachmentsGetAttachmentInfoResponse>
   */
  getAttachmentInfo(attachmentId: string, options?: RequestOptionsBase): Promise<Models.AttachmentsGetAttachmentInfoResponse>;
  /**
   * @param attachmentId attachment id
   * @param callback The callback
   */
  getAttachmentInfo(attachmentId: string, callback: ServiceCallback<Models.AttachmentInfo>): void;
  /**
   * @param attachmentId attachment id
   * @param options The optional parameters
   * @param callback The callback
   */
  getAttachmentInfo(attachmentId: string, options: RequestOptionsBase, callback: ServiceCallback<Models.AttachmentInfo>): void;
  getAttachmentInfo(attachmentId: string, options?: RequestOptionsBase | ServiceCallback<Models.AttachmentInfo>, callback?: ServiceCallback<Models.AttachmentInfo>): Promise<Models.AttachmentsGetAttachmentInfoResponse> {
    return this.client.sendOperationRequest(
      {
        attachmentId,
        options
      },
      getAttachmentInfoOperationSpec,
      callback) as Promise<Models.AttachmentsGetAttachmentInfoResponse>;
  }

  /**
   * Get the named view as binary content
   * @summary GetAttachment
   * @param attachmentId attachment id
   * @param viewId View id from attachmentInfo
   * @param [options] The optional parameters
   * @returns Promise<Models.AttachmentsGetAttachmentResponse>
   */
  getAttachment(attachmentId: string, viewId: string, options?: RequestOptionsBase): Promise<Models.AttachmentsGetAttachmentResponse>;
  /**
   * @param attachmentId attachment id
   * @param viewId View id from attachmentInfo
   * @param callback The callback
   */
  getAttachment(attachmentId: string, viewId: string, callback: ServiceCallback<void>): void;
  /**
   * @param attachmentId attachment id
   * @param viewId View id from attachmentInfo
   * @param options The optional parameters
   * @param callback The callback
   */
  getAttachment(attachmentId: string, viewId: string, options: RequestOptionsBase, callback: ServiceCallback<void>): void;
  getAttachment(attachmentId: string, viewId: string, options?: RequestOptionsBase | ServiceCallback<void>, callback?: ServiceCallback<void>): Promise<Models.AttachmentsGetAttachmentResponse> {
    return this.client.sendOperationRequest(
      {
        attachmentId,
        viewId,
        options
      },
      getAttachmentOperationSpec,
      callback) as Promise<Models.AttachmentsGetAttachmentResponse>;
  }
}

// Operation Specifications
const serializer = new Serializer(Mappers);
const getAttachmentInfoOperationSpec: OperationSpec = {
  httpMethod: "GET",
  path: "v3/attachments/{attachmentId}",
  urlParameters: [
    Parameters.attachmentId
  ],
  responses: {
    200: {
      bodyMapper: Mappers.AttachmentInfo
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  serializer
};

const getAttachmentOperationSpec: OperationSpec = {
  httpMethod: "GET",
  path: "v3/attachments/{attachmentId}/views/{viewId}",
  urlParameters: [
    Parameters.attachmentId,
    Parameters.viewId
  ],
  responses: {
    200: {
      bodyMapper: {
        serializedName: "parsedResponse",
        type: {
          name: "Stream"
        }
      }
    },
    301: {},
    302: {},
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  serializer
};
