/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ExpressionProperty, ExpressionPropertyValue } from '../expressionProperty';
import fetch, * as request from "node-fetch";
import { Activity } from 'botbuilder-core';

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

        /**
         * TODO: replace the key value pair in json recursively
         */
        const url = this.url.evaluate(this.id, dc.state);
        const body = this.body.evaluate(this.id, dc.state);
        const headers = this.headers.evaluate(this.id, dc.state);

        const response = await fetch(url, {
            method: this.method.toString(),
            headers: headers,
            body: body
        });

        const jsonResult = await response.json();

        let result: Result = {
            headers: this.headers,
            statusCode: response.status,
            reasonPhrase: response.statusText
        };

        switch (this.responseType) {
            case ResponsesTypes.Activity:
                result.content = jsonResult;
                dc.context.sendActivity(jsonResult as Activity);
                break;
            case ResponsesTypes.Activities:
                result.content = jsonResult;
                dc.context.sendActivities(jsonResult as Activity[]);
                break;
            case ResponsesTypes.Json:
                result.content = jsonResult;
                break;
            case ResponsesTypes.None:
            default:
                break;
        }

        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty, jsonResult);
        }

        return await dc.endDialog(jsonResult);
    }
}

export class Result {
    public statusCode?: Number;

    public reasonPhrase?: string;

    public headers?: any;

    public content?: object;
}