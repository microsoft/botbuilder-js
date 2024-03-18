/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CompositeMapper } from '@azure/core-http';

export const ChannelInfo: CompositeMapper = {
    serializedName: 'ChannelInfo',
    type: {
        name: 'Composite',
        className: 'ChannelInfo',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const ConversationList: CompositeMapper = {
    serializedName: 'ConversationList',
    type: {
        name: 'Composite',
        className: 'ConversationList',
        modelProperties: {
            conversations: {
                serializedName: 'conversations',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'ChannelInfo',
                        },
                    },
                },
            },
        },
    },
};

export const TeamDetails: CompositeMapper = {
    serializedName: 'TeamDetails',
    type: {
        name: 'Composite',
        className: 'TeamDetails',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            aadGroupId: {
                serializedName: 'aadGroupId',
                type: {
                    name: 'String',
                },
            },
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TeamInfo: CompositeMapper = {
    serializedName: 'TeamInfo',
    type: {
        name: 'Composite',
        className: 'TeamInfo',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            aadGroupId: {
                serializedName: 'aadGroupId',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const NotificationInfo: CompositeMapper = {
    serializedName: 'NotificationInfo',
    type: {
        name: 'Composite',
        className: 'NotificationInfo',
        modelProperties: {
            alert: {
                serializedName: 'alert',
                type: {
                    name: 'Boolean',
                },
            },
            alertInMeeting: {
                serializedName: 'alertInMeeting',
                type: {
                    name: 'Boolean',
                },
            },
            externalResourceUrl: {
                serializedName: 'externalResourceUrl',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TenantInfo: CompositeMapper = {
    serializedName: 'TenantInfo',
    type: {
        name: 'Composite',
        className: 'TenantInfo',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TeamsChannelData: CompositeMapper = {
    serializedName: 'TeamsChannelData',
    type: {
        name: 'Composite',
        className: 'TeamsChannelData',
        modelProperties: {
            channel: {
                serializedName: 'channel',
                type: {
                    name: 'Composite',
                    className: 'ChannelInfo',
                },
            },
            eventType: {
                serializedName: 'eventType',
                type: {
                    name: 'String',
                },
            },
            team: {
                serializedName: 'team',
                type: {
                    name: 'Composite',
                    className: 'TeamInfo',
                },
            },
            notification: {
                serializedName: 'notification',
                type: {
                    name: 'Composite',
                    className: 'NotificationInfo',
                },
            },
            tenant: {
                serializedName: 'tenant',
                type: {
                    name: 'Composite',
                    className: 'TenantInfo',
                },
            },
            settings: {
                serializedName: 'settings',
                type: {
                    name: 'Composite',
                    className: 'TeamsChannelDataSettings',
                },
            },
        },
    },
};

export const TeamsChannelDataSettings: CompositeMapper = {
    serializedName: 'TeamsChannelDataSettings',
    type: {
        name: 'Composite',
        className: 'TeamsChannelDataSettings',
        modelProperties: {
            selectedChannel: {
                serializedName: 'selectedChannel',
                type: {
                    name: 'Composite',
                    className: 'ChannelInfo',
                },
            },
        },
    },
};

export const ChannelAccount: CompositeMapper = {
    serializedName: 'ChannelAccount',
    type: {
        name: 'Composite',
        className: 'ChannelAccount',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TeamsChannelAccount: CompositeMapper = {
    serializedName: 'TeamsChannelAccount',
    type: {
        name: 'Composite',
        className: 'TeamsChannelAccount',
        modelProperties: {
            ...ChannelAccount.type.modelProperties,
            givenName: {
                serializedName: 'givenName',
                type: {
                    name: 'String',
                },
            },
            surname: {
                serializedName: 'surname',
                type: {
                    name: 'String',
                },
            },
            email: {
                serializedName: 'email',
                type: {
                    name: 'String',
                },
            },
            userPrincipalName: {
                serializedName: 'userPrincipalName',
                type: {
                    name: 'String',
                },
            },
            tenantId: {
                serializedName: 'tenantId',
                type: {
                    name: 'String',
                },
            },
            userRole: {
                serializedName: 'userRole',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const Meeting: CompositeMapper = {
    serializedName: 'meeting',
    type: {
        name: 'Composite',
        className: 'Meeting',
        modelProperties: {
            role: {
                serializedName: 'role',
                type: {
                    name: 'String',
                },
            },
            inMeeting: {
                serializedName: 'inMeeting',
                type: {
                    name: 'Boolean',
                },
            },
        },
    },
};

export const TeamsMeetingParticipant: CompositeMapper = {
    serializedName: 'TeamsMeetingParticipant',
    type: {
        name: 'Composite',
        className: 'TeamsMeetingParticipant',
        modelProperties: {
            user: {
                serializedName: 'user',
                type: {
                    name: 'Composite',
                    className: 'TeamsChannelAccount',
                },
            },
            meeting: {
                serializedName: 'meeting',
                type: {
                    name: 'Composite',
                    className: 'Meeting',
                },
            },
            conversation: {
                serializedName: 'conversation',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadConversation',
                },
            },
        },
    },
};

export const TeamsMeetingInfo: CompositeMapper = {
    serializedName: 'TeamsMeetingInfo',
    type: {
        name: 'Composite',
        className: 'TeamsMeetingInfo',
        modelProperties: {
            details: {
                serializedName: 'details',
                type: {
                    name: 'Composite',
                    className: 'TeamsMeetingDetails',
                },
            },
            conversation: {
                serializedName: 'conversation',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadConversation',
                },
            },
            organizer: {
                serializedName: 'organizer',
                type: {
                    name: 'Composite',
                    className: 'TeamsChannelAccount',
                },
            },
        },
    },
};

export const TeamsMeetingDetails: CompositeMapper = {
    serializedName: 'TeamsMeetingDetails',
    type: {
        name: 'Composite',
        className: 'TeamsMeetingDetails',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            msGraphResourceId: {
                serializedName: 'msGraphResourceId',
                type: {
                    name: 'String',
                },
            },
            scheduledStartTime: {
                serializedName: 'scheduledStartTime',
                type: {
                    name: 'DateTime',
                },
            },
            scheduledEndTime: {
                serializedName: 'scheduledEndTime',
                type: {
                    name: 'DateTime',
                },
            },
            joinUrl: {
                serializedName: 'joinUrl',
                type: {
                    name: 'String',
                },
            },
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MeetingNotification: CompositeMapper = {
    serializedName: 'MeetingNotification',
    type: {
        name: 'Composite',
        className: 'MeetingNotification',
        modelProperties: {
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
            value: {
                serializedName: 'value',
                type: {
                    name: 'any',
                },
            },
            channelData: {
                serializedName: 'channelData',
                type: {
                    name: 'Composite',
                    className: 'MeetingNotificationChannelData',
                },
            },
        },
    },
};

export const MeetingNotificationChannelData = {
    serializedName: 'MeetingNotificationChannelData',
    type: {
        name: 'Composite',
        className: 'MeetingNotificationChannelData',
        modelProperties: {
            onBehalfOf: {
                serializedName: 'onBehalfOf',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'OnBehalfOf',
                        },
                    },
                },
            },
        },
    },
};

export const OnBehalfOf: CompositeMapper = {
    serializedName: 'OnBehalfOf',
    type: {
        name: 'Composite',
        className: 'OnBehalfOf',
        modelProperties: {
            itemid: {
                serializedName: 'itemid',
                type: {
                    name: 'Number',
                },
            },
            mentionType: {
                serializedName: 'mentionType',
                type: {
                    name: 'String',
                },
            },
            mri: {
                serializedName: 'mri',
                type: {
                    name: 'String',
                },
            },
            displayName: {
                serializedName: 'displayName',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MeetingNotificationRecipientFailureInfo: CompositeMapper = {
    serializedName: 'MeetingNotificationRecipientFailureInfo',
    type: {
        name: 'Composite',
        className: 'MeetingNotificationRecipientFailureInfo',
        modelProperties: {
            recipientMri: {
                serializedName: 'recipientMri',
                type: {
                    name: 'String',
                },
            },
            failureReason: {
                serializedName: 'failureReason',
                type: {
                    name: 'String',
                },
            },
            errorCode: {
                serializedName: 'errorCode',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MeetingNotificationResponse: CompositeMapper = {
    serializedName: 'MeetingNotificationResponse',
    type: {
        name: 'Composite',
        className: 'MeetingNotificationResponse',
        modelProperties: {
            recipientsFailureInfo: {
                serializedName: 'recipientsFailureInfo',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'MeetingNotificationRecipientFailureInfo',
                        },
                    },
                },
            },
        },
    },
};

export const CardAction: CompositeMapper = {
    serializedName: 'CardAction',
    type: {
        name: 'Composite',
        className: 'CardAction',
        modelProperties: {
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
            image: {
                serializedName: 'image',
                type: {
                    name: 'String',
                },
            },
            value: {
                serializedName: 'value',
                type: {
                    name: 'Object',
                },
            },
        },
    },
};

export const CardImage: CompositeMapper = {
    serializedName: 'CardImage',
    type: {
        name: 'Composite',
        className: 'CardImage',
        modelProperties: {
            url: {
                serializedName: 'url',
                type: {
                    name: 'String',
                },
            },
            alt: {
                serializedName: 'alt',
                type: {
                    name: 'String',
                },
            },
            tap: {
                serializedName: 'tap',
                type: {
                    name: 'Composite',
                    className: 'CardAction',
                },
            },
        },
    },
};

export const O365ConnectorCardFact: CompositeMapper = {
    serializedName: 'O365ConnectorCardFact',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardFact',
        modelProperties: {
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            value: {
                serializedName: 'value',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardImage: CompositeMapper = {
    serializedName: 'O365ConnectorCardImage',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardImage',
        modelProperties: {
            image: {
                serializedName: 'image',
                type: {
                    name: 'String',
                },
            },
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardActionBase: CompositeMapper = {
    serializedName: 'O365ConnectorCardActionBase',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardActionBase',
        modelProperties: {
            type: {
                serializedName: '@type',
                type: {
                    name: 'String',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            id: {
                serializedName: '@id',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardSection: CompositeMapper = {
    serializedName: 'O365ConnectorCardSection',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardSection',
        modelProperties: {
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
            text: {
                serializedName: 'text',
                type: {
                    name: 'String',
                },
            },
            activityTitle: {
                serializedName: 'activityTitle',
                type: {
                    name: 'String',
                },
            },
            activitySubtitle: {
                serializedName: 'activitySubtitle',
                type: {
                    name: 'String',
                },
            },
            activityText: {
                serializedName: 'activityText',
                type: {
                    name: 'String',
                },
            },
            activityImage: {
                serializedName: 'activityImage',
                type: {
                    name: 'String',
                },
            },
            activityImageType: {
                serializedName: 'activityImageType',
                type: {
                    name: 'String',
                },
            },
            markdown: {
                serializedName: 'markdown',
                type: {
                    name: 'Boolean',
                },
            },
            facts: {
                serializedName: 'facts',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardFact',
                        },
                    },
                },
            },
            images: {
                serializedName: 'images',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardImage',
                        },
                    },
                },
            },
            potentialAction: {
                serializedName: 'potentialAction',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardActionBase',
                        },
                    },
                },
            },
        },
    },
};

export const O365ConnectorCard: CompositeMapper = {
    serializedName: 'O365ConnectorCard',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCard',
        modelProperties: {
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
            text: {
                serializedName: 'text',
                type: {
                    name: 'String',
                },
            },
            summary: {
                serializedName: 'summary',
                type: {
                    name: 'String',
                },
            },
            themeColor: {
                serializedName: 'themeColor',
                type: {
                    name: 'String',
                },
            },
            sections: {
                serializedName: 'sections',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardSection',
                        },
                    },
                },
            },
            potentialAction: {
                serializedName: 'potentialAction',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardActionBase',
                        },
                    },
                },
            },
        },
    },
};

export const O365ConnectorCardViewAction: CompositeMapper = {
    serializedName: 'O365ConnectorCardViewAction',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardViewAction',
        modelProperties: {
            ...O365ConnectorCardActionBase.type.modelProperties,
            target: {
                serializedName: 'target',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'String',
                        },
                    },
                },
            },
        },
    },
};

export const O365ConnectorCardOpenUriTarget: CompositeMapper = {
    serializedName: 'O365ConnectorCardOpenUriTarget',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardOpenUriTarget',
        modelProperties: {
            os: {
                serializedName: 'os',
                type: {
                    name: 'String',
                },
            },
            uri: {
                serializedName: 'uri',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardOpenUri: CompositeMapper = {
    serializedName: 'O365ConnectorCardOpenUri',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardOpenUri',
        modelProperties: {
            ...O365ConnectorCardActionBase.type.modelProperties,
            targets: {
                serializedName: 'targets',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardOpenUriTarget',
                        },
                    },
                },
            },
        },
    },
};

export const O365ConnectorCardHttpPOST: CompositeMapper = {
    serializedName: 'O365ConnectorCardHttpPOST',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardHttpPOST',
        modelProperties: {
            ...O365ConnectorCardActionBase.type.modelProperties,
            body: {
                serializedName: 'body',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardInputBase: CompositeMapper = {
    serializedName: 'O365ConnectorCardInputBase',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardInputBase',
        modelProperties: {
            type: {
                serializedName: '@type',
                type: {
                    name: 'String',
                },
            },
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            isRequired: {
                serializedName: 'isRequired',
                type: {
                    name: 'Boolean',
                },
            },
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
            value: {
                serializedName: 'value',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardActionCard: CompositeMapper = {
    serializedName: 'O365ConnectorCardActionCard',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardActionCard',
        modelProperties: {
            ...O365ConnectorCardActionBase.type.modelProperties,
            inputs: {
                serializedName: 'inputs',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardInputBase',
                        },
                    },
                },
            },
            actions: {
                serializedName: 'actions',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardActionBase',
                        },
                    },
                },
            },
        },
    },
};

export const O365ConnectorCardTextInput: CompositeMapper = {
    serializedName: 'O365ConnectorCardTextInput',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardTextInput',
        modelProperties: {
            ...O365ConnectorCardInputBase.type.modelProperties,
            isMultiline: {
                serializedName: 'isMultiline',
                type: {
                    name: 'Boolean',
                },
            },
            maxLength: {
                serializedName: 'maxLength',
                type: {
                    name: 'Number',
                },
            },
        },
    },
};

export const O365ConnectorCardDateInput: CompositeMapper = {
    serializedName: 'O365ConnectorCardDateInput',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardDateInput',
        modelProperties: {
            ...O365ConnectorCardInputBase.type.modelProperties,
            includeTime: {
                serializedName: 'includeTime',
                type: {
                    name: 'Boolean',
                },
            },
        },
    },
};

export const O365ConnectorCardMultichoiceInputChoice: CompositeMapper = {
    serializedName: 'O365ConnectorCardMultichoiceInputChoice',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardMultichoiceInputChoice',
        modelProperties: {
            display: {
                serializedName: 'display',
                type: {
                    name: 'String',
                },
            },
            value: {
                serializedName: 'value',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const O365ConnectorCardMultichoiceInput: CompositeMapper = {
    serializedName: 'O365ConnectorCardMultichoiceInput',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardMultichoiceInput',
        modelProperties: {
            ...O365ConnectorCardInputBase.type.modelProperties,
            choices: {
                serializedName: 'choices',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'O365ConnectorCardMultichoiceInputChoice',
                        },
                    },
                },
            },
            style: {
                serializedName: 'style',
                type: {
                    name: 'String',
                },
            },
            isMultiSelect: {
                serializedName: 'isMultiSelect',
                type: {
                    name: 'Boolean',
                },
            },
        },
    },
};

export const O365ConnectorCardActionQuery: CompositeMapper = {
    serializedName: 'O365ConnectorCardActionQuery',
    type: {
        name: 'Composite',
        className: 'O365ConnectorCardActionQuery',
        modelProperties: {
            body: {
                serializedName: 'body',
                type: {
                    name: 'String',
                },
            },
            actionId: {
                serializedName: 'actionId',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const SigninStateVerificationQuery: CompositeMapper = {
    serializedName: 'SigninStateVerificationQuery',
    type: {
        name: 'Composite',
        className: 'SigninStateVerificationQuery',
        modelProperties: {
            state: {
                serializedName: 'state',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessagingExtensionQueryOptions: CompositeMapper = {
    serializedName: 'MessagingExtensionQueryOptions',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionQueryOptions',
        modelProperties: {
            skip: {
                serializedName: 'skip',
                type: {
                    name: 'Number',
                },
            },
            count: {
                serializedName: 'count',
                type: {
                    name: 'Number',
                },
            },
        },
    },
};

export const MessagingExtensionParameter: CompositeMapper = {
    serializedName: 'MessagingExtensionParameter',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionParameter',
        modelProperties: {
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            value: {
                serializedName: 'value',
                type: {
                    name: 'Object',
                },
            },
        },
    },
};

export const MessagingExtensionQuery: CompositeMapper = {
    serializedName: 'MessagingExtensionQuery',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionQuery',
        modelProperties: {
            commandId: {
                serializedName: 'commandId',
                type: {
                    name: 'String',
                },
            },
            parameters: {
                serializedName: 'parameters',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'MessagingExtensionParameter',
                        },
                    },
                },
            },
            queryOptions: {
                serializedName: 'queryOptions',
                type: {
                    name: 'Composite',
                    className: 'MessagingExtensionQueryOptions',
                },
            },
            state: {
                serializedName: 'state',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const Activity: CompositeMapper = {
    serializedName: 'Activity',
    type: {
        name: 'Composite',
        className: 'Activity',
        modelProperties: {
            dummyProperty: {
                serializedName: 'dummyProperty',
                type: {
                    name: 'String',
                },
            },
            text: {
                serializedName: 'text',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessageActionsPayloadUser: CompositeMapper = {
    serializedName: 'MessageActionsPayloadUser',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadUser',
        modelProperties: {
            userIdentityType: {
                serializedName: 'userIdentityType',
                type: {
                    name: 'String',
                },
            },
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            displayName: {
                serializedName: 'displayName',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessageActionsPayloadApp: CompositeMapper = {
    serializedName: 'MessageActionsPayloadApp',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadApp',
        modelProperties: {
            applicationIdentityType: {
                serializedName: 'applicationIdentityType',
                type: {
                    name: 'String',
                },
            },
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            displayName: {
                serializedName: 'displayName',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessageActionsPayloadConversation: CompositeMapper = {
    serializedName: 'MessageActionsPayloadConversation',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadConversation',
        modelProperties: {
            conversationIdentityType: {
                serializedName: 'conversationIdentityType',
                type: {
                    name: 'String',
                },
            },
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            displayName: {
                serializedName: 'displayName',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessageActionsPayloadFrom: CompositeMapper = {
    serializedName: 'MessageActionsPayloadFrom',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadFrom',
        modelProperties: {
            user: {
                serializedName: 'user',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadUser',
                },
            },
            application: {
                serializedName: 'application',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadApp',
                },
            },
            conversation: {
                serializedName: 'conversation',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadConversation',
                },
            },
        },
    },
};

export const MessageActionsPayloadBody: CompositeMapper = {
    serializedName: 'MessageActionsPayload_body',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadBody',
        modelProperties: {
            contentType: {
                serializedName: 'contentType',
                type: {
                    name: 'String',
                },
            },
            content: {
                serializedName: 'content',
                type: {
                    name: 'String',
                },
            },
            textContent: {
                serializedName: 'textContent',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessageActionsPayloadAttachment: CompositeMapper = {
    serializedName: 'MessageActionsPayloadAttachment',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadAttachment',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            contentType: {
                serializedName: 'contentType',
                type: {
                    name: 'String',
                },
            },
            contentUrl: {
                serializedName: 'contentUrl',
                type: {
                    name: 'String',
                },
            },
            content: {
                serializedName: 'content',
                type: {
                    name: 'Object',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            thumbnailUrl: {
                serializedName: 'thumbnailUrl',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessageActionsPayloadMention: CompositeMapper = {
    serializedName: 'MessageActionsPayloadMention',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadMention',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'Number',
                },
            },
            mentionText: {
                serializedName: 'mentionText',
                type: {
                    name: 'String',
                },
            },
            mentioned: {
                serializedName: 'mentioned',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadFrom',
                },
            },
        },
    },
};

export const MessageActionsPayloadReaction: CompositeMapper = {
    serializedName: 'MessageActionsPayloadReaction',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayloadReaction',
        modelProperties: {
            reactionType: {
                serializedName: 'reactionType',
                type: {
                    name: 'String',
                },
            },
            createdDateTime: {
                serializedName: 'createdDateTime',
                type: {
                    name: 'String',
                },
            },
            user: {
                serializedName: 'user',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadFrom',
                },
            },
        },
    },
};

export const MessageActionsPayload: CompositeMapper = {
    serializedName: 'MessageActionsPayload',
    type: {
        name: 'Composite',
        className: 'MessageActionsPayload',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
            replyToId: {
                serializedName: 'replyToId',
                type: {
                    name: 'String',
                },
            },
            messageType: {
                serializedName: 'messageType',
                type: {
                    name: 'String',
                },
            },
            createdDateTime: {
                serializedName: 'createdDateTime',
                type: {
                    name: 'String',
                },
            },
            lastModifiedDateTime: {
                serializedName: 'lastModifiedDateTime',
                type: {
                    name: 'String',
                },
            },
            deleted: {
                serializedName: 'deleted',
                type: {
                    name: 'Boolean',
                },
            },
            subject: {
                serializedName: 'subject',
                type: {
                    name: 'String',
                },
            },
            summary: {
                serializedName: 'summary',
                type: {
                    name: 'String',
                },
            },
            importance: {
                serializedName: 'importance',
                type: {
                    name: 'String',
                },
            },
            locale: {
                serializedName: 'locale',
                type: {
                    name: 'String',
                },
            },
            from: {
                serializedName: 'from',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadFrom',
                },
            },
            body: {
                serializedName: 'body',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayloadBody',
                },
            },
            attachmentLayout: {
                serializedName: 'attachmentLayout',
                type: {
                    name: 'String',
                },
            },
            attachments: {
                serializedName: 'attachments',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'MessageActionsPayloadAttachment',
                        },
                    },
                },
            },
            mentions: {
                serializedName: 'mentions',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'MessageActionsPayloadMention',
                        },
                    },
                },
            },
            reactions: {
                serializedName: 'reactions',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'MessageActionsPayloadReaction',
                        },
                    },
                },
            },
            linkToMessage: {
                serializedName: 'linkToMessage',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TaskModuleRequest: CompositeMapper = {
    serializedName: 'TaskModuleRequest',
    type: {
        name: 'Composite',
        className: 'TaskModuleRequest',
        modelProperties: {
            data: {
                serializedName: 'data',
                type: {
                    name: 'Object',
                },
            },
            context: {
                serializedName: 'context',
                type: {
                    name: 'Composite',
                    className: 'TaskModuleRequestContext',
                },
            },
        },
    },
};

export const MessagingExtensionAction: CompositeMapper = {
    serializedName: 'MessagingExtensionAction',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionAction',
        modelProperties: {
            ...TaskModuleRequest.type.modelProperties,
            commandId: {
                serializedName: 'commandId',
                type: {
                    name: 'String',
                },
            },
            commandContext: {
                serializedName: 'commandContext',
                type: {
                    name: 'String',
                },
            },
            botMessagePreviewAction: {
                serializedName: 'botMessagePreviewAction',
                type: {
                    name: 'String',
                },
            },
            botActivityPreview: {
                serializedName: 'botActivityPreview',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'Activity',
                        },
                    },
                },
            },
            messagePayload: {
                serializedName: 'messagePayload',
                type: {
                    name: 'Composite',
                    className: 'MessageActionsPayload',
                },
            },
        },
    },
};

export const TaskModuleResponseBase: CompositeMapper = {
    serializedName: 'TaskModuleResponseBase',
    type: {
        name: 'Composite',
        className: 'TaskModuleResponseBase',
        modelProperties: {
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const Attachment: CompositeMapper = {
    serializedName: 'Attachment',
    type: {
        name: 'Composite',
        className: 'Attachment',
        modelProperties: {
            contentType: {
                serializedName: 'contentType',
                type: {
                    name: 'String',
                },
            },
            contentUrl: {
                serializedName: 'contentUrl',
                type: {
                    name: 'String',
                },
            },
            content: {
                serializedName: 'content',
                type: {
                    name: 'Object',
                },
            },
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            thumbnailUrl: {
                serializedName: 'thumbnailUrl',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const MessagingExtensionAttachment: CompositeMapper = {
    serializedName: 'MessagingExtensionAttachment',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionAttachment',
        modelProperties: {
            ...Attachment.type.modelProperties,
            preview: {
                serializedName: 'preview',
                type: {
                    name: 'Composite',
                    className: 'Attachment',
                },
            },
        },
    },
};

export const MessagingExtensionSuggestedAction: CompositeMapper = {
    serializedName: 'MessagingExtensionSuggestedAction',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionSuggestedAction',
        modelProperties: {
            actions: {
                serializedName: 'actions',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'CardAction',
                        },
                    },
                },
            },
        },
    },
};

export const MessagingExtensionResult: CompositeMapper = {
    serializedName: 'MessagingExtensionResult',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionResult',
        modelProperties: {
            attachmentLayout: {
                serializedName: 'attachmentLayout',
                type: {
                    name: 'String',
                },
            },
            type: {
                serializedName: 'type',
                type: {
                    name: 'String',
                },
            },
            attachments: {
                serializedName: 'attachments',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'MessagingExtensionAttachment',
                        },
                    },
                },
            },
            suggestedActions: {
                serializedName: 'suggestedActions',
                type: {
                    name: 'Composite',
                    className: 'MessagingExtensionSuggestedAction',
                },
            },
            text: {
                serializedName: 'text',
                type: {
                    name: 'String',
                },
            },
            activityPreview: {
                serializedName: 'activityPreview',
                type: {
                    name: 'Composite',
                    className: 'Activity',
                },
            },
        },
    },
};

export const CacheInfo: CompositeMapper = {
    serializedName: 'cacheInfo',
    type: {
        name: 'Composite',
        className: 'cacheInfo',
        modelProperties: {
            cacheType: {
                serializedName: 'cacheType',
                type: {
                    name: 'String',
                },
            },
            cacheDuration: {
                serializedName: 'cacheDuration',
                type: {
                    name: 'Number',
                },
            },
        },
    },
};

export const MessagingExtensionActionResponse: CompositeMapper = {
    serializedName: 'MessagingExtensionActionResponse',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionActionResponse',
        modelProperties: {
            task: {
                serializedName: 'task',
                type: {
                    name: 'Composite',
                    className: 'TaskModuleResponseBase',
                },
            },
            composeExtension: {
                serializedName: 'composeExtension',
                type: {
                    name: 'Composite',
                    className: 'MessagingExtensionResult',
                },
            },
            cacheInfo: {
                serializedName: 'cacheInfo',
                type: {
                    name: 'Composite',
                    className: 'cacheInfo',
                },
            },
        },
    },
};

export const MessagingExtensionResponse: CompositeMapper = {
    serializedName: 'MessagingExtensionResponse',
    type: {
        name: 'Composite',
        className: 'MessagingExtensionResponse',
        modelProperties: {
            composeExtension: {
                serializedName: 'composeExtension',
                type: {
                    name: 'Composite',
                    className: 'MessagingExtensionResult',
                },
            },
            cacheInfo: {
                serializedName: 'cacheInfo',
                type: {
                    name: 'Composite',
                    className: 'cacheInfo',
                },
            },
        },
    },
};

export const FileConsentCard: CompositeMapper = {
    serializedName: 'FileConsentCard',
    type: {
        name: 'Composite',
        className: 'FileConsentCard',
        modelProperties: {
            description: {
                serializedName: 'description',
                type: {
                    name: 'String',
                },
            },
            sizeInBytes: {
                serializedName: 'sizeInBytes',
                type: {
                    name: 'Number',
                },
            },
            acceptContext: {
                serializedName: 'acceptContext',
                type: {
                    name: 'Object',
                },
            },
            declineContext: {
                serializedName: 'declineContext',
                type: {
                    name: 'Object',
                },
            },
        },
    },
};

export const FileDownloadInfo: CompositeMapper = {
    serializedName: 'FileDownloadInfo',
    type: {
        name: 'Composite',
        className: 'FileDownloadInfo',
        modelProperties: {
            downloadUrl: {
                serializedName: 'downloadUrl',
                type: {
                    name: 'String',
                },
            },
            uniqueId: {
                serializedName: 'uniqueId',
                type: {
                    name: 'String',
                },
            },
            fileType: {
                serializedName: 'fileType',
                type: {
                    name: 'String',
                },
            },
            etag: {
                serializedName: 'etag',
                type: {
                    name: 'Object',
                },
            },
        },
    },
};

export const FileInfoCard: CompositeMapper = {
    serializedName: 'FileInfoCard',
    type: {
        name: 'Composite',
        className: 'FileInfoCard',
        modelProperties: {
            uniqueId: {
                serializedName: 'uniqueId',
                type: {
                    name: 'String',
                },
            },
            fileType: {
                serializedName: 'fileType',
                type: {
                    name: 'String',
                },
            },
            etag: {
                serializedName: 'etag',
                type: {
                    name: 'Object',
                },
            },
        },
    },
};

export const FileUploadInfo: CompositeMapper = {
    serializedName: 'FileUploadInfo',
    type: {
        name: 'Composite',
        className: 'FileUploadInfo',
        modelProperties: {
            name: {
                serializedName: 'name',
                type: {
                    name: 'String',
                },
            },
            uploadUrl: {
                serializedName: 'uploadUrl',
                type: {
                    name: 'String',
                },
            },
            contentUrl: {
                serializedName: 'contentUrl',
                type: {
                    name: 'String',
                },
            },
            uniqueId: {
                serializedName: 'uniqueId',
                type: {
                    name: 'String',
                },
            },
            fileType: {
                serializedName: 'fileType',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const FileConsentCardResponse: CompositeMapper = {
    serializedName: 'FileConsentCardResponse',
    type: {
        name: 'Composite',
        className: 'FileConsentCardResponse',
        modelProperties: {
            action: {
                serializedName: 'action',
                type: {
                    name: 'String',
                },
            },
            context: {
                serializedName: 'context',
                type: {
                    name: 'Object',
                },
            },
            uploadInfo: {
                serializedName: 'uploadInfo',
                type: {
                    name: 'Composite',
                    className: 'FileUploadInfo',
                },
            },
        },
    },
};

export const TaskModuleTaskInfo: CompositeMapper = {
    serializedName: 'TaskModuleTaskInfo',
    type: {
        name: 'Composite',
        className: 'TaskModuleTaskInfo',
        modelProperties: {
            title: {
                serializedName: 'title',
                type: {
                    name: 'String',
                },
            },
            height: {
                serializedName: 'height',
                type: {
                    name: 'Object',
                },
            },
            width: {
                serializedName: 'width',
                type: {
                    name: 'Object',
                },
            },
            url: {
                serializedName: 'url',
                type: {
                    name: 'String',
                },
            },
            card: {
                serializedName: 'card',
                type: {
                    name: 'Composite',
                    className: 'Attachment',
                },
            },
            fallbackUrl: {
                serializedName: 'fallbackUrl',
                type: {
                    name: 'String',
                },
            },
            completionBotId: {
                serializedName: 'completionBotId',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TaskModuleContinueResponse: CompositeMapper = {
    serializedName: 'TaskModuleContinueResponse',
    type: {
        name: 'Composite',
        className: 'TaskModuleContinueResponse',
        modelProperties: {
            ...TaskModuleResponseBase.type.modelProperties,
            value: {
                serializedName: 'value',
                type: {
                    name: 'Composite',
                    className: 'TaskModuleTaskInfo',
                },
            },
        },
    },
};

export const TaskModuleMessageResponse: CompositeMapper = {
    serializedName: 'TaskModuleMessageResponse',
    type: {
        name: 'Composite',
        className: 'TaskModuleMessageResponse',
        modelProperties: {
            ...TaskModuleResponseBase.type.modelProperties,
            value: {
                serializedName: 'value',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const TaskModuleResponse: CompositeMapper = {
    serializedName: 'TaskModuleResponse',
    type: {
        name: 'Composite',
        className: 'TaskModuleResponse',
        modelProperties: {
            task: {
                serializedName: 'task',
                type: {
                    name: 'Composite',
                    className: 'TaskModuleResponseBase',
                },
            },
            cacheInfo: {
                serializedName: 'cacheInfo',
                type: {
                    name: 'Composite',
                    className: 'cacheInfo',
                },
            },
        },
    },
};

export const TaskModuleRequestContext: CompositeMapper = {
    serializedName: 'TaskModuleRequest_context',
    type: {
        name: 'Composite',
        className: 'TaskModuleRequestContext',
        modelProperties: {
            theme: {
                serializedName: 'theme',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const AppBasedLinkQuery: CompositeMapper = {
    serializedName: 'AppBasedLinkQuery',
    type: {
        name: 'Composite',
        className: 'AppBasedLinkQuery',
        modelProperties: {
            url: {
                serializedName: 'url',
                type: {
                    name: 'String',
                },
            },
            state: {
                serializedName: 'state',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const BatchOperationRequest: CompositeMapper = {
    serializedName: 'BatchOperationRequest',
    type: {
        name: 'Composite',
        className: 'BatchOperationRequest',
        modelProperties: {
            activity: {
                serializedName: 'activity',
                type: {
                    name: 'Composite',
                    className: 'Activity',
                    modelProperties: {
                        text: {
                            serializedName: 'text',
                            type: {
                                name: 'String',
                            },
                        },
                        type: {
                            serializedName: 'type',
                            type: {
                                name: 'String',
                            },
                        },
                    },
                },
            },
            tenantId: {
                serializedName: 'tenantId',
                type: {
                    name: 'String',
                },
            },
            teamId: {
                serializedName: 'teamId',
                type: {
                    name: 'String',
                },
            },
            members: {
                serializedName: 'members',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'TeamsMember',
                            modelProperties: {
                                id: {
                                    serializedName: 'id',
                                    type: {
                                        name: 'String',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export const BatchOperationResponse: CompositeMapper = {
    serializedName: 'BatchOperationResponse',
    type: {
        name: 'Composite',
        className: 'BatchOperationResponse',
        modelProperties: {
            operationId: {
                serializedName: 'operationId',
                type: {
                    name: 'String',
                },
            },
        },
    },
};

export const GetTeamsOperationStateResponse: CompositeMapper = {
    serializedName: 'GetTeamsOperationStateResponse',
    type: {
        name: 'Composite',
        className: 'GetTeamsOperationStateResponse',
        modelProperties: {
            state: {
                serializedName: 'state',
                type: {
                    name: 'String',
                },
            },
            stateMap: {
                serializedName: 'stateMap',
                type: {
                    name: 'Dictionary',
                    value: {
                        type: {
                            name: 'Number',
                        },
                    },
                },
            },
            retryAfter: {
                serializedName: 'retryAfter',
                type: {
                    name: 'DateTime',
                },
            },
            totalEntriesCount: {
                serializedName: 'totalEntriesCount',
                type: {
                    name: 'Number',
                },
            },
        },
    },
};

export const GetTeamsFailedEntriesResponse: CompositeMapper = {
    serializedName: 'BatchFailedEntriesResponse',
    type: {
        name: 'Composite',
        className: 'BatchFailedEntriesResponse',
        modelProperties: {
            continuationToken: {
                serializedName: 'continuationToken',
                type: {
                    name: 'String',
                },
            },
            failedEntryResponses: {
                serializedName: 'failedEntryResponses',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'BatchFailedEntry',
                            modelProperties: {
                                id: {
                                    serializedName: 'Id',
                                    type: {
                                        name: 'String',
                                    },
                                },
                                error: {
                                    serializedName: 'error',
                                    type: {
                                        name: 'String',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export const TeamsMember: CompositeMapper = {
    serializedName: 'TeamsMember',
    type: {
        name: 'Composite',
        className: 'TeamsMember',
        modelProperties: {
            id: {
                serializedName: 'id',
                type: {
                    name: 'String',
                },
            },
        },
    },
};
