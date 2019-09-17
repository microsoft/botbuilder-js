const { WeChatMessageMapper, WeChatClient, MediaTypes, UploadTemporaryMediaResult, UploadPersistentMediaResult } = require('../lib');
const { MemoryStorage, ActionTypes, CardFactory, ActivityTypes } = require('botbuilder-core');
const assert = require('assert');
const xml2js = require('xml2js');

const storage = new MemoryStorage();
const AppId = 'wx77f941c869071d99';
const AppSecret = 'secret';
const XmlText = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[this is a test]]></Content><MsgId>1234567890123456</MsgId></xml>';
const XmlImage = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[image]]></MsgType><PicUrl><![CDATA[this is a url]]></PicUrl><MediaId><![CDATA[media_id]]></MediaId><MsgId>1234567890123456</MsgId></xml>';
const XmlVoice = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[voice]]></MsgType><MediaId><![CDATA[media_id]]></MediaId><Format><![CDATA[Format]]></Format><MsgId>1234567890123456</MsgId></xml>';
const XmlVideo = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[video]]></MsgType><MediaId><![CDATA[media_id]]></MediaId><ThumbMediaId><![CDATA[thumb_media_id]]></ThumbMediaId><MsgId>1234567890123456</MsgId></xml>';
const XmlLocation = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[location]]></MsgType><Location_X>23.134521</Location_X><Location_Y>113.358803</Location_Y><Scale>20</Scale><Label><![CDATA[LocationInfo]]></Label><MsgId>1234567890123456</MsgId></xml>';
const XmlShortVideo = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[shortvideo]]></MsgType><MediaId><![CDATA[media_id]]></MediaId><ThumbMediaId><![CDATA[thumb_media_id]]></ThumbMediaId><MsgId>1234567890123456</MsgId></xml>';
const XmlLink = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[link]]></MsgType><Title><![CDATA[This is a link]]></Title><Description><![CDATA[This is a link]]></Description><Url><![CDATA[url]]></Url><MsgId>1234567890123456</MsgId></xml>';
const XmlEventLocation = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[FromUser]]></FromUserName><CreateTime>123456789</CreateTime><MsgType><![CDATA[event]]></MsgType><Event><![CDATA[LOCATION]]></Event><Latitude>23.104105</Latitude><Longitude>113.320107</Longitude><Precision>65.000000</Precision></xml>';
const XmlEventClick = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[FromUser]]></FromUserName><CreateTime>123456789</CreateTime><MsgType><![CDATA[event]]></MsgType><Event><![CDATA[CLICK]]></Event><EventKey><![CDATA[EVENTKEY]]></EventKey></xml>';
const XmlEventView = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[FromUser]]></FromUserName><CreateTime>123456789</CreateTime><MsgType><![CDATA[event]]></MsgType><Event><![CDATA[VIEW]]></Event><EventKey><![CDATA[www.qq.com]]></EventKey></xml>';
const XmlEventSubscribe = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[FromUser]]></FromUserName><CreateTime>123456789</CreateTime><MsgType><![CDATA[event]]></MsgType><Event><![CDATA[subscribe]]></Event><EventKey><![CDATA[qrscene_123123]]></EventKey><Ticket><![CDATA[TICKET]]></Ticket></xml>';
const XmlEventScan = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[FromUser]]></FromUserName><CreateTime>123456789</CreateTime><MsgType><![CDATA[event]]></MsgType><Event><![CDATA[SCAN]]></Event><EventKey><![CDATA[SCENE_VALUE]]></EventKey><Ticket><![CDATA[TICKET]]></Ticket></xml>';
const ImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAACeCAYAAACvg+F+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAxOTowMzoxMyAxOTo0Mjo0OBCBEeIAAAG8SURBVHhe7dJBDQAgEMCwA/+egQcmlrSfGdg6z0DE/oUEw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phCZm52U4FOCAVGHQAAAAASUVORK5CYII=';

const mockActivity = {
    type: ActivityTypes.Message,
    id: 'id',
    channelId: 'wechat',
    from: {
        id: 'FromId',
        name: 'Bot',
        role: 'bot',
    },
    recipient: {
        id: 'RecipientId',
        name: 'User',
        role: 'user',
    },
    conversation: {
        isGroup: false,
        id: 'FromId',
    },
    timestamp: new Date(Date.now()),
    text: 'text',
    suggestedActions: {
        actions: [
            { title: ActionTypes.MessageBack, type: ActionTypes.MessageBack, value: 'messageBack' },
            { title: ActionTypes.ImBack, type: ActionTypes.ImBack, value: 'imBack' },
            { title: ActionTypes.OpenUrl, type: ActionTypes.OpenUrl, value: 'http://test.com' },
        ],
    },
    attachments: [],
};

class MockWeChatClient extends WeChatClient {
    constructor(AppId, AppSecret, storage) {
        super(AppId, AppSecret, storage);
    }
    async GetAccessTokenAsync() {
        return 'mockToken';
    }
    async SendHttpRequestAsync(method, url, data = undefined, token = undefined, timeout = 10000) {
        const WeChatResult = {
            errcode: 0,
            errmsg: 'ok',
        };
        return WeChatResult;
    }
    async UploadMediaAsync(attachmentData, isTemporary, timeout) {
        const mediaResult = {
            errcode: 0,
            errmsg: 'ok',
            thumb_media_id: 'thumbMediaId',
            type: MediaTypes.Image,
            media_id: 'mediaId',
        };
        return new UploadTemporaryMediaResult(mediaResult);
    }
    async UploadNewsAsync(newsList, isTemporary, timeout) {
        const mediaResult = {
            errcode: 0,
            errmsg: 'ok',
            thumb_media_id: 'thumbMediaId',
            type: MediaTypes.News,
            media_id: 'mediaId',
        };
        return new UploadTemporaryMediaResult(mediaResult);
    }
    async UploadNewsImageAsync(attachmentData, timeout) {
        const mediaResult = {
            media_id: 'mediaId',
            url: 'https://mediaUrl',
            errcode: 0,
            errmsg: 'ok',
        };
        return new UploadPersistentMediaResult(mediaResult);
    }
}

function parseXML(str){
    const xmlParser = new xml2js.Parser({
        explicitArray: false,
        explicitCharkey: false,
        explicitRoot: false
    });
    return new Promise((resolve, reject) => {
        if (!str) {
            reject(new Error('Document is empty'));
        } else {
            xmlParser.parseString(str, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }
    });
}

async function GetMockRequestMessageList() {
    const result = [
        await parseXML(XmlText),
        await parseXML(XmlImage),
        await parseXML(XmlVoice),
        await parseXML(XmlVideo),
        await parseXML(XmlShortVideo),
        await parseXML(XmlLocation),
        await parseXML(XmlLink),
        await parseXML(XmlEventClick),
        await parseXML(XmlEventLocation),
        await parseXML(XmlEventView),
        await parseXML(XmlEventSubscribe),
        await parseXML(XmlEventScan),
    ];
    return result;
}

function GetMockMessageActivityList() {
    var result = [];
    mockActivity.attachments.push(CardFactory.animationCard('foo', ['https://example.org/media'], ['a', 'b', 'c']));
    mockActivity.attachments.push(CardFactory.audioCard('foo', ['https://example.org/media'], ['a', 'b', 'c']));
    mockActivity.attachments.push(CardFactory.videoCard('foo', ['https://example.org/media'], ['a', 'b', 'c']));
    mockActivity.attachments.push(CardFactory.heroCard('foo', [ImageDataUrl], ['a', 'b', 'c'], {tap: {type: ActionTypes.OpenUrl, value: 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg' }}));
    mockActivity.attachments.push(CardFactory.receiptCard({ title: 'foo' }));
    mockActivity.attachments.push(CardFactory.signinCard('foo', 'https://example.org/signin', 'bar'));
    mockActivity.attachments.push(CardFactory.oauthCard('ConnectionName', 'Test', 'Test-text'));
    mockActivity.attachments.push(CardFactory.thumbnailCard('foo', 'bar', undefined, undefined, { subtitle: 'sub' }));
    result.push(mockActivity);
    return result;
}

const testClient = new MockWeChatClient(AppId, AppSecret, storage);
const testMessageMapperTemporary = new WeChatMessageMapper(testClient, true);
const testMessageMapperForever = new WeChatMessageMapper(testClient, false);

describe('WeChat Message Mapper', () => {
    it('should get correct activity from wechat request message', async () => {
        const mockRequestList = await GetMockRequestMessageList();
        for (let request of mockRequestList) {
            var activity = await testMessageMapperTemporary.ToConnectorMessage(request);
            assert.equal(activity.recipient.id, request.ToUserName);
            assert.equal(activity.recipient.name, 'Bot');
            assert.equal(activity.from.id, request.FromUserName);
            assert.equal(activity.from.name, 'User');
            if (request.MsgType !== 'event') {
                assert.equal(activity.id, request.MsgId);
            } else {
                assert(request.MsgType === 'event', 'The message type should be Event');
            }
            assert.equal(activity.channelId, 'wechat');
            assert.equal(activity.conversation.id, request.FromUserName);
        }
    });
    it('should convert response message from Bot format to Wechat format correctly for temporary upload', async () => {
        const activityList = GetMockMessageActivityList();
        for (let messageActivity of activityList) {
            const MeidaResponse = await testMessageMapperTemporary.ToWeChatMessage(messageActivity);
            assert(MeidaResponse.length > 0, 'The number of responses should not be 0.');
        }
    });
    it('should convert response message from Bot format to Wechat format correctly for forever upload', async () => {
        const activityList = GetMockMessageActivityList();
        for (let messageActivity of activityList) {
            const MeidaResponse = await testMessageMapperForever.ToWeChatMessage(messageActivity);
            assert(MeidaResponse.length > 0, 'The number of responses should not be 0.');
        }
    });

});

