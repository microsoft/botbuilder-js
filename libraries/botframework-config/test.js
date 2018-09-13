let bf = require('./lib');
let assert = require('assert');


async function foo() {
    const botConfig = await bf.BotConfiguration.load('./tests/test.bot');

    console.log('ORIGINAL', botConfig);

    // This is roughly what happens with the RPC protocol in Electron
    const botConfigCopy = bf.BotConfiguration.fromJSON(JSON.parse(JSON.stringify(botConfig)));
    console.log('COPIED', botConfigCopy);

    assert.deepEqual(botConfig, botConfigCopy,'NOT EQUAL');
}

foo();