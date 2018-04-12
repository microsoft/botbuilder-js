/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export declare const AttachmentView: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            viewId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            size: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const AttachmentInfo: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            views: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const ErrorModel: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            code: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            message: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const ErrorResponse: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            error: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const ChannelAccount: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            role: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const ConversationAccount: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            isGroup: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            conversationType: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            role: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const MessageReaction: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const CardAction: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            image: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            displayText: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const SuggestedActions: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            to: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
            actions: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const Attachment: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            contentType: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            contentUrl: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            content: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            thumbnailUrl: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const Entity: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const ConversationReference: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            activityId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            user: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            bot: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            conversation: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            channelId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            serviceUrl: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const TextHighlight: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            occurence: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const Activity: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            timestamp: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            localTimestamp: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            serviceUrl: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            channelId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            from: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            conversation: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            recipient: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            textFormat: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            attachmentLayout: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            membersAdded: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            membersRemoved: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            reactionsAdded: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            reactionsRemoved: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            topicName: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            historyDisclosed: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            locale: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            speak: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            inputHint: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            summary: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            suggestedActions: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            attachments: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            entities: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            channelData: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            action: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            replyToId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            label: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            valueType: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            relatesTo: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            code: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            expiration: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            importance: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            deliveryMode: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            textHighlights: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const ConversationParameters: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            isGroup: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            bot: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            members: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            topicName: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            activity: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            channelData: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const ConversationResourceResponse: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            activityId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            serviceUrl: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const ConversationMembers: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            members: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const ConversationsResult: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            continuationToken: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            conversations: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const ResourceResponse: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const AttachmentData: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            originalBase64: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            thumbnailBase64: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const CardImage: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            url: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            alt: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            tap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const HeroCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            images: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            tap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const ThumbnailUrl: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            url: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            alt: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const MediaUrl: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            url: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            profile: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const AnimationCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            image: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            media: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            shareable: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autoloop: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autostart: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            aspect: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const AudioCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            image: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            media: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            shareable: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autoloop: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autostart: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            aspect: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const BasicCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            images: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            tap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const MediaCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            image: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            media: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            shareable: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autoloop: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autostart: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            aspect: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const Fact: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            key: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const ReceiptItem: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            image: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            price: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            quantity: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            tap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const ReceiptCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            facts: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            items: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            tap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            total: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            tax: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            vat: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const SigninCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const OAuthCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            connectionName: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const ThumbnailCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            images: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            tap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const VideoCard: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            title: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            subtitle: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            image: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            media: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            buttons: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            shareable: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autoloop: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            autostart: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            aspect: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const GeoCoordinates: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            elevation: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            latitude: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            longitude: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const Mention: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            mentioned: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            text: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const Place: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            address: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            geo: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            hasMap: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const Thing: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            type: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            name: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const MediaEventValue: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            cardValue: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const TokenRequest: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            provider: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            settings: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    value: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const TokenResponse: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            connectionName: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            token: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            expiration: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const MicrosoftPayMethodData: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            mechantId: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            supportedNetworks: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
            supportedTypes: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
        };
    };
};
export declare const PaymentAddress: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            country: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            addressLine: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
            region: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            city: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            dependentLocality: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            postalCode: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            sortingCode: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            languageCode: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            organization: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            recipient: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            phone: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentCurrencyAmount: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            currency: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            value: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            currencySystem: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentItem: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            label: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            amount: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            pending: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentShippingOption: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            label: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            amount: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            selected: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentDetailsModifier: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            supportedMethods: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
            total: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            additionalDisplayItems: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            data: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentDetails: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            total: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            displayItems: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            shippingOptions: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            modifiers: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            error: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentMethodData: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            supportedMethods: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                        };
                    };
                };
            };
            data: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentOptions: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            requestPayerName: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            requestPayerEmail: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            requestPayerPhone: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            requestShipping: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            shippingType: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentRequest: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            methodData: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    element: {
                        required: boolean;
                        serializedName: string;
                        type: {
                            name: string;
                            className: string;
                        };
                    };
                };
            };
            details: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            options: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            expires: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentResponse: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            methodName: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            details: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            shippingAddress: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            shippingOption: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            payerEmail: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            payerPhone: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentRequestComplete: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            paymentRequest: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            paymentResponse: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const PaymentRequestCompleteResult: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            result: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentRequestUpdate: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            id: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
            details: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            shippingAddress: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
            shippingOption: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
export declare const PaymentRequestUpdateResult: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            details: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                    className: string;
                };
            };
        };
    };
};
export declare const ConversationsGetConversationsOptionalParams: {
    required: boolean;
    serializedName: string;
    type: {
        name: string;
        className: string;
        modelProperties: {
            continuationToken: {
                required: boolean;
                serializedName: string;
                type: {
                    name: string;
                };
            };
        };
    };
};
