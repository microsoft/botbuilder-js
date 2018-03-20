import 'skeleton-css/css/normalize.css';
import 'skeleton-css/css/skeleton.css';
import './css/alarmBot.css';

import {Bot, ConversationState, MemoryStorage} from 'botbuilder-core';
import {WebChatAdapter} from "./webChatAdapter";
import {ChatComponent} from "./chatComponent";
import {AlarmRenderer} from "./alarmRenderer";
import {routes} from "./routes";

const webChatAdapter = new WebChatAdapter();

const bot = new Bot(webChatAdapter)
    .use(new MemoryStorage(),
        new BotStateManager(),
        new AlarmRenderer());

ChatComponent.bootstrap(webChatAdapter.getMessagePipelineToBot(), document.querySelector('section'));
// handle activities
bot.onReceive((context) => routes(context));

// FOUC
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => document.body.style.visibility = 'visible');
});