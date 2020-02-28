/**
 * @module botbuilder-core
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 /**
  * Internal interface representing the WebResource from @azure/ms-rest-js@1.2.6
  */
export interface WebResource {}

export interface AppCredentialsProvider {
    signRequest(webResource: WebResource): Promise<WebResource>;
}