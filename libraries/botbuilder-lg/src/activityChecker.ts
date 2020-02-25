/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ActivityTypes, ActionTypes } from 'botbuilder-core';
import { CardFactory } from 'botbuilder-core';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Range } from './range';
import { Position } from './position';
import { Evaluator } from './evaluator';

/**
 *  Structure LG result checker.
 */
export class ActivityChecker {
    public static readonly genericCardTypeMapping: Map<string, string> = new Map<string, string>
    ([
        [ 'herocard', CardFactory.contentTypes.heroCard ],
        [ 'thumbnailcard', CardFactory.contentTypes.thumbnailCard ],
        [ 'audiocard', CardFactory.contentTypes.audioCard ],
        [ 'videocard', CardFactory.contentTypes.videoCard ],
        [ 'animationcard', CardFactory.contentTypes.animationCard ],
        [ 'signincard', CardFactory.contentTypes.signinCard ],
        [ 'oauthcard', CardFactory.contentTypes.oauthCard ],
        [ 'receiptcard', CardFactory.contentTypes.receiptCard ],
    ]);

    public static readonly activityProperties: string[] = ['type','id','timestamp','localTimestamp','localTimezone','callerId',
        'serviceUrl','channelId','from','conversation','recipient','textFormat','attachmentLayout','membersAdded',
        'membersRemoved','reactionsAdded','reactionsRemoved','topicName','historyDisclosed','locale','text','speak',
        'inputHint','summary','suggestedActions','attachments','entities','channelData','action','replyToId','label',
        'valueType','value','name','typrelatesToe','code','expiration','importance','deliveryMode','listenFor',
        'textHighlights','semanticAction'];

    public static readonly cardActionProperties: string[] = ['type','title','image','text','displayText','value','channelData'];

    /**
     * check the LG result before generate an Activity.
     * @param lgResult lg output.
     * @returns Diagnostic list.
     */
    public static check(lgResult: any): Diagnostic[] {
        if (lgResult === undefined) {
            return [this.buildDiagnostic('LG output is empty', false)];
        }

        if (typeof lgResult === 'string') {
            if (!lgResult.startsWith('{') || !lgResult.endsWith('}')) {
                return [this.buildDiagnostic('LG output is not a json object, and will fallback to string format.', false)];
            }

            let lgStructuredResult: any = undefined;

            try {
                lgStructuredResult = JSON.parse(lgResult);
            } catch (error) {
                return [this.buildDiagnostic('LG output is not a json object, and will fallback to string format.', false)];
            }

            return this.checkStructuredResult(lgStructuredResult);
        } else {
            return this.checkStructuredResult(lgResult);
        }
    }

    public static checkStructuredResult(input: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        const type: string = this.getStructureType(input);
        if (ActivityChecker.genericCardTypeMapping.has(type) || type === 'attachment') {
            result.push(...this.checkAttachment(input));
        } else if (type === 'activity') {
            result.push(...this.checkActivity(input));
        } else {
            const diagnosticMessage: string = (type === undefined || type === '') ? 
                `'${ Evaluator.LGType }' does not exist in lg output json object.`
                : `Type '${ type }' is not supported currently.`;
            result.push(this.buildDiagnostic(diagnosticMessage));
        }

        return result;
    }

    private static checkActivity(input: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        let activityType: string = undefined;
        if ('type' in input) {
            activityType = input['type'].toString().trim();
        }

        result.push(...this.checkActivityType(activityType));
        result.push(...this.checkActivityPropertyName(input));
        result.push(...this.checkActivityProperties(input));

        return result;
    }

    private static checkActivityType(activityType: string): Diagnostic[] {
        if (activityType !== undefined) {
            if (!Object.values(ActivityTypes).map((u: string): string => u.toLowerCase()).includes(activityType.toLowerCase())) {
                return [this.buildDiagnostic(`'${ activityType }' is not a valid activity type.`)];
            }
        }
        return [];
    }

    private static checkActivityPropertyName(input: any): Diagnostic[] {
        const invalidProperties: string[] = [];
        for (const property of Object.keys(input)) {
            if (property === Evaluator.LGType) {
                continue;
            }
            if (!ActivityChecker.activityProperties.map((u: string): string => u.toLowerCase()).includes(property.toLowerCase())) {
                invalidProperties.push(property);
            }
        }
        if (invalidProperties.length > 0) {
            return [this.buildDiagnostic(`'${ invalidProperties.join(',') }' not support in Activity.`, false)];
        }

        return [];
    }

    private static checkActivityProperties(input: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        for (const key of Object.keys(input)) {
            const property: string = key.trim();
            const value: any = input[key];

            switch (property.toLowerCase()) {
                case 'attachments':
                    result.push(...this.checkAttachments(value));
                    break;
                case 'suggestedactions':
                    result.push(...this.checkSuggestions(value));
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    private static checkSuggestions(value: any): Diagnostic[] {
        const actions: any[] = this.normalizedToList(value);
        return this.checkCardActions(actions);
    }

    private static checkButtons(value: any): Diagnostic[] {
        const actions: any[] = this.normalizedToList(value);
        return this.checkCardActions(actions);
    }

    private static checkCardActions(actions: any[]): Diagnostic[] {
        const result: Diagnostic[] = [];
        actions.forEach((u: any): void => { result.push(...this.checkCardAction(u)); });
        return result;
    }

    private static checkCardAction(value: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        if (typeof value === 'string') {
            return result;
        }

        if (typeof value === 'object') {
            const type: string = this.getStructureType(value);
            if (type !== 'cardaction'){
                result.push(this.buildDiagnostic(`'${ type }' is not card action type.`, false));
            } else {
                result.push(...this.checkCardActionPropertyName(value));
                if ('type' in value) {
                    result.push(...this.checkCardActionType(value['type']));
                }
            }
        } else {
            result.push(this.buildDiagnostic(`'${ value }' is not a valid card action format.`, false));
        }

        return result;
    }

    
    private static checkCardActionPropertyName(input: any): Diagnostic[] {
        const invalidProperties: string[] = [];
        for (const property of Object.keys(input)) {
            if (property === Evaluator.LGType) {
                continue;
            }
            if (!ActivityChecker.cardActionProperties.map((u: string): string => u.toLowerCase()).includes(property.toLowerCase())) {
                invalidProperties.push(property);
            }
        }
        if (invalidProperties.length > 0) {
            return [this.buildDiagnostic(`'${ invalidProperties.join(',') }' not support in card action.`, false)];
        }

        return [];
    }

    private static checkCardActionType(cardActionType: string): Diagnostic[] {
        const result: Diagnostic[] = [];
        if (!cardActionType) {
            return result;
        }

        if (!Object.values(ActionTypes).map((u: string): string => u.toLowerCase()).includes(cardActionType.toLowerCase())) {
            return [this.buildDiagnostic(`'${ cardActionType }' is not a valid card action type.`)];
        }

        return result;
    }

    private static checkAttachments(value: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        const attachmentsJsonList: any[] = this.normalizedToList(value);

        for (const attachmentsJson of attachmentsJsonList) {
            if (typeof attachmentsJson === 'object') {
                result.push(...this.checkAttachment(attachmentsJson));
            }
        }

        return result;
    }

    private static checkAttachment(value: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        const type: string = this.getStructureType(value);
        if (ActivityChecker.genericCardTypeMapping.has(type)) {
            result.push(...this.checkCardAttachment(value));
        } else if (type === 'adaptivecard') {
            // TODO
            // check adaptivecard format
        } else if(type === 'attachment') {
            // TODO
            // Check attachment format
        } else {
            result.push(this.buildDiagnostic(`'${ type }' is not an attachment type.`, false));
        }

        return result;
    }

    private static checkCardAttachment(input: any): Diagnostic[] {
        const result: Diagnostic[] = [];
        for (const key of Object.keys(input)) {
            const property: string = key.trim().toLowerCase();
            const value: any = input[key];

            switch (property) {
                case 'buttons':
                    result.push(...this.checkButtons(value));
                    break;
                case 'autostart':
                case 'shareable':
                case 'autoloop':
                    const boolValue: boolean = this.getValidBooleanValue(value.toString());
                    if (boolValue === undefined) {
                        result.push(this.buildDiagnostic(`'${ value.toString() }' is not a boolean value.`));
                    }
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    private static getStructureType(input: any): string {
        let result = '';

        if (input !== undefined) {
            if (Evaluator.LGType in input) {
                result = input[Evaluator.LGType].toString();
            } else if ('type' in input) {
                // Adaptive card type
                result = input['type'].toString();
            }
        }

        return result.trim().toLowerCase();
    }

    
    private static getValidBooleanValue(boolValue: string): boolean{
        if (boolValue.toLowerCase() === 'true')
        {
            return true;
        }
        else if (boolValue.toLowerCase() === 'false')
        {
            return false;
        }

        return undefined;
    }

    private static buildDiagnostic(message: string, isError: boolean = true): Diagnostic {
        message = message === undefined ? '' : message;
        const emptyRange: Range = new Range(new Position(0, 0), new Position(0, 0));
        return isError ? new Diagnostic(emptyRange, message, DiagnosticSeverity.Error)
            : new Diagnostic(emptyRange, message, DiagnosticSeverity.Warning);
    }

    private static normalizedToList(item: any): any[] {
        if (item === undefined) {
            return [];
        } else if (Array.isArray(item)){
            return item;
        } else {
            return [item];
        }
    }
}