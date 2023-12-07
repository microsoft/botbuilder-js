/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OperationQueryParameter } from "@azure/core-http"

export const channelId0: OperationQueryParameter = {
  parameterPath: [
    "options",
    "channelId"
  ],
  mapper: {
    serializedName: "channelId",
    type: {
      name: "String"
    }
  }
};
export const channelId1: OperationQueryParameter = {
  parameterPath: "channelId",
  mapper: {
    required: true,
    serializedName: "channelId",
    type: {
      name: "String"
    }
  }
};
export const code: OperationQueryParameter = {
  parameterPath: [
    "options",
    "code"
  ],
  mapper: {
    serializedName: "code",
    type: {
      name: "String"
    }
  }
};
export const codeChallenge: OperationQueryParameter = {
  parameterPath: [
    "options",
    "codeChallenge"
  ],
  mapper: {
    serializedName: "code_challenge",
    type: {
      name: "String"
    }
  }
};
export const connectionName0: OperationQueryParameter = {
  parameterPath: "connectionName",
  mapper: {
    required: true,
    serializedName: "connectionName",
    type: {
      name: "String"
    }
  }
};
export const connectionName1: OperationQueryParameter = {
  parameterPath: [
    "options",
    "connectionName"
  ],
  mapper: {
    serializedName: "connectionName",
    type: {
      name: "String"
    }
  }
};
export const emulatorUrl: OperationQueryParameter = {
  parameterPath: [
    "options",
    "emulatorUrl"
  ],
  mapper: {
    serializedName: "emulatorUrl",
    type: {
      name: "String"
    }
  }
};
export const finalRedirect: OperationQueryParameter = {
  parameterPath: [
    "options",
    "finalRedirect"
  ],
  mapper: {
    serializedName: "finalRedirect",
    type: {
      name: "String"
    }
  }
};
export const include: OperationQueryParameter = {
  parameterPath: [
    "options",
    "include"
  ],
  mapper: {
    serializedName: "include",
    type: {
      name: "String"
    }
  }
};
export const state: OperationQueryParameter = {
  parameterPath: "state",
  mapper: {
    required: true,
    serializedName: "state",
    type: {
      name: "String"
    }
  }
};
export const userId: OperationQueryParameter = {
  parameterPath: "userId",
  mapper: {
    required: true,
    serializedName: "userId",
    type: {
      name: "String"
    }
  }
};
