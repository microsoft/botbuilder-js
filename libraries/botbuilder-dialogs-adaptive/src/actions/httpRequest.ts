/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import fetch from 'node-fetch';
import { Response, Headers } from 'node-fetch';
import { DialogTurnResult, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Converter } from 'botbuilder-dialogs-declarative';
import { Activity } from 'botbuilder-core';
import { ValueExpression, StringExpression, BoolExpression, EnumExpression } from 'adaptive-expressions';
import { JsonExtensions } from '../jsonExtensions';

export class HttpHeadersConverter implements Converter {
    public convert(value: object): { [key: string]: StringExpression } {
        const headers = {};
        for (const key in value) {
            headers[key] = new StringExpression(value[key]);
        }
        return headers;
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
    Binary
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
    DELETE = 'DELETE'
}

/**
 * Result data of HTTP operation.
 */
export class Result {
    /**
     * Initialize a new instance of Result class.
     * @param headers Response headers.
     */
    public constructor(headers?: Headers) {
        if (headers) {
            headers.forEach((value: string, name: string): void => {
                this.headers[name] = value;
            });
        }
    }

    /**
     * The status code from the response to HTTP operation.
     */
    public statusCode?: number;

    /**
     * The reason phrase from the response to HTTP operation.
     */
    public reasonPhrase?: string;

    /**
     * The headers from the response to HTTP operation.
     */
    public headers?: { [key: string]: string } = {};

    /**
     * The content body from the response to HTTP operation.
     */
    public content?: any;
}

export class HttpRequest<O extends object = {}> extends Dialog<O> implements Configurable {
    public constructor();
    public constructor(method: HttpMethod, url: string, headers: { [key: string]: string }, body: any);
    public constructor(method?: HttpMethod, url?: string, headers?: { [key: string]: string }, body?: any) {
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
    public method?: HttpMethod = HttpMethod.GET;

    /**
     * Content type of request body
     */
    public contentType?: StringExpression = new StringExpression('application/json');

    /**
     * Http Url
     */
    public url?: StringExpression;

    /**
     * Http Headers
     */
    public headers?: { [key: string]: StringExpression } = {};
    /**
     * Http Body
     */
    public body?: ValueExpression;

    /**
     * The response type of the response
     */
    public responseType?: EnumExpression<ResponsesTypes> = new EnumExpression<ResponsesTypes>(ResponsesTypes.Json);

    /**
     * Gets or sets the property expression to store the HTTP response in.
     */
    public resultProperty?: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const instanceUrl = this.url.getValue(dc.state);
        const instanceMethod = this.method.toString();

        const instanceHeaders = {};
        for (let key in this.headers) {
            if (key.toLowerCase() === 'Content-Type') {
                key = 'Content-Type';
            }
            instanceHeaders[key] = this.headers[key].getValue(dc.state);
        }
        const contentType = this.contentType.getValue(dc.state) || 'application/json';
        instanceHeaders['Content-Type'] = contentType;

        let instanceBody: string;
        if (this.body) {
            let body = this.body.getValue(dc.state);
            if (body) {
                if (typeof body === 'string') {
                    instanceBody = body;
                } else {
                    instanceBody = JSON.stringify(JsonExtensions.replaceJsonRecursively(dc.state, Object.assign({}, body)));
                }
            }
        }

        const traceInfo = {
            request: {
                method: instanceMethod,
                url: instanceUrl,
                headers: instanceHeaders,
                content: instanceBody
            },
            response: undefined
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
            case ResponsesTypes.Json:
                const content = await response.text();
                try {
                    result.content = JSON.parse(content);
                } catch {
                    result.content = content;
                }
                break;
            case ResponsesTypes.Binary:
                const buffer = await response.arrayBuffer();
                result.content = new Uint8Array(buffer);
                break;
            case ResponsesTypes.None:
            default:
                break;
        }

        traceInfo.response = result;

        // Write trace activity for http request and response values.
        await dc.context.sendTraceActivity('HttpRequest', traceInfo, 'Microsoft.HttpRequest', this.id);

        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }

        return await dc.endDialog(result);
    }

    protected onComputeId(): string {
        return `HttpRequest[${ this.method } ${ this.url }]`;
    }
}
