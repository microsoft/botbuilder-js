/**
 * @module wechat
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, AttachmentData } from "botbuilder-core";
import { WeChatAttachmentStorage } from "./weChatAttachmentStorage";
import { AccessTokenStorage } from "./accessTokenStorage";
import { AttachmentHash } from "./attachmentHash";
import { WeChatAccessToken, WeChatJsonResult, ResponseMessageTypes, Article, AccessTokenResult, UploadMediaResult, News, UploadTemporaryMediaResult, UploadPersistentMediaResult, MessageMenu, MediaTypes } from "./weChatSchema";
import { WebResource, HttpMethods, DefaultHttpClient } from "@azure/ms-rest-js";
import * as FormData from "form-data";

export class WeChatClient {
    private ApiHost: string = "https://api.weixin.qq.com";
    private Client = new DefaultHttpClient();
    private AppId: string;
    private AppSecret: string;
    private TokenStorage: AccessTokenStorage;
    private AttachmentStorage: WeChatAttachmentStorage;
    private AttachmentHash: AttachmentHash;

    /**
     * Creates an instance of we chat client.
     * @param appId
     * @param appSecret
     * @param storage
     * @param [attachmentHash]
     */
    constructor(appId: string, appSecret: string, storage: Storage) {
        this.AppId = appId;
        this.AppSecret = appSecret;
        this.TokenStorage = new AccessTokenStorage(storage);
        this.AttachmentStorage = new WeChatAttachmentStorage(storage);
        this.AttachmentHash = new AttachmentHash();
    }

    /**
     * Upload temporary graphic media.
     * @param newsList Graphic material list.
     * @param isTemporary If upload media as a temporary media.
     * @param timeout Upload temporary news timeout.
     * @returns  Result of upload a temporary news.
     */
    public async UploadNewsAsync(newsList: News[], isTemporary: boolean, timeout: number = 30000): Promise<UploadMediaResult> {
        const mediaHash = this.AttachmentHash.computerStringHash(JSON.stringify(newsList)) + isTemporary;
        const cacheResult = await this.AttachmentStorage.GetAsync(mediaHash);
        const accessToken = await this.GetAccessTokenAsync();
        const url = this.GetUploadNewsEndPoint(accessToken, isTemporary);
        if (cacheResult === undefined || cacheResult.Expired) {
            let data = {
                articles: newsList
            };
            let result = await this.SendHttpRequestAsync("POST", url, data, null, timeout);
            let uploadResult: any;
            if (isTemporary) {
                uploadResult = new UploadTemporaryMediaResult(result);
            } else {
                uploadResult = new UploadPersistentMediaResult(result);
            }

            await this.CheckAndUpdateAttachmentStorage(mediaHash, uploadResult);
            return uploadResult;
        }
        return cacheResult;
    }

    /**
     * Added other types of permanent material.
     * @param attachmentData Attachment data to be uploaded.
     * @param timeout Upload persistent media timeout.
     * @returns  Result of upload persistent media.
     */
    public async UploadNewsImageAsync(attachmentData: AttachmentData, timeout: number = 30000): Promise<UploadMediaResult> {
        const mediaHash = this.AttachmentHash.computerBytesHash(attachmentData.originalBase64);
        const cacheResult = await this.AttachmentStorage.GetAsync(mediaHash);
        if (cacheResult === undefined || cacheResult.Expired) {
            const accessToken = await this.GetAccessTokenAsync();
            const url = this.GetAcquireMediaUrlEndPoint(accessToken);
            const uploadResult = await this.ProcessUploadMediaAsync(attachmentData, url, false, timeout);
            await this.CheckAndUpdateAttachmentStorage(mediaHash, uploadResult);
            return uploadResult;
        }
        return cacheResult;
    }

    /**
     * Upload temporary media (originally uploaded media files api).
     * @param attachmentData attachment data to be uploaded.
     * @param isTemporary If upload media as a temporary media.
     * @param timeout Upload temporary media timeout.
     * @returns  Result of upload Temporary media.
     */
    public async UploadMediaAsync(attachmentData: AttachmentData, isTemporary: boolean, timeout: number = 30000): Promise<UploadMediaResult> {
        const mediaHash = this.AttachmentHash.computerBytesHash(attachmentData.originalBase64) + isTemporary;
        const cacheResult = await this.AttachmentStorage.GetAsync(mediaHash);
        const accessToken = await this.GetAccessTokenAsync();
        const url = this.GetUploadMediaEndPoint(accessToken, attachmentData.type, isTemporary);
        if (cacheResult === undefined || cacheResult.Expired) {
            let uploadResult = await this.ProcessUploadMediaAsync(attachmentData, url, isTemporary, timeout);
            await this.CheckAndUpdateAttachmentStorage(mediaHash, uploadResult);
            return uploadResult;
        }
        return cacheResult;
    }

    /**
     * Get media url from mediaId.
     * @param mediaId The media Id.
     * @returns  Url of the specific media.
     */
    public async GetMediaUrlAsync(mediaId: string): Promise<string> {
        var accessToken = await this.GetAccessTokenAsync();
        var mediaUrl = `${this.ApiHost}/cgi-bin/media/get?access_token=${accessToken}&media_id=${mediaId}`;
        return mediaUrl;
    }


    /**
     * Get access token used to call WeChat API.
     * @returns  Access token string.
     */
    public async GetAccessTokenAsync(): Promise<string> {
        var token = await this.TokenStorage.GetAsync(this.AppId);
        if (token === undefined || token.ExpireTime <= new Date(Date.now())) {
            var url = this.GetAccessTokenEndPoint(this.AppId, this.AppSecret);
            var result = await this.SendHttpRequestAsync("GET", url);
            var tokenResult = new AccessTokenResult(result);
            if (tokenResult.ErrorCode === undefined) {
                const token: WeChatAccessToken = {
                    AppId: this.AppId,
                    Secret: this.AppSecret,
                    ExpireTime: new Date(Date.now() + tokenResult.ExpireIn * 1000),
                    Token: tokenResult.Token
                };
                await this.TokenStorage.SaveAsync(this.AppId, token);
                return token.Token;
            } else {
                throw new Error("Acess Token is invalid.");
            }
        } else {
            return token.Token;
        }
    }

    /**
     * Send message to user through customer service message api.
     * @param data Message data.
     * @param timeout Send message to user timeout.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendMessageToUser(data: any, timeout: number = 10000): Promise<WeChatJsonResult> {
        var accessToken = await this.GetAccessTokenAsync();
        var url = this.GetMessageApiEndPoint(accessToken);
        var result = await this.SendHttpRequestAsync("POST", url, data, null, timeout);
        var sendResult = new WeChatJsonResult(result);
        if (sendResult.ErrorCode !== 0) {
            throw new Error(`${sendResult.ErrorMessage}`);
        }
        return sendResult;
    }

    public async SendHttpRequestAsync(method: HttpMethods, url: string, data: any = undefined, token: string = undefined, timeout: number = 10000): Promise<any> {
        var result = await this.MakeHttpRequestAsync(method, url, data, token, timeout);
        return result;
    }

    /**
     * All http request send to WeChat will be handled by this method.
     * @param method Http method.
     * @param url Request URL.
     * @param [data] Request data.
     * @param [token] Authentication token.
     * @param [timeout] Send http request timeout.
     * @returns Http response content.
     */
    private async MakeHttpRequestAsync(method: HttpMethods, url: string, data: any = undefined, token: string = undefined, timeout: number = 10000): Promise<any> {
        var requestMessage = new WebResource(url, method);
        if (!url.includes(this.ApiHost)) {
            requestMessage.streamResponseBody = true;
        }

        // requestMessage.timeout = timeout;
        if (data) {
            // TODO: find a way to handle form data array
            if (data instanceof FormData || Array.isArray(data)) {
                requestMessage.formData = data;
            } else {
                requestMessage.body = data;
            }
        }
        if (token) {
            requestMessage.headers.set("Bearer", token);
        }
        var response = await this.Client.sendRequest(requestMessage);
        if (response.bodyAsText) {
            return JSON.parse(response.bodyAsText);
        } else {
            return new Uint8Array(response.readableStreamBody.read() as Buffer);
        }
    }

    /**
     * Send Image message.
     * @param openId User's open id from WeChat.
     * @param mediaId Image media id.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendImageAsync(
        openId: string,
        mediaId: string,
        timeout: number = 10000,
        customerServiceAccount: string = undefined
    ): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Image,
                image: {
                    media_id: mediaId
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Image,
                image: {
                    media_id: mediaId
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send a graphic message (click to jump to the graphic message page) The number of the messages is limited to 8
     * note that if the number of graphics more then 8, there will be no response.
     * @param openId User's open id from WeChat.
     * @param mediaId Image media id.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendMPNewsAsync(
        openId: string,
        mediaId: string,
        timeout: number = 10000,
        customerServiceAccount: string = undefined
    ): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.MPNews,
                image: {
                    media_id: mediaId
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.MPNews,
                image: {
                    media_id: mediaId
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send music message to user.
     * @param openId User's open id from WeChat.
     * @param title Music Title, Not required.
     * @param description Not required.
     * @param musicUrl Music url send to user.
     * @param highQualityMusicUrl High-quality music link, wifi environment priority use this link to play music.
     * @param thumbMediaId Media id for thumbnail image.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendMusicAsync(
        openId: string,
        title: string,
        description: string,
        musicUrl: string,
        highQualityMusicUrl: string,
        thumbMediaId: string,
        timeout: number = 10000,
        customerServiceAccount: string = undefined
    ): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Music,
                music: {
                    title: title,
                    description: description,
                    musicurl: musicUrl,
                    hqmusicurl: highQualityMusicUrl,
                    thumb_media_id: thumbMediaId
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Music,
                music: {
                    title: title,
                    description: description,
                    musicurl: musicUrl,
                    hqmusicurl: highQualityMusicUrl,
                    thumb_media_id: thumbMediaId
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send graphic message to user.
     * @param openId User's open id from WeChat.
     * @param articles Article list will be sent to user.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendNewsAsync(
        openId: string,
        articles: Article[],
        timeout: number = 10000,
        customerServiceAccount: string = undefined
    ): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.News,
                news: {
                    articles: articles
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.News,
                news: {
                    articles: articles
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send text message to user.
     * @param openId User's open id from WeChat.
     * @param content Text message content.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendTextAsync(
        openId: string,
        content: string,
        timeout: number = 10000,
        customerServiceAccount: string = undefined
    ): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Text,
                text: {
                    content: content
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Text,
                text: {
                    content: content
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send a video message.
     * @param openId User's open id from WeChat.
     * @param mediaId Media id of the video.
     * @param title The title of the video.
     * @param description Video description.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @param thumbMeidaId Thumbnail image media id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendVideoAsync(
        openId: string,
        mediaId: string,
        title: string,
        description: string,
        timeout: number = 10000,
        customerServiceAccount: string = undefined,
        thumbMeidaId: string = undefined
    ): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Video,
                video: {
                    media_id: mediaId,
                    thumb_media_id: thumbMeidaId,
                    title: title,
                    description: description
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Video,
                video: {
                    media_id: mediaId,
                    thumb_media_id: thumbMeidaId,
                    title: title,
                    description: description
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send a voice message.
     * @param openId User's open id from WeChat.
     * @param mediaId Media id of the voice.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendVoiceAsync(openId: string, mediaId: string, timeout: number = 10000, customerServiceAccount: string = undefined): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Voice,
                image: {
                    media_id: mediaId
                }
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Voice,
                image: {
                    media_id: mediaId
                },
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Send a menu message.
     * @param openId User's open id from WeChat.
     * @param messageMenu Message menu that need to be sent.
     * @param timeout Send message operation timeout.
     * @param customerServiceAccount Customer service account open id.
     * @returns  Standard result of calling WeChat message API.
     */
    public async SendMessageMenuAsync(openId: string, messageMenu: MessageMenu, timeout: number = 10000, customerServiceAccount: string = undefined): Promise<WeChatJsonResult> {
        var data: any;
        if (customerServiceAccount === undefined) {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.MessageMenu,
                msgmenu: messageMenu,
            };
        } else {
            data = {
                touser: openId,
                msgtype: ResponseMessageTypes.Voice,
                msgmenu: messageMenu,
                customservice: {
                    kf_account: customerServiceAccount
                }
            };
        }
        return await this.SendMessageToUser(data, timeout);
    }

    /**
     * Upload media data to WeChat.
     * @param attachmentData The attachment data need to be uploaded.
     * @param url The endpoint when upload the data.
     * @param isTemporaryMeida If upload media as a temporary media.
     * @param [timeout] Upload media timeout.
     * @returns Uploaded result from WeChat.
     */
    private async ProcessUploadMediaAsync(attachmentData: AttachmentData, url: string, isTemporaryMeida: boolean, timeout: number = 30000): Promise<UploadMediaResult> {
        try {
            var form = new FormData();
            form.append("file", Buffer.from(attachmentData.originalBase64), {
                contentType: attachmentData.type,
                filename: attachmentData.name,
            });
            if (!isTemporaryMeida && attachmentData.type.includes(MediaTypes.Video)) {
                // form.append()
            }
            var response = await this.SendHttpRequestAsync("POST", url, form, null, timeout);
            if (isTemporaryMeida) {
                return new UploadTemporaryMediaResult(response);
            } else {
                return new UploadPersistentMediaResult(response);
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * Check if upload media successful then update attachment storage.
     * @param mediaHash Hash value of the media.
     * @param uploadResult Upload media result.
     * @returns  Task of updating media.
     */
    private async CheckAndUpdateAttachmentStorage(
        mediaHash: string,
        uploadResult: UploadMediaResult
    ) {
        if (uploadResult.ErrorCode === 0) {
            await this.AttachmentStorage.SaveAsync(mediaHash, uploadResult);
        } else {
            throw new Error("Upload media to WeChat failed.");
        }
    }

    /**
     * Private method to get access token endpoint.
     */
    private GetAccessTokenEndPoint(appId: string, appSecret: string) {
        return `${this.ApiHost}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    }

    /**
     * Private method to get message api endpoint.
     */
    private GetMessageApiEndPoint(accessToken: string) {
        return `${this.ApiHost}/cgi-bin/message/custom/send?access_token=${accessToken}`;
    }

    /**
     * Private method to get upload media endpoint.
     */
    private GetUploadMediaEndPoint(
        accessToken: string,
        type: string,
        isTemporaryMeida: boolean
    ) {
        if (isTemporaryMeida) {
            return `${this.ApiHost}/cgi-bin/media/upload?access_token=${accessToken}&type=${type}`;
        }
        return `${this.ApiHost}/cgi-bin/material/add_material?access_token=${accessToken}&type=${type};`;
    }

    /**
     * Private method to get upload news endpoint.
     */
    private GetUploadNewsEndPoint(accessToken: string, isTemporary: boolean) {
        if (isTemporary) {
            return `${this.ApiHost}/cgi-bin/media/uploadnews?access_token=${accessToken}`;
        }
        return `${this.ApiHost}/cgi-bin/material/add_news?access_token=${accessToken}`;
    }

    private GetAcquireMediaUrlEndPoint(accessToken: string) {
        return `${this.ApiHost}/cgi-bin/media/uploadimg?access_token=${accessToken}`;
    }
}
