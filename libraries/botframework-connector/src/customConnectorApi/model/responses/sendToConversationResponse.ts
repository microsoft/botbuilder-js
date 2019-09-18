import http = require('http');
import { ResourceResponse } from '../resourceResponse';
import { PagedMembersResult } from '../pagedMembersResult';

export type SendToConversationResponse = ResourceResponse & {
    /*
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