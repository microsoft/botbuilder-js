/**
 * @module botbuilder
 */
/** second comment block */
import { MiddlewareSet } from './middlewareSet';
import { Activity, ActivityTypes, applyConversationReference, ConversationReference } from './activity';
import { ActivityAdapter } from './activityAdapter';
import { Promiseable } from './middleware';
import { BotContext } from './botContext';

/**
 * Manages all communication between the bot and a user.
 *
 * **Usage Example**
 *
 * ```js
 * import { Bot } from 'botbuilder-core'; // typescript
 *
 * const bot = new Bot(adapter); // init bot and bind to adapter
 *
 * bot.onReceive((context) => { // define the bot's onReceive handler
 *   context.reply(`Hello World`); // send message to user
 * });
 * ```
 */
export class Bot extends MiddlewareSet {
    private receivers: ((context: BotContext) => Promiseable<void>)[] = [];
    private _adapter: ActivityAdapter;
    private pluginReflectMetadata = new Map<Partial<any>, { [propName: string]: PropertyDescriptor | undefined }>();

    /**
     * Creates a new instance of a bot
     *
     * @param adapter Connector used to link the bot to the user communication wise.
     */
    constructor(adapter: ActivityAdapter) {
        super();

        // Bind to adapter
        this.adapter = adapter;
    }

    /** Returns the current adapter. */
    public get adapter(): ActivityAdapter {
        return this._adapter;
    }

    /** Changes the bots adapter. The previous adapter will first be disconnected from.  */
    public set adapter(adapter: ActivityAdapter) {
        if (!adapter) {
            throw new Error(`Please provide an activity adapter`);
        }

        // Disconnect from existing adapter
        if (this._adapter) {
            this._adapter.onReceive = <any>undefined;
        }

        // Connect to new adapter
        this._adapter = adapter;
        this._adapter.onReceive = (activity) => this.receive(activity).then(() => {
        });
    }

    /**
     * Adds a plugin whose functions (including getters/setters) become available
     * on the context object passed to the middleware api. In order to resolve name
     * collisions, if a naming collision should occur, calling a plugin function
     * on the context returns an array containing the functions matched by name.
     *
     * ```js
     * class ContextPlugin implements BotContext {
     *   doStuff() {
     *     if (this.request.entities) {
     *       this.processEntities(this.request.entities);
     *   }
     *
     *   processEntities() {
     *     // Process entities
     *   }
     * }
     *
     * class MyMiddleware {
     *   receiveActivity(context, next) {
     *      context.doStuff()
     *   }
     * }
     * const bot = new Bot();
     * bot.plugin(new ContextPlugin())
     *    .use(new MyMiddleware());
     *
     * ```
     *
     * @param plugin Either a constructed class, a class prototype or an object containing properties
     * whose values are functions.
     */
    public plugin(plugin: { [property: string]: any, constructor?: Function }): Bot {
        const {pluginReflectMetadata} = this;
        const reflect = (target: { [property: string]: any, constructor?: Function }): { [key: string]: PropertyDescriptor | undefined } => {
            const meta = {} as { [key: string]: PropertyDescriptor | undefined };
            // Tail call avoidance
            while (target && target !== Object.prototype && target !== BotContext.prototype) {
                // Retain descriptors for use later
                Reflect.ownKeys(target).filter(key => !/(constructor|__proto__)/.test(key as string)).forEach(key => {
                    meta[key] = Reflect.getOwnPropertyDescriptor(target, key);
                });
                target = Reflect.getPrototypeOf(target);
            }
            return meta;
        };
        // Check if this is an object literal, prototype or a class instance
        const prototype = Reflect.getPrototypeOf(plugin);
        if (prototype !== Object.prototype && 'constructor' in prototype && plugin.constructor === prototype.constructor) {
            plugin = prototype;
        }
        pluginReflectMetadata.set(plugin, reflect(plugin));
        return this;
    }

    /**
     * Creates a new context object given an activity or conversation reference. The context object
     * will be disposed of automatically once the callback completes or the promise it returns
     * completes.
     *
     * **Usage Example**
     *
     * ```js
     * subscribers.forEach((subscriber) => {
     *      bot.createContext(subscriber.savedReference, (context) => {
     *          context.reply(`Hi ${subscriber.name}... Here's what's new with us.`)
     *                 .reply(newsFlash);
     *      });
     * });
     * ```
     *
     * @param activityOrReference Activity or ConversationReference to initialize the context object with.
     * @param onReady Function that will use the created context object.
     */
    public createContext(activityOrReference: Activity | ConversationReference, onReady: (context: BotContext) => Promiseable<void>): Promise<void> {
        // Initialize context object
        const handler = new MiddlewareProxyHandler(this.pluginReflectMetadata);
        let revocable: { proxy: BotContext, revoke: Function };
        if ((activityOrReference as Activity).type) {
            revocable = Proxy.revocable(new BotContext(this, activityOrReference), handler);
        } else {
            revocable = Proxy.revocable(new BotContext(this), handler);
            revocable.proxy.conversationReference = activityOrReference;
        }
        // Run context created pipeline
        return this.contextCreated(revocable.proxy, function contextReady() {
            // Run proactive or reactive logic
            return Promise.resolve(onReady(revocable.proxy));
        }).then(() => {
            // Next flush any queued up responses
            return revocable.proxy.flushResponses();
        }).then(() => {
            // Dispose of the context object
            revocable.revoke();
        });
    }

    /**
     * Registers a new receiver with the bot. All incoming activities are routed to receivers in
     * the order they're registered. The first receiver to return `{ handled: true }` prevents
     * the receivers after it from being called.
     *
     * **Usage Example**
     *
     * ```js
     * const bot = new Bot(adapter)
     *      .onReceive((context) => {
     *         context.reply(`Hello World`);
     *      });
     * ```
     *
     * @param receivers One or more receivers to register.
     */
    public onReceive(...receivers: ((context: BotContext) => Promiseable<void>)[]): this {
        receivers.forEach((fn) => {
            this.use({
                receiveActivity: function onReceive(context, next) {
                    return Promise.resolve(fn(context)).then(() => next());
                }
            });
        });
        return this;
    }

    /**
     * INTERNAL sends an outgoing set of activities to the user. Calling `context.flushResponses()` achieves the same
     * effect and is the preferred way of sending activities to the user.
     *
     * @param context Context for the current turn of the conversation.
     * @param activities Set of activities to send.
     */
    public post(context: BotContext, ...activities: Partial<Activity>[]): Promise<ConversationReference[]> {
        // Ensure activities are well formed.
        for (let i = 0; i < activities.length; i++) {
            let activity = activities[i];
            if (!activity.type) {
                activity.type = ActivityTypes.message;
            }
            applyConversationReference(activity, context.conversationReference);
        }

        // Run post activity pipeline
        const adapter = this.adapter;
        return this.postActivity(context, activities, function postActivities() {
            // Post the set of output activities
            return adapter.post(activities)
                .then((responses) => {
                    // Ensure responses array populated
                    if (!Array.isArray(responses)) {
                        responses = [];
                        for (let i = 0; i < activities.length; i++) {
                            responses.push({});
                        }
                    }
                    return responses;
                });
        });
    }

    /**
     * Dispatches an incoming set of activities. This method can be used to dispatch an activity
     * to the bot as if a user had sent it which is sometimes useful.
     *
     * @param activity The activity that was received.
     * @returns `{ handled: true }` if the activity was handled by a middleware plugin or one of the bots receivers.
     */
    public receive(activity: Activity): Promise<void> {
        // Create context and run receive activity pipeline
        return this.createContext(activity,
            (context) => this.receiveActivity(context,
                () => Promise.resolve()));
    }
}

class MiddlewareProxyHandler implements ProxyHandler<BotContext> {
    constructor(private pluginReflectMetadata: Map<Partial<any>, { [propName: string]: PropertyDescriptor | undefined }>) {

    }

    public get(target: BotContext, prop: PropertyKey, receiver: ProxyConstructor): Function[] | Function | any {
        if (prop in target) {
            return (target as any)[prop];
        }
        const matches = this.getDescriptorIteratorByName(prop, target);
        return matches.length > 1 ? () => matches : matches[0];
    }

    private getDescriptorIteratorByName(propertyName: PropertyKey, target: BotContext): Function[] | Function | any {
        const matches: PropertyDescriptor[] = [];
        this.pluginReflectMetadata.forEach(meta => {
            const descriptor = meta[propertyName];
            if (descriptor) {
                matches.push((descriptor.get ? descriptor.get.call(target) : descriptor.value.bind(target)));
            }
        });
        return matches;
    }
}
