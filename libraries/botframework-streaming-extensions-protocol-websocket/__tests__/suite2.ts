import {abcd} from 'botframework-streaming-extensions-protocol'

test('simple test 1', () => {
        expect('abc').toBe('abc');
});

test('simple test 2', () => {
        var x = abcd();
        expect(x).toBe("abcd");
});
