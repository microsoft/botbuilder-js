/**
 * @module botbuilder
 */
/** second comment block */
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
export declare class ConsoleLogger implements Middleware {
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
}
