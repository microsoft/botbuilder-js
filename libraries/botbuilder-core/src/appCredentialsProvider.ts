/**
 * @module botbuilder-core
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class WebResource { }

export interface AppCredentialsProvider {
    signRequest(webResource: WebResource): Promise<WebResource>;
}