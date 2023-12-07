/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceClient, ServiceClientCredentials, getDefaultUserAgentValue } from "@azure/core-http";
import * as Models from "./models";

const packageName = "botframework-connector";
const packageVersion = "4.0.0";

export class ConnectorClientContext extends ServiceClient {
  credentials: ServiceClientCredentials;

  /**
   * Initializes a new instance of the ConnectorClientContext class.
   * @param credentials Subscription credentials which uniquely identify client subscription.
   * @param [options] The parameter options
   */
  constructor(credentials: ServiceClientCredentials, options?: Models.ConnectorClientOptions) {
    if (credentials === null || credentials === undefined) {
      throw new Error('\'credentials\' cannot be null.');
    }

    if (!options) {
      // NOTE: autogen creates a {} which is invalid, it needs to be cast
      options = {} as Models.ConnectorClientOptions;
    }
    // TODO  This is to workaround fact that AddUserAgent() was removed.  
    const defaultUserAgent = getDefaultUserAgentValue();
    options.userAgent = `${packageName}/${packageVersion} ${defaultUserAgent} ${options.userAgent || ''}`;

    super(credentials, options);

    this.baseUri = options.baseUri || this.baseUri || "https://api.botframework.com";
    this.requestContentType = "application/json; charset=utf-8";
    this.credentials = credentials;

  }
}
