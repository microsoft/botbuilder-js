/**
 * @module botbuilder-planning
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
    None,
    Json,
    Activity,
    Activities
}

export enum HttpMethod {
    GET,
    POST,
    PATCH,
    PUT,
    DELETE
}

// export class Result {
//     constructor();
//     constructor(headers: object) {

//     }

//     public statusCode: number;

//     public re
// }

export class HttpRequest<O extends object = {}> extends Dialog<O> {

    public method?: HttpMethod;

    public url?: ExpressionProperty<string>;

    public headers?: ExpressionProperty<any>;

    public body?: ExpressionProperty<any>;

    public responseType?: ResponsesTypes;

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
        const headers = this.body.evaluate(this.id, dc.state);

        var options = {
            method: this.method.toString(),
            uri: url,
            body: body,
            json: true
        };

        var response = rp(url, options).promise;

        return await dc.endDialog(response);
    }
}
