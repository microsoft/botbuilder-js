/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Middleware } from './middleware';

/**
 * Middleware for logging activity to the console.
 * 
 * __Extends BotContext:__
 * * context.logger - Logs activity and analytics within the bot.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new ConsoleLogger())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
export class ConsoleLogger implements Middleware {
    public contextCreated(context: BotContext, next: () => Promise<void>): Promise<void> {
        // Wrap parent log() method
        const parentLog = context.logger.log;
        context.logger.log = (message, traceLevel, properties) => {
            switch(traceLevel) {
                default:
                case TraceLevel.log:
                    console.log(message);
                    break;
                case TraceLevel.debug:
                    console.debug(message);
                    break;
                case TraceLevel.information:
                    console.info(message);
                    break;
                case TraceLevel.warning:
                    console.warn(message);
                    break;
                case TraceLevel.error:
                case TraceLevel.critical:
                    console.error(message);
                    break;
            }
            parentLog(message, traceLevel, properties);
        };

        // Wrap parents logException() method
        const parentLogException = context.logger.logException;
        context.logger.logException = (exception, message, properties, metrics) => {
            let msg = message && message.length > 0 ? message + '/n' : '';
            console.error(msg + exception.stack); 
            parentLogException(exception, message, properties, metrics);
        };
        return next();
    }
}