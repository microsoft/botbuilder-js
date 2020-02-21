// Generated from ../ExpressionParser.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { FuncInvokeExpContext } from "./ExpressionParser";
import { ConstantAtomContext } from "./ExpressionParser";
import { IdAtomContext } from "./ExpressionParser";
import { StringAtomContext } from "./ExpressionParser";
import { IndexAccessExpContext } from "./ExpressionParser";
import { StringInterpolationAtomContext } from "./ExpressionParser";
import { MemberAccessExpContext } from "./ExpressionParser";
import { ParenthesisExpContext } from "./ExpressionParser";
import { NumericAtomContext } from "./ExpressionParser";
import { UnaryOpExpContext } from "./ExpressionParser";
import { BinaryOpExpContext } from "./ExpressionParser";
import { PrimaryExpContext } from "./ExpressionParser";
import { FileContext } from "./ExpressionParser";
import { ExpressionContext } from "./ExpressionParser";
import { PrimaryExpressionContext } from "./ExpressionParser";
import { StringInterpolationContext } from "./ExpressionParser";
import { TextContentContext } from "./ExpressionParser";
import { ArgsListContext } from "./ExpressionParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ExpressionParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface ExpressionParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `funcInvokeExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFuncInvokeExp?: (ctx: FuncInvokeExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `constantAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstantAtom?: (ctx: ConstantAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `idAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdAtom?: (ctx: IdAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringAtom?: (ctx: StringAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `indexAccessExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndexAccessExp?: (ctx: IndexAccessExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringInterpolationAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringInterpolationAtom?: (ctx: StringInterpolationAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `memberAccessExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberAccessExp?: (ctx: MemberAccessExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesisExp?: (ctx: ParenthesisExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `numericAtom`
	 * labeled alternative in `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumericAtom?: (ctx: NumericAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `unaryOpExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryOpExp?: (ctx: UnaryOpExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `binaryOpExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinaryOpExp?: (ctx: BinaryOpExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `primaryExp`
	 * labeled alternative in `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimaryExp?: (ctx: PrimaryExpContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.file`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFile?: (ctx: FileContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimaryExpression?: (ctx: PrimaryExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.stringInterpolation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringInterpolation?: (ctx: StringInterpolationContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.textContent`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTextContent?: (ctx: TextContentContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.argsList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgsList?: (ctx: ArgsListContext) => Result;
}

