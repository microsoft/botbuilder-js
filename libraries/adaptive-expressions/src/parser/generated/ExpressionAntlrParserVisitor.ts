// Generated from ExpressionAntlrParser.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ExpressionAntlrParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface ExpressionAntlrParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `funcInvokeExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFuncInvokeExp?: (ctx: FuncInvokeExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `constantAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstantAtom?: (ctx: ConstantAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `idAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdAtom?: (ctx: IdAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringAtom?: (ctx: StringAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `indexAccessExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndexAccessExp?: (ctx: IndexAccessExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringInterpolationAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringInterpolationAtom?: (ctx: StringInterpolationAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `memberAccessExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberAccessExp?: (ctx: MemberAccessExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesisExp?: (ctx: ParenthesisExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `numericAtom`
	 * labeled alternative in `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumericAtom?: (ctx: NumericAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `unaryOpExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryOpExp?: (ctx: UnaryOpExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `binaryOpExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinaryOpExp?: (ctx: BinaryOpExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `primaryExp`
	 * labeled alternative in `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimaryExp?: (ctx: PrimaryExpContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionAntlrParser.file`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFile?: (ctx: FileContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionAntlrParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionAntlrParser.primaryExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimaryExpression?: (ctx: PrimaryExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionAntlrParser.stringInterpolation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringInterpolation?: (ctx: StringInterpolationContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionAntlrParser.textContent`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTextContent?: (ctx: TextContentContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionAntlrParser.argsList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgsList?: (ctx: ArgsListContext) => Result;
}

