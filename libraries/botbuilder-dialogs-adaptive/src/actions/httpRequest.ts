/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, DialogCommand, Dialog } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';
import { ExpressionProperty, ExpressionPropertyValue } from '../expressionProperty';
import * as rp from 'request-promise-native';

export interface HttpRequestConfiguration extends DialogConfiguration {

    method?: HttpMethod;

    valueType?: string;

    url?: string;

    headers?: object;

    body?: object;

    responseType?: ResponsesTypes;

    resultProperty?: string;
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
    Activities
}

export enum HttpMethod {
    /**
     * Http GET
     */
    GET,

    /**
     * Http POST
     */
    POST,

    /**
     * Http PATCH
     */
    PATCH,

    /**
     * Http PUT
     */
    PUT,

    /**
     * Http DELETE
     */
    DELETE
}

export class HttpRequest<O extends object = {}> extends Dialog<O> {

    /**
     * Http Method
     */
    public method?: HttpMethod;

    /**
     * Http Url
     */
    public url?: ExpressionProperty<string>;

    /**
     * Http Headers
     */
    public headers?: ExpressionProperty<any>;

    /**
     * Http Body
     */
    public body?: ExpressionProperty<any>;

    /**
     * The response type of the response
     */
    public responseType?: ResponsesTypes;

    /**
     * Gets or sets the property expression to store the HTTP response in.
     */
    public resultProperty?: string;

    constructor();
    constructor(method: HttpMethod, url: ExpressionPropertyValue<string>, headers: ExpressionPropertyValue<any>,
        body: ExpressionPropertyValue<any>,
        responseType: ResponsesTypes, resultProperty: string);
    constructor(method?: HttpMethod, url?: ExpressionPropertyValue<string>, headers?: ExpressionPropertyValue<any>,
        body?: ExpressionPropertyValue<any>,
        responseType?: ResponsesTypes, resultProperty?: string) {
        super();
        this.method = method;
        this.url = new ExpressionProperty(url);
        this.headers = new ExpressionProperty(headers);
        this.body = new ExpressionProperty(body);
        this.responseType = responseType;
        this.resultProperty = resultProperty;
    }

    protected onComputeId(): string {
        return `HttpRequest[${this.method} ${this.url}]`;
    }

    public configure(config: HttpRequestConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {

        const url = this.url.evaluate(this.id, dc.state);
        const body = this.body.evaluate(this.id, dc.state);
        const headers = this.headers.evaluate(this.id, dc.state);

        var options = {
            method: this.method.toString(),
            uri: url,
            body: body,
            headers: headers,
            json: true
        };

        var response = rp(url, options).promise;

        return await dc.endDialog(response);
    }
}
