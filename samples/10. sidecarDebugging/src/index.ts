import {ConversationState} from "botbuilder-core";
import {BotDebugger} from "botbuilder-dialogs";

const {MemoryStorage} = require('botbuilder-core');

const restify = require('restify');
const {default: chalk} = require('chalk');

const {BotFrameworkAdapter} = require('botbuilder');
const {EmulatorAwareBot} = require('./bot');

const memoryStorage = new MemoryStorage();
// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const bot = new EmulatorAwareBot(conversationState);

const adapter = new BotFrameworkAdapter({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

if (process.env.NODE_ENV === 'development') {
	new BotDebugger(memoryStorage, adapter);
}

const server = restify.createServer();
server.listen(process.env.PORT, () => {
	process.stdout.write(`Bot is listening on port: ${chalk.blue(server.address().port)}`);
});

server.opts('/api/messages', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
	res.end();
});

server.post('/api/messages', (req, res) => {
	return adapter.processActivity(req, res, bot.onTurn.bind(bot)).catch(res.error);
});
