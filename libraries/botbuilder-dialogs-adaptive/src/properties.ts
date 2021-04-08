// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dialog, TemplateInterface } from 'botbuilder-dialogs';
import { DialogExpression } from './expressions/dialogExpression';

import {
    ArrayExpression,
    BoolExpression,
    EnumExpression,
    Expression,
    IntExpression,
    NumberExpression,
    ObjectExpression,
    StringExpression,
    ValueExpression,
} from 'adaptive-expressions';

export type Property = string | Expression;

export type UnknownProperty = unknown | ValueExpression;

export type TemplateInterfaceProperty<T, D> = T | TemplateInterface<T, D> | string;

export type ArrayProperty<T> = T[] | ArrayExpression<T> | Property;

export type BoolProperty = boolean | BoolExpression | Property;

export type DialogProperty = Dialog | DialogExpression | Property;

export type EnumProperty<T> = T | EnumExpression<T> | Property;

export type IntProperty = number | IntExpression | Property;

export type NumberProperty = number | NumberExpression | Property;

export type ObjectProperty<T> = T | ObjectExpression<T> | Property;

export type StringProperty = StringExpression | Property;
