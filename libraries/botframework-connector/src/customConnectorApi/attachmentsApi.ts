/**
 * Microsoft Bot Connector API - v3.0
 * The Bot Connector REST API allows your bot to send and receive messages to channels configured in the  [Bot Framework Developer Portal](https://dev.botframework.com).
 * The Connector service uses industry-standard REST and JSON over HTTPS.
 * Client libraries for this REST API are available. See below for a list.
 * Many bots will use both the Bot Connector REST API and the associated [Bot State REST API](/en-us/restapi/state).
 * The Bot State REST API allows a bot to store and retrieve state associated with users and conversations. 
 * Authentication for both the Bot Connector and Bot State REST APIs is accomplished with JWT Bearer tokens, and is described in detail in the [Connector Authentication](/en-us/restapi/authentication) document.
 * # Client Libraries for the Bot Connector REST API
 * * [Bot Builder for C#](/en-us/csharp/builder/sdkreference/)
 * * [Bot Builder for Node.js](/en-us/node/builder/overview/)
 * * Generate your own from the [Connector API Swagger file](https://raw.githubusercontent.com/Microsoft/BotBuilder/master/CSharp/Library/Microsoft.Bot.Connector.Shared/Swagger/ConnectorAPI.json)
 * © 2016 Microsoft
 *
 * The version of the OpenAPI document: v3
 * Contact: botframework@microsoft.com
 */

import http = require('http');
import * as HttpStatus from 'http-status-codes';

import { ObjectSerializer, RequestOptions, GetAttachmentResponse, GetAttachmentInfoResponse } from './model/models';
import { CustomMicrosoftAppCredentials } from '../auth'

const fetch = (new Function('require', 'if (!this.hasOwnProperty("fetch")) { return require("node-fetch"); } else { return this.fetch; }'))(require);
let defaultBasePath = 'https://api.botframework.com';

export enum AttachmentsApiApiKeys {
}

export class AttachmentsApi {
    protected _basePath = defaultBasePath;
    protected defaultHeaders: any = {};
    protected _useQuerystring: boolean = false;
    protected credentials: CustomMicrosoftAppCredentials;

    constructor(CustomCredentials: CustomMicrosoftAppCredentials)
    constructor(CustomCredentials: CustomMicrosoftAppCredentials, basePath?: string) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (CustomCredentials) {
            this.credentials = CustomCredentials;
        }
    }

    set useQuerystring(value: boolean) {
        this._useQuerystring = value;
    }

    set basePath(basePath: string) {
        this._basePath = basePath;
    }

    get basePath() {
        return this._basePath;
    }

    /**
     * Get the named view as binary content
     * @summary GetAttachment
     * @param attachmentId attachment id
     * @param viewId View id from attachmentInfo
     */
    public async GetAttachment(attachmentId: string, viewId: string, options: RequestOptions): Promise<GetAttachmentResponse> {
        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId == null) {
            throw new Error('Required parameter attachmentId was null or undefined when calling attachmentsGetAttachment.');
        }
        // verify required parameter 'viewId' is not null or undefined
        if (viewId == null) {
            throw new Error('Required parameter viewId was null or undefined when calling attachmentsGetAttachment.');
        }

        const path = this.basePath + '/v3/attachments/{attachmentId}/views/{viewId}'
            .replace('{' + 'attachmentId' + '}', encodeURIComponent(String(attachmentId)))
            .replace('{' + 'viewId' + '}', encodeURIComponent(String(viewId)));
        let queryParameters: any = {};
        let headerParams: any = Object.assign({}, this.defaultHeaders);
        let formParams: any = {};
        let url = new URL(path);
        let useFormData = false;
        let requestOptions = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: path,
            useQuerystring: this._useQuerystring,
            encoding: null,
            proxy: options.proxyOptions
        };

        Object.keys(queryParameters).forEach(key => url.searchParams.append(key, queryParameters[key]));
        Object.assign(headerParams, options.headers);
                
        if (Object.keys(formParams).length) {
            useFormData ? requestOptions['formData'] = formParams : requestOptions['form'] = formParams;
        }

        await this.credentials.signRequest(requestOptions);

        return await this.deserializeResponse<GetAttachmentResponse>(url, requestOptions, 'GetAttachmentResponse');
    }

    /**
     * Get AttachmentInfo structure describing the attachment views
     * @summary GetAttachmentInfo
     * @param attachmentId attachment id
     */
    public async GetAttachmentInfo(attachmentId: string, options?: RequestOptions): Promise<GetAttachmentInfoResponse> {
        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId == null) {
            throw new Error('Required parameter attachmentId was null or undefined when calling attachmentsGetAttachmentInfo.');
        }

        const path = this.basePath + '/v3/attachments/{attachmentId}'
            .replace('{' + 'attachmentId' + '}', encodeURIComponent(String(attachmentId)));
        let queryParameters: any = {};
        let headerParams: any = Object.assign({}, this.defaultHeaders);
        let formParams: any = {};
        let url = new URL(path);
        let useFormData = false;
        let requestOptions = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: path,
            useQuerystring: this._useQuerystring,
            json: true,
            proxy: options.proxyOptions
        };

        Object.keys(queryParameters).forEach(key => url.searchParams.append(key, queryParameters[key]));
        Object.assign(headerParams, options.headers);

        if (Object.keys(formParams).length) {
            useFormData ? requestOptions['formData'] = formParams : requestOptions['form'] = formParams;
        }

        await this.credentials.signRequest(requestOptions);

        return await this.deserializeResponse<GetAttachmentInfoResponse>(url, requestOptions, 'GetAttachmentInfoResponse');
    }

    private async deserializeResponse<T>(url, requestOptions, type): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            fetch(url, requestOptions).then(response => {
                let _body: T = ObjectSerializer.deserialize(response, type);
                let _bodyAsText = ObjectSerializer.deserialize(response, "string");
                let httpResponse: http.IncomingMessage = response;

                if (response.status && response.status >= HttpStatus.OK && response.status < HttpStatus.MULTIPLE_CHOICES) {
                    response.json().then(result => {
                        let _response = Object.assign(httpResponse, { bodyAsText: _bodyAsText, parsedBody: _body });
                        let toReturn: T = _body == undefined ? Object.assign({ _response: _response }) : Object.assign(_body, { _response: _response });

                        resolve(toReturn);
                    });
                }
            });
        });
    }
}
