const { AccessTokenStorage } = require('../lib/accessTokenStorage');
const { MemoryStorage } = require('botbuilder-core');
const { WeChatAccessToken } = require('../lib/weChatSchema')
const assert = require('assert');
const accessTokenStorage = new AccessTokenStorage(new MemoryStorage());
const key = 'accesstokenkey';
const result = {
    AppId: 'appid',
    Secret: 'secret',
    Token: 'token',
    ExpireTime: new Date('1995-12-17T03:24:00')
};
const value = new WeChatAccessToken(result);

describe('My access token storage', async () => {
    assert(accessTokenStorage.SaveAsync(key, value), 'Save failed.');
    it('shoule be reload the corret stored value', async () => {
        assert.deepStrictEqual(await accessTokenStorage.GetAsync(key), value);
    });
});