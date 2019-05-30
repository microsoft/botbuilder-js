/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from './dialogContext';
import { StateMap } from './stateMap';
import * as jsonpath from 'jsonpath';

/**
 * Defines the shape of the state object returned by calling `DialogContext.state.toJSON()`.
 */
export interface DialogContextVisibleState {
    /**
     * All properties being persisted for the current user across all their conversations with the
     * bot.
     */
    user: any;

    /**
     * All properties being persisted for the current conversation the user is having with the bot.
     */
    conversation: any;

    /**
     * All properties being persisted for the current dialog that's active.
     */
    dialog: any;

    /**
     * Transient properties that are only remembered for the current turn.
     */
    turn: any;
}

export class DialogContextState {
    private readonly dc: DialogContext;

    /**
     * Properties being persisted for the current user across all their conversations with the
     * bot.
     * 
     * @remarks
     * These values are visible to all dialogs.
     */
    public readonly user: StateMap; 

    /**
     * Properties being persisted for the current conversation the user is having with the bot.
     * 
     * @remarks
     * These values are visible to all dialogs but are intended to be transient and may 
     * automatically expire after some timeout period.
     */
    public readonly conversation: StateMap; 

    /**
     * @private
     */
    constructor(dc: DialogContext, userState: StateMap, conversationState: StateMap) {
        this.dc = dc;
        this.user = userState;
        this.conversation = conversationState;
    }

    /**
     * Properties being persisted for the current dialog that's active.
     * 
     * @remarks
     * These variables are only visible to the current dialog instance but may be passed to a child
     * dialog using an `inputBinding`. 
     */
    public get dialog(): StateMap {
        let instance = this.dc.activeDialog;
        if (!instance) {
            if (this.dc.parent) {
                instance = this.dc.parent.activeDialog
            } else {
                throw new Error(`DialogContext.state.dialog: no active or parent dialog instance.`); 
            }
        }
        return new StateMap(instance.state);
    }

    /**
     * Transient properties that are only remembered for the current turn.
     */
    public get turn(): StateMap {
        // Get transient state for the current turn
        let turn: object = this.dc.context.turnState.get(TURN_STATE);
        if (!turn) {
            turn = {};
            this.dc.context.turnState.set(TURN_STATE, turn);
        }
        return new StateMap(turn);
    }

    /**
     * Returns a JSON object representing the in-memory properties that are visible to the current
     * `DialogContext`.
     * 
     * @remarks
     * These values are passed by reference and may also be accessed individually using the
     * [user](#user), [conversation](#conversation), and [dialog](#dialog) properties.
     */
    public toJSON(): DialogContextVisibleState {
        // Calculate dialog state
        let instance = this.dc.activeDialog;
        if (!instance && this.dc.parent) {
            instance = this.dc.parent.activeDialog
        }
        return {
            user: this.user.memory,
            conversation: this.conversation.memory,
            dialog: instance ? instance.state : undefined,
            turn: this.turn.memory
        };
    }

    /**
     * Executes a JSONPath expression across the in-memory properties visible to the current
     * `DialogContext`.
     * 
     * @remarks
     * The syntax for JSONPath can be found [here](https://github.com/dchester/jsonpath#jsonpath-syntax). 
     * An array of matching values will be returned.
     * 
     * The shape of the object being searched over is an instance of a `DialogContextMemoryObject` 
     * that's returned by the [toJson()](#tojson) method.
     * 
     * To search for the users name you would pass in an expression of `$.user.name` or simply `user.name`.
     * @param pathExpression JSONPath expression to evaluate. The leading `$.` is optional.
     * @param count (Optional) number of matches to return. The default value is to return all matches.
     */
    public query(pathExpression: string, count?: number): any[] {
        return DialogContextState.queryMemory(this.toJSON(), pathExpression, count);
    }

    /**
     * Returns the first in-memory property that matches a JSONPath expression.
     * @param pathExpression JSONPath expression to evaluate. The leading `$.` is optional.
     * @param defaultValue (Optional) value to return if the path can't be found. Defaults to `undefined`.
     */
    public getValue<T = any>(pathExpression: string, defaultValue?: T): T {

        let value: T;
        if (pathExpression) {
            value = jsonpath.value(this.toJSON(), DialogContextState.resolvePath(pathExpression));
        }
         
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Assigns a value to an in-memory property using a given JSONPath expression.
     * @param pathExpression JSONPath expression to evaluate. The leading `$.` is optional.
     * @param value Value to assign.
     */
    public setValue(pathExpression: string, value?: any): void {
        jsonpath.value(this.toJSON(), DialogContextState.resolvePath(pathExpression), value);
    }

    static queryMemory(memory: object, pathExpression: string, count?: number): any[] {
        return jsonpath.query(memory, DialogContextState.resolvePath(pathExpression), count);
    }
   
    static resolvePath(pathExpression: string): string {

        // Check for JSONPath selector
        if (pathExpression.indexOf('$.') == 0) {
            return pathExpression;
        } else {
            // Check for shortcuts
            if (pathExpression[0] == '$') {
                return '$.dialog.result.' + pathExpression.substr(1);
            } else if (pathExpression[0] == '@') {
                return '$.turn.recognized.entities.' + pathExpression.substr(1);
            } else if (pathExpression[0] == '#') {
                return '$.turn.recognized.intents.' + pathExpression.substr(1);
            }

            // Add JSONPath selector prefix
            return '$.' + pathExpression;
        }
    }
}

const TURN_STATE = Symbol('turn_state');