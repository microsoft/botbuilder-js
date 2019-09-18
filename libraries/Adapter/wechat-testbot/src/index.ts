// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { config } from "dotenv";
import * as path from "path";
import * as restify from "restify";

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { MemoryStorage, ConversationState, UserState } from "botbuilder";
import { SecretInfo, VerificationHelper, WeChatAdapter } from "wechat";
import { RichCardsBot } from "./bots/richCardsBot";

import { MainDialog } from "./dialogs/mainDialog";
const ENV_FILE = path.join(__dirname, "..", ".env");
config({ path: ENV_FILE });

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(
        `\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`
    );
    console.log(`\nTo test your bot, see: https://aka.ms/debug-with-emulator`);
});

const storage = new MemoryStorage();

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const wechatAdapter = new WeChatAdapter(storage, {
    AppId: process.env.AppId,
    AppSecret: process.env.AppSecret,
    Token: process.env.Token,
    EncodingAESKey: process.env.EncodingAESKey,
    UploadTemporaryMedia: process.env.UploadTemporaryMedia === "true"
});

// Catch-all for errors.
wechatAdapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
let conversationState, userState;

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);

// Create the main dialog.
const dialog = new MainDialog();
const bot = new RichCardsBot(conversationState, userState, dialog);

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
// Listen for incoming requests.
server.post("/WeChat", (req, res) => {
    const secretInfo: SecretInfo = {
        AppId: req.query.appId || undefined,
        Signature: req.query.signature || undefined,
        Msg_signature: req.query.msg_signature || undefined,
        Timestamp: req.query.timestamp || undefined,
        Token: req.query.token || undefined,
        Nonce: req.query.nonce || undefined,
        EncodingAesKey: req.query.encodingAesKey || undefined
    };
    wechatAdapter.processActivity(
        req,
        res,
        async context => {
            // Route to main dialog.
            await bot.run(context);
        },
        secretInfo,
        false
    );
});

server.get("/WeChat", (req, res) => {
    const echostr: string = req.query.echostr;
    if (
        VerificationHelper.VerifySignature(
            req.query.signature,
            req.query.timestamp,
            req.query.nonce,
            process.env.Token
        )
    ) {
        res.statusCode = 200;
        res.contentType = "text/plain; charset=utf-8";
        res.send(echostr);
    }
});
