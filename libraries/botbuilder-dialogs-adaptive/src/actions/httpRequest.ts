/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StatusCodes } from 'botbuilder-core';
import fetch, { FetchError } from 'node-fetch';
import { Activity } from 'botbuilder';
import { BoolProperty, EnumProperty, StringProperty, UnknownProperty } from '../properties';
import { Response, Headers } from 'node-fetch';
import { evaluateExpression } from '../jsonExtensions';

import {
    BoolExpression,
    BoolExpressionConverter,
    EnumExpression,
    EnumExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    DialogContext,
    Dialog,
    DialogTurnResult,
    DialogConfiguration,
} from 'botbuilder-dialogs';

type HeadersInput = Record<string, string>;
type HeadersOutput = Record<string, StringExpression>;

/**
 * [HeadersInput](xref:botbuilder-dialogs-adaptive.HeadersInput) or [HeadersOutput](xref:botbuilder-dialogs-adaptive.HeadersOutput) to [HttpHeader](xref:botbuilder-dialogs-adaptive.HttpHeader) converter.
 */
class HttpHeadersConverter implements Converter<HeadersInput, HeadersOutput> {
    /**
     * Converts a [HeadersInput](xref:botbuilder-dialogs-adaptive.HeadersInput) or [HeadersOutput](xref:botbuilder-dialogs-adaptive.HeadersOutput) to [HttpHeader](xref:botbuilder-dialogs-adaptive.HttpHeader).
     *
     * @param value [HeadersInput](xref:botbuilder-dialogs-adaptive.HeadersInput) or [HeadersOutput](xref:botbuilder-dialogs-adaptive.HeadersOutput) to convert.
     * @returns The [HttpHeader](xref:botbuilder-dialogs-adaptive.HttpHeader).
     */
    convert(value: HeadersInput | HeadersOutput): HeadersOutput {
        return Object.entries(value).reduce((headers, [key, value]) => {
            return {
                ...headers,
                [key]: value instanceof StringExpression ? value : new StringExpression(value),
            };
        }, {});
    }
}

export enum ResponsesTypes {
    /**
     * No response expected
     */
    None,

    /**
     * Plain JSON response
     */
    Json,

    /**
     * JSON Activity object to send to the user
     */
    Activity,

    /**
     * Json Array of activity objects to send to the user
     */
    Activities,

    /**
     * Binary data parsing from http response content
     */
    Binary,
}

export enum HttpMethod {
    /**
     * Http GET
     */
    GET = 'GET',

    /**
     * Http POST
     */
    POST = 'POST',

    /**
     * Http PATCH
     */
    PATCH = 'PATCH',

    /**
     * Http PUT
     */
    PUT = 'PUT',

    /**
     * Http DELETE
     */
    DELETE = 'DELETE',
}

/**
 * Result data of HTTP operation.
 */
export class Result {
    /**
     * Initialize a new instance of Result class.
     *
     * @param headers Response headers.
     */
    constructor(headers?: Headers) {
        if (headers) {
            headers.forEach((value: string, name: string): void => {
                this.headers[name] = value;
            });
        }
    }

    /**
     * The status code from the response to HTTP operation.
     */
    statusCode?: number;

    /**
     * The reason phrase from the response to HTTP operation.
     */
    reasonPhrase?: string;

    /**
     * The headers from the response to HTTP operation.
     */
    headers?: { [key: string]: string } = {};

    /**
     * The content body from the response to HTTP operation.
     */
    content?: any;
}

export interface HttpRequestConfiguration extends DialogConfiguration {
    method?: HttpMethod;
    contentType?: StringProperty;
    url?: StringProperty;
    headers?: HeadersInput | HeadersOutput;
    body?: UnknownProperty;
    responseType?: EnumProperty<ResponsesTypes>;
    resultProperty: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Action for performing an `HttpRequest`.
 */
export class HttpRequest<O extends object = {}> extends Dialog<O> implements HttpRequestConfiguration {
    static $kind = 'Microsoft.HttpRequest';

    constructor();

    /**
     * Initializes a new instance of the [HttpRequest](xref:botbuilder-dialogs-adaptive.HttpRequest) class.
     *
     * @param method The [HttpMethod](xref:botbuilder-dialogs-adaptive.HttpMethod), for example POST, GET, DELETE or PUT.
     * @param url URL for the request.
     * @param headers The headers of the request.
     * @param body The raw body of the request.
     */
    constructor(method: HttpMethod, url: string, headers: { [key: string]: string }, body: any);

    /**
     * Initializes a new instance of the [HttpRequest](xref:botbuilder-dialogs-adaptive.HttpRequest) class.
     *
     * @param method Optional. The [HttpMethod](xref:botbuilder-dialogs-adaptive.HttpMethod), for example POST, GET, DELETE or PUT.
     * @param url Optional. URL for the request.
     * @param headers Optional. The headers of the request.
     * @param body Optional. The raw body of the request.
     */
    constructor(method?: HttpMethod, url?: string, headers?: { [key: string]: string }, body?: any) {
        super();
        this.method = method || HttpMethod.GET;
        this.url = new StringExpression(url);
        if (headers) {
            this.headers = {};
            for (const key in headers) {
                this.headers[key] = new StringExpression(headers[key]);
            }
        }
        this.body = new ValueExpression(body);
    }

    /**
     * Http Method
     */
    method?: HttpMethod = HttpMethod.GET;

    /**
     * Content type of request body
     */
    contentType?: StringExpression = new StringExpression('application/json');

    /**
     * Http Url
     */
    url?: StringExpression;

    /**
     * Http Headers
     */
    headers?: { [key: string]: StringExpression } = {};
    /**
     * Http Body
     */
    body?: ValueExpression;

    /**
     * The response type of the response
     */
    responseType?: EnumExpression<ResponsesTypes> = new EnumExpression<ResponsesTypes>(ResponsesTypes.Json);

    /**
     * Gets or sets the property expression to store the HTTP response in.
     */
    resultProperty: StringExpression = new StringExpression('turn.results');

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof HttpRequestConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'contentType':
                return new StringExpressionConverter();
            case 'url':
                return new StringExpressionConverter();
            case 'headers':
                return new HttpHeadersConverter();
            case 'body':
                return new ValueExpressionConverter();
            case 'responseType':
                return new EnumExpressionConverter<ResponsesTypes>(ResponsesTypes);
            case 'resultProperty':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const instanceUrl = this.url.getValue(dc.state);
        const instanceMethod = this.method.toString();

        const instanceHeaders = {};
        for (let key in this.headers) {
            if (key.toLowerCase() === 'content-type') {
                key = 'Content-Type';
            }
            instanceHeaders[key] = this.headers[key].getValue(dc.state);
        }
        const contentType = this.contentType.getValue(dc.state) || 'application/json';
        instanceHeaders['Content-Type'] = contentType;

        let instanceBody: string;
        let traceInfo;
        try {
            const body = evaluateExpression(dc.state, this.body);
            if (body) {
                if (typeof body === 'string') {
                    instanceBody = body;
                } else {
                    instanceBody = JSON.stringify(Object.assign({}, body));
                }
            }

            traceInfo = {
                request: {
                    method: instanceMethod,
                    url: instanceUrl,
                    headers: instanceHeaders,
                    content: instanceBody,
                },
                response: undefined,
            };

            let response: Response;

            switch (this.method) {
                case HttpMethod.DELETE:
                case HttpMethod.GET:
                    response = await fetch(instanceUrl, {
                        method: instanceMethod,
                        headers: instanceHeaders,
                    });
                    break;
                case HttpMethod.PUT:
                case HttpMethod.PATCH:
                case HttpMethod.POST:
                    response = await fetch(instanceUrl, {
                        method: instanceMethod,
                        headers: instanceHeaders,
                        body: instanceBody,
                    });
                    break;
            }

            const result = new Result(response.headers);
            result.statusCode = response.status;
            result.reasonPhrase = response.statusText;

            switch (this.responseType.getValue(dc.state)) {
                case ResponsesTypes.Activity:
                    result.content = await response.json();
                    dc.context.sendActivity(result.content as Activity);
                    break;
                case ResponsesTypes.Activities:
                    result.content = await response.json();
                    dc.context.sendActivities(result.content as Activity[]);
                    break;
                case ResponsesTypes.Json: {
                    const content = await response.text();
                    try {
                        result.content = JSON.parse(content);
                    } catch {
                        result.content = content;
                    }
                    break;
                }
                case ResponsesTypes.Binary: {
                    const buffer = await response.arrayBuffer();
                    result.content = new Uint8Array(buffer);
                    break;
                }
                case ResponsesTypes.None:
                default:
                    break;
            }

            return await this.endDialogWithResult(dc, result, traceInfo);
        } catch (err) {
            if (err instanceof FetchError) {
                const result = new Result();
                result.content = err.message;
                result.statusCode = StatusCodes.NOT_FOUND;
                return await this.endDialogWithResult(dc, result, traceInfo);
            } else {
                throw err;
            }
        }
    }

    /**
     * Writes Trace Activity for the http request and response values and returns the actionResult as the result of this operation.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param result Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @param traceInfo Trace information to be written.
     * @returns A `Promise` representing the asynchronous operation.
     */
    private async endDialogWithResult(dc: DialogContext, result: Result, traceInfo: any): Promise<DialogTurnResult> {
        traceInfo.response = result;

        // Write trace activity for http request and response values.
        await dc.context.sendTraceActivity('HttpRequest', traceInfo, 'Microsoft.HttpRequest', this.id);

        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }

        return await dc.endDialog(result);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `HttpRequest[${this.method} ${this.url}]`;
    }
}
