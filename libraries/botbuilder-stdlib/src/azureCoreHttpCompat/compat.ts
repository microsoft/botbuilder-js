// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export * from './interfaces';

// Re-export only ProxySettings as it is the same as the deprecated core-http library.
export { ProxySettings } from '@azure/core-rest-pipeline';

// Re-export only WebResourceLike, CompatResponse, RequestPolicy as they are the same as the deprecated core-http library.
export {
    WebResourceLike,
    CompatResponse as HttpOperationResponse,
    RequestPolicy as HttpClient,
} from '@azure/core-http-compat';

// Re-export. Can't access the HttpHeaders directly from the @azure/core-http-compat package because it is not defined in the package.json 'exports' property.
export { HttpHeaders } from './util';

// Re-export only TokenCredential, isTokenCredential as they are the same as the deprecated core-http library.
export { TokenCredential, isTokenCredential } from '@azure/core-auth';

// Re-export these as they are the same as the deprecated core-http library.
export {
    createSerializer,
    OperationURLParameter,
    OperationQueryParameter,
    OperationSpec,
    CompositeMapper,
} from '@azure/core-client';

import { WebResourceLike } from '@azure/core-http-compat';
import { PipelineRequestOptions, createPipelineRequest } from '@azure/core-rest-pipeline';
import { toWebResourceLike } from './util';

/**
 * Creates a new WebResourceLike object from the provided resource.
 *
 * @param resource The resource to convert to a WebResourceLike object.
 * @returns A new WebResourceLike object.
 */
export function createWebResource(resource?: PipelineRequestOptions): WebResourceLike {
    return toWebResourceLike(createPipelineRequest(resource ?? { url: '' }));
}

/**
 * A set of constants used internally when processing requests.
 */
export const Constants = {
    /**
     * Defines constants for use with HTTP headers.
     */
    HeaderConstants: {
        /**
         * The Authorization header.
         */
        AUTHORIZATION: 'Authorization',
        AUTHORIZATION_SCHEME: 'Bearer',
    },
};
