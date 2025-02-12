// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TracingContext } from '@azure/core-tracing';
import { AbortSignalLike } from '@azure/abort-controller';
import { ProxySettings, TransferProgressEvent } from '@azure/core-rest-pipeline';
import { DeserializationContentTypes } from '@azure/core-client';
import {
    RequestPolicyFactory,
    HttpPipelineLogLevel,
    RequestPolicy as HttpClient,
    WebResourceLike,
    CompatResponse as HttpOperationResponse,
} from '@azure/core-http-compat';

/**
 * Represents an object or class with a `signRequest` method which will sign outgoing requests (for example, by setting the `Authorization` header).
 */
export interface ServiceClientCredentials {
    /**
     * Signs a request with the Authentication header.
     *
     * @param webResource - The WebResourceLike/request to be signed.
     * @returns The signed request object;
     */
    signRequest(webResource: WebResourceLike): Promise<WebResourceLike>;
}

/**
 * The flattened response to a REST call.
 * Contains the underlying {@link HttpOperationResponse} as well as
 * the merged properties of the `parsedBody`, `parsedHeaders`, etc.
 */
export interface RestResponse {
    /**
     * The underlying HTTP response containing both raw and deserialized response data.
     */
    _response: HttpOperationResponse;
    /**
     * The flattened properties described by the `OperationSpec`, deserialized from headers and the HTTP body.
     */
    [key: string]: any;
}

/**
 * Options to govern behavior of xml parser and builder.
 */
interface SerializerOptions {
    /**
     * indicates the name of the root element in the resulting XML when building XML.
     */
    rootName?: string;
    /**
     * indicates whether the root element is to be included or not in the output when parsing XML.
     */
    includeRoot?: boolean;
    /**
     * key used to access the XML value content when parsing XML.
     */
    xmlCharKey?: string;
}

/**
 * Describes the base structure of the options object that will be used in every operation.
 */
export interface RequestOptionsBase {
    /**
     * will be applied before the request is sent.
     */
    customHeaders?: {
        [key: string]: string;
    };
    /**
     * Signal of an abort controller. Can be used to abort both sending a network request and waiting for a response.
     */
    abortSignal?: AbortSignalLike;
    /**
     * The number of milliseconds a request can take before automatically being terminated.
     * If the request is terminated, an `AbortError` is thrown.
     */
    timeout?: number;
    /**
     * Callback which fires upon upload progress.
     */
    onUploadProgress?: (progress: TransferProgressEvent) => void;
    /**
     * Callback which fires upon download progress.
     */
    onDownloadProgress?: (progress: TransferProgressEvent) => void;
    /**
     * Whether or not the HttpOperationResponse should be deserialized. If this is undefined, then the
     * HttpOperationResponse should be deserialized.
     */
    shouldDeserialize?: boolean | ((response: HttpOperationResponse) => boolean);
    /**
     * Tracing: Context used when creating spans.
     */
    tracingContext?: TracingContext;
    /**
     * May contain other properties.
     */
    [key: string]: any;
    /**
     * Options to override XML parsing/building behavior.
     */
    serializerOptions?: SerializerOptions;
}

export interface ServiceClientOptions {
    /**
     * (Optional) baseUri will be set automatically within BotFrameworkAdapter,
     * but is required if using the ConnectorClient outside of the adapter.
     */
    baseUri?: string;
    /**
     * An array of factories which get called to create the RequestPolicy pipeline used to send a HTTP
     * request on the wire, or a function that takes in the defaultRequestPolicyFactories and returns
     * the requestPolicyFactories that will be used.
     */
    requestPolicyFactories?:
        | RequestPolicyFactory[]
        | ((defaultRequestPolicyFactories: RequestPolicyFactory[]) => void | RequestPolicyFactory[]);
    /**
     * The HttpClient that will be used to send HTTP requests.
     */
    httpClient?: HttpClient;
    /**
     * The HttpPipelineLogger that can be used to debug RequestPolicies within the HTTP pipeline.
     */
    httpPipelineLogger?: HttpPipelineLogger;
    /**
     * If set to true, turn off the default retry policy.
     */
    noRetryPolicy?: boolean;
    /**
     * Gets or sets the retry timeout in seconds for AutomaticRPRegistration. Default value is 30.
     */
    rpRegistrationRetryTimeout?: number;
    /**
     * Whether or not to generate a client request ID header for each HTTP request.
     */
    generateClientRequestIdHeader?: boolean;
    /**
     * Whether to include credentials in CORS requests in the browser.
     * See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials for more information.
     */
    withCredentials?: boolean;
    /**
     * If specified, a GenerateRequestIdPolicy will be added to the HTTP pipeline that will add a
     * header to all outgoing requests with this header name and a random UUID as the request ID.
     */
    clientRequestIdHeaderName?: string;
    /**
     * The content-types that will be associated with JSON or XML serialization.
     */
    deserializationContentTypes?: DeserializationContentTypes;
    /**
     * The header name to use for the telemetry header while sending the request. If this is not
     * specified, then "User-Agent" will be used when running on Node.js and "x-ms-useragent" will
     * be used when running in a browser.
     */
    userAgentHeaderName?: string | ((defaultUserAgentHeaderName: string) => string);
    /**
     * The string to be set to the telemetry header while sending the request, or a function that
     * takes in the default user-agent string and returns the user-agent string that will be used.
     */
    userAgent?: string | ((defaultUserAgent: string) => string);
    /**
     * Proxy settings which will be used for every HTTP request (Node.js only).
     */
    proxySettings?: ProxySettings;
    /**
     * If specified, will be used to build the BearerTokenAuthenticationPolicy.
     */
    credentialScopes?: string | string[];
}

export interface ServiceCallback<TResult> {
    /**
     * A method that will be invoked as a callback to a service function.
     *
     * @param err - The error occurred if any, while executing the request; otherwise null.
     * @param result - The deserialized response body if an error did not occur.
     * @param request - The raw/actual request sent to the server if an error did not occur.
     * @param response - The raw/actual response from the server if an error did not occur.
     */
    (err: Error | null, result?: TResult, request?: WebResourceLike, response?: HttpOperationResponse): void;
}

/**
 * A Logger that can be added to a HttpPipeline. This enables each RequestPolicy to log messages
 * that can be used for debugging purposes.
 */
export interface HttpPipelineLogger {
    /**
     * The log level threshold for what logs will be logged.
     */
    minimumLogLevel: HttpPipelineLogLevel;

    /**
     * Log the provided message.
     *
     * @param logLevel - The HttpLogDetailLevel associated with this message.
     * @param message - The message to log.
     */
    log(logLevel: HttpPipelineLogLevel, message: string): void;
}

/**
 * A collection of properties that apply to a single invocation of an operation.
 */
export interface OperationArguments {
    /**
     * The parameters that were passed to the operation method.
     */
    [parameterName: string]: any;
    /**
     * The optional arugments that are provided to an operation.
     */
    options?: RequestOptionsBase;
}
