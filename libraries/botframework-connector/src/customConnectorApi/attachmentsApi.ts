/**
 * Microsoft Bot Connector API - v3.0
 * The Bot Connector REST API allows your bot to send and receive messages to channels configured in the  [Bot Framework Developer Portal](https://dev.botframework.com). The Connector service uses industry-standard REST  and JSON over HTTPS.    Client libraries for this REST API are available. See below for a list.    Many bots will use both the Bot Connector REST API and the associated [Bot State REST API](/en-us/restapi/state). The  Bot State REST API allows a bot to store and retrieve state associated with users and conversations.    Authentication for both the Bot Connector and Bot State REST APIs is accomplished with JWT Bearer tokens, and is  described in detail in the [Connector Authentication](/en-us/restapi/authentication) document.    # Client Libraries for the Bot Connector REST API    * [Bot Builder for C#](/en-us/csharp/builder/sdkreference/)  * [Bot Builder for Node.js](/en-us/node/builder/overview/)  * Generate your own from the [Connector API Swagger file](https://raw.githubusercontent.com/Microsoft/BotBuilder/master/CSharp/Library/Microsoft.Bot.Connector.Shared/Swagger/ConnectorAPI.json)    © 2016 Microsoft
 *
 * The version of the OpenAPI document: v3
 * Contact: botframework@microsoft.com
 */

import request = require('request');
import http = require('http');

import { RequestOptions, SimpleCredential, GetAttachmentResponse, GetAttachmentInfoResponse } from './interfaces';
import { ObjectSerializer, Authentication, VoidAuth } from './model/models';

let defaultBasePath = 'https://api.botframework.com';

export enum AttachmentsApiApiKeys {
}

export class AttachmentsApi {
    protected _basePath = defaultBasePath;
    protected defaultHeaders: any = {};
    protected _useQuerystring: boolean = false;
    protected credentials: SimpleCredential;

    protected authentications = {
        'default': <Authentication>new VoidAuth(),
    }

    constructor(CustomCredentials: SimpleCredential)
    constructor(CustomCredentials: SimpleCredential, basePath?: string) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (CustomCredentials) {
            this.credentials = new SimpleCredential(CustomCredentials.appId, CustomCredentials.appPassword);
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

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: AttachmentsApiApiKeys, value: string) {
        (this.authentications as any)[AttachmentsApiApiKeys[key]].apiKey = value;
    }

    /**
     * Get the named view as binary content
     * @summary GetAttachment
     * @param attachmentId attachment id
     * @param viewId View id from attachmentInfo
     */
    public async GetAttachment(attachmentId: string, viewId: string, options: RequestOptions): Promise<GetAttachmentResponse> {
        const localVarPath = this.basePath + '/v3/attachments/{attachmentId}/views/{viewId}'
            .replace('{' + 'attachmentId' + '}', encodeURIComponent(String(attachmentId)))
            .replace('{' + 'viewId' + '}', encodeURIComponent(String(viewId)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this.defaultHeaders);
        let localVarFormParams: any = {};

        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId == null) {
            throw new Error('Required parameter attachmentId was null or undefined when calling attachmentsGetAttachment.');
        }
        // verify required parameter 'viewId' is not null or undefined
        if (viewId == null) {
            throw new Error('Required parameter viewId was null or undefined when calling attachmentsGetAttachment.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;
        let localVarRequestOptions: request.Options = {
            method: 'GET',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            encoding: null,
        };

        this.authentications.default.applyToRequest(localVarRequestOptions);

        if (Object.keys(localVarFormParams).length) {
            localVarUseFormData ? (<any>localVarRequestOptions).formData = localVarFormParams : localVarRequestOptions.form = localVarFormParams;
        }

        return new Promise<GetAttachmentResponse>((resolve, reject) => {
            request(localVarRequestOptions, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    let _body: GetAttachmentResponse = ObjectSerializer.deserialize(response, "GetAttachmentResponse");
                    let _bodyAsText = ObjectSerializer.deserialize(response, "string");
                    let httpResponse: http.IncomingMessage = response;

                    if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                        let _response = Object.assign(httpResponse, { bodyAsText: _bodyAsText, parsedBody: _body });
                        let toReturn: GetAttachmentResponse = Object.assign(_body, { _response: _response });

                        resolve(toReturn);
                    } else {
                        let _response = Object.assign(httpResponse, { bodyAsText: _bodyAsText, parsedBody: _body });
                        let toReturn: GetAttachmentResponse = Object.assign(_body, { _response: _response });

                        reject(toReturn);
                    }
                }
            });
        });
    }

    /**
     * Get AttachmentInfo structure describing the attachment views
     * @summary GetAttachmentInfo
     * @param attachmentId attachment id
     */
    public async GetAttachmentInfo(attachmentId: string, options?: RequestOptions): Promise<GetAttachmentInfoResponse> {
        const localVarPath = this.basePath + '/v3/attachments/{attachmentId}'
            .replace('{' + 'attachmentId' + '}', encodeURIComponent(String(attachmentId)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this.defaultHeaders);
        let localVarFormParams: any = {};

        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId == null) {
            throw new Error('Required parameter attachmentId was null or undefined when calling attachmentsGetAttachmentInfo.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;
        let localVarRequestOptions: request.Options = {
            method: 'GET',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
        };

        this.authentications.default.applyToRequest(localVarRequestOptions);

        if (Object.keys(localVarFormParams).length) {
            if (localVarUseFormData) {
                (<any>localVarRequestOptions).formData = localVarFormParams;
            } else {
                localVarRequestOptions.form = localVarFormParams;
            }
        }

        return new Promise<GetAttachmentInfoResponse>((resolve, reject) => {
            request(localVarRequestOptions, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    let _body: GetAttachmentInfoResponse = ObjectSerializer.deserialize(response, "GetAttachmentInfoResponse");
                    let _bodyAsText = ObjectSerializer.deserialize(response, "string");
                    let httpResponse: http.IncomingMessage = response;

                    if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                        let _response = Object.assign(httpResponse, { bodyAsText: _bodyAsText, parsedBody: _body });
                        let toReturn: GetAttachmentInfoResponse = Object.assign(_body, { _response: _response });

                        resolve(toReturn);
                    } else {
                        let _response = Object.assign(httpResponse, { bodyAsText: _bodyAsText, parsedBody: _body });
                        let toReturn: GetAttachmentInfoResponse = Object.assign(_body, { _response: _response });

                        reject(toReturn);
                    }
                }
            });
        });
    }
}
