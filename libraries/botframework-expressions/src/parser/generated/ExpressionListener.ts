/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// Generated from ../Expression.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { FuncInvokeExpContext } from "./ExpressionParser";
import { IdAtomContext } from "./ExpressionParser";
import { ShorthandAccessorExpContext } from "./ExpressionParser";
import { StringAtomContext } from "./ExpressionParser";
import { IndexAccessExpContext } from "./ExpressionParser";
import { MemberAccessExpContext } from "./ExpressionParser";
import { ParenthesisExpContext } from "./ExpressionParser";
import { NumericAtomContext } from "./ExpressionParser";
import { ShorthandAtomContext } from "./ExpressionParser";
import { UnaryOpExpContext } from "./ExpressionParser";
import { BinaryOpExpContext } from "./ExpressionParser";
import { PrimaryExpContext } from "./ExpressionParser";
import { FileContext } from "./ExpressionParser";
import { ExpressionContext } from "./ExpressionParser";
import { PrimaryExpressionContext } from "./ExpressionParser";
import { ArgsListContext } from "./ExpressionParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `ExpressionParser`.
 */
export interface ExpressionListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `funcInvokeExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterFuncInvokeExp?: (ctx: FuncInvokeExpContext) => void;
	/**
	 * Exit a parse tree produced by the `funcInvokeExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitFuncInvokeExp?: (ctx: FuncInvokeExpContext) => void;

	/**
	 * Enter a parse tree produced by the `idAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterIdAtom?: (ctx: IdAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `idAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitIdAtom?: (ctx: IdAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `shorthandAccessorExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterShorthandAccessorExp?: (ctx: ShorthandAccessorExpContext) => void;
	/**
	 * Exit a parse tree produced by the `shorthandAccessorExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitShorthandAccessorExp?: (ctx: ShorthandAccessorExpContext) => void;

	/**
	 * Enter a parse tree produced by the `stringAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterStringAtom?: (ctx: StringAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `stringAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitStringAtom?: (ctx: StringAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `indexAccessExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterIndexAccessExp?: (ctx: IndexAccessExpContext) => void;
	/**
	 * Exit a parse tree produced by the `indexAccessExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitIndexAccessExp?: (ctx: IndexAccessExpContext) => void;

	/**
	 * Enter a parse tree produced by the `memberAccessExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterMemberAccessExp?: (ctx: MemberAccessExpContext) => void;
	/**
	 * Exit a parse tree produced by the `memberAccessExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitMemberAccessExp?: (ctx: MemberAccessExpContext) => void;

	/**
	 * Enter a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterParenthesisExp?: (ctx: ParenthesisExpContext) => void;
	/**
	 * Exit a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitParenthesisExp?: (ctx: ParenthesisExpContext) => void;

	/**
	 * Enter a parse tree produced by the `numericAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterNumericAtom?: (ctx: NumericAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `numericAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitNumericAtom?: (ctx: NumericAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `shorthandAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterShorthandAtom?: (ctx: ShorthandAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `shorthandAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitShorthandAtom?: (ctx: ShorthandAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `unaryOpExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	enterUnaryOpExp?: (ctx: UnaryOpExpContext) => void;
	/**
	 * Exit a parse tree produced by the `unaryOpExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	exitUnaryOpExp?: (ctx: UnaryOpExpContext) => void;

	/**
	 * Enter a parse tree produced by the `binaryOpExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	enterBinaryOpExp?: (ctx: BinaryOpExpContext) => void;
	/**
	 * Exit a parse tree produced by the `binaryOpExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	exitBinaryOpExp?: (ctx: BinaryOpExpContext) => void;

	/**
	 * Enter a parse tree produced by the `primaryExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	enterPrimaryExp?: (ctx: PrimaryExpContext) => void;
	/**
	 * Exit a parse tree produced by the `primaryExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	exitPrimaryExp?: (ctx: PrimaryExpContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.file`.
	 * @param ctx the parse tree
	 */
	enterFile?: (ctx: FileContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.file`.
	 * @param ctx the parse tree
	 */
	exitFile?: (ctx: FileContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.argsList`.
	 * @param ctx the parse tree
	 */
	enterArgsList?: (ctx: ArgsListContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.argsList`.
	 * @param ctx the parse tree
	 */
	exitArgsList?: (ctx: ArgsListContext) => void;
}

