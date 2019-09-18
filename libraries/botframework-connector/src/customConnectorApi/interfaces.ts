import localVarRequest = require('request');
import http = require('http');

/* tslint:disable:no-unused-locals */
import { Activity } from './model/activity';
import { AttachmentData } from './model/attachmentData';
import { ChannelAccount } from './model/channelAccount';
import { ConversationParameters } from './model/conversationParameters';
import { ConversationResourceResponse } from './model/conversationResourceResponse';
import { ConversationsResult } from './model/conversationsResult';
import { ErrorResponse } from './model/errorResponse';
import { PagedMembersResult } from './model/pagedMembersResult';
import { ResourceResponse } from './model/resourceResponse';
import { Transcript } from './model/transcript';

import * as Models from "./model";

import { ObjectSerializer, Authentication, VoidAuth } from './model/models';

export interface RequestOptions {
    headers: 
    {
        [name: string]: string
    }
}

export type CreateConversationResponse = ConversationResourceResponse & {
    /**
     * The underlying HTTP response.
     */
    response: http.IncomingMessage & {
      /**
       * The response body as text (string format)
       */
      bodyAsText: string;
  
      /**
       * The response body as parsed JSON or XML
       */
      parsedBody: ConversationResourceResponse;
    };
    body: any;
  };

  export type GetConversationPagedMembersResponse = PagedMembersResult & {
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
      parsedBody: PagedMembersResult;
    };
  };

  /**
 * Contains response data for the getConversationMembers operation.
 */
export type ConversationsGetConversationMembersResponse = Array<ChannelAccount> & {
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
      body: Array<ChannelAccount>;
    };
  };

 
/**
 * Contains response data for the DeleteConversationMember operation.
 */
export type ConversationsApiDeleteConversationMemberResponse = {
    /**
     * The response body properties.
     */
    [propertyName: string]: TokenResponse;
  } & {
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
        parsedBody: { [propertyName: string]: TokenResponse };
    };
};

/**
 * An interface representing TokenResponse.
 */
export interface TokenResponse {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member {string} [connectionName]
     */
    connectionName?: string;
    token?: string;
    expiration?: string;
}
