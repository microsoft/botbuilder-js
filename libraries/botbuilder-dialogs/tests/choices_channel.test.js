const assert = require('assert');
const { supportsSuggestedActions, supportsCardActions, hasMessageFeed, getChannelId } = require('../lib/choices/channel');

describe('channel methods', function() {
    this.timeout(5000);

    it(`should return true for supportsCardActions() with skype and 10`, function () {
        const validNumOfSuggestedActions = supportsSuggestedActions('skype', 10);
        assert(validNumOfSuggestedActions, `returned false.`);
    });

    it(`should return false for supportsCardActions() with skype and 11`, function () {
        const validNumOfSuggestedActions = supportsSuggestedActions('skype', 11);
        assert(validNumOfSuggestedActions === false, `returned true.`);
    });

    it(`should return true for supportsCardActions() with kik and 20`, function () {
        const validNumOfSuggestedActions = supportsSuggestedActions('kik', 20);
        assert(validNumOfSuggestedActions, `returned false.`);
    });

    it(`should return false for supportsCardActions() with kik and 21`, function () {
        const validNumOfSuggestedActions = supportsSuggestedActions('kik', 21);
        assert(validNumOfSuggestedActions === false, `returned true.`);
    });

    it(`should return true for supportsCardActions() with emulator and 100`, function () {
        const validNumOfSuggestedActions = supportsSuggestedActions('emulator', 100);
        assert(validNumOfSuggestedActions, `returned false.`);
    });

    it(`should return false for supportsCardActions() with emulator and 101`, function () {
        const validNumOfSuggestedActions = supportsSuggestedActions('emulator', 101);
        assert(validNumOfSuggestedActions === false, `returned true.`);
    });

    it(`should return true for supportsCardActions() with cortana and 100`, function () {
        const validNumOfCardActions = supportsCardActions('cortana', 100);
        assert(validNumOfCardActions, `returned false.`);
    });

    it(`should return false for supportsCardActions() with slack and 101`, function () {
        const validNumOfCardActions = supportsCardActions('cortana', 101);
        assert(validNumOfCardActions === false, `returned true.`);
    });

    it(`should return true for supportsCardActions() with skype and 3`, function () {
        const validNumOfCardActions = supportsCardActions('skype', 3);
        assert(validNumOfCardActions, `returned false.`);
    });

    it(`should return false for supportsCardActions() with skype and 5`, function () {
        const validNumOfCardActions = supportsCardActions('skype', 5);
        assert(validNumOfCardActions === false, `returned true.`);
    });

    it(`should return false for hasMessageFeed() with cortana`, function () {
        const hasFeed = hasMessageFeed('cortana');
        assert(hasFeed === false, `returned true.`);
    });

    it(`should return the channelId from context.activity.`, function () {
        const channel = getChannelId({ activity: { channelId: 'facebook' } });
        assert(channel === 'facebook', `expected "facebook", instead received ${ channel }`);
    });

    it(`should return an empty string if context.activity.channelId is falsey.`, function () {
        const channel = getChannelId({ activity: { } });
        assert(channel === '', `expected "", instead received ${ channel }`);
    });
});
