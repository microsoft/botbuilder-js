/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CompositeMapper } from '@azure/core-http';

export const IntentModel: CompositeMapper = {
    serializedName: 'IntentModel',
    type: {
        name: 'Composite',
        className: 'IntentModel',
        modelProperties: {
            intent: {
                serializedName: 'intent',
                type: {
                    name: 'String',
                },
            },
            score: {
                serializedName: 'score',
                constraints: {
                    InclusiveMaximum: 1,
                    InclusiveMinimum: 0,
                },
                type: {
                    name: 'Number',
                },
            },
        },
    },
};

export const EntityModel: CompositeMapper = {
    serializedName: 'EntityModel',
    type: {
        name: 'Composite',
        className: 'EntityModel',
        modelProperties: {
            entity: {
                required: true,
                serializedName: 'entity',
                type: {
                    name: 'String',
                },
            },
            type: {
                required: true,
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
            startIndex: {
                required: true,
                serializedName: 'startIndex',
                type: {
                    name: 'Number',
                },
            },
            endIndex: {
                required: true,
                serializedName: 'endIndex',
                type: {
                    name: 'Number',
                },
            },
        },
        additionalProperties: {
            type: {
                name: 'Object',
            },
        },
    },
};

export const CompositeChildModel: CompositeMapper = {
    serializedName: 'CompositeChildModel',
    type: {
        name: 'Composite',
        className: 'CompositeChildModel',
        modelProperties: {
            type: {
                required: true,
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
            value: {
                required: true,
                serializedName: 'value',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const CompositeEntityModel: CompositeMapper = {
    serializedName: 'CompositeEntityModel',
    type: {
        name: 'Composite',
        className: 'CompositeEntityModel',
        modelProperties: {
            parentType: {
                required: true,
                serializedName: 'parentType',
                type: {
                    name: 'String',
                },
            },
            value: {
                required: true,
                serializedName: 'value',
                type: {
                    name: 'String',
                },
            },
            children: {
                required: true,
                serializedName: 'children',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'CompositeChildModel',
                        },
                    },
                },
            },
        },
    },
};

export const Sentiment: CompositeMapper = {
    serializedName: 'Sentiment',
    type: {
        name: 'Composite',
        className: 'Sentiment',
        modelProperties: {
            label: {
                serializedName: 'label',
                type: {
                    name: 'String',
                },
            },
            score: {
                serializedName: 'score',
                type: {
                    name: 'Number',
                },
            },
        },
    },
};

export const LuisResult: CompositeMapper = {
    serializedName: 'LuisResult',
    type: {
        name: 'Composite',
        className: 'LuisResult',
        modelProperties: {
            query: {
                serializedName: 'query',
                type: {
                    name: 'String',
                },
            },
            alteredQuery: {
                serializedName: 'alteredQuery',
                type: {
                    name: 'String',
                },
            },
            topScoringIntent: {
                serializedName: 'topScoringIntent',
                type: {
                    name: 'Composite',
                    className: 'IntentModel',
                },
            },
            intents: {
                serializedName: 'intents',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'IntentModel',
                        },
                    },
                },
            },
            entities: {
                serializedName: 'entities',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'EntityModel',
                            additionalProperties: {
                                type: {
                                    name: 'Object',
                                },
                            },
                        },
                    },
                },
            },
            compositeEntities: {
                serializedName: 'compositeEntities',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'CompositeEntityModel',
                        },
                    },
                },
            },
            sentimentAnalysis: {
                serializedName: 'sentimentAnalysis',
                type: {
                    name: 'Composite',
                    className: 'Sentiment',
                },
            },
            connectedServiceResult: {
                serializedName: 'connectedServiceResult',
                type: {
                    name: 'Composite',
                    className: 'LuisResult',
                },
            },
        },
    },
};

export const EntityWithScore: CompositeMapper = {
    serializedName: 'EntityWithScore',
    type: {
        name: 'Composite',
        className: 'EntityWithScore',
        modelProperties: {
            ...EntityModel.type.modelProperties,
            score: {
                required: true,
                serializedName: 'score',
                constraints: {
                    InclusiveMaximum: 1,
                    InclusiveMinimum: 0,
                },
                type: {
                    name: 'Number',
                },
            },
        },
        additionalProperties: EntityModel.type.additionalProperties,
    },
};

export const EntityWithResolution: CompositeMapper = {
    serializedName: 'EntityWithResolution',
    type: {
        name: 'Composite',
        className: 'EntityWithResolution',
        modelProperties: {
            ...EntityModel.type.modelProperties,
            resolution: {
                required: true,
                serializedName: 'resolution',
                type: {
                    name: 'Object',
                },
            },
        },
        additionalProperties: EntityModel.type.additionalProperties,
    },
};

export const APIError: CompositeMapper = {
    serializedName: 'APIError',
    type: {
        name: 'Composite',
        className: 'APIError',
        modelProperties: {
            statusCode: {
                serializedName: 'statusCode',
                type: {
                    name: 'String',
                },
            },
            message: {
                serializedName: 'message',
                type: {
                    name: 'String',
                },
            },
        },
    },
};
