import { TranscriptStore, PagedResult, Transcript } from "./transcriptLogger";
import { Activity } from "botbuilder-core";
/**
 * The file transcript store stores transcripts in file system with each activity as a file.
 */
export declare class FileTranscriptStore implements TranscriptStore {
    private static readonly PageSize;
    private rootFolder;
    /**
     * Creates an instance of FileTranscriptStore
     * @param folder Root folder where transcript will be stored.
     */
    constructor(folder: string);
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void>;
    /**
     * Get activities for a conversation (Aka the transcript)
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuatuation token to page through results.
     * @param startDate Earliest time to include.
     */
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>>;
    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>>;
    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId: string, conversationId: string): Promise<void>;
    private saveActivity(activity, transcriptPath, activityFilename);
    private ensureFolder(path);
    private getActivityFilename(activity);
    private getChannelFolder(channelId);
    private getTranscriptFolder(channelId, conversationId);
    private sanitizeKey(key);
}
