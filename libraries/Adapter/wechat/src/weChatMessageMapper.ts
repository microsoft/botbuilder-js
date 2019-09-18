/**
 * @module wechat
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { WeChatClient } from './weChatClient';
import { IResponseMessageBase, MenuItem, MessageMenu, MessageMenuResponse, ResponseMessageTypes, TextResponse, Music, MediaTypes, ResponseMessage, ImageResponse, VideoResponse, VoiceResponse, MusicResponse, Video, News, MPNewsResponse, Article, NewsResponse, IRequestMessageBase, RequestMessageTypes, RequestMessage, TextRequest, ImageRequest, VoiceRequest, VideoRequest, ShortVideoRequest, LocationRequest, LinkRequest } from './weChatSchema';
import { IActivity, IMessageActivity, ActivityTypes, CardAction, Attachment, MediaUrl, AttachmentData, HeroCard, CardImage, ThumbnailCard, SigninCard, ReceiptCard, Fact, ReceiptItem, OAuthCard, Activity, ChannelAccount, ConversationAccount, Entity, GeoCoordinates } from 'botbuilder-core';
import { AttachmentHelper } from './attachmentHelper';
import { CardFactory, AudioCard, VideoCard, AnimationCard } from 'botbuilder-core';

/**
 * WeChat massage mapper that can convert the message from a WeChat request to Activity or Activity to WeChat response.
 * @remarks
 * WeChat message mapper will help create the bot activity and WeChat response.
 * When deal with the media attachments or cards, mapper will upload the data first to aquire the acceptable media url.
 */
export class WeChatMessageMapper {
    private readonly weChatClient: WeChatClient;
    private readonly uploadTemporaryMedia: boolean;

    /**
     * Creates an instance of we chat message mapper.
     * @param wechatClient The WeChat client need to be used when need to call WeChat api, like upload media, etc.
     * @param uploadTemporaryMedia The upload media setting need to used by mapper.
     */
    constructor(wechatClient: WeChatClient, uploadTemporaryMedia: boolean) {
        this.weChatClient = wechatClient;
        this.uploadTemporaryMedia = uploadTemporaryMedia;
    }

    /**
     * Convert WeChat message to Activity.
     * @param wechatRequest WeChat request message.
     * @returns  Activity.
     */
    public async ToConnectorMessage(wechatRequest: IRequestMessageBase): Promise<IActivity> {
        const activity = CreateActivity(wechatRequest);
        let attachment: Attachment;
        switch (wechatRequest.MsgType) {
            case RequestMessageTypes.Text:
                const textRequest = wechatRequest as TextRequest;
                activity.text = textRequest.Content;
                break;
            case RequestMessageTypes.Image:
                const imageRequest = wechatRequest as ImageRequest;
                attachment = {
                    contentType: MediaTypes.Image,
                    contentUrl: imageRequest.PicUrl,
                };
                activity.attachments.push(attachment);
                break;
            case RequestMessageTypes.Voice:
                const voiceRequest = wechatRequest as VoiceRequest;
                activity.text = voiceRequest.Recognition;
                attachment = {
                    contentType: MediaTypes.Voice,
                    contentUrl: await this.weChatClient.GetMediaUrlAsync(voiceRequest.MediaId),
                };
                activity.attachments.push(attachment);
                break;
            case RequestMessageTypes.Video:
                const videoRequest = wechatRequest as VideoRequest;
                attachment = {
                    contentType: MediaTypes.Video,
                    contentUrl: await this.weChatClient.GetMediaUrlAsync(videoRequest.MediaId),
                    thumbnailUrl: await this.weChatClient.GetMediaUrlAsync(videoRequest.ThumbMediaId),
                };
                activity.attachments.push(attachment);
                break;
            case RequestMessageTypes.ShortVideo:
                const shortVideoRequest = wechatRequest as ShortVideoRequest;
                attachment = {
                    contentType: MediaTypes.Video,
                    contentUrl: await this.weChatClient.GetMediaUrlAsync(shortVideoRequest.MediaId),
                    thumbnailUrl: await this.weChatClient.GetMediaUrlAsync(shortVideoRequest.ThumbMediaId),
                };
                activity.attachments.push(attachment);
                break;
            case RequestMessageTypes.Location:
                const locationRequest = wechatRequest as LocationRequest;
                const geo: GeoCoordinates = {
                    name: locationRequest.Label,
                    latitude: locationRequest.Latitude,
                    longitude: locationRequest.Longtitude,
                    elevation: undefined,
                    type: undefined,
                };
                activity.entities.push(geo);
                break;
            case RequestMessageTypes.Link:
                const linkRequest = wechatRequest as LinkRequest;
                activity.text = linkRequest.Title + linkRequest.Url;
                activity.summary = linkRequest.Description;
                break;
        }
        return activity;
    }

    /**
     * Convert response message from Bot format to Wechat format.
     * @param activity message activity received from bot.
     * @returns  WeChat message list.
     */
    public async ToWeChatMessage(activity: IActivity): Promise<IResponseMessageBase[]> {
        try {
            let responseMessageList: IResponseMessageBase[] = [];
            if (activity.type === ActivityTypes.Message) {
                const messageActivity = activity as IMessageActivity;
                responseMessageList = responseMessageList.concat(CreateTextResponseFromMessageActivity(messageActivity));

                if (messageActivity.suggestedActions && messageActivity.suggestedActions.actions) {
                    responseMessageList = responseMessageList.concat(ProcessCardActions(messageActivity, messageActivity.suggestedActions.actions));
                }
                for (const attachment of (messageActivity.attachments || Array<Attachment>())) {
                    switch (attachment.contentType) {
                        // case CardFactory.contentTypes.adaptiveCard:
                        // TODO: AdaptiveCard
                        case CardFactory.contentTypes.animationCard:
                        case CardFactory.contentTypes.audioCard:
                        case CardFactory.contentTypes.videoCard:
                            responseMessageList = responseMessageList.concat(await this.ProcessMediaCardAsync(messageActivity, attachment));
                            break;
                        case CardFactory.contentTypes.heroCard:
                            responseMessageList = responseMessageList.concat(await this.ProcessHeroCardAsync(messageActivity, attachment));
                            break;
                        case CardFactory.contentTypes.thumbnailCard:
                            responseMessageList = responseMessageList.concat(ProcessThumbnailCard(messageActivity, attachment));
                            break;
                        case CardFactory.contentTypes.signinCard:
                            responseMessageList = responseMessageList.concat(ProcessSigninCard(messageActivity, attachment));
                            break;
                        case CardFactory.contentTypes.receiptCard:
                            responseMessageList = responseMessageList.concat(ProcessReceiptCard(messageActivity, attachment));
                            break;
                        case CardFactory.contentTypes.oauthCard:
                            responseMessageList = responseMessageList.concat(ProcessOAuthCard(messageActivity, attachment));
                            break;
                        default:
                            if (attachment && (attachment.contentUrl || attachment.content || attachment.thumbnailUrl)) {
                                responseMessageList = responseMessageList.concat(await this.ProcessAttachmentAsync(messageActivity, attachment));
                            }
                            break;
                    }
                }
            } else if (activity.type === ActivityTypes.Event) {
                // WeChat won't accept event type, just bypass.
            }
            return responseMessageList;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Process all types of general attachment.
     * @param activity The message activity.
     * @param attachment The attachment object need to be processed.
     * @returns  List of WeChat response message.
     */
    private async ProcessAttachmentAsync(activity: IMessageActivity, attachment: Attachment): Promise<IResponseMessageBase[]> {
        let messages: IResponseMessageBase[] = [];
        if (attachment.thumbnailUrl) {
            messages.push(await this.MediaContentToWeChatResponse(activity, attachment.name, attachment.thumbnailUrl, attachment.contentType));
        }
        if (attachment.contentUrl) {
            messages.push(await this.MediaContentToWeChatResponse(activity, attachment.name, attachment.contentUrl, attachment.contentType));
        }
        if (attachment.content && AttachmentHelper.IsUrl(attachment.content)) {
            messages.push(await this.MediaContentToWeChatResponse(activity, attachment.name, attachment.content, attachment.contentType));
        } else {
            if (attachment.content) {
                messages = messages.concat(GetMessages(activity, attachment.content as string));
            }
        }
        return messages;
    }

    /**
     * Convert hero card to WeChat response message.
     * @param activity Message activity from bot.
     * @param attachment The attachment object need to be processed.
     * @returns List of WeChat response message.
     */
    private async ProcessHeroCardAsync(activity: IMessageActivity, attachment: Attachment): Promise<IResponseMessageBase[]> {
        let messages: IResponseMessageBase[] = [];
        const heroCard = attachment.content as HeroCard;
        const news = await this.CreateNewsFromHeroCard(activity, heroCard);
        const uploadResult = await this.weChatClient.UploadNewsAsync([news], this.uploadTemporaryMedia);
        const mpnews = new MPNewsResponse(uploadResult.MediaId);
        SetCommenField(mpnews, activity);
        messages.push(mpnews);
        messages = messages.concat(ProcessCardActions(activity, heroCard.buttons));
        return messages;
    }

    private async CreateNewsFromHeroCard(activity: IMessageActivity, heroCard: HeroCard): Promise<News> {
        if (heroCard.tap === undefined) {
            throw new Error('Tap action is required.');
        }
        let count = '0';
        if (heroCard.images && heroCard.images.length > 0) {
            count = '1';
        }
        const news: News = {
            Author: activity.from.name,
            Description: heroCard.subtitle,
            Content: heroCard.text,
            Title: heroCard.title,
            ShowCoverPicture: count,
            ContentSourceUrl: heroCard.tap.value.toString(),
            ThumbMediaId: undefined,
            ThumbUrl: undefined,
        };
        for (const image of (heroCard.images || new Array<CardImage>())) {
            const mediaMessage = await this.MediaContentToWeChatResponse(activity, image.alt, image.url, MediaTypes.Image);
            news.ThumbMediaId = (mediaMessage as ImageResponse).image.MediaId;
            news.ThumbUrl = image.url;
        }
        return news;
    }

    /**
     * Upload media to WeChat and map to WeChat Response message.
     * @param activity message activity from bot.
     * @param name Media's name.
     * @param content Media content, can be a url or base64 string.
     * @param contentType Media content type.
     * @returns  WeChat response message.
     */
    private async MediaContentToWeChatResponse(activity: IMessageActivity, name: string, content: string, contentType: string): Promise<IResponseMessageBase> {
        const attachmentData = await this.CreateAttachmentDataAsync(name, content, contentType);
        const uploadResult = await this.weChatClient.UploadMediaAsync(attachmentData, this.uploadTemporaryMedia);
        return CreateMediaResponse(activity, uploadResult.MediaId, attachmentData.type);
    }

    /**
     * Convert three media card to WeChat response message.
     * @param activity Message activity from bot.
     * @param attachment The attachment object need to be processed.
     * @returns List of WeChat response message.
     */
    private async ProcessMediaCardAsync(activity: IMessageActivity, attachment: Attachment): Promise<IResponseMessageBase[]> {
        let messages: IResponseMessageBase[] = [];
        if (attachment.contentType === CardFactory.contentTypes.audioCard) {
            const audioCard = attachment.content as AudioCard;
            let body = audioCard.subtitle;
            body = AddLine(body, audioCard.text);
            const music: Music = {
                Title: audioCard.title,
                MusicUrl: audioCard.media[0].url,
                HQMusicUrl: audioCard.media[0].url,
                Description: body,
                ThumbMediaId: undefined,
            };
            if (audioCard.image && audioCard.image.url) {
                const responseList = await this.MediaContentToWeChatResponse(activity, audioCard.image.alt, audioCard.image.url, MediaTypes.Image);
                if (responseList instanceof ImageResponse) {
                    music.ThumbMediaId = responseList.image.MediaId;
                }
            }
            const musicResponse: MusicResponse = {
                CreateTime: Date.now(),
                FromUserName: activity.from.id,
                ToUserName: activity.recipient.id,
                Music: music,
                MsgType: ResponseMessageTypes.Music,
            };
            messages.push(musicResponse);
            messages = messages.concat(ProcessCardActions(activity, audioCard.buttons));
        }
        if (attachment.contentType === CardFactory.contentTypes.videoCard) {
            const videoCard = attachment.content as VideoCard;
            let body = videoCard.subtitle;
            body = AddLine(body, videoCard.text);
            let video: Video;
            if (videoCard.image && videoCard.image.url) {
                const responseList = await this.MediaContentToWeChatResponse(activity, videoCard.title, videoCard.media[0].url, MediaTypes.Video);
                if (responseList instanceof VideoResponse) {
                    video = new Video(responseList.Video.MediaId, videoCard.title, body);
                }
            }
            const videoResponse: VideoResponse = {
                CreateTime: Date.now(),
                FromUserName: activity.from.id,
                ToUserName: activity.recipient.id,
                Video: video,
                MsgType: ResponseMessageTypes.Video,
            };
            messages.push(videoResponse);
            messages = messages.concat(ProcessCardActions(activity, videoCard.buttons));
        }
        if (attachment.contentType === CardFactory.contentTypes.animationCard) {
            const animationCard = attachment.content as AnimationCard;
            let body = animationCard.title;
            body = AddLine(body, animationCard.subtitle);
            body = AddLine(body, animationCard.text);
            messages = messages.concat(GetMessages(activity, body));
            if (animationCard.image && animationCard.image.url) {
                messages.push(await this.MediaContentToWeChatResponse(activity, animationCard.image.alt, animationCard.image.url, MediaTypes.Image));
            }
            for (const mediaUrl of (animationCard.media || new Array<MediaUrl>())) {
                messages.push(await this.MediaContentToWeChatResponse(activity, mediaUrl.profile, mediaUrl.url, MediaTypes.Image));
            }
            messages = messages.concat(ProcessCardActions(activity, animationCard.buttons));
        }
        return messages;
    }

    /**
     * Create Attachment data object using the give parameters.
     * @param name Attachment name.
     * @param content Attachment content url.
     * @param contentType Attachment content type.
     * @returns  A valid AttachmentData instance.
     */
    private async CreateAttachmentDataAsync(name: string, content: string, contentType: string): Promise<AttachmentData> {
        if (contentType === undefined) {
            throw new Error('Content type can not be null.');
        }
        if (content === undefined) {
            throw new Error('Content url can not be null.');
        }
        let data: any;
        if (AttachmentHelper.IsUrl(content)) {
            data = await this.weChatClient.SendHttpRequestAsync('GET', content);
            name = name || newGuid();
            contentType = GetFixedMeidaType(contentType);
            const attachmentData: AttachmentData = {
                type: contentType,
                name: name,
                originalBase64: data,
                thumbnailBase64: data,
            };
            return attachmentData;
        } else {
            data = AttachmentHelper.DecodeBase64String(content);
            name = name || newGuid();
            contentType = GetFixedMeidaType(data.contentType);
            const attachmentData: AttachmentData = {
                type: contentType,
                name: name,
                originalBase64: data.base64,
                thumbnailBase64: data.base64,
            };
            return attachmentData;
        }
    }
}

/**
 * Create activtiy from WeChat request.
 * @private
 * @param wechatRequest WeChat request instance.
 * @returns A activity instance.
 */
function CreateActivity(wechatRequest: IRequestMessageBase): Activity {
    const recipient: ChannelAccount = {
        id: wechatRequest.ToUserName,
        name: 'Bot',
        role: 'bot',
    };
    const user: ChannelAccount = {
        id: wechatRequest.FromUserName,
        name: 'User',
        role: 'user',
    };
    const conversation: ConversationAccount = {
        isGroup: false,
        conversationType: undefined,
        tenantId: undefined,
        name: undefined,
        id: wechatRequest.FromUserName,
    };
    const activity: Activity = {
        channelId: 'wechat',
        recipient: recipient,
        from: user,
        serviceUrl: undefined,
        conversation: conversation,
        timestamp: new Date(Number(wechatRequest.CreateTime)),
        channelData: wechatRequest,
        attachments: new Array<Attachment>(),
        entities: new Array<Entity>(),
        localTimezone: undefined,
        callerId: undefined,
        type: undefined,
        text: undefined,
        label: undefined,
        valueType: undefined,
        listenFor: undefined,
    };
    if (wechatRequest.MsgType === RequestMessageTypes.Event) {
        activity.id = newGuid();
        activity.type = ActivityTypes.Message;
    } else {
        const request = wechatRequest as RequestMessage;
        activity.id = request.MsgId.toString();
        activity.type = ActivityTypes.Message;
    }
    return activity;
}

/**
 * Downgrade OAuthCard into text replies for low-fi channels.
 * @private
 * @param activity Message activity from bot.
 * @param attachment The attachment object need to be processed.
 * @returns List of WeChat response message.
 */
function ProcessOAuthCard(activity: IMessageActivity, attachment: Attachment): IResponseMessageBase[] {
    let messages: IResponseMessageBase[] = [];
    const oauthCard = attachment.content as OAuthCard;
    messages = messages.concat(GetMessages(activity, oauthCard.text));
    messages = messages.concat(ProcessCardActions(activity, oauthCard.buttons));
    return messages;
}

/**
 * Downgrade ReceiptCard into text replies for low-fi channels.
 * @private
 * @param activity Message activity from bot.
 * @param attachment The attachment object need to be processed.
 * @returns List of WeChat response message.
 */
function ProcessReceiptCard(activity: IMessageActivity, attachment: Attachment): IResponseMessageBase[] {
    let messages: IResponseMessageBase[] = [];
    const receiptCard = attachment.content as ReceiptCard;
    let body = receiptCard.title;
    for (const fact of (receiptCard.facts || new Array<Fact>())) {
        body = AddLine(body, `${ fact.key }: ${ fact.value }`);
    }
    for (const item of (receiptCard.items || new Array<ReceiptItem>())) {
        body = AddText(item.title, item.price);
        body = AddLine(body, item.subtitle);
        body = AddLine(body, item.text);
        messages = messages.concat(GetMessages(activity, body));
    }
    body = `Tax: ${ receiptCard.tax }`;
    body = AddLine(body, `Total: ${ receiptCard.total }`);
    messages = messages.concat(ProcessCardActions(activity, receiptCard.buttons));
    messages = messages.concat(GetMessages(activity, body));
    return messages;
}

/**
 * Process thumbnail card and return the WeChat response message.
 * @private
 * @param activity Message activity from bot.
 * @param attachment The attachment object need to be processed.
 * @returns List of WeChat response message.
 */
function ProcessThumbnailCard(activity: IMessageActivity, attachment: Attachment): IResponseMessageBase[] {
    let messages: IResponseMessageBase[] = [];
    const thumbnailCard = attachment.content as ThumbnailCard;
    let body = thumbnailCard.subtitle;
    body = AddLine(body, thumbnailCard.text);
    const article: Article = {
        title: thumbnailCard.title,
        description: body,
        url: thumbnailCard.tap? thumbnailCard.tap.value.toString() : undefined,
        picUrl: thumbnailCard.images ? thumbnailCard.images[0].url : undefined,
    };
    const newsResponse: NewsResponse = {
        Articles: [article],
        FromUserName: activity.from.id,
        ToUserName: activity.recipient.id,
        MsgType: ResponseMessageTypes.News,
        CreateTime: Date.now(),
        ArticleCount: 0,
    };
    newsResponse.ArticleCount = newsResponse.Articles.length;
    messages.push(newsResponse);
    messages = messages.concat(ProcessCardActions(activity, thumbnailCard.buttons));
    return messages;
}

/**
 * Downgrade SigninCard into text replies for low-fi channels.
 * @private
 * @param activity Message activity from bot.
 * @param attachment The attachment object need to be processed.
 * @returns List of WeChat response message.
 */
function ProcessSigninCard(activity: IMessageActivity, attachment: Attachment): IResponseMessageBase[] {
    let messages: IResponseMessageBase[] = [];
    const signinCard = attachment.content as SigninCard;
    messages = messages.concat(ProcessCardActions(activity, signinCard.buttons));
    const textResponse = CreateTextResponseFromMessageActivity(activity);
    textResponse.Content = signinCard.text;
    messages.push(textResponse);
    return messages;
}

/**
 * Gets text messages
 * @private
 * @param activity Message activity from bot.
 * @param text Text content.
 * @returns Response message list.
 */
function GetMessages(activity: IMessageActivity, text: string) {
    const messages: IResponseMessageBase[] = [];
    if (text === undefined) {
        return messages;
    }
    const textResponse = CreateTextResponseFromMessageActivity(activity);
    textResponse.Content = text;
    messages.push(textResponse);
    return messages;
}

/**
 * Get fixed media type before upload media to WeChat, ensure upload successful.
 * @private
 * @param type The type of the media, typically it should be a mime type.
 * @returns  The fixed media type WeChat supported.
 */
function GetFixedMeidaType(type: string): string {
    if (type.includes(MediaTypes.Image)) {
        type = MediaTypes.Image;
    }
    if (type.includes(MediaTypes.Video)) {
        type = MediaTypes.Video;
    }
    if (type.includes(MediaTypes.Voice)) {
        type = MediaTypes.Voice;
    }
    return type;
}

/**
 * Generate new guid
 * @private
 * @returns new guid
 */
function newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any) => {
        const r: number = Math.random() * 16 | 0;
        const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
}

/**
 * Create a media type response message using mediaId and acitivity.
 * @private
 * @param activity Activity from bot.
 * @param mediaId MediaId from WeChat.
 * @param type Media type.
 * @returns  Media resposne such as ImageResponse, etc.
 */
function CreateMediaResponse(activity: IActivity, mediaId: string, type: string): ResponseMessage {
    let response: ResponseMessage;
    if (type.includes(MediaTypes.Image)) {
        response = new ImageResponse(mediaId);
    }
    if (type.includes(MediaTypes.Video)) {
        response = new VideoResponse(mediaId);
    }
    if (type.includes(MediaTypes.Audio)) {
        response = new VoiceResponse(mediaId);
    }
    SetCommenField(response, activity);
    if (response === undefined) {
        throw new Error('The media type is not supported by Wechat');
    }
    return response;
}

/**
 * Set commen field in response message.
 * @private
 * @param responseMessage Response message need to be set.
 * @param activity Activity instance from bot.
 */
function SetCommenField(response: ResponseMessage, activity: IActivity) {
    response.FromUserName = activity.from.id;
    response.ToUserName = activity.recipient.id;
    response.CreateTime = activity.timestamp.valueOf() || Date.now();
}

/**
 * Add new line and append new text.
 * @private
 * @param text The origin text.
 * @param newText Text need to be attached.
 * @returns  Combined new text string.
 */
function AddLine(text: string, newText: string): string {
    if (newText === undefined) {
        return text;
    }

    if (text === undefined) {
        return newText;
    }

    return text + '\r\n' + newText;
}

/**
 * Add text break and append the new text.
 * @private
 * @param text The origin text.
 * @param newText Text need to be attached.
 * @returns  Combined new text string.
 */
function AddText(text: string, newText: string): string {
    if (newText === undefined) {
        return text;
    }

    if (text === undefined) {
        return newText;
    }

    return text + '  ' + newText;
}

/**
 * Convert all buttons in a message to text string for channels that can't display button.
 * @private
 * @param activity Message activity from bot.
 * @param actions CardAction list.
 * @returns  WeChatResponses converted from card actions.
 */
function ProcessCardActions(activity: IMessageActivity, actions: CardAction[]): IResponseMessageBase[] {
    const messages = new Array<IResponseMessageBase>();
    actions = actions || new Array<CardAction>();
    const menuItems = new Array<MenuItem>();
    let text: string;
    for (const action of actions) {
        const actionContent = action.title || action.displayText || action.text;
        if (action.value && !AttachmentHelper.IsUrl(action.value)) {
            const menuItem: MenuItem = {
                id: actionContent,
                content: action.value.toString(),
            };
            menuItems.push(menuItem);
        } else {
            text = AddLine(text, `<a href=\"${ action.value }\">${ actionContent }</a>`);
        }
    }

    if (menuItems.length !== 0) {
        const messageMenu: MessageMenu = {
            HeaderContent: '',
            MenuItems: menuItems,
            TailContent: '',
        };
        const menuResponse: MessageMenuResponse = {
            MessageMenu: messageMenu,
            MsgType: ResponseMessageTypes.MessageMenu,
            FromUserName: activity.from.id,
            ToUserName: activity.recipient.id,
            CreateTime: activity.timestamp.valueOf() || Date.now(),
        };
        messages.push(menuResponse);
    }

    if (text !== undefined) {
        const textResponse = CreateTextResponseFromMessageActivity(activity);
        textResponse.Content = text;
        messages.push(textResponse);
    }
    return messages;
}

/**
 * Convert Text To WeChat Message.
 * @private
 * @param activity Message activity from bot.
 * @returns  Response message to WeChat.
 */
function CreateTextResponseFromMessageActivity(activity: IMessageActivity): TextResponse {
    const response: TextResponse = {
        Content: activity.text,
        FromUserName: activity.from.id,
        ToUserName: activity.recipient.id,
        CreateTime: activity.timestamp ? activity.timestamp.valueOf() : Date.now(),
        MsgType: ResponseMessageTypes.Text,
    };
    return response;
}