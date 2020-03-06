// Generated from ExpressionAntlrParser.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { FuncInvokeExpContext } from "./ExpressionAntlrParser";
import { ConstantAtomContext } from "./ExpressionAntlrParser";
import { IdAtomContext } from "./ExpressionAntlrParser";
import { StringAtomContext } from "./ExpressionAntlrParser";
import { IndexAccessExpContext } from "./ExpressionAntlrParser";
import { StringInterpolationAtomContext } from "./ExpressionAntlrParser";
import { MemberAccessExpContext } from "./ExpressionAntlrParser";
import { ParenthesisExpContext } from "./ExpressionAntlrParser";
import { NumericAtomContext } from "./ExpressionAntlrParser";
import { UnaryOpExpContext } from "./ExpressionAntlrParser";
import { BinaryOpExpContext } from "./ExpressionAntlrParser";
import { PrimaryExpContext } from "./ExpressionAntlrParser";
import { FileContext } from "./ExpressionAntlrParser";
import { ExpressionContext } from "./ExpressionAntlrParser";
import { PrimaryExpressionContext } from "./ExpressionAntlrParser";
import { StringInterpolationContext } from "./ExpressionAntlrParser";
import { TextContentContext } from "./ExpressionAntlrParser";
import { ArgsListContext } from "./ExpressionAntlrParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `ExpressionAntlrParser`.
 */
export interface ExpressionAntlrParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `funcInvokeExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterFuncInvokeExp?: (ctx: FuncInvokeExpContext) => void;
	/**
	 * Exit a parse tree produced by the `funcInvokeExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitFuncInvokeExp?: (ctx: FuncInvokeExpContext) => void;

	/**
	 * Enter a parse tree produced by the `constantAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterConstantAtom?: (ctx: ConstantAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `constantAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitConstantAtom?: (ctx: ConstantAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `idAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterIdAtom?: (ctx: IdAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `idAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitIdAtom?: (ctx: IdAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `stringAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterStringAtom?: (ctx: StringAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `stringAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitStringAtom?: (ctx: StringAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `indexAccessExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterIndexAccessExp?: (ctx: IndexAccessExpContext) => void;
	/**
	 * Exit a parse tree produced by the `indexAccessExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitIndexAccessExp?: (ctx: IndexAccessExpContext) => void;

	/**
	 * Enter a parse tree produced by the `stringInterpolationAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterStringInterpolationAtom?: (ctx: StringInterpolationAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `stringInterpolationAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitStringInterpolationAtom?: (ctx: StringInterpolationAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `memberAccessExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterMemberAccessExp?: (ctx: MemberAccessExpContext) => void;
	/**
	 * Exit a parse tree produced by the `memberAccessExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitMemberAccessExp?: (ctx: MemberAccessExpContext) => void;

	/**
	 * Enter a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterParenthesisExp?: (ctx: ParenthesisExpContext) => void;
	/**
	 * Exit a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitParenthesisExp?: (ctx: ParenthesisExpContext) => void;

	/**
	 * Enter a parse tree produced by the `numericAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterNumericAtom?: (ctx: NumericAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `numericAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitNumericAtom?: (ctx: NumericAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `unaryOpExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	enterUnaryOpExp?: (ctx: UnaryOpExpContext) => void;
	/**
	 * Exit a parse tree produced by the `unaryOpExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	exitUnaryOpExp?: (ctx: UnaryOpExpContext) => void;

	/**
	 * Enter a parse tree produced by the `binaryOpExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	enterBinaryOpExp?: (ctx: BinaryOpExpContext) => void;
	/**
	 * Exit a parse tree produced by the `binaryOpExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	exitBinaryOpExp?: (ctx: BinaryOpExpContext) => void;

	/**
	 * Enter a parse tree produced by the `primaryExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	enterPrimaryExp?: (ctx: PrimaryExpContext) => void;
	/**
	 * Exit a parse tree produced by the `primaryExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	exitPrimaryExp?: (ctx: PrimaryExpContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionAntlrParser.file`.
	 * @param ctx the parse tree
	 */
	enterFile?: (ctx: FileContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionAntlrParser.file`.
	 * @param ctx the parse tree
	 */
	exitFile?: (ctx: FileContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	enterPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 */
	exitPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionAntlrParser.stringInterpolation`.
	 * @param ctx the parse tree
	 */
	enterStringInterpolation?: (ctx: StringInterpolationContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionAntlrParser.stringInterpolation`.
	 * @param ctx the parse tree
	 */
	exitStringInterpolation?: (ctx: StringInterpolationContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionAntlrParser.textContent`.
	 * @param ctx the parse tree
	 */
	enterTextContent?: (ctx: TextContentContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionAntlrParser.textContent`.
	 * @param ctx the parse tree
	 */
	exitTextContent?: (ctx: TextContentContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionAntlrParser.argsList`.
	 * @param ctx the parse tree
	 */
	enterArgsList?: (ctx: ArgsListContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionAntlrParser.argsList`.
	 * @param ctx the parse tree
	 */
	exitArgsList?: (ctx: ArgsListContext) => void;
}

