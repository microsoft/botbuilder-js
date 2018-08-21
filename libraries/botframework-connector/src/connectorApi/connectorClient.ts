/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as msRest from "ms-rest-js";
import * as Models from "botframework-schema";
import * as Mappers from "./models/mappers";
import * as operations from "./operations";

const packageName = "botframework-connector";
const packageVersion = "4.0.0";

class ConnectorClient extends msRest.ServiceClient {
  credentials: msRest.ServiceClientCredentials;
  baseUri: string;

  // Operation groups
  attachments: operations.Attachments;
  conversations: operations.Conversations;
  serializer: msRest.Serializer;

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
  constructor(credentials: msRest.ServiceClientCredentials, baseUri?: string, options?: msRest.ServiceClientOptions) {
    if (credentials === null || credentials === undefined) {
      throw new Error('\'credentials\' cannot be null.');
    }

    if (!options) options = {};

    super(credentials, options);

    this.baseUri = baseUri as string;
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

export { ConnectorClient, Models as ConnectorModels, Mappers as ConnectorMappers };
