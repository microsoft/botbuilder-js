/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IActivity } from '.';

/**
 * Common support methods for IActivity
 */
 export class ActivityEx {
     /**
      * Determine if the Activity was sent via an Http/Https connection or Streaming
      * This can be determined by looking at the ServiceUrl property:
      *   (1) All channels that send messages via http/https are not streaming
      *   (2) Channels that send messages via streaming have a ServiceUrl that does not begin with http/https.
      * @param activity 
      */
     public static isFromStreamingConnection(activity: IActivity): boolean {
        return activity && activity.serviceUrl && !activity.serviceUrl.toLowerCase().startsWith('http');
     }
 }