/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class TransportConstants {
  public static readonly MaxPayloadLength: number = 4096;
  //get MaxPayloadLength(): number { return TransportContants.MaxPayloadLength; }
  public static readonly MaxHeaderLength: number = 48;
  //get MaxHeaderLength(): number { return TransportContants.MaxHeaderLength; }
  public static readonly MaxLength: number = 999999;
  //get MaxLength(): number { return TransportContants.MaxLength; }
  public static readonly MinLength: number = 0;
  //get MinLength(): number { return TransportContants.MinLength; }
}
