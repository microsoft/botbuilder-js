export * from './actionTypes';
export * from './activity';
export * from './activityImportance';
export * from './activityTypes';
export * from './animationCard';
export * from './attachment';
export * from './attachmentData';
export * from './attachmentInfo';
export * from './attachmentLayoutTypes';
export * from './attachmentView';
export * from './audioCard';
export * from './basicCard';
export * from './cardAction';
export * from './cardImage';
export * from './channelAccount';
export * from './contactRelationUpdateActionTypes';
export * from './conversationAccount';
export * from './conversationMembers';
export * from './conversationReference';
export * from './conversationResourceResponse';
export * from './conversationsResult';
export * from './deliveryModes';
export * from './endOfConversationCodes';
export * from './entity';
export * from './errorResponse';
export * from './fact';
export * from './geoCoordinates';
export * from './heroCard';
export * from './innerHttpError';
export * from './inputHints';
export * from './installationUpdateActionTypes';
export * from './mediaCard';
export * from './mediaEventValue';
export * from './mediaUrl';
export * from './mention';
export * from './messageReaction';
export * from './messageReactionTypes';
export * from './microsoftPayMethodData';
export * from './modelError';
export * from './oAuthCard';
export * from './pagedMembersResult';
export * from './paymentAddress';
export * from './paymentCurrencyAmount';
export * from './paymentDetails';
export * from './paymentDetailsModifier';
export * from './paymentItem';
export * from './paymentMethodData';
export * from './paymentOptions';
export * from './paymentRequest';
export * from './paymentRequestComplete';
export * from './paymentRequestCompleteResult';
export * from './paymentRequestUpdate';
export * from './paymentRequestUpdateResult';
export * from './paymentResponse';
export * from './paymentShippingOption';
export * from './place';
export * from './receiptCard';
export * from './receiptItem';
export * from './resourceResponse';
export * from './roleTypes';
export * from './semanticAction';
export * from './semanticActionStates';
export * from './signinCard';
export * from './suggestedActions';
export * from './textFormatTypes';
export * from './textHighlight';
export * from './thing';
export * from './thumbnailCard';
export * from './thumbnailUrl';
export * from './tokenRequest';
export * from './tokenResponse';
export * from './transcript';
export * from './videoCard';
export * from './responses/createConversationResponse'
export * from './responses/getConversationMembersResponse'
export * from './responses/deleteActivityResponse'
export * from './responses/getAttachmentInfoResponse'
export * from './responses/getAttachmentResponse'
export * from './responses/useResourceResponse'
export * from './parameters/conversationParameters'
export * from './parameters/requestOptions'
export * from './parameters/pagedParameters'

import localVarRequest = require('request');

import { ActionTypes } from './actionTypes';
import { Activity } from './activity';
import { ActivityImportance } from './activityImportance';
import { ActivityTypes } from './activityTypes';
import { AnimationCard } from './animationCard';
import { Attachment } from './attachment';
import { AttachmentData } from './attachmentData';
import { AttachmentInfo } from './attachmentInfo';
import { AttachmentLayoutTypes } from './attachmentLayoutTypes';
import { AttachmentView } from './attachmentView';
import { AudioCard } from './audioCard';
import { BasicCard } from './basicCard';
import { CardAction } from './cardAction';
import { CardImage } from './cardImage';
import { ChannelAccount } from './channelAccount';
import { ContactRelationUpdateActionTypes } from './contactRelationUpdateActionTypes';
import { ConversationAccount } from './conversationAccount';
import { ConversationMembers } from './conversationMembers';
import { ConversationParameters } from './parameters/conversationParameters';
import { PagedParameters } from './parameters/pagedParameters'
import { RequestOptions } from './parameters/requestOptions'
import { ConversationReference } from './conversationReference';
import { ConversationResourceResponse } from './conversationResourceResponse';
import { ConversationsResult } from './conversationsResult';
import { DeliveryModes } from './deliveryModes';
import { EndOfConversationCodes } from './endOfConversationCodes';
import { Entity } from './entity';
import { ErrorResponse } from './errorResponse';
import { Fact } from './fact';
import { GeoCoordinates } from './geoCoordinates';
import { HeroCard } from './heroCard';
import { InnerHttpError } from './innerHttpError';
import { InputHints } from './inputHints';
import { InstallationUpdateActionTypes } from './installationUpdateActionTypes';
import { MediaCard } from './mediaCard';
import { MediaEventValue } from './mediaEventValue';
import { MediaUrl } from './mediaUrl';
import { Mention } from './mention';
import { MessageReaction } from './messageReaction';
import { MessageReactionTypes } from './messageReactionTypes';
import { MicrosoftPayMethodData } from './microsoftPayMethodData';
import { ModelError } from './modelError';
import { OAuthCard } from './oAuthCard';
import { PagedMembersResult } from './pagedMembersResult';
import { PaymentAddress } from './paymentAddress';
import { PaymentCurrencyAmount } from './paymentCurrencyAmount';
import { PaymentDetails } from './paymentDetails';
import { PaymentDetailsModifier } from './paymentDetailsModifier';
import { PaymentItem } from './paymentItem';
import { PaymentMethodData } from './paymentMethodData';
import { PaymentOptions } from './paymentOptions';
import { PaymentRequest } from './paymentRequest';
import { PaymentRequestComplete } from './paymentRequestComplete';
import { PaymentRequestCompleteResult } from './paymentRequestCompleteResult';
import { PaymentRequestUpdate } from './paymentRequestUpdate';
import { PaymentRequestUpdateResult } from './paymentRequestUpdateResult';
import { PaymentResponse } from './paymentResponse';
import { PaymentShippingOption } from './paymentShippingOption';
import { Place } from './place';
import { ReceiptCard } from './receiptCard';
import { ReceiptItem } from './receiptItem';
import { ResourceResponse } from './resourceResponse';
import { RoleTypes } from './roleTypes';
import { SemanticAction } from './semanticAction';
import { SemanticActionStates } from './semanticActionStates';
import { SigninCard } from './signinCard';
import { SuggestedActions } from './suggestedActions';
import { TextFormatTypes } from './textFormatTypes';
import { TextHighlight } from './textHighlight';
import { Thing } from './thing';
import { ThumbnailCard } from './thumbnailCard';
import { ThumbnailUrl } from './thumbnailUrl';
import { TokenRequest } from './tokenRequest';
import { TokenResponse } from './tokenResponse';
import { Transcript } from './transcript';
import { VideoCard } from './videoCard';

/* tslint:disable:no-unused-variable */
let primitives = [
                    "string",
                    "boolean",
                    "double",
                    "integer",
                    "long",
                    "float",
                    "number",
                    "any"
                 ];
                 
let enumsMap: {[index: string]: any} = {
}

let typeMap: {[index: string]: any} = {
    "ActionTypes": ActionTypes,
    "Activity": Activity,
    "ActivityImportance": ActivityImportance,
    "ActivityTypes": ActivityTypes,
    "AnimationCard": AnimationCard,
    "Attachment": Attachment,
    "AttachmentData": AttachmentData,
    "AttachmentInfo": AttachmentInfo,
    "AttachmentLayoutTypes": AttachmentLayoutTypes,
    "AttachmentView": AttachmentView,
    "AudioCard": AudioCard,
    "BasicCard": BasicCard,
    "CardAction": CardAction,
    "CardImage": CardImage,
    "ChannelAccount": ChannelAccount,
    "ContactRelationUpdateActionTypes": ContactRelationUpdateActionTypes,
    "ConversationAccount": ConversationAccount,
    "ConversationMembers": ConversationMembers,
    "ConversationParameters": ConversationParameters,
    "ConversationReference": ConversationReference,
    "ConversationResourceResponse": ConversationResourceResponse,
    "ConversationsResult": ConversationsResult,
    "DeliveryModes": DeliveryModes,
    "EndOfConversationCodes": EndOfConversationCodes,
    "Entity": Entity,
    "ErrorResponse": ErrorResponse,
    "Fact": Fact,
    "GeoCoordinates": GeoCoordinates,
    "HeroCard": HeroCard,
    "InnerHttpError": InnerHttpError,
    "InputHints": InputHints,
    "InstallationUpdateActionTypes": InstallationUpdateActionTypes,
    "MediaCard": MediaCard,
    "MediaEventValue": MediaEventValue,
    "MediaUrl": MediaUrl,
    "Mention": Mention,
    "MessageReaction": MessageReaction,
    "MessageReactionTypes": MessageReactionTypes,
    "MicrosoftPayMethodData": MicrosoftPayMethodData,
    "ModelError": ModelError,
    "OAuthCard": OAuthCard,
    "PagedParameters": PagedParameters,
    "RequestOptions": RequestOptions,
    "PagedMembersResult": PagedMembersResult,
    "PaymentAddress": PaymentAddress,
    "PaymentCurrencyAmount": PaymentCurrencyAmount,
    "PaymentDetails": PaymentDetails,
    "PaymentDetailsModifier": PaymentDetailsModifier,
    "PaymentItem": PaymentItem,
    "PaymentMethodData": PaymentMethodData,
    "PaymentOptions": PaymentOptions,
    "PaymentRequest": PaymentRequest,
    "PaymentRequestComplete": PaymentRequestComplete,
    "PaymentRequestCompleteResult": PaymentRequestCompleteResult,
    "PaymentRequestUpdate": PaymentRequestUpdate,
    "PaymentRequestUpdateResult": PaymentRequestUpdateResult,
    "PaymentResponse": PaymentResponse,
    "PaymentShippingOption": PaymentShippingOption,
    "Place": Place,
    "ReceiptCard": ReceiptCard,
    "ReceiptItem": ReceiptItem,
    "ResourceResponse": ResourceResponse,
    "RoleTypes": RoleTypes,
    "SemanticAction": SemanticAction,
    "SemanticActionStates": SemanticActionStates,
    "SigninCard": SigninCard,
    "SuggestedActions": SuggestedActions,
    "TextFormatTypes": TextFormatTypes,
    "TextHighlight": TextHighlight,
    "Thing": Thing,
    "ThumbnailCard": ThumbnailCard,
    "ThumbnailUrl": ThumbnailUrl,
    "TokenRequest": TokenRequest,
    "TokenResponse": TokenResponse,
    "Transcript": Transcript,
    "VideoCard": VideoCard,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index in data) {
                let date = data[index];
                transformedData.push(ObjectSerializer.serialize(date, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return data.toISOString();
        } else {
            if (enumsMap[type]) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }
            
            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: {[index: string]: any} = {};
            for (let index in attributeTypes) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index in data) {
                let date = data[index];
                transformedData.push(ObjectSerializer.deserialize(date, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap[type]) {// is Enum
                return data;
            }

            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index in attributeTypes) {
                let attributeType = attributeTypes[index];
                instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
            }
            return instance;
        }
    }
}

export interface Authentication {
    /**
    * Apply authentication settings to header and query params.
    */
    applyToRequest(requestOptions: localVarRequest.Options): void;
}

export class HttpBasicAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        requestOptions.auth = {
            username: this.username, password: this.password
        }
    }
}

export class ApiKeyAuth implements Authentication {
    public apiKey: string = '';

    constructor(private location: string, private paramName: string) {
    }

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (this.location == "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
    }
}

export class OAuth implements Authentication {
    public accessToken: string = '';

    constructor(accessToken: string){
        this.accessToken = accessToken; 
    }

    applyToRequest(requestOptions: any): void {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}

export class VoidAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(_: localVarRequest.Options): void {
        // Do nothing
    }
}