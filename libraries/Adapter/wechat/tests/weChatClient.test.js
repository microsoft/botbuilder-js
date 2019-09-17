const assert = require('assert');
const { TextEncoder } = require('util');
const { MemoryStorage } = require('botbuilder-core');
const { WeChatClient, MediaTypes } = require('../lib');
const storage = new MemoryStorage();
const AppId = 'wx77f941c869071d99';
const AppSecret = 'secret';
const ImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAACeCAYAAACvg+F+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAxOTowMzoxMyAxOTo0Mjo0OBCBEeIAAAG8SURBVHhe7dJBDQAgEMCwA/+egQcmlrSfGdg6z0DE/oUEw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phSTEsKYYlxbCkGJYUw5JiWFIMS4phCZm52U4FOCAVGHQAAAAASUVORK5CYII=';
const openId = 'testuser';
const content = 'test';
const customerServiceAccount = 'test';
const mediaId = '';
const title = '';
const description = '';
const musicUrl = '';
const highQualityMusicUrl = '';
const thumbMediaId = '';
const articles = [ { Title: 'title', Description: 'Description', Url: 'testUrl', PicUrl: 'picUrl', } ];
const WeChatResult = {
    errcode: 0,
    errmsg: 'ok',
};
const TokenResult = {
    expires_in: 7200,
    access_token: 'testToken'
};
const MockAttachmentData = {
    name: 'tempImage',
    type: 'image/png',
    originalBase64: new TextEncoder().encode(ImageDataUrl),
    thumbnailBase64: new TextEncoder().encode(ImageDataUrl)
};

const MockNews = [ { title: 'test' } ];

class MockWeChatClient extends WeChatClient {
    constructor(AppId, AppSecret, storage) {
        super(AppId, AppSecret, storage);
    }
    async SendHttpRequestAsync(method, url, data = undefined, token = undefined, timeout = 10000) {
        var result = WeChatResult;
        if (url.includes('cgi-bin/token')) {
            result = TokenResult;
        } else if (url.includes('upload?access_token')) {
            result = MockTempMediaResult(MediaTypes.Image);
        } else if (url.includes('add_material')) {
            result = MockForeverMediaResult('foreverMedia');
        } else if (url.includes('uploadnews')) {
            result = MockTempMediaResult(MediaTypes.News);
        } else if (url.includes('add_news')) {
            result = MockForeverMediaResult('foreverNews');
        } else if (url.includes('uploadimg')) {
            result = MockForeverMediaResult('foreverImage');
        }
        return result;
    }
}

function MockTempMediaResult(type, mediaId = undefined) {
    const tempMedia = {
        errcode: 0,
        errmsg: 'ok',
        thumb_media_id: 'thumbMediaId',
        type: type,
        media_id: mediaId || 'mediaId',
    };
    return tempMedia;
}

function MockForeverMediaResult(mediaId = undefined) {
    const foreverMedia = {
        media_id: mediaId || 'mediaId',
        url: 'https://mediaUrl',
        errcode: 0,
        errmsg: 'ok',
    };
    return foreverMedia;
}

const testClient = new MockWeChatClient(AppId, AppSecret, storage);

describe('WeChatClient', () => {
    it('should get correct access token', async () => {
        const tokenResult = await testClient.GetAccessTokenAsync();
        assert.equal(tokenResult, 'testToken');
    });
    it('should upload media as temporary media', async () => {
        const result = await testClient.UploadMediaAsync(MockAttachmentData, true, 10000);
        assert.equal(result.MediaId, 'mediaId');
    });
    it('should upload media as persistent media', async () => {
        const result = await testClient.UploadMediaAsync(MockAttachmentData, false, 10000);
        assert.equal(result.MediaId, 'foreverMedia');
    });
    it('should upload news media temporarily', async () => {
        const result = await testClient.UploadNewsAsync(MockNews, true);
        assert.equal(result.Type, MediaTypes.News);
    });
    it('should upload news media persistently', async () => {
        const result = await testClient.UploadNewsAsync(MockNews, false);
        assert.equal(result.MediaId, 'foreverNews');
    });
    it('should upload image persistently', async () => {
        const result = await testClient.UploadNewsImageAsync(MockAttachmentData);
        assert.equal(result.MediaId, 'foreverImage');
    });
    it('should send Text correctly', async () => {
        var result = await testClient.SendTextAsync(openId, content);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendTextAsync(openId, content, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
    it('should send Image correctly', async () => {
        var result = await testClient.SendImageAsync(openId, mediaId);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendImageAsync(openId, mediaId, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
    it('should send Music correctly', async () => {
        var result = await testClient.SendMusicAsync(openId, title, description, musicUrl, highQualityMusicUrl, thumbMediaId);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendMusicAsync(openId, title, description, musicUrl, highQualityMusicUrl, thumbMediaId, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
    it('should send Video correctly', async () => {
        var result = await testClient.SendVideoAsync(openId, mediaId, title, description);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendVideoAsync(openId, mediaId, title, description, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
    it('should send Voice correctly', async () => {
        var result = await testClient.SendVoiceAsync(openId, mediaId);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendVoiceAsync(openId, mediaId, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
    it('should send News correctly', async () => {
        var result = await testClient.SendNewsAsync(openId, articles);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendNewsAsync(openId, articles, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
    it('should send MPNews correctly', async () => {
        var result = await testClient.SendMPNewsAsync(openId, mediaId);
        assert.equal(result.ErrorCode, 0);
        result = await testClient.SendMPNewsAsync(openId, mediaId, 10000, customerServiceAccount);
        assert.equal(result.ErrorCode, 0);
    });
});