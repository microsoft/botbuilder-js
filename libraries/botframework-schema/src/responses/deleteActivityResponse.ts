import http = require('http');
import { TokenResponse } from '../tokenResponse';


export type DeleteActivityResponse = {
  /**
   * The underlying HTTP response containing both raw and deserialized response data.
   */
  _response: http.IncomingMessage;

  [key: string]: any;
};