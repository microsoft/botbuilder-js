/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OperationURLParameter, OperationQueryParameter } from "@azure/core-http"

export const activityId: OperationURLParameter = {
  parameterPath: "activityId",
  mapper: {
    required: true,
    serializedName: "activityId",
    type: {
      name: "String"
    }
  }
};
export const attachmentId: OperationURLParameter = {
  parameterPath: "attachmentId",
  mapper: {
    required: true,
    serializedName: "attachmentId",
    type: {
      name: "String"
    }
  }
};
export const continuationToken: OperationQueryParameter = {
  parameterPath: [
    "options",
    "continuationToken"
  ],
  mapper: {
    serializedName: "continuationToken",
    type: {
      name: "String"
    }
  }
};
export const conversationId: OperationURLParameter = {
  parameterPath: "conversationId",
  mapper: {
    required: true,
    serializedName: "conversationId",
    type: {
      name: "String"
    }
  }
};
export const memberId: OperationURLParameter = {
  parameterPath: "memberId",
  mapper: {
    required: true,
    serializedName: "memberId",
    type: {
      name: "String"
    }
  }
};
export const pageSize: OperationQueryParameter = {
  parameterPath: [
    "options",
    "pageSize"
  ],
  mapper: {
    serializedName: "pageSize",
    type: {
      name: "Number"
    }
  }
};
export const viewId: OperationURLParameter = {
  parameterPath: "viewId",
  mapper: {
    required: true,
    serializedName: "viewId",
    type: {
      name: "String"
    }
  }
};
