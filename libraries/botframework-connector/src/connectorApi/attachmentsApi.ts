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

import * as Model from 'botframework-schema';
import { MicrosoftAppCredentials } from '../auth'
import { ApiHelper } from '../apiHelper';

const fetch = (new Function('require', 'if (!this.hasOwnProperty("fetch")) { return require("node-fetch"); } else { return this.fetch; }'))(require);
let defaultBasePath = 'https://api.botframework.com';

export enum AttachmentsApiApiKeys {
}

export class AttachmentsApi {
    protected _basePath = defaultBasePath;
    protected _defaultHeaders: any = {};
    protected _useQuerystring: boolean = false;
    protected credentials: MicrosoftAppCredentials;

    constructor(CustomCredentials: MicrosoftAppCredentials)
    constructor(CustomCredentials: MicrosoftAppCredentials, basePath?: string) {
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

    set defaultHeaders(defaultHeaders: {}) {
        this._defaultHeaders = defaultHeaders;
    }

    /**
     * Get the named view as binary content
     * @summary GetAttachment
     * @param attachmentId attachment id
     * @param viewId View id from attachmentInfo
     */
    public async getAttachment(attachmentId: string, viewId: string, options: Model.RequestOptions = { headers: {} }): Promise<Model.GetAttachmentResponse> {
        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId == null) {
            throw new Error('Required parameter attachmentId was null or undefined when calling getAttachment.');
        }
        // verify required parameter 'viewId' is not null or undefined
        if (viewId == null) {
            throw new Error('Required parameter viewId was null or undefined when calling getAttachment.');
        }

        const path = this.basePath + '/v3/attachments/{attachmentId}/views/{viewId}'
            .replace('{' + 'attachmentId' + '}', encodeURIComponent(String(attachmentId)))
            .replace('{' + 'viewId' + '}', encodeURIComponent(String(viewId)));        
        let headerParams: any = Object.assign({}, this._defaultHeaders);
        let url = new URL(path);
        let requestOptions = {
            method: 'GET',
            headers: headerParams,
            uri: path,
            useQuerystring: this._useQuerystring,
            encoding: null,
            proxy: options.proxyOptions
        };        
        Object.assign(headerParams, options.headers);

        await this.credentials.signRequest(requestOptions);

        return new Promise<Model.GetAttachmentResponse>((resolve, reject) => {
            let httpResponse;
            fetch(url, requestOptions).then(response => {         
                httpResponse = response;
                return response.body
            }).then((body)=>{
                if (httpResponse.status &&  httpResponse.status >= HttpStatus.OK && httpResponse.status < HttpStatus.MULTIPLE_CHOICES) { 
                        let _body: Buffer = ApiHelper.deserialize(body, "Buffer");
                        let _bodyAsText: string = _body == undefined? "" : ApiHelper.deserialize(body, "string");                        
                        let _response = Object.assign(httpResponse, {bodyAsText: _bodyAsText, parsedBody: _body, readableStreamBody: _body});                        
                        let toReturn: Model.GetAttachmentResponse = _body == undefined? Object.assign( {_response: _response}) : Object.assign(_body, {_response: _response});

                        resolve(toReturn);                    
                } else {
                    let toReturn: Model.GetAttachmentResponse = Object.assign({_response: httpResponse});   
                    resolve(toReturn);
                }                
            });
        });
    }

    /**
     * Get AttachmentInfo structure describing the attachment views
     * @summary GetAttachmentInfo
     * @param attachmentId attachment id
     */
    public async getAttachmentInfo(attachmentId: string, options: Model.RequestOptions = { headers: {} }): Promise<Model.GetAttachmentInfoResponse> {
        // verify required parameter 'attachmentId' is not null or undefined
        if (attachmentId == null) {
            throw new Error('Required parameter attachmentId was null or undefined when calling getAttachmentInfo.');
        }

        const path = this.basePath + '/v3/attachments/{attachmentId}'
            .replace('{' + 'attachmentId' + '}', encodeURIComponent(String(attachmentId)));        
        
        let headerParams: any = Object.assign({}, this._defaultHeaders);    
        Object.assign(headerParams, options.headers);
        
        let url = new URL(path);
        let requestOptions = {
            method: 'GET',            
            headers: headerParams,
            uri: path,
            useQuerystring: this._useQuerystring,
            json: true,
            proxy: options.proxyOptions
        };
        
        await this.credentials.signRequest(requestOptions);

        return await ApiHelper.deserializeResponse<Model.GetAttachmentInfoResponse>(url, requestOptions);
    }
}
