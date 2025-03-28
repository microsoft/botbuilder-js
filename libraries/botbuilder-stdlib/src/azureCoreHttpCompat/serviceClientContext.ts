/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ServiceClient,
    OperationSpec,
    OperationArguments as OperationArgumentsPipeline,
    OperationRequestOptions,
} from '@azure/core-client';
import { convertHttpClient, createRequestPolicyFactoryPolicy } from '@azure/core-http-compat';
import { toCompatResponse } from './response';
import { PipelineRequest, PipelinePolicy, createHttpHeaders } from '@azure/core-rest-pipeline';
import {
    ServiceCallback,
    ServiceClientCredentials,
    ServiceClientOptions,
    OperationArguments,
    HttpOperationResponse,
    createWebResource,
    RestResponse,
} from './compat';

/**
 * Compat implementation between @azure/core-http and @azure/core-client.
 */
export class ServiceClientContext {
    /**
     * If specified, this is the base URI that requests will be made against for this ServiceClient.
     * If it is not specified, then all OperationSpecs must contain a baseUrl property.
     */
    protected baseUri?: string;
    /**
     * The default request content type for the service.
     * Used if no requestContentType is present on an OperationSpec.
     */
    protected requestContentType?: string;

    private options: ServiceClientOptions;
    private client: ServiceClient;
    private readonly _requestPolicyFactories: PipelinePolicy[] = [];

    credentials: ServiceClientCredentials;

    // Protects against JSON.stringify leaking secrets
    protected toJSON(): unknown {
        return { name: this.constructor.name };
    }

    /**
     * Initializes a new instance of the ConnectorClientContext class.
     *
     * @param credentials Subscription credentials which uniquely identify client subscription.
     * @param [options] The parameter options
     */
    constructor(credentials: ServiceClientCredentials, options: ServiceClientOptions = {}) {
        if (credentials === null || credentials === undefined) {
            throw new Error("'credentials' cannot be null.");
        }

        if (!options) {
            options = {};
        }

        const requestContentType =
            options.deserializationContentTypes?.json?.join(' ') ||
            options.deserializationContentTypes?.xml?.join(' ') ||
            'application/json; charset=utf-8';

        const userAgentPrefix =
            (typeof options.userAgent === 'function' ? options.userAgent('') : options.userAgent) || '';

        const {
            baseUri: endpoint,
            proxySettings: proxyOptions,
            httpClient,
            credentialScopes,
            requestPolicyFactories,
        } = options;

        // do something with noPolicy option.
        this.client = new ServiceClient({
            endpoint,
            requestContentType,
            userAgentOptions: { userAgentPrefix },
            allowInsecureConnection: endpoint?.toLowerCase().startsWith('http:'),
            proxyOptions,
            httpClient: httpClient ? convertHttpClient(httpClient) : undefined,
            credentialScopes,
        });

        this.baseUri = endpoint;
        this.requestContentType = requestContentType;
        this.credentials = credentials;
        this.options = options;
        this._requestPolicyFactories = this.addPolicies(this.client, requestPolicyFactories);
    }

    /**
     * Send the provided httpRequest.
     *
     * @param request The HTTP request to send.
     * @returns The HTTP response.
     */
    async sendRequest(request: PipelineRequest): Promise<HttpOperationResponse> {
        if (!request) {
            throw new Error('request cannot be null');
        }

        const newRequest = await this.addRequestSettings(request);
        const response = await this.client.sendRequest(newRequest);
        return toCompatResponse(response);
    }

    /**
     * Send an HTTP request that is populated using the provided OperationSpec.
     *
     * @param operationArguments - The arguments that the HTTP request's templated values will be populated from.
     * @param operationSpec - The OperationSpec to use to populate the httpRequest.
     * @param callback - The callback to call when the response is received.
     * @returns The response object.
     */
    async sendOperationRequest(
        operationArguments: OperationArguments,
        operationSpec: OperationSpec,
        callback?: ServiceCallback<any>,
    ): Promise<RestResponse> {
        if (!operationArguments) {
            throw new Error('operationArguments cannot be null');
        }

        const {
            customHeaders,
            timeout,
            onDownloadProgress,
            onUploadProgress,
            shouldDeserialize,
            serializerOptions,
            tracingContext,
            ...restOptions
        } = operationArguments.options || {};

        let _response;
        const requestOptions: OperationRequestOptions = {};
        const operationArgumentPipeline: OperationArgumentsPipeline = {
            ...operationArguments,
            options: {
                ...restOptions,
                requestOptions,
                onResponse(rawResponse, flatResponse, error) {
                    _response = rawResponse;
                    const response = toCompatResponse(rawResponse);
                    callback?.(error as Error, flatResponse, response.request, response);
                },
            },
        };

        if (customHeaders) {
            requestOptions.customHeaders = customHeaders;
        }

        if (timeout) {
            requestOptions.timeout = timeout;
        }

        if (onDownloadProgress) {
            requestOptions.onDownloadProgress = onDownloadProgress;
        }

        if (onUploadProgress) {
            requestOptions.onUploadProgress = onUploadProgress;
        }

        if (shouldDeserialize) {
            requestOptions.shouldDeserialize = (response) => {
                if (typeof shouldDeserialize === 'function') {
                    return shouldDeserialize(toCompatResponse(response));
                } else if (typeof shouldDeserialize === 'boolean') {
                    return shouldDeserialize;
                }
                return true;
            };
        }

        if (serializerOptions) {
            operationArgumentPipeline.options!.serializerOptions = {
                xml: serializerOptions,
            };
        }

        if (tracingContext) {
            operationArgumentPipeline.options!.tracingOptions = {
                tracingContext,
            };
        }

        const result = await this.client.sendOperationRequest<RestResponse>(operationArgumentPipeline, operationSpec);

        Object.defineProperty(result, '_response', {
            value: _response,
        });

        return result;
    }

    private async addRequestSettings(request: PipelineRequest) {
        const webResource = createWebResource(request);
        await this.credentials.signRequest(webResource);
        const headers = createHttpHeaders({
            ...request.headers.toJSON({ preserveCase: true }),
            ...webResource.headers.toJson({ preserveCase: true }),
        });
        request.withCredentials = this.options?.withCredentials === true;
        request.headers = headers;
        return request;
    }

    private addPolicies(
        client: ServiceClient,
        policies: ServiceClientOptions['requestPolicyFactories'],
    ): PipelinePolicy[] {
        if (Array.isArray(policies)) {
            const policy = createRequestPolicyFactoryPolicy(policies);
            policy.name = 'ServiceClientContext_RequestPolicyFactories';
            client.pipeline.removePolicy(policy);
            client.pipeline.addPolicy(policy);
        } else if (typeof policies === 'function') {
            this.addPolicies(client, policies([]) || []);
        }

        this.client.pipeline.addPolicy({
            name: 'ServiceClientContext_Credentials_SignRequest',
            sendRequest: async (request, next) => {
                const newRequest = await this.addRequestSettings(request);
                return next(newRequest);
            },
        });

        return client.pipeline.getOrderedPolicies();
    }
}
