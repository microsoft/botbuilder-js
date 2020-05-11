// Generated from src/CommonRegex.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ParseContext } from "./CommonRegexParser";
import { AlternationContext } from "./CommonRegexParser";
import { ExprContext } from "./CommonRegexParser";
import { ElementContext } from "./CommonRegexParser";
import { QuantifierContext } from "./CommonRegexParser";
import { Quantifier_typeContext } from "./CommonRegexParser";
import { Character_classContext } from "./CommonRegexParser";
import { CaptureContext } from "./CommonRegexParser";
import { Non_captureContext } from "./CommonRegexParser";
import { OptionContext } from "./CommonRegexParser";
import { Option_flagContext } from "./CommonRegexParser";
import { AtomContext } from "./CommonRegexParser";
import { Cc_atomContext } from "./CommonRegexParser";
import { Shared_atomContext } from "./CommonRegexParser";
import { LiteralContext } from "./CommonRegexParser";
import { Cc_literalContext } from "./CommonRegexParser";
import { Shared_literalContext } from "./CommonRegexParser";
import { NumberContext } from "./CommonRegexParser";
import { Octal_charContext } from "./CommonRegexParser";
import { Octal_digitContext } from "./CommonRegexParser";
import { DigitsContext } from "./CommonRegexParser";
import { DigitContext } from "./CommonRegexParser";
import { NameContext } from "./CommonRegexParser";
import { Alpha_numsContext } from "./CommonRegexParser";
import { Non_close_parensContext } from "./CommonRegexParser";
import { Non_close_parenContext } from "./CommonRegexParser";
import { LetterContext } from "./CommonRegexParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CommonRegexParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CommonRegexVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `CommonRegexParser.parse`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParse?: (ctx: ParseContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.alternation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAlternation?: (ctx: AlternationContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpr?: (ctx: ExprContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.element`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitElement?: (ctx: ElementContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.quantifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQuantifier?: (ctx: QuantifierContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.quantifier_type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQuantifier_type?: (ctx: Quantifier_typeContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.character_class`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCharacter_class?: (ctx: Character_classContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.capture`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCapture?: (ctx: CaptureContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.non_capture`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNon_capture?: (ctx: Non_captureContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.option`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOption?: (ctx: OptionContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.option_flag`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOption_flag?: (ctx: Option_flagContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtom?: (ctx: AtomContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.cc_atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCc_atom?: (ctx: Cc_atomContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.shared_atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitShared_atom?: (ctx: Shared_atomContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.cc_literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCc_literal?: (ctx: Cc_literalContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.shared_literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitShared_literal?: (ctx: Shared_literalContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.number`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumber?: (ctx: NumberContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.octal_char`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOctal_char?: (ctx: Octal_charContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.octal_digit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOctal_digit?: (ctx: Octal_digitContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.digits`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDigits?: (ctx: DigitsContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.digit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDigit?: (ctx: DigitContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.name`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName?: (ctx: NameContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.alpha_nums`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAlpha_nums?: (ctx: Alpha_numsContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.non_close_parens`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNon_close_parens?: (ctx: Non_close_parensContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.non_close_paren`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNon_close_paren?: (ctx: Non_close_parenContext) => Result;

	/**
	 * Visit a parse tree produced by `CommonRegexParser.letter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetter?: (ctx: LetterContext) => Result;
}

