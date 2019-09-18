/**
 * @module wechat
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Activity, ActivityTypes, BotAdapter, ConversationReference, ResourceResponse, TurnContext } from 'botbuilder-core';
import { Storage } from 'botbuilder-core';
import { WeChatClient } from './weChatClient';
import { IRequestMessageBase, SecretInfo, IResponseMessageBase, ResponseMessageTypes, TextResponse, ImageResponse, NewsResponse, MusicResponse, MPNewsResponse, VideoResponse, VoiceResponse, UploadMediaResult, MessageMenuResponse } from './weChatSchema';
import { WeChatMessageMapper } from './weChatMessageMapper';
import * as xml2js from 'xml2js';
import { VerificationHelper } from './VerificationHelper';
import { MessageCryptography } from './messageCryptography';

/**
 * Express or Restify Request object.
 */
export interface WebRequest {
    body?: any;
    headers: any;
    on(event: string, ...args: any[]): any;
}

/**
 * Express or Restify Response object.
 */
export interface WebResponse {
    end(...args: any[]): any;
    send(body: any): any;
    status(status: number): any;
}

/**
 * Settings used to configure a `WeChatAdapter` instance.
 */
export interface WeChatAdapterSettings {
    AppId: string;
    AppSecret: string;
    Token: string;
    EncodingAESKey: string;
    UploadTemporaryMedia: boolean;
}

/**
 * Represents a adapter that can connect a bot to WeChat endpoint.
 */
export class WeChatAdapter extends BotAdapter {
    /**
     * Key to get all response from bot in a single turn.
     */
    private TurnResponseKey = 'turnResponse';

    private weChatMessageMapper: WeChatMessageMapper;
    private weChatClient: WeChatClient;
    protected readonly settings: WeChatAdapterSettings;

    /**
     * Creates an instance of we chat adapter.
     * @param storage
     * @param settings configuration settings for the adapter.
     */
    constructor(storage: Storage, settings: WeChatAdapterSettings) {
        super();
        this.settings = {
            AppId: '',
            AppSecret: '',
            Token: '',
            EncodingAESKey: '',
            UploadTemporaryMedia: undefined,
            ...settings
        };
        this.weChatClient = new WeChatClient(this.settings.AppId, this.settings.AppSecret, storage);
        this.weChatMessageMapper = new WeChatMessageMapper(this.weChatClient, this.settings.UploadTemporaryMedia);
    }

    /**
     * Resume a conversation with a user, possibly after some time has gone by.
     * @param reference A `ConversationReference` saved during a previous incoming activity.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     * @returns conversation
     */
    public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        const request: Partial<Activity> = TurnContext.applyConversationReference({ type: 'event', name: 'continueConversation' }, reference,true);
        const context: TurnContext = this.createContext(request);

        await this.runMiddleware(context, logic as any);
    }

    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }

    /**
     * Process the request from WeChat.
     * @param wechatRequest Request message entity from wechat.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     * @param passiveResponse Marked the message whether it needs passive reply or not.
     * @returns Response message entity.
     */
    public async ProcessWeChatRequest(wechatRequest: IRequestMessageBase, logic: (context: TurnContext) => Promise<any>, passiveResponse: boolean): Promise<any> {
        const activity = await this.weChatMessageMapper.ToConnectorMessage(wechatRequest);
        const context = new TurnContext(this, activity as Activity);
        const responses = new Map<string, Array<Activity>>();
        context.turnState.set(this.TurnResponseKey, responses);
        await this.runMiddleware(context, logic);
        const key = `${ activity.conversation.id }:${ activity.id }`;
        try {
            let activities: any;
            const test = responses.has(key);
            if (test) {
                activities = responses.get(key);
            } else {
                activities = new Array<Activity>();
            }
            const response = await this.ProcessBotResponse(activities, wechatRequest.FromUserName, passiveResponse);
            return response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Does not support by WeChat.
     */
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error('WeChat does not support deleting activities.');
    }

    /**
     * Does not support by WeChat.
     */
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('WeChat does not support updating activities.');
    }

    /**
     * Sends a set of outgoing activities to WeChat.
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     * @returns Response activities
     */
    public async sendActivities(context: TurnContext, activities: Activity[]): Promise<ResourceResponse[]> {
        const resourceResponses: ResourceResponse[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Activity = activities[i];

            switch (activity.type) {
                case ActivityTypes.Message:
                case ActivityTypes.EndOfConversation:
                    const conversation = activity.conversation;
                    const key = `${ conversation.id }:${ activity.replyToId }`;
                    const responses = context.turnState.get(this.TurnResponseKey);
                    if (responses.has(key)) {
                        responses.get(key).push(activity);
                    } else {
                        responses.set(key, [activity]);
                    }
                    break;
                default:
                    break;
            }
            const resourceResponse: ResourceResponse = {
                id: activity.id || ''
            };
            resourceResponses.push(resourceResponse);
        }
        return resourceResponses;
    }

    /**
     * Process the request from WeChat.
     * @param req The request sent from WeChat.
     * @param res Http response object of current request.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     * @param secretInfo Secret info for verify the request.
     * @param passiveResponse If using passvice response mode, if set to true, user can only get one reply.
     * @returns Process activity result.
     */
    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>, secretInfo: SecretInfo, passiveResponse: boolean): Promise<void> {
        if (req === undefined) {
            throw new Error(`ArgumentNullException - Request is invalid.`);
        }

        if (res === undefined) {
            throw new Error(`ArgumentNullException - Response is invalid.`);
        }

        if (logic === undefined) {
            throw new Error(`ArgumentNullException - Bot logic is invalid.`);
        }

        if (secretInfo === undefined) {
            throw new Error(`ArgumentNullException - Secret information is invalid.`);
        }

        if (!VerificationHelper.VerifySignature(secretInfo.Signature, secretInfo.Timestamp, secretInfo.Nonce, this.settings.Token)) {
            throw new Error('UnauthorizedAccessException - Signature verification failed');
        }

        secretInfo.Token = this.settings.Token;
        secretInfo.EncodingAesKey = this.settings.EncodingAESKey;
        secretInfo.AppId = this.settings.AppId;
        const weChatRequest = await parseRequest(req, secretInfo);

        try {
            if (!passiveResponse) {
                this.ProcessWeChatRequest(weChatRequest, logic, passiveResponse);
                // Return status
                res.status(200);
                res.end();
            } else {
                // TODO: Passive reply
            }
        } catch (err) {
            throw err;
        }
    }


    /**
     * Get the respone from bot for the wechat request.
     * @param activities List of bot activities.
     * @param openId User's open id from WeChat.
     * @param passiveResponse If using passvice response mode, if set to true, user can only get one reply.
     * @returns Bot response message.
     */
    private async ProcessBotResponse(activities: Activity[], openId: string, passiveResponse: boolean): Promise<any> {
        let response: any;
        for (const activity of activities) {
            if (activity !== undefined && activity.type === ActivityTypes.Message) {
                if (activity.channelData !== undefined) {
                    if (passiveResponse) {
                        response = activity.channelData;
                    } else {
                        await this.SendChannelDataToWeChat(activity.channelData);
                    }
                } else {
                    const responseList = (await this.weChatMessageMapper.ToWeChatMessage(activity)) as IResponseMessageBase[];
                    if (passiveResponse) {
                        response = responseList;
                    } else {
                        await this.SendMessageToWeChat(responseList, openId);
                    }
                }
            }
        }
        return response;
    }

    /**
     * Send raw channel data to WeChat.
     * @param channelData Raw channel data.
     * @returns  Task running result.
     */
    private async SendChannelDataToWeChat(channelData: any) {
        try {
            await this.weChatClient.SendMessageToUser(channelData);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Send response based on message type.
     * @param responseList Response message list.
     * @param openId User's open id from WeChat.
     * @returns  Task running result.
     */
    private async SendMessageToWeChat(responseList: IResponseMessageBase[], openId: string) {
        for (const response of responseList) {
            try {
                switch (response.MsgType) {
                    case ResponseMessageTypes.Text:
                        const textResponse = response as TextResponse;
                        await this.weChatClient.SendTextAsync(
                            openId,
                            textResponse.Content
                        );
                        break;
                    case ResponseMessageTypes.Image:
                        const imageResponse = response as ImageResponse;
                        await this.weChatClient.SendImageAsync(
                            openId,
                            imageResponse.image.MediaId
                        );
                        break;
                    case ResponseMessageTypes.News:
                        const newsResponse = response as NewsResponse;
                        await this.weChatClient.SendNewsAsync(
                            openId,
                            newsResponse.Articles
                        );
                        break;
                    case ResponseMessageTypes.Music:
                        const musicResponse = response as MusicResponse;
                        const music = musicResponse.Music;
                        await this.weChatClient.SendMusicAsync(
                            openId,
                            music.Title,
                            music.Description,
                            music.MusicUrl,
                            music.HQMusicUrl,
                            music.ThumbMediaId
                        );
                        break;
                    case ResponseMessageTypes.MPNews:
                        const mpnewsResponse = response as MPNewsResponse;
                        await this.weChatClient.SendMPNewsAsync(
                            openId,
                            mpnewsResponse.MediaId
                        );
                        break;
                    case ResponseMessageTypes.Video:
                        const videoRespones = response as VideoResponse;
                        const video = videoRespones.Video;
                        await this.weChatClient.SendVideoAsync(
                            openId,
                            video.MediaId,
                            video.Title,
                            video.Description
                        );
                        break;
                    case ResponseMessageTypes.Voice:
                        const voiceResponse = response as VoiceResponse;
                        await this.weChatClient.SendVoiceAsync(
                            openId,
                            voiceResponse.Voice.MediaId
                        );
                        break;
                    case ResponseMessageTypes.MessageMenu:
                        const menuResponse = response as MessageMenuResponse;
                        await this.weChatClient.SendMessageMenuAsync(openId, menuResponse.MessageMenu);
                    case ResponseMessageTypes.LocationMessage:
                    case ResponseMessageTypes.SuccessResponse:
                    case ResponseMessageTypes.Unknown:
                    case ResponseMessageTypes.NoResponse:
                    default:
                        break;
                }
            } catch (e) {
                throw e;
            }
        }
    }
}

/**
 * Parses request message
 * @private
 * @param req The request sent from WeChat.
 * @param secretInfo Secret info for decrypt message.
 */
async function parseRequest(req: WebRequest, secretInfo: SecretInfo): Promise<IRequestMessageBase> {
    const requestRaw = await parseXML(req.body);
    if (requestRaw.Encrypt === undefined) {
        return requestRaw;
    } else {
        const requestMessage = await parseXML(MessageCryptography.DecryptMessage(requestRaw, secretInfo));
        return requestMessage;
    }
}

/**
 * Parses xml string
 * @private
 * @param str xml string
 */
function parseXML(str: string): Promise<IRequestMessageBase> {
    const xmlParser = new xml2js.Parser({
        explicitArray: false,
        explicitCharkey: false,
        explicitRoot: false
    });
    return new Promise((resolve, reject) => {
        if (!str) {
            reject(new Error('Document is empty'));
        } else {
            xmlParser.parseString(str, (err?: Error, res?: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }
    });
}
