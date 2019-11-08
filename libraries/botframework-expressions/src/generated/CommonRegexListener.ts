/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// Generated from ../CommonRegex.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `CommonRegexParser`.
 */
export interface CommonRegexListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `CommonRegexParser.parse`.
	 * @param ctx the parse tree
	 */
	enterParse?: (ctx: ParseContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.parse`.
	 * @param ctx the parse tree
	 */
	exitParse?: (ctx: ParseContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.alternation`.
	 * @param ctx the parse tree
	 */
	enterAlternation?: (ctx: AlternationContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.alternation`.
	 * @param ctx the parse tree
	 */
	exitAlternation?: (ctx: AlternationContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.element`.
	 * @param ctx the parse tree
	 */
	enterElement?: (ctx: ElementContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.element`.
	 * @param ctx the parse tree
	 */
	exitElement?: (ctx: ElementContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.quantifier`.
	 * @param ctx the parse tree
	 */
	enterQuantifier?: (ctx: QuantifierContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.quantifier`.
	 * @param ctx the parse tree
	 */
	exitQuantifier?: (ctx: QuantifierContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.quantifier_type`.
	 * @param ctx the parse tree
	 */
	enterQuantifier_type?: (ctx: Quantifier_typeContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.quantifier_type`.
	 * @param ctx the parse tree
	 */
	exitQuantifier_type?: (ctx: Quantifier_typeContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.character_class`.
	 * @param ctx the parse tree
	 */
	enterCharacter_class?: (ctx: Character_classContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.character_class`.
	 * @param ctx the parse tree
	 */
	exitCharacter_class?: (ctx: Character_classContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.capture`.
	 * @param ctx the parse tree
	 */
	enterCapture?: (ctx: CaptureContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.capture`.
	 * @param ctx the parse tree
	 */
	exitCapture?: (ctx: CaptureContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.non_capture`.
	 * @param ctx the parse tree
	 */
	enterNon_capture?: (ctx: Non_captureContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.non_capture`.
	 * @param ctx the parse tree
	 */
	exitNon_capture?: (ctx: Non_captureContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.option`.
	 * @param ctx the parse tree
	 */
	enterOption?: (ctx: OptionContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.option`.
	 * @param ctx the parse tree
	 */
	exitOption?: (ctx: OptionContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.option_flag`.
	 * @param ctx the parse tree
	 */
	enterOption_flag?: (ctx: Option_flagContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.option_flag`.
	 * @param ctx the parse tree
	 */
	exitOption_flag?: (ctx: Option_flagContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.atom`.
	 * @param ctx the parse tree
	 */
	enterAtom?: (ctx: AtomContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.atom`.
	 * @param ctx the parse tree
	 */
	exitAtom?: (ctx: AtomContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.cc_atom`.
	 * @param ctx the parse tree
	 */
	enterCc_atom?: (ctx: Cc_atomContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.cc_atom`.
	 * @param ctx the parse tree
	 */
	exitCc_atom?: (ctx: Cc_atomContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.shared_atom`.
	 * @param ctx the parse tree
	 */
	enterShared_atom?: (ctx: Shared_atomContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.shared_atom`.
	 * @param ctx the parse tree
	 */
	exitShared_atom?: (ctx: Shared_atomContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.literal`.
	 * @param ctx the parse tree
	 */
	enterLiteral?: (ctx: LiteralContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.literal`.
	 * @param ctx the parse tree
	 */
	exitLiteral?: (ctx: LiteralContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.cc_literal`.
	 * @param ctx the parse tree
	 */
	enterCc_literal?: (ctx: Cc_literalContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.cc_literal`.
	 * @param ctx the parse tree
	 */
	exitCc_literal?: (ctx: Cc_literalContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.shared_literal`.
	 * @param ctx the parse tree
	 */
	enterShared_literal?: (ctx: Shared_literalContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.shared_literal`.
	 * @param ctx the parse tree
	 */
	exitShared_literal?: (ctx: Shared_literalContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.number`.
	 * @param ctx the parse tree
	 */
	enterNumber?: (ctx: NumberContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.number`.
	 * @param ctx the parse tree
	 */
	exitNumber?: (ctx: NumberContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.octal_char`.
	 * @param ctx the parse tree
	 */
	enterOctal_char?: (ctx: Octal_charContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.octal_char`.
	 * @param ctx the parse tree
	 */
	exitOctal_char?: (ctx: Octal_charContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.octal_digit`.
	 * @param ctx the parse tree
	 */
	enterOctal_digit?: (ctx: Octal_digitContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.octal_digit`.
	 * @param ctx the parse tree
	 */
	exitOctal_digit?: (ctx: Octal_digitContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.digits`.
	 * @param ctx the parse tree
	 */
	enterDigits?: (ctx: DigitsContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.digits`.
	 * @param ctx the parse tree
	 */
	exitDigits?: (ctx: DigitsContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.digit`.
	 * @param ctx the parse tree
	 */
	enterDigit?: (ctx: DigitContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.digit`.
	 * @param ctx the parse tree
	 */
	exitDigit?: (ctx: DigitContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.name`.
	 * @param ctx the parse tree
	 */
	enterName?: (ctx: NameContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.name`.
	 * @param ctx the parse tree
	 */
	exitName?: (ctx: NameContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.alpha_nums`.
	 * @param ctx the parse tree
	 */
	enterAlpha_nums?: (ctx: Alpha_numsContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.alpha_nums`.
	 * @param ctx the parse tree
	 */
	exitAlpha_nums?: (ctx: Alpha_numsContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.non_close_parens`.
	 * @param ctx the parse tree
	 */
	enterNon_close_parens?: (ctx: Non_close_parensContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.non_close_parens`.
	 * @param ctx the parse tree
	 */
	exitNon_close_parens?: (ctx: Non_close_parensContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.non_close_paren`.
	 * @param ctx the parse tree
	 */
	enterNon_close_paren?: (ctx: Non_close_parenContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.non_close_paren`.
	 * @param ctx the parse tree
	 */
	exitNon_close_paren?: (ctx: Non_close_parenContext) => void;

	/**
	 * Enter a parse tree produced by `CommonRegexParser.letter`.
	 * @param ctx the parse tree
	 */
	enterLetter?: (ctx: LetterContext) => void;
	/**
	 * Exit a parse tree produced by `CommonRegexParser.letter`.
	 * @param ctx the parse tree
	 */
	exitLetter?: (ctx: LetterContext) => void;
}

