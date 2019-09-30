/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RequestOptions } from './requestOptions'

export interface ConversationsOptionalParams extends RequestOptions {
  /**
   * skip or continuation token
   */
  continuationToken: string;
}