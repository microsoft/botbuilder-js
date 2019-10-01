import http = require('http');
import { ChannelAccount } from '../channelAccount';

/**
 * Contains response data for the getConversationMembers operation.
 */
export type GetConversationMembersResponse = Array<ChannelAccount> & {
  /**
   * The underlying HTTP response.
   */
  _response: http.IncomingMessage & {
    /**
     * The response body as text (string format)
     */
    bodyAsText: string;

    /**
     * The response body as parsed JSON or XML
     */
    parsedBody: ChannelAccount[];
  };
};