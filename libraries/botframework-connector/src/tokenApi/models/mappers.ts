/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CompositeMapper } from "@azure/core-http";

export const TokenExchangeResource: CompositeMapper = {
  serializedName: "TokenExchangeResource",
  type: {
    name: "Composite",
    className: "TokenExchangeResource",
    modelProperties: {
      id: {
        serializedName: "id",
        type: {
          name: "String"
        }
      },
      uri: {
        serializedName: "uri",
        type: {
          name: "String"
        }
      },
      providerId: {
        serializedName: "providerId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SignInUrlResponse: CompositeMapper = {
  serializedName: "SignInUrlResponse",
  type: {
    name: "Composite",
    className: "SignInUrlResponse",
    modelProperties: {
      signInLink: {
        serializedName: "signInLink",
        type: {
          name: "String"
        }
      },
      tokenExchangeResource: {
        serializedName: "tokenExchangeResource",
        type: {
          name: "Composite",
          className: "TokenExchangeResource"
        }
      }
    }
  }
};

export const TokenResponse: CompositeMapper = {
  serializedName: "TokenResponse",
  type: {
    name: "Composite",
    className: "TokenResponse",
    modelProperties: {
      channelId: {
        serializedName: "channelId",
        type: {
          name: "String"
        }
      },
      connectionName: {
        serializedName: "connectionName",
        type: {
          name: "String"
        }
      },
      token: {
        serializedName: "token",
        type: {
          name: "String"
        }
      },
      expiration: {
        serializedName: "expiration",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const InnerHttpError: CompositeMapper = {
  serializedName: "InnerHttpError",
  type: {
    name: "Composite",
    className: "InnerHttpError",
    modelProperties: {
      statusCode: {
        serializedName: "statusCode",
        type: {
          name: "Number"
        }
      },
      body: {
        serializedName: "body",
        type: {
          name: "Object"
        }
      }
    }
  }
};

export const ErrorModel: CompositeMapper = {
  serializedName: "Error",
  type: {
    name: "Composite",
    className: "ErrorModel",
    modelProperties: {
      code: {
        serializedName: "code",
        type: {
          name: "String"
        }
      },
      message: {
        serializedName: "message",
        type: {
          name: "String"
        }
      },
      innerHttpError: {
        serializedName: "innerHttpError",
        type: {
          name: "Composite",
          className: "InnerHttpError"
        }
      }
    }
  }
};

export const ErrorResponse: CompositeMapper = {
  serializedName: "ErrorResponse",
  type: {
    name: "Composite",
    className: "ErrorResponse",
    modelProperties: {
      error: {
        serializedName: "error",
        type: {
          name: "Composite",
          className: "ErrorModel"
        }
      }
    }
  }
};

export const AadResourceUrls: CompositeMapper = {
  serializedName: "AadResourceUrls",
  type: {
    name: "Composite",
    className: "AadResourceUrls",
    modelProperties: {
      resourceUrls: {
        serializedName: "resourceUrls",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const TokenStatus: CompositeMapper = {
  serializedName: "TokenStatus",
  type: {
    name: "Composite",
    className: "TokenStatus",
    modelProperties: {
      channelId: {
        serializedName: "channelId",
        type: {
          name: "String"
        }
      },
      connectionName: {
        serializedName: "connectionName",
        type: {
          name: "String"
        }
      },
      hasToken: {
        serializedName: "hasToken",
        type: {
          name: "Boolean"
        }
      },
      serviceProviderDisplayName: {
        serializedName: "serviceProviderDisplayName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const TokenExchangeRequest: CompositeMapper = {
  serializedName: "TokenExchangeRequest",
  type: {
    name: "Composite",
    className: "TokenExchangeRequest",
    modelProperties: {
      uri: {
        serializedName: "uri",
        type: {
          name: "String"
        }
      },
      token: {
        serializedName: "token",
        type: {
          name: "String"
        }
      }
    }
  }
};
