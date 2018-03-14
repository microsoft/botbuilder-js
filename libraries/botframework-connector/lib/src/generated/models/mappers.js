/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
exports.AttachmentView = {
    required: false,
    serializedName: 'AttachmentView',
    type: {
        name: 'Composite',
        className: 'AttachmentView',
        modelProperties: {
            viewId: {
                required: false,
                serializedName: 'viewId',
                type: {
                    name: 'String'
                }
            },
            size: {
                required: false,
                serializedName: 'size',
                type: {
                    name: 'Number'
                }
            }
        }
    }
};
exports.AttachmentInfo = {
    required: false,
    serializedName: 'AttachmentInfo',
    type: {
        name: 'Composite',
        className: 'AttachmentInfo',
        modelProperties: {
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            },
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            views: {
                required: false,
                serializedName: 'views',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'AttachmentViewElementType',
                        type: {
                            name: 'Composite',
                            className: 'AttachmentView'
                        }
                    }
                }
            }
        }
    }
};
exports.ErrorModel = {
    required: false,
    serializedName: 'Error',
    type: {
        name: 'Composite',
        className: 'ErrorModel',
        modelProperties: {
            code: {
                required: false,
                serializedName: 'code',
                type: {
                    name: 'String'
                }
            },
            message: {
                required: false,
                serializedName: 'message',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.ErrorResponse = {
    required: false,
    serializedName: 'ErrorResponse',
    type: {
        name: 'Composite',
        className: 'ErrorResponse',
        modelProperties: {
            error: {
                required: false,
                serializedName: 'error',
                type: {
                    name: 'Composite',
                    className: 'ErrorModel'
                }
            }
        }
    }
};
exports.ChannelAccount = {
    required: false,
    serializedName: 'ChannelAccount',
    type: {
        name: 'Composite',
        className: 'ChannelAccount',
        modelProperties: {
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.ConversationAccount = {
    required: false,
    serializedName: 'ConversationAccount',
    type: {
        name: 'Composite',
        className: 'ConversationAccount',
        modelProperties: {
            isGroup: {
                required: false,
                serializedName: 'isGroup',
                type: {
                    name: 'Boolean'
                }
            },
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.MessageReaction = {
    required: false,
    serializedName: 'MessageReaction',
    type: {
        name: 'Composite',
        className: 'MessageReaction',
        modelProperties: {
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.CardAction = {
    required: false,
    serializedName: 'CardAction',
    type: {
        name: 'Composite',
        className: 'CardAction',
        modelProperties: {
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            image: {
                required: false,
                serializedName: 'image',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            displayText: {
                required: false,
                serializedName: 'displayText',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.SuggestedActions = {
    required: false,
    serializedName: 'SuggestedActions',
    type: {
        name: 'Composite',
        className: 'SuggestedActions',
        modelProperties: {
            to: {
                required: false,
                serializedName: 'to',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'stringElementType',
                        type: {
                            name: 'String'
                        }
                    }
                }
            },
            actions: {
                required: false,
                serializedName: 'actions',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            }
        }
    }
};
exports.Attachment = {
    required: false,
    serializedName: 'Attachment',
    type: {
        name: 'Composite',
        className: 'Attachment',
        modelProperties: {
            contentType: {
                required: false,
                serializedName: 'contentType',
                type: {
                    name: 'String'
                }
            },
            contentUrl: {
                required: false,
                serializedName: 'contentUrl',
                type: {
                    name: 'String'
                }
            },
            content: {
                required: false,
                serializedName: 'content',
                type: {
                    name: 'Object'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            },
            thumbnailUrl: {
                required: false,
                serializedName: 'thumbnailUrl',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.Entity = {
    required: false,
    serializedName: 'Entity',
    type: {
        name: 'Composite',
        className: 'Entity',
        modelProperties: {
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.ConversationReference = {
    required: false,
    serializedName: 'ConversationReference',
    type: {
        name: 'Composite',
        className: 'ConversationReference',
        modelProperties: {
            activityId: {
                required: false,
                serializedName: 'activityId',
                type: {
                    name: 'String'
                }
            },
            user: {
                required: false,
                serializedName: 'user',
                type: {
                    name: 'Composite',
                    className: 'ChannelAccount'
                }
            },
            bot: {
                required: false,
                serializedName: 'bot',
                type: {
                    name: 'Composite',
                    className: 'ChannelAccount'
                }
            },
            conversation: {
                required: false,
                serializedName: 'conversation',
                type: {
                    name: 'Composite',
                    className: 'ConversationAccount'
                }
            },
            channelId: {
                required: false,
                serializedName: 'channelId',
                type: {
                    name: 'String'
                }
            },
            serviceUrl: {
                required: false,
                serializedName: 'serviceUrl',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.TextHighlight = {
    required: false,
    serializedName: 'TextHighlight',
    type: {
        name: 'Composite',
        className: 'TextHighlight',
        modelProperties: {
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            occurence: {
                required: false,
                serializedName: 'occurence',
                type: {
                    name: 'Number'
                }
            }
        }
    }
};
exports.Activity = {
    required: false,
    serializedName: 'Activity',
    type: {
        name: 'Composite',
        className: 'Activity',
        modelProperties: {
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            timestamp: {
                required: false,
                serializedName: 'timestamp',
                type: {
                    name: 'DateTime'
                }
            },
            localTimestamp: {
                required: false,
                serializedName: 'localTimestamp',
                type: {
                    name: 'DateTime'
                }
            },
            serviceUrl: {
                required: false,
                serializedName: 'serviceUrl',
                type: {
                    name: 'String'
                }
            },
            channelId: {
                required: false,
                serializedName: 'channelId',
                type: {
                    name: 'String'
                }
            },
            from: {
                required: false,
                serializedName: 'from',
                type: {
                    name: 'Composite',
                    className: 'ChannelAccount'
                }
            },
            conversation: {
                required: false,
                serializedName: 'conversation',
                type: {
                    name: 'Composite',
                    className: 'ConversationAccount'
                }
            },
            recipient: {
                required: false,
                serializedName: 'recipient',
                type: {
                    name: 'Composite',
                    className: 'ChannelAccount'
                }
            },
            textFormat: {
                required: false,
                serializedName: 'textFormat',
                type: {
                    name: 'String'
                }
            },
            attachmentLayout: {
                required: false,
                serializedName: 'attachmentLayout',
                type: {
                    name: 'String'
                }
            },
            membersAdded: {
                required: false,
                serializedName: 'membersAdded',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'ChannelAccountElementType',
                        type: {
                            name: 'Composite',
                            className: 'ChannelAccount'
                        }
                    }
                }
            },
            membersRemoved: {
                required: false,
                serializedName: 'membersRemoved',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'ChannelAccountElementType',
                        type: {
                            name: 'Composite',
                            className: 'ChannelAccount'
                        }
                    }
                }
            },
            reactionsAdded: {
                required: false,
                serializedName: 'reactionsAdded',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'MessageReactionElementType',
                        type: {
                            name: 'Composite',
                            className: 'MessageReaction'
                        }
                    }
                }
            },
            reactionsRemoved: {
                required: false,
                serializedName: 'reactionsRemoved',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'MessageReactionElementType',
                        type: {
                            name: 'Composite',
                            className: 'MessageReaction'
                        }
                    }
                }
            },
            topicName: {
                required: false,
                serializedName: 'topicName',
                type: {
                    name: 'String'
                }
            },
            historyDisclosed: {
                required: false,
                serializedName: 'historyDisclosed',
                type: {
                    name: 'Boolean'
                }
            },
            locale: {
                required: false,
                serializedName: 'locale',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            speak: {
                required: false,
                serializedName: 'speak',
                type: {
                    name: 'String'
                }
            },
            inputHint: {
                required: false,
                serializedName: 'inputHint',
                type: {
                    name: 'String'
                }
            },
            summary: {
                required: false,
                serializedName: 'summary',
                type: {
                    name: 'String'
                }
            },
            suggestedActions: {
                required: false,
                serializedName: 'suggestedActions',
                type: {
                    name: 'Composite',
                    className: 'SuggestedActions'
                }
            },
            attachments: {
                required: false,
                serializedName: 'attachments',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'AttachmentElementType',
                        type: {
                            name: 'Composite',
                            className: 'Attachment'
                        }
                    }
                }
            },
            entities: {
                required: false,
                serializedName: 'entities',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'EntityElementType',
                        type: {
                            name: 'Composite',
                            className: 'Entity'
                        }
                    }
                }
            },
            channelData: {
                required: false,
                serializedName: 'channelData',
                type: {
                    name: 'Object'
                }
            },
            action: {
                required: false,
                serializedName: 'action',
                type: {
                    name: 'String'
                }
            },
            replyToId: {
                required: false,
                serializedName: 'replyToId',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'Object'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            },
            relatesTo: {
                required: false,
                serializedName: 'relatesTo',
                type: {
                    name: 'Composite',
                    className: 'ConversationReference'
                }
            },
            code: {
                required: false,
                serializedName: 'code',
                type: {
                    name: 'String'
                }
            },
            expiration: {
                required: false,
                serializedName: 'expiration',
                type: {
                    name: 'DateTime'
                }
            },
            importance: {
                required: false,
                serializedName: 'importance',
                type: {
                    name: 'String'
                }
            },
            deliveryMode: {
                required: false,
                serializedName: 'deliveryMode',
                type: {
                    name: 'String'
                }
            },
            textHighlights: {
                required: false,
                serializedName: 'textHighlights',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'TextHighlightElementType',
                        type: {
                            name: 'Composite',
                            className: 'TextHighlight'
                        }
                    }
                }
            }
        }
    }
};
exports.ConversationParameters = {
    required: false,
    serializedName: 'ConversationParameters',
    type: {
        name: 'Composite',
        className: 'ConversationParameters',
        modelProperties: {
            isGroup: {
                required: false,
                serializedName: 'isGroup',
                type: {
                    name: 'Boolean'
                }
            },
            bot: {
                required: false,
                serializedName: 'bot',
                type: {
                    name: 'Composite',
                    className: 'ChannelAccount'
                }
            },
            members: {
                required: false,
                serializedName: 'members',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'ChannelAccountElementType',
                        type: {
                            name: 'Composite',
                            className: 'ChannelAccount'
                        }
                    }
                }
            },
            topicName: {
                required: false,
                serializedName: 'topicName',
                type: {
                    name: 'String'
                }
            },
            activity: {
                required: false,
                serializedName: 'activity',
                type: {
                    name: 'Composite',
                    className: 'Activity'
                }
            },
            channelData: {
                required: false,
                serializedName: 'channelData',
                type: {
                    name: 'Object'
                }
            }
        }
    }
};
exports.ConversationResourceResponse = {
    required: false,
    serializedName: 'ConversationResourceResponse',
    type: {
        name: 'Composite',
        className: 'ConversationResourceResponse',
        modelProperties: {
            activityId: {
                required: false,
                serializedName: 'activityId',
                type: {
                    name: 'String'
                }
            },
            serviceUrl: {
                required: false,
                serializedName: 'serviceUrl',
                type: {
                    name: 'String'
                }
            },
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.ResourceResponse = {
    required: false,
    serializedName: 'ResourceResponse',
    type: {
        name: 'Composite',
        className: 'ResourceResponse',
        modelProperties: {
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.AttachmentData = {
    required: false,
    serializedName: 'AttachmentData',
    type: {
        name: 'Composite',
        className: 'AttachmentData',
        modelProperties: {
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            },
            originalBase64: {
                required: false,
                serializedName: 'originalBase64',
                type: {
                    name: 'ByteArray'
                }
            },
            thumbnailBase64: {
                required: false,
                serializedName: 'thumbnailBase64',
                type: {
                    name: 'ByteArray'
                }
            }
        }
    }
};
exports.CardImage = {
    required: false,
    serializedName: 'CardImage',
    type: {
        name: 'Composite',
        className: 'CardImage',
        modelProperties: {
            url: {
                required: false,
                serializedName: 'url',
                type: {
                    name: 'String'
                }
            },
            alt: {
                required: false,
                serializedName: 'alt',
                type: {
                    name: 'String'
                }
            },
            tap: {
                required: false,
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction'
                }
            }
        }
    }
};
exports.HeroCard = {
    required: false,
    serializedName: 'HeroCard',
    type: {
        name: 'Composite',
        className: 'HeroCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            images: {
                required: false,
                serializedName: 'images',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardImageElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardImage'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            tap: {
                required: false,
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction'
                }
            }
        }
    }
};
exports.ThumbnailUrl = {
    required: false,
    serializedName: 'ThumbnailUrl',
    type: {
        name: 'Composite',
        className: 'ThumbnailUrl',
        modelProperties: {
            url: {
                required: false,
                serializedName: 'url',
                type: {
                    name: 'String'
                }
            },
            alt: {
                required: false,
                serializedName: 'alt',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.MediaUrl = {
    required: false,
    serializedName: 'MediaUrl',
    type: {
        name: 'Composite',
        className: 'MediaUrl',
        modelProperties: {
            url: {
                required: false,
                serializedName: 'url',
                type: {
                    name: 'String'
                }
            },
            profile: {
                required: false,
                serializedName: 'profile',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.AnimationCard = {
    required: false,
    serializedName: 'AnimationCard',
    type: {
        name: 'Composite',
        className: 'AnimationCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            image: {
                required: false,
                serializedName: 'image',
                type: {
                    name: 'Composite',
                    className: 'ThumbnailUrl'
                }
            },
            media: {
                required: false,
                serializedName: 'media',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'MediaUrlElementType',
                        type: {
                            name: 'Composite',
                            className: 'MediaUrl'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            shareable: {
                required: false,
                serializedName: 'shareable',
                type: {
                    name: 'Boolean'
                }
            },
            autoloop: {
                required: false,
                serializedName: 'autoloop',
                type: {
                    name: 'Boolean'
                }
            },
            autostart: {
                required: false,
                serializedName: 'autostart',
                type: {
                    name: 'Boolean'
                }
            },
            aspect: {
                required: false,
                serializedName: 'aspect',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.AudioCard = {
    required: false,
    serializedName: 'AudioCard',
    type: {
        name: 'Composite',
        className: 'AudioCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            image: {
                required: false,
                serializedName: 'image',
                type: {
                    name: 'Composite',
                    className: 'ThumbnailUrl'
                }
            },
            media: {
                required: false,
                serializedName: 'media',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'MediaUrlElementType',
                        type: {
                            name: 'Composite',
                            className: 'MediaUrl'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            shareable: {
                required: false,
                serializedName: 'shareable',
                type: {
                    name: 'Boolean'
                }
            },
            autoloop: {
                required: false,
                serializedName: 'autoloop',
                type: {
                    name: 'Boolean'
                }
            },
            autostart: {
                required: false,
                serializedName: 'autostart',
                type: {
                    name: 'Boolean'
                }
            },
            aspect: {
                required: false,
                serializedName: 'aspect',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.BasicCard = {
    required: false,
    serializedName: 'BasicCard',
    type: {
        name: 'Composite',
        className: 'BasicCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            images: {
                required: false,
                serializedName: 'images',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardImageElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardImage'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            tap: {
                required: false,
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction'
                }
            }
        }
    }
};
exports.MediaCard = {
    required: false,
    serializedName: 'MediaCard',
    type: {
        name: 'Composite',
        className: 'MediaCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            image: {
                required: false,
                serializedName: 'image',
                type: {
                    name: 'Composite',
                    className: 'ThumbnailUrl'
                }
            },
            media: {
                required: false,
                serializedName: 'media',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'MediaUrlElementType',
                        type: {
                            name: 'Composite',
                            className: 'MediaUrl'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            shareable: {
                required: false,
                serializedName: 'shareable',
                type: {
                    name: 'Boolean'
                }
            },
            autoloop: {
                required: false,
                serializedName: 'autoloop',
                type: {
                    name: 'Boolean'
                }
            },
            autostart: {
                required: false,
                serializedName: 'autostart',
                type: {
                    name: 'Boolean'
                }
            },
            aspect: {
                required: false,
                serializedName: 'aspect',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.ReceiptItem = {
    required: false,
    serializedName: 'ReceiptItem',
    type: {
        name: 'Composite',
        className: 'ReceiptItem',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            image: {
                required: false,
                serializedName: 'image',
                type: {
                    name: 'Composite',
                    className: 'CardImage'
                }
            },
            price: {
                required: false,
                serializedName: 'price',
                type: {
                    name: 'String'
                }
            },
            quantity: {
                required: false,
                serializedName: 'quantity',
                type: {
                    name: 'String'
                }
            },
            tap: {
                required: false,
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction'
                }
            }
        }
    }
};
exports.Fact = {
    required: false,
    serializedName: 'Fact',
    type: {
        name: 'Composite',
        className: 'Fact',
        modelProperties: {
            key: {
                required: false,
                serializedName: 'key',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.ReceiptCard = {
    required: false,
    serializedName: 'ReceiptCard',
    type: {
        name: 'Composite',
        className: 'ReceiptCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            items: {
                required: false,
                serializedName: 'items',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'ReceiptItemElementType',
                        type: {
                            name: 'Composite',
                            className: 'ReceiptItem'
                        }
                    }
                }
            },
            facts: {
                required: false,
                serializedName: 'facts',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'FactElementType',
                        type: {
                            name: 'Composite',
                            className: 'Fact'
                        }
                    }
                }
            },
            tap: {
                required: false,
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction'
                }
            },
            total: {
                required: false,
                serializedName: 'total',
                type: {
                    name: 'String'
                }
            },
            tax: {
                required: false,
                serializedName: 'tax',
                type: {
                    name: 'String'
                }
            },
            vat: {
                required: false,
                serializedName: 'vat',
                type: {
                    name: 'String'
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            }
        }
    }
};
exports.SigninCard = {
    required: false,
    serializedName: 'SigninCard',
    type: {
        name: 'Composite',
        className: 'SigninCard',
        modelProperties: {
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            }
        }
    }
};
exports.ThumbnailCard = {
    required: false,
    serializedName: 'ThumbnailCard',
    type: {
        name: 'Composite',
        className: 'ThumbnailCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            images: {
                required: false,
                serializedName: 'images',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardImageElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardImage'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            tap: {
                required: false,
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction'
                }
            }
        }
    }
};
exports.VideoCard = {
    required: false,
    serializedName: 'VideoCard',
    type: {
        name: 'Composite',
        className: 'VideoCard',
        modelProperties: {
            title: {
                required: false,
                serializedName: 'title',
                type: {
                    name: 'String'
                }
            },
            subtitle: {
                required: false,
                serializedName: 'subtitle',
                type: {
                    name: 'String'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            image: {
                required: false,
                serializedName: 'image',
                type: {
                    name: 'Composite',
                    className: 'ThumbnailUrl'
                }
            },
            media: {
                required: false,
                serializedName: 'media',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'MediaUrlElementType',
                        type: {
                            name: 'Composite',
                            className: 'MediaUrl'
                        }
                    }
                }
            },
            buttons: {
                required: false,
                serializedName: 'buttons',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'CardActionElementType',
                        type: {
                            name: 'Composite',
                            className: 'CardAction'
                        }
                    }
                }
            },
            shareable: {
                required: false,
                serializedName: 'shareable',
                type: {
                    name: 'Boolean'
                }
            },
            autoloop: {
                required: false,
                serializedName: 'autoloop',
                type: {
                    name: 'Boolean'
                }
            },
            autostart: {
                required: false,
                serializedName: 'autostart',
                type: {
                    name: 'Boolean'
                }
            },
            aspect: {
                required: false,
                serializedName: 'aspect',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.GeoCoordinates = {
    required: false,
    serializedName: 'GeoCoordinates',
    type: {
        name: 'Composite',
        className: 'GeoCoordinates',
        modelProperties: {
            elevation: {
                required: false,
                serializedName: 'elevation',
                type: {
                    name: 'Number'
                }
            },
            latitude: {
                required: false,
                serializedName: 'latitude',
                type: {
                    name: 'Number'
                }
            },
            longitude: {
                required: false,
                serializedName: 'longitude',
                type: {
                    name: 'Number'
                }
            },
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.Mention = {
    required: false,
    serializedName: 'Mention',
    type: {
        name: 'Composite',
        className: 'Mention',
        modelProperties: {
            mentioned: {
                required: false,
                serializedName: 'mentioned',
                type: {
                    name: 'Composite',
                    className: 'ChannelAccount'
                }
            },
            text: {
                required: false,
                serializedName: 'text',
                type: {
                    name: 'String'
                }
            },
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.Place = {
    required: false,
    serializedName: 'Place',
    type: {
        name: 'Composite',
        className: 'Place',
        modelProperties: {
            address: {
                required: false,
                serializedName: 'address',
                type: {
                    name: 'Object'
                }
            },
            geo: {
                required: false,
                serializedName: 'geo',
                type: {
                    name: 'Object'
                }
            },
            hasMap: {
                required: false,
                serializedName: 'hasMap',
                type: {
                    name: 'Object'
                }
            },
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.Thing = {
    required: false,
    serializedName: 'Thing',
    type: {
        name: 'Composite',
        className: 'Thing',
        modelProperties: {
            type: {
                required: false,
                serializedName: 'type',
                type: {
                    name: 'String'
                }
            },
            name: {
                required: false,
                serializedName: 'name',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.MediaEventValue = {
    required: false,
    serializedName: 'MediaEventValue',
    type: {
        name: 'Composite',
        className: 'MediaEventValue',
        modelProperties: {
            cardValue: {
                required: false,
                serializedName: 'cardValue',
                type: {
                    name: 'Object'
                }
            }
        }
    }
};
exports.MicrosoftPayMethodData = {
    required: false,
    serializedName: 'MicrosoftPayMethodData',
    type: {
        name: 'Composite',
        className: 'MicrosoftPayMethodData',
        modelProperties: {
            mechantId: {
                required: false,
                serializedName: 'mechantId',
                type: {
                    name: 'String'
                }
            },
            supportedNetworks: {
                required: false,
                serializedName: 'supportedNetworks',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'stringElementType',
                        type: {
                            name: 'String'
                        }
                    }
                }
            },
            supportedTypes: {
                required: false,
                serializedName: 'supportedTypes',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'stringElementType',
                        type: {
                            name: 'String'
                        }
                    }
                }
            }
        }
    }
};
exports.PaymentAddress = {
    required: false,
    serializedName: 'PaymentAddress',
    type: {
        name: 'Composite',
        className: 'PaymentAddress',
        modelProperties: {
            country: {
                required: false,
                serializedName: 'country',
                type: {
                    name: 'String'
                }
            },
            addressLine: {
                required: false,
                serializedName: 'addressLine',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'stringElementType',
                        type: {
                            name: 'String'
                        }
                    }
                }
            },
            region: {
                required: false,
                serializedName: 'region',
                type: {
                    name: 'String'
                }
            },
            city: {
                required: false,
                serializedName: 'city',
                type: {
                    name: 'String'
                }
            },
            dependentLocality: {
                required: false,
                serializedName: 'dependentLocality',
                type: {
                    name: 'String'
                }
            },
            postalCode: {
                required: false,
                serializedName: 'postalCode',
                type: {
                    name: 'String'
                }
            },
            sortingCode: {
                required: false,
                serializedName: 'sortingCode',
                type: {
                    name: 'String'
                }
            },
            languageCode: {
                required: false,
                serializedName: 'languageCode',
                type: {
                    name: 'String'
                }
            },
            organization: {
                required: false,
                serializedName: 'organization',
                type: {
                    name: 'String'
                }
            },
            recipient: {
                required: false,
                serializedName: 'recipient',
                type: {
                    name: 'String'
                }
            },
            phone: {
                required: false,
                serializedName: 'phone',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentCurrencyAmount = {
    required: false,
    serializedName: 'PaymentCurrencyAmount',
    type: {
        name: 'Composite',
        className: 'PaymentCurrencyAmount',
        modelProperties: {
            currency: {
                required: false,
                serializedName: 'currency',
                type: {
                    name: 'String'
                }
            },
            value: {
                required: false,
                serializedName: 'value',
                type: {
                    name: 'String'
                }
            },
            currencySystem: {
                required: false,
                serializedName: 'currencySystem',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentItem = {
    required: false,
    serializedName: 'PaymentItem',
    type: {
        name: 'Composite',
        className: 'PaymentItem',
        modelProperties: {
            label: {
                required: false,
                serializedName: 'label',
                type: {
                    name: 'String'
                }
            },
            amount: {
                required: false,
                serializedName: 'amount',
                type: {
                    name: 'Composite',
                    className: 'PaymentCurrencyAmount'
                }
            },
            pending: {
                required: false,
                serializedName: 'pending',
                type: {
                    name: 'Boolean'
                }
            }
        }
    }
};
exports.PaymentShippingOption = {
    required: false,
    serializedName: 'PaymentShippingOption',
    type: {
        name: 'Composite',
        className: 'PaymentShippingOption',
        modelProperties: {
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            label: {
                required: false,
                serializedName: 'label',
                type: {
                    name: 'String'
                }
            },
            amount: {
                required: false,
                serializedName: 'amount',
                type: {
                    name: 'Composite',
                    className: 'PaymentCurrencyAmount'
                }
            },
            selected: {
                required: false,
                serializedName: 'selected',
                type: {
                    name: 'Boolean'
                }
            }
        }
    }
};
exports.PaymentDetailsModifier = {
    required: false,
    serializedName: 'PaymentDetailsModifier',
    type: {
        name: 'Composite',
        className: 'PaymentDetailsModifier',
        modelProperties: {
            supportedMethods: {
                required: false,
                serializedName: 'supportedMethods',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'stringElementType',
                        type: {
                            name: 'String'
                        }
                    }
                }
            },
            total: {
                required: false,
                serializedName: 'total',
                type: {
                    name: 'Composite',
                    className: 'PaymentItem'
                }
            },
            additionalDisplayItems: {
                required: false,
                serializedName: 'additionalDisplayItems',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'PaymentItemElementType',
                        type: {
                            name: 'Composite',
                            className: 'PaymentItem'
                        }
                    }
                }
            },
            data: {
                required: false,
                serializedName: 'data',
                type: {
                    name: 'Object'
                }
            }
        }
    }
};
exports.PaymentDetails = {
    required: false,
    serializedName: 'PaymentDetails',
    type: {
        name: 'Composite',
        className: 'PaymentDetails',
        modelProperties: {
            total: {
                required: false,
                serializedName: 'total',
                type: {
                    name: 'Composite',
                    className: 'PaymentItem'
                }
            },
            displayItems: {
                required: false,
                serializedName: 'displayItems',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'PaymentItemElementType',
                        type: {
                            name: 'Composite',
                            className: 'PaymentItem'
                        }
                    }
                }
            },
            shippingOptions: {
                required: false,
                serializedName: 'shippingOptions',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'PaymentShippingOptionElementType',
                        type: {
                            name: 'Composite',
                            className: 'PaymentShippingOption'
                        }
                    }
                }
            },
            modifiers: {
                required: false,
                serializedName: 'modifiers',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'PaymentDetailsModifierElementType',
                        type: {
                            name: 'Composite',
                            className: 'PaymentDetailsModifier'
                        }
                    }
                }
            },
            error: {
                required: false,
                serializedName: 'error',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentMethodData = {
    required: false,
    serializedName: 'PaymentMethodData',
    type: {
        name: 'Composite',
        className: 'PaymentMethodData',
        modelProperties: {
            supportedMethods: {
                required: false,
                serializedName: 'supportedMethods',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'stringElementType',
                        type: {
                            name: 'String'
                        }
                    }
                }
            },
            data: {
                required: false,
                serializedName: 'data',
                type: {
                    name: 'Object'
                }
            }
        }
    }
};
exports.PaymentOptions = {
    required: false,
    serializedName: 'PaymentOptions',
    type: {
        name: 'Composite',
        className: 'PaymentOptions',
        modelProperties: {
            requestPayerName: {
                required: false,
                serializedName: 'requestPayerName',
                type: {
                    name: 'Boolean'
                }
            },
            requestPayerEmail: {
                required: false,
                serializedName: 'requestPayerEmail',
                type: {
                    name: 'Boolean'
                }
            },
            requestPayerPhone: {
                required: false,
                serializedName: 'requestPayerPhone',
                type: {
                    name: 'Boolean'
                }
            },
            requestShipping: {
                required: false,
                serializedName: 'requestShipping',
                type: {
                    name: 'Boolean'
                }
            },
            shippingType: {
                required: false,
                serializedName: 'shippingType',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentRequest = {
    required: false,
    serializedName: 'PaymentRequest',
    type: {
        name: 'Composite',
        className: 'PaymentRequest',
        modelProperties: {
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            methodData: {
                required: false,
                serializedName: 'methodData',
                type: {
                    name: 'Sequence',
                    element: {
                        required: false,
                        serializedName: 'PaymentMethodDataElementType',
                        type: {
                            name: 'Composite',
                            className: 'PaymentMethodData'
                        }
                    }
                }
            },
            details: {
                required: false,
                serializedName: 'details',
                type: {
                    name: 'Composite',
                    className: 'PaymentDetails'
                }
            },
            options: {
                required: false,
                serializedName: 'options',
                type: {
                    name: 'Composite',
                    className: 'PaymentOptions'
                }
            },
            expires: {
                required: false,
                serializedName: 'expires',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentResponse = {
    required: false,
    serializedName: 'PaymentResponse',
    type: {
        name: 'Composite',
        className: 'PaymentResponse',
        modelProperties: {
            methodName: {
                required: false,
                serializedName: 'methodName',
                type: {
                    name: 'String'
                }
            },
            details: {
                required: false,
                serializedName: 'details',
                type: {
                    name: 'Object'
                }
            },
            shippingAddress: {
                required: false,
                serializedName: 'shippingAddress',
                type: {
                    name: 'Composite',
                    className: 'PaymentAddress'
                }
            },
            shippingOption: {
                required: false,
                serializedName: 'shippingOption',
                type: {
                    name: 'String'
                }
            },
            payerEmail: {
                required: false,
                serializedName: 'payerEmail',
                type: {
                    name: 'String'
                }
            },
            payerPhone: {
                required: false,
                serializedName: 'payerPhone',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentRequestComplete = {
    required: false,
    serializedName: 'PaymentRequestComplete',
    type: {
        name: 'Composite',
        className: 'PaymentRequestComplete',
        modelProperties: {
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            paymentRequest: {
                required: false,
                serializedName: 'paymentRequest',
                type: {
                    name: 'Composite',
                    className: 'PaymentRequest'
                }
            },
            paymentResponse: {
                required: false,
                serializedName: 'paymentResponse',
                type: {
                    name: 'Composite',
                    className: 'PaymentResponse'
                }
            }
        }
    }
};
exports.PaymentRequestCompleteResult = {
    required: false,
    serializedName: 'PaymentRequestCompleteResult',
    type: {
        name: 'Composite',
        className: 'PaymentRequestCompleteResult',
        modelProperties: {
            result: {
                required: false,
                serializedName: 'result',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentRequestUpdate = {
    required: false,
    serializedName: 'PaymentRequestUpdate',
    type: {
        name: 'Composite',
        className: 'PaymentRequestUpdate',
        modelProperties: {
            id: {
                required: false,
                serializedName: 'id',
                type: {
                    name: 'String'
                }
            },
            details: {
                required: false,
                serializedName: 'details',
                type: {
                    name: 'Composite',
                    className: 'PaymentDetails'
                }
            },
            shippingAddress: {
                required: false,
                serializedName: 'shippingAddress',
                type: {
                    name: 'Composite',
                    className: 'PaymentAddress'
                }
            },
            shippingOption: {
                required: false,
                serializedName: 'shippingOption',
                type: {
                    name: 'String'
                }
            }
        }
    }
};
exports.PaymentRequestUpdateResult = {
    required: false,
    serializedName: 'PaymentRequestUpdateResult',
    type: {
        name: 'Composite',
        className: 'PaymentRequestUpdateResult',
        modelProperties: {
            details: {
                required: false,
                serializedName: 'details',
                type: {
                    name: 'Composite',
                    className: 'PaymentDetails'
                }
            }
        }
    }
};
//# sourceMappingURL=mappers.js.map