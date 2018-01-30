/**
 * @module botbuilder
 */
/** second comment block */
import { Activity, ConversationReference, ConversationResourceResponse } from './activity';

/**
 * Implemented by activity adapters
 */
export interface ActivityAdapter {
    /**
     * Handler that returns incoming activities to a single consumer. The `Bot` will set this 
     * when the adapter is passed to its constructor. Just keep in mind that should the bots 
     * adapter be replaced (like when running unit tests) this handler can end up being set
     * back to undefined.
     */
    onReceive: (activity: Activity) => Promise<void>;
    
    /**
     * Called by a consumer to send outgoing set of activities to a user.
     *
     * @param activities The set of activities to send.
     */
    post(activities: Partial<Activity>[]): Promise<ConversationResourceResponse[]|undefined>;
}
/* istanbul ignore file */
