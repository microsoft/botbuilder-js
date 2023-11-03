/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceClient, ServiceClientCredentials, getDefaultUserAgentValue } from "@azure/core-http";
import * as Models from "./models";

const packageName = "botframework-Token";
const packageVersion = "4.0.0";

export class TokenApiClientContext extends ServiceClient {
  credentials: ServiceClientCredentials;

  // Protects against JSON.stringify leaking secrets
  private toJSON(): unknown {
    return { name: this.constructor.name };
  }

  /**
   * Initializes a new instance of the TokenApiClientContext class.
   * @param credentials Subscription credentials which uniquely identify client subscription.
   * @param [options] The parameter options
   */
  constructor(credentials: ServiceClientCredentials, options?: Models.TokenApiClientOptions) {
    if (credentials === null || credentials === undefined) {
      throw new Error('\'credentials\' cannot be null.');
    }

    if (!options) {
      options = {};
    }
    const defaultUserAgent = getDefaultUserAgentValue();
    options.userAgent = `${packageName}/${packageVersion} ${defaultUserAgent} ${options.userAgent || ''}`;

    super(credentials, options);

    this.baseUri = options.baseUri || this.baseUri || "https://token.botframework.com";
    this.requestContentType = "application/json; charset=utf-8";
    this.credentials = credentials;

  }
}
