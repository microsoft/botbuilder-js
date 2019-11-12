/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// Generated from ../CommonRegex.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { CommonRegexListener } from "./CommonRegexListener";
import { CommonRegexVisitor } from "./CommonRegexVisitor";


export class CommonRegexParser extends Parser {
	public static readonly BellChar = 1;
	public static readonly ControlChar = 2;
	public static readonly EscapeChar = 3;
	public static readonly FormFeed = 4;
	public static readonly NewLine = 5;
	public static readonly CarriageReturn = 6;
	public static readonly Tab = 7;
	public static readonly Backslash = 8;
	public static readonly HexChar = 9;
	public static readonly Dot = 10;
	public static readonly DecimalDigit = 11;
	public static readonly NotDecimalDigit = 12;
	public static readonly CharWithProperty = 13;
	public static readonly CharWithoutProperty = 14;
	public static readonly WhiteSpace = 15;
	public static readonly NotWhiteSpace = 16;
	public static readonly WordChar = 17;
	public static readonly NotWordChar = 18;
	public static readonly CharacterClassStart = 19;
	public static readonly CharacterClassEnd = 20;
	public static readonly Caret = 21;
	public static readonly Hyphen = 22;
	public static readonly QuestionMark = 23;
	public static readonly Plus = 24;
	public static readonly Star = 25;
	public static readonly OpenBrace = 26;
	public static readonly CloseBrace = 27;
	public static readonly Comma = 28;
	public static readonly EndOfSubject = 29;
	public static readonly Pipe = 30;
	public static readonly OpenParen = 31;
	public static readonly CloseParen = 32;
	public static readonly LessThan = 33;
	public static readonly GreaterThan = 34;
	public static readonly SingleQuote = 35;
	public static readonly Underscore = 36;
	public static readonly Colon = 37;
	public static readonly Hash = 38;
	public static readonly Equals = 39;
	public static readonly Exclamation = 40;
	public static readonly Ampersand = 41;
	public static readonly ALC = 42;
	public static readonly BLC = 43;
	public static readonly CLC = 44;
	public static readonly DLC = 45;
	public static readonly ELC = 46;
	public static readonly FLC = 47;
	public static readonly GLC = 48;
	public static readonly HLC = 49;
	public static readonly ILC = 50;
	public static readonly JLC = 51;
	public static readonly KLC = 52;
	public static readonly LLC = 53;
	public static readonly MLC = 54;
	public static readonly NLC = 55;
	public static readonly OLC = 56;
	public static readonly PLC = 57;
	public static readonly QLC = 58;
	public static readonly RLC = 59;
	public static readonly SLC = 60;
	public static readonly TLC = 61;
	public static readonly ULC = 62;
	public static readonly VLC = 63;
	public static readonly WLC = 64;
	public static readonly XLC = 65;
	public static readonly YLC = 66;
	public static readonly ZLC = 67;
	public static readonly AUC = 68;
	public static readonly BUC = 69;
	public static readonly CUC = 70;
	public static readonly DUC = 71;
	public static readonly EUC = 72;
	public static readonly FUC = 73;
	public static readonly GUC = 74;
	public static readonly HUC = 75;
	public static readonly IUC = 76;
	public static readonly JUC = 77;
	public static readonly KUC = 78;
	public static readonly LUC = 79;
	public static readonly MUC = 80;
	public static readonly NUC = 81;
	public static readonly OUC = 82;
	public static readonly PUC = 83;
	public static readonly QUC = 84;
	public static readonly RUC = 85;
	public static readonly SUC = 86;
	public static readonly TUC = 87;
	public static readonly UUC = 88;
	public static readonly VUC = 89;
	public static readonly WUC = 90;
	public static readonly XUC = 91;
	public static readonly YUC = 92;
	public static readonly ZUC = 93;
	public static readonly D1 = 94;
	public static readonly D2 = 95;
	public static readonly D3 = 96;
	public static readonly D4 = 97;
	public static readonly D5 = 98;
	public static readonly D6 = 99;
	public static readonly D7 = 100;
	public static readonly D8 = 101;
	public static readonly D9 = 102;
	public static readonly D0 = 103;
	public static readonly OtherChar = 104;
	public static readonly RULE_parse = 0;
	public static readonly RULE_alternation = 1;
	public static readonly RULE_expr = 2;
	public static readonly RULE_element = 3;
	public static readonly RULE_quantifier = 4;
	public static readonly RULE_quantifier_type = 5;
	public static readonly RULE_character_class = 6;
	public static readonly RULE_capture = 7;
	public static readonly RULE_non_capture = 8;
	public static readonly RULE_option = 9;
	public static readonly RULE_option_flag = 10;
	public static readonly RULE_atom = 11;
	public static readonly RULE_cc_atom = 12;
	public static readonly RULE_shared_atom = 13;
	public static readonly RULE_literal = 14;
	public static readonly RULE_cc_literal = 15;
	public static readonly RULE_shared_literal = 16;
	public static readonly RULE_number = 17;
	public static readonly RULE_octal_char = 18;
	public static readonly RULE_octal_digit = 19;
	public static readonly RULE_digits = 20;
	public static readonly RULE_digit = 21;
	public static readonly RULE_name = 22;
	public static readonly RULE_alpha_nums = 23;
	public static readonly RULE_non_close_parens = 24;
	public static readonly RULE_non_close_paren = 25;
	public static readonly RULE_letter = 26;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"parse", "alternation", "expr", "element", "quantifier", "quantifier_type", 
		"character_class", "capture", "non_capture", "option", "option_flag", 
		"atom", "cc_atom", "shared_atom", "literal", "cc_literal", "shared_literal", 
		"number", "octal_char", "octal_digit", "digits", "digit", "name", "alpha_nums", 
		"non_close_parens", "non_close_paren", "letter",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'\\a'", "'\\c'", "'\\e'", "'\\f'", "'\\n'", "'\\r'", "'\\t'", 
		"'\\'", undefined, "'.'", "'\\d'", "'\\D'", undefined, undefined, "'\\s'", 
		"'\\S'", "'\\w'", "'\\W'", "'['", "']'", "'^'", "'-'", "'?'", "'+'", "'*'", 
		"'{'", "'}'", "','", "'$'", "'|'", "'('", "')'", "'<'", "'>'", "'''", 
		"'_'", "':'", "'#'", "'='", "'!'", "'&'", "'a'", "'b'", "'c'", "'d'", 
		"'e'", "'f'", "'g'", "'h'", "'i'", "'j'", "'k'", "'l'", "'m'", "'n'", 
		"'o'", "'p'", "'q'", "'r'", "'s'", "'t'", "'u'", "'v'", "'w'", "'x'", 
		"'y'", "'z'", "'A'", "'B'", "'C'", "'D'", "'E'", "'F'", "'G'", "'H'", 
		"'I'", "'J'", "'K'", "'L'", "'M'", "'N'", "'O'", "'P'", "'Q'", "'R'", 
		"'S'", "'T'", "'U'", "'V'", "'W'", "'X'", "'Y'", "'Z'", "'1'", "'2'", 
		"'3'", "'4'", "'5'", "'6'", "'7'", "'8'", "'9'", "'0'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "BellChar", "ControlChar", "EscapeChar", "FormFeed", "NewLine", 
		"CarriageReturn", "Tab", "Backslash", "HexChar", "Dot", "DecimalDigit", 
		"NotDecimalDigit", "CharWithProperty", "CharWithoutProperty", "WhiteSpace", 
		"NotWhiteSpace", "WordChar", "NotWordChar", "CharacterClassStart", "CharacterClassEnd", 
		"Caret", "Hyphen", "QuestionMark", "Plus", "Star", "OpenBrace", "CloseBrace", 
		"Comma", "EndOfSubject", "Pipe", "OpenParen", "CloseParen", "LessThan", 
		"GreaterThan", "SingleQuote", "Underscore", "Colon", "Hash", "Equals", 
		"Exclamation", "Ampersand", "ALC", "BLC", "CLC", "DLC", "ELC", "FLC", 
		"GLC", "HLC", "ILC", "JLC", "KLC", "LLC", "MLC", "NLC", "OLC", "PLC", 
		"QLC", "RLC", "SLC", "TLC", "ULC", "VLC", "WLC", "XLC", "YLC", "ZLC", 
		"AUC", "BUC", "CUC", "DUC", "EUC", "FUC", "GUC", "HUC", "IUC", "JUC", 
		"KUC", "LUC", "MUC", "NUC", "OUC", "PUC", "QUC", "RUC", "SUC", "TUC", 
		"UUC", "VUC", "WUC", "XUC", "YUC", "ZUC", "D1", "D2", "D3", "D4", "D5", 
		"D6", "D7", "D8", "D9", "D0", "OtherChar",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CommonRegexParser._LITERAL_NAMES, CommonRegexParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CommonRegexParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "CommonRegex.g4"; }

	// @Override
	public get ruleNames(): string[] { return CommonRegexParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return CommonRegexParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(CommonRegexParser._ATN, this);
	}
	// @RuleVersion(0)
	public parse(): ParseContext {
		let _localctx: ParseContext = new ParseContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CommonRegexParser.RULE_parse);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 54;
			this.alternation();
			this.state = 55;
			this.match(CommonRegexParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public alternation(): AlternationContext {
		let _localctx: AlternationContext = new AlternationContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CommonRegexParser.RULE_alternation);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 57;
			this.expr();
			this.state = 62;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CommonRegexParser.Pipe) {
				{
				{
				this.state = 58;
				this.match(CommonRegexParser.Pipe);
				this.state = 59;
				this.expr();
				}
				}
				this.state = 64;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expr(): ExprContext {
		let _localctx: ExprContext = new ExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, CommonRegexParser.RULE_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 68;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CommonRegexParser.BellChar) | (1 << CommonRegexParser.ControlChar) | (1 << CommonRegexParser.EscapeChar) | (1 << CommonRegexParser.FormFeed) | (1 << CommonRegexParser.NewLine) | (1 << CommonRegexParser.CarriageReturn) | (1 << CommonRegexParser.Tab) | (1 << CommonRegexParser.Backslash) | (1 << CommonRegexParser.HexChar) | (1 << CommonRegexParser.Dot) | (1 << CommonRegexParser.DecimalDigit) | (1 << CommonRegexParser.NotDecimalDigit) | (1 << CommonRegexParser.CharWithProperty) | (1 << CommonRegexParser.CharWithoutProperty) | (1 << CommonRegexParser.WhiteSpace) | (1 << CommonRegexParser.NotWhiteSpace) | (1 << CommonRegexParser.WordChar) | (1 << CommonRegexParser.NotWordChar) | (1 << CommonRegexParser.CharacterClassStart) | (1 << CommonRegexParser.CharacterClassEnd) | (1 << CommonRegexParser.Caret) | (1 << CommonRegexParser.Hyphen) | (1 << CommonRegexParser.OpenBrace) | (1 << CommonRegexParser.CloseBrace) | (1 << CommonRegexParser.Comma) | (1 << CommonRegexParser.EndOfSubject) | (1 << CommonRegexParser.OpenParen))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (CommonRegexParser.LessThan - 33)) | (1 << (CommonRegexParser.GreaterThan - 33)) | (1 << (CommonRegexParser.SingleQuote - 33)) | (1 << (CommonRegexParser.Underscore - 33)) | (1 << (CommonRegexParser.Colon - 33)) | (1 << (CommonRegexParser.Hash - 33)) | (1 << (CommonRegexParser.Equals - 33)) | (1 << (CommonRegexParser.Exclamation - 33)) | (1 << (CommonRegexParser.Ampersand - 33)) | (1 << (CommonRegexParser.ALC - 33)) | (1 << (CommonRegexParser.BLC - 33)) | (1 << (CommonRegexParser.CLC - 33)) | (1 << (CommonRegexParser.DLC - 33)) | (1 << (CommonRegexParser.ELC - 33)) | (1 << (CommonRegexParser.FLC - 33)) | (1 << (CommonRegexParser.GLC - 33)) | (1 << (CommonRegexParser.HLC - 33)) | (1 << (CommonRegexParser.ILC - 33)) | (1 << (CommonRegexParser.JLC - 33)) | (1 << (CommonRegexParser.KLC - 33)) | (1 << (CommonRegexParser.LLC - 33)) | (1 << (CommonRegexParser.MLC - 33)) | (1 << (CommonRegexParser.NLC - 33)) | (1 << (CommonRegexParser.OLC - 33)) | (1 << (CommonRegexParser.PLC - 33)) | (1 << (CommonRegexParser.QLC - 33)) | (1 << (CommonRegexParser.RLC - 33)) | (1 << (CommonRegexParser.SLC - 33)) | (1 << (CommonRegexParser.TLC - 33)) | (1 << (CommonRegexParser.ULC - 33)) | (1 << (CommonRegexParser.VLC - 33)) | (1 << (CommonRegexParser.WLC - 33)))) !== 0) || ((((_la - 65)) & ~0x1F) === 0 && ((1 << (_la - 65)) & ((1 << (CommonRegexParser.XLC - 65)) | (1 << (CommonRegexParser.YLC - 65)) | (1 << (CommonRegexParser.ZLC - 65)) | (1 << (CommonRegexParser.AUC - 65)) | (1 << (CommonRegexParser.BUC - 65)) | (1 << (CommonRegexParser.CUC - 65)) | (1 << (CommonRegexParser.DUC - 65)) | (1 << (CommonRegexParser.EUC - 65)) | (1 << (CommonRegexParser.FUC - 65)) | (1 << (CommonRegexParser.GUC - 65)) | (1 << (CommonRegexParser.HUC - 65)) | (1 << (CommonRegexParser.IUC - 65)) | (1 << (CommonRegexParser.JUC - 65)) | (1 << (CommonRegexParser.KUC - 65)) | (1 << (CommonRegexParser.LUC - 65)) | (1 << (CommonRegexParser.MUC - 65)) | (1 << (CommonRegexParser.NUC - 65)) | (1 << (CommonRegexParser.OUC - 65)) | (1 << (CommonRegexParser.PUC - 65)) | (1 << (CommonRegexParser.QUC - 65)) | (1 << (CommonRegexParser.RUC - 65)) | (1 << (CommonRegexParser.SUC - 65)) | (1 << (CommonRegexParser.TUC - 65)) | (1 << (CommonRegexParser.UUC - 65)) | (1 << (CommonRegexParser.VUC - 65)) | (1 << (CommonRegexParser.WUC - 65)) | (1 << (CommonRegexParser.XUC - 65)) | (1 << (CommonRegexParser.YUC - 65)) | (1 << (CommonRegexParser.ZUC - 65)) | (1 << (CommonRegexParser.D1 - 65)) | (1 << (CommonRegexParser.D2 - 65)) | (1 << (CommonRegexParser.D3 - 65)))) !== 0) || ((((_la - 97)) & ~0x1F) === 0 && ((1 << (_la - 97)) & ((1 << (CommonRegexParser.D4 - 97)) | (1 << (CommonRegexParser.D5 - 97)) | (1 << (CommonRegexParser.D6 - 97)) | (1 << (CommonRegexParser.D7 - 97)) | (1 << (CommonRegexParser.D8 - 97)) | (1 << (CommonRegexParser.D9 - 97)) | (1 << (CommonRegexParser.D0 - 97)) | (1 << (CommonRegexParser.OtherChar - 97)))) !== 0)) {
				{
				{
				this.state = 65;
				this.element();
				}
				}
				this.state = 70;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public element(): ElementContext {
		let _localctx: ElementContext = new ElementContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CommonRegexParser.RULE_element);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 71;
			this.atom();
			this.state = 73;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				{
				this.state = 72;
				this.quantifier();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public quantifier(): QuantifierContext {
		let _localctx: QuantifierContext = new QuantifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, CommonRegexParser.RULE_quantifier);
		try {
			this.state = 99;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 75;
				this.match(CommonRegexParser.QuestionMark);
				this.state = 76;
				this.quantifier_type();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 77;
				this.match(CommonRegexParser.Plus);
				this.state = 78;
				this.quantifier_type();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 79;
				this.match(CommonRegexParser.Star);
				this.state = 80;
				this.quantifier_type();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 81;
				this.match(CommonRegexParser.OpenBrace);
				this.state = 82;
				this.number();
				this.state = 83;
				this.match(CommonRegexParser.CloseBrace);
				this.state = 84;
				this.quantifier_type();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 86;
				this.match(CommonRegexParser.OpenBrace);
				this.state = 87;
				this.number();
				this.state = 88;
				this.match(CommonRegexParser.Comma);
				this.state = 89;
				this.match(CommonRegexParser.CloseBrace);
				this.state = 90;
				this.quantifier_type();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 92;
				this.match(CommonRegexParser.OpenBrace);
				this.state = 93;
				this.number();
				this.state = 94;
				this.match(CommonRegexParser.Comma);
				this.state = 95;
				this.number();
				this.state = 96;
				this.match(CommonRegexParser.CloseBrace);
				this.state = 97;
				this.quantifier_type();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public quantifier_type(): Quantifier_typeContext {
		let _localctx: Quantifier_typeContext = new Quantifier_typeContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, CommonRegexParser.RULE_quantifier_type);
		try {
			this.state = 104;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CommonRegexParser.Plus:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 101;
				this.match(CommonRegexParser.Plus);
				}
				break;
			case CommonRegexParser.QuestionMark:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 102;
				this.match(CommonRegexParser.QuestionMark);
				}
				break;
			case CommonRegexParser.EOF:
			case CommonRegexParser.BellChar:
			case CommonRegexParser.ControlChar:
			case CommonRegexParser.EscapeChar:
			case CommonRegexParser.FormFeed:
			case CommonRegexParser.NewLine:
			case CommonRegexParser.CarriageReturn:
			case CommonRegexParser.Tab:
			case CommonRegexParser.Backslash:
			case CommonRegexParser.HexChar:
			case CommonRegexParser.Dot:
			case CommonRegexParser.DecimalDigit:
			case CommonRegexParser.NotDecimalDigit:
			case CommonRegexParser.CharWithProperty:
			case CommonRegexParser.CharWithoutProperty:
			case CommonRegexParser.WhiteSpace:
			case CommonRegexParser.NotWhiteSpace:
			case CommonRegexParser.WordChar:
			case CommonRegexParser.NotWordChar:
			case CommonRegexParser.CharacterClassStart:
			case CommonRegexParser.CharacterClassEnd:
			case CommonRegexParser.Caret:
			case CommonRegexParser.Hyphen:
			case CommonRegexParser.OpenBrace:
			case CommonRegexParser.CloseBrace:
			case CommonRegexParser.Comma:
			case CommonRegexParser.EndOfSubject:
			case CommonRegexParser.Pipe:
			case CommonRegexParser.OpenParen:
			case CommonRegexParser.CloseParen:
			case CommonRegexParser.LessThan:
			case CommonRegexParser.GreaterThan:
			case CommonRegexParser.SingleQuote:
			case CommonRegexParser.Underscore:
			case CommonRegexParser.Colon:
			case CommonRegexParser.Hash:
			case CommonRegexParser.Equals:
			case CommonRegexParser.Exclamation:
			case CommonRegexParser.Ampersand:
			case CommonRegexParser.ALC:
			case CommonRegexParser.BLC:
			case CommonRegexParser.CLC:
			case CommonRegexParser.DLC:
			case CommonRegexParser.ELC:
			case CommonRegexParser.FLC:
			case CommonRegexParser.GLC:
			case CommonRegexParser.HLC:
			case CommonRegexParser.ILC:
			case CommonRegexParser.JLC:
			case CommonRegexParser.KLC:
			case CommonRegexParser.LLC:
			case CommonRegexParser.MLC:
			case CommonRegexParser.NLC:
			case CommonRegexParser.OLC:
			case CommonRegexParser.PLC:
			case CommonRegexParser.QLC:
			case CommonRegexParser.RLC:
			case CommonRegexParser.SLC:
			case CommonRegexParser.TLC:
			case CommonRegexParser.ULC:
			case CommonRegexParser.VLC:
			case CommonRegexParser.WLC:
			case CommonRegexParser.XLC:
			case CommonRegexParser.YLC:
			case CommonRegexParser.ZLC:
			case CommonRegexParser.AUC:
			case CommonRegexParser.BUC:
			case CommonRegexParser.CUC:
			case CommonRegexParser.DUC:
			case CommonRegexParser.EUC:
			case CommonRegexParser.FUC:
			case CommonRegexParser.GUC:
			case CommonRegexParser.HUC:
			case CommonRegexParser.IUC:
			case CommonRegexParser.JUC:
			case CommonRegexParser.KUC:
			case CommonRegexParser.LUC:
			case CommonRegexParser.MUC:
			case CommonRegexParser.NUC:
			case CommonRegexParser.OUC:
			case CommonRegexParser.PUC:
			case CommonRegexParser.QUC:
			case CommonRegexParser.RUC:
			case CommonRegexParser.SUC:
			case CommonRegexParser.TUC:
			case CommonRegexParser.UUC:
			case CommonRegexParser.VUC:
			case CommonRegexParser.WUC:
			case CommonRegexParser.XUC:
			case CommonRegexParser.YUC:
			case CommonRegexParser.ZUC:
			case CommonRegexParser.D1:
			case CommonRegexParser.D2:
			case CommonRegexParser.D3:
			case CommonRegexParser.D4:
			case CommonRegexParser.D5:
			case CommonRegexParser.D6:
			case CommonRegexParser.D7:
			case CommonRegexParser.D8:
			case CommonRegexParser.D9:
			case CommonRegexParser.D0:
			case CommonRegexParser.OtherChar:
				this.enterOuterAlt(_localctx, 3);
				// tslint:disable-next-line:no-empty
				{
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public character_class(): Character_classContext {
		let _localctx: Character_classContext = new Character_classContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CommonRegexParser.RULE_character_class);
		let _la: number;
		try {
			this.state = 123;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 106;
				this.match(CommonRegexParser.CharacterClassStart);
				this.state = 107;
				this.match(CommonRegexParser.Caret);
				this.state = 109;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 108;
					this.cc_atom();
					}
					}
					this.state = 111;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CommonRegexParser.BellChar) | (1 << CommonRegexParser.ControlChar) | (1 << CommonRegexParser.EscapeChar) | (1 << CommonRegexParser.FormFeed) | (1 << CommonRegexParser.NewLine) | (1 << CommonRegexParser.CarriageReturn) | (1 << CommonRegexParser.Tab) | (1 << CommonRegexParser.Backslash) | (1 << CommonRegexParser.HexChar) | (1 << CommonRegexParser.Dot) | (1 << CommonRegexParser.DecimalDigit) | (1 << CommonRegexParser.NotDecimalDigit) | (1 << CommonRegexParser.CharWithProperty) | (1 << CommonRegexParser.CharWithoutProperty) | (1 << CommonRegexParser.WhiteSpace) | (1 << CommonRegexParser.NotWhiteSpace) | (1 << CommonRegexParser.WordChar) | (1 << CommonRegexParser.NotWordChar) | (1 << CommonRegexParser.CharacterClassStart) | (1 << CommonRegexParser.Caret) | (1 << CommonRegexParser.Hyphen) | (1 << CommonRegexParser.QuestionMark) | (1 << CommonRegexParser.Plus) | (1 << CommonRegexParser.Star) | (1 << CommonRegexParser.OpenBrace) | (1 << CommonRegexParser.CloseBrace) | (1 << CommonRegexParser.Comma) | (1 << CommonRegexParser.EndOfSubject) | (1 << CommonRegexParser.Pipe) | (1 << CommonRegexParser.OpenParen))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (CommonRegexParser.CloseParen - 32)) | (1 << (CommonRegexParser.LessThan - 32)) | (1 << (CommonRegexParser.GreaterThan - 32)) | (1 << (CommonRegexParser.SingleQuote - 32)) | (1 << (CommonRegexParser.Underscore - 32)) | (1 << (CommonRegexParser.Colon - 32)) | (1 << (CommonRegexParser.Hash - 32)) | (1 << (CommonRegexParser.Equals - 32)) | (1 << (CommonRegexParser.Exclamation - 32)) | (1 << (CommonRegexParser.Ampersand - 32)) | (1 << (CommonRegexParser.ALC - 32)) | (1 << (CommonRegexParser.BLC - 32)) | (1 << (CommonRegexParser.CLC - 32)) | (1 << (CommonRegexParser.DLC - 32)) | (1 << (CommonRegexParser.ELC - 32)) | (1 << (CommonRegexParser.FLC - 32)) | (1 << (CommonRegexParser.GLC - 32)) | (1 << (CommonRegexParser.HLC - 32)) | (1 << (CommonRegexParser.ILC - 32)) | (1 << (CommonRegexParser.JLC - 32)) | (1 << (CommonRegexParser.KLC - 32)) | (1 << (CommonRegexParser.LLC - 32)) | (1 << (CommonRegexParser.MLC - 32)) | (1 << (CommonRegexParser.NLC - 32)) | (1 << (CommonRegexParser.OLC - 32)) | (1 << (CommonRegexParser.PLC - 32)) | (1 << (CommonRegexParser.QLC - 32)) | (1 << (CommonRegexParser.RLC - 32)) | (1 << (CommonRegexParser.SLC - 32)) | (1 << (CommonRegexParser.TLC - 32)) | (1 << (CommonRegexParser.ULC - 32)) | (1 << (CommonRegexParser.VLC - 32)))) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & ((1 << (CommonRegexParser.WLC - 64)) | (1 << (CommonRegexParser.XLC - 64)) | (1 << (CommonRegexParser.YLC - 64)) | (1 << (CommonRegexParser.ZLC - 64)) | (1 << (CommonRegexParser.AUC - 64)) | (1 << (CommonRegexParser.BUC - 64)) | (1 << (CommonRegexParser.CUC - 64)) | (1 << (CommonRegexParser.DUC - 64)) | (1 << (CommonRegexParser.EUC - 64)) | (1 << (CommonRegexParser.FUC - 64)) | (1 << (CommonRegexParser.GUC - 64)) | (1 << (CommonRegexParser.HUC - 64)) | (1 << (CommonRegexParser.IUC - 64)) | (1 << (CommonRegexParser.JUC - 64)) | (1 << (CommonRegexParser.KUC - 64)) | (1 << (CommonRegexParser.LUC - 64)) | (1 << (CommonRegexParser.MUC - 64)) | (1 << (CommonRegexParser.NUC - 64)) | (1 << (CommonRegexParser.OUC - 64)) | (1 << (CommonRegexParser.PUC - 64)) | (1 << (CommonRegexParser.QUC - 64)) | (1 << (CommonRegexParser.RUC - 64)) | (1 << (CommonRegexParser.SUC - 64)) | (1 << (CommonRegexParser.TUC - 64)) | (1 << (CommonRegexParser.UUC - 64)) | (1 << (CommonRegexParser.VUC - 64)) | (1 << (CommonRegexParser.WUC - 64)) | (1 << (CommonRegexParser.XUC - 64)) | (1 << (CommonRegexParser.YUC - 64)) | (1 << (CommonRegexParser.ZUC - 64)) | (1 << (CommonRegexParser.D1 - 64)) | (1 << (CommonRegexParser.D2 - 64)))) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & ((1 << (CommonRegexParser.D3 - 96)) | (1 << (CommonRegexParser.D4 - 96)) | (1 << (CommonRegexParser.D5 - 96)) | (1 << (CommonRegexParser.D6 - 96)) | (1 << (CommonRegexParser.D7 - 96)) | (1 << (CommonRegexParser.D8 - 96)) | (1 << (CommonRegexParser.D9 - 96)) | (1 << (CommonRegexParser.D0 - 96)) | (1 << (CommonRegexParser.OtherChar - 96)))) !== 0));
				this.state = 113;
				this.match(CommonRegexParser.CharacterClassEnd);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 115;
				this.match(CommonRegexParser.CharacterClassStart);
				this.state = 117;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 116;
					this.cc_atom();
					}
					}
					this.state = 119;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CommonRegexParser.BellChar) | (1 << CommonRegexParser.ControlChar) | (1 << CommonRegexParser.EscapeChar) | (1 << CommonRegexParser.FormFeed) | (1 << CommonRegexParser.NewLine) | (1 << CommonRegexParser.CarriageReturn) | (1 << CommonRegexParser.Tab) | (1 << CommonRegexParser.Backslash) | (1 << CommonRegexParser.HexChar) | (1 << CommonRegexParser.Dot) | (1 << CommonRegexParser.DecimalDigit) | (1 << CommonRegexParser.NotDecimalDigit) | (1 << CommonRegexParser.CharWithProperty) | (1 << CommonRegexParser.CharWithoutProperty) | (1 << CommonRegexParser.WhiteSpace) | (1 << CommonRegexParser.NotWhiteSpace) | (1 << CommonRegexParser.WordChar) | (1 << CommonRegexParser.NotWordChar) | (1 << CommonRegexParser.CharacterClassStart) | (1 << CommonRegexParser.Caret) | (1 << CommonRegexParser.Hyphen) | (1 << CommonRegexParser.QuestionMark) | (1 << CommonRegexParser.Plus) | (1 << CommonRegexParser.Star) | (1 << CommonRegexParser.OpenBrace) | (1 << CommonRegexParser.CloseBrace) | (1 << CommonRegexParser.Comma) | (1 << CommonRegexParser.EndOfSubject) | (1 << CommonRegexParser.Pipe) | (1 << CommonRegexParser.OpenParen))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (CommonRegexParser.CloseParen - 32)) | (1 << (CommonRegexParser.LessThan - 32)) | (1 << (CommonRegexParser.GreaterThan - 32)) | (1 << (CommonRegexParser.SingleQuote - 32)) | (1 << (CommonRegexParser.Underscore - 32)) | (1 << (CommonRegexParser.Colon - 32)) | (1 << (CommonRegexParser.Hash - 32)) | (1 << (CommonRegexParser.Equals - 32)) | (1 << (CommonRegexParser.Exclamation - 32)) | (1 << (CommonRegexParser.Ampersand - 32)) | (1 << (CommonRegexParser.ALC - 32)) | (1 << (CommonRegexParser.BLC - 32)) | (1 << (CommonRegexParser.CLC - 32)) | (1 << (CommonRegexParser.DLC - 32)) | (1 << (CommonRegexParser.ELC - 32)) | (1 << (CommonRegexParser.FLC - 32)) | (1 << (CommonRegexParser.GLC - 32)) | (1 << (CommonRegexParser.HLC - 32)) | (1 << (CommonRegexParser.ILC - 32)) | (1 << (CommonRegexParser.JLC - 32)) | (1 << (CommonRegexParser.KLC - 32)) | (1 << (CommonRegexParser.LLC - 32)) | (1 << (CommonRegexParser.MLC - 32)) | (1 << (CommonRegexParser.NLC - 32)) | (1 << (CommonRegexParser.OLC - 32)) | (1 << (CommonRegexParser.PLC - 32)) | (1 << (CommonRegexParser.QLC - 32)) | (1 << (CommonRegexParser.RLC - 32)) | (1 << (CommonRegexParser.SLC - 32)) | (1 << (CommonRegexParser.TLC - 32)) | (1 << (CommonRegexParser.ULC - 32)) | (1 << (CommonRegexParser.VLC - 32)))) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & ((1 << (CommonRegexParser.WLC - 64)) | (1 << (CommonRegexParser.XLC - 64)) | (1 << (CommonRegexParser.YLC - 64)) | (1 << (CommonRegexParser.ZLC - 64)) | (1 << (CommonRegexParser.AUC - 64)) | (1 << (CommonRegexParser.BUC - 64)) | (1 << (CommonRegexParser.CUC - 64)) | (1 << (CommonRegexParser.DUC - 64)) | (1 << (CommonRegexParser.EUC - 64)) | (1 << (CommonRegexParser.FUC - 64)) | (1 << (CommonRegexParser.GUC - 64)) | (1 << (CommonRegexParser.HUC - 64)) | (1 << (CommonRegexParser.IUC - 64)) | (1 << (CommonRegexParser.JUC - 64)) | (1 << (CommonRegexParser.KUC - 64)) | (1 << (CommonRegexParser.LUC - 64)) | (1 << (CommonRegexParser.MUC - 64)) | (1 << (CommonRegexParser.NUC - 64)) | (1 << (CommonRegexParser.OUC - 64)) | (1 << (CommonRegexParser.PUC - 64)) | (1 << (CommonRegexParser.QUC - 64)) | (1 << (CommonRegexParser.RUC - 64)) | (1 << (CommonRegexParser.SUC - 64)) | (1 << (CommonRegexParser.TUC - 64)) | (1 << (CommonRegexParser.UUC - 64)) | (1 << (CommonRegexParser.VUC - 64)) | (1 << (CommonRegexParser.WUC - 64)) | (1 << (CommonRegexParser.XUC - 64)) | (1 << (CommonRegexParser.YUC - 64)) | (1 << (CommonRegexParser.ZUC - 64)) | (1 << (CommonRegexParser.D1 - 64)) | (1 << (CommonRegexParser.D2 - 64)))) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & ((1 << (CommonRegexParser.D3 - 96)) | (1 << (CommonRegexParser.D4 - 96)) | (1 << (CommonRegexParser.D5 - 96)) | (1 << (CommonRegexParser.D6 - 96)) | (1 << (CommonRegexParser.D7 - 96)) | (1 << (CommonRegexParser.D8 - 96)) | (1 << (CommonRegexParser.D9 - 96)) | (1 << (CommonRegexParser.D0 - 96)) | (1 << (CommonRegexParser.OtherChar - 96)))) !== 0));
				this.state = 121;
				this.match(CommonRegexParser.CharacterClassEnd);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public capture(): CaptureContext {
		let _localctx: CaptureContext = new CaptureContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, CommonRegexParser.RULE_capture);
		try {
			this.state = 137;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 125;
				this.match(CommonRegexParser.OpenParen);
				this.state = 126;
				this.match(CommonRegexParser.QuestionMark);
				this.state = 127;
				this.match(CommonRegexParser.LessThan);
				this.state = 128;
				this.name();
				this.state = 129;
				this.match(CommonRegexParser.GreaterThan);
				this.state = 130;
				this.alternation();
				this.state = 131;
				this.match(CommonRegexParser.CloseParen);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 133;
				this.match(CommonRegexParser.OpenParen);
				this.state = 134;
				this.alternation();
				this.state = 135;
				this.match(CommonRegexParser.CloseParen);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public non_capture(): Non_captureContext {
		let _localctx: Non_captureContext = new Non_captureContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, CommonRegexParser.RULE_non_capture);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 139;
			this.match(CommonRegexParser.OpenParen);
			this.state = 140;
			this.match(CommonRegexParser.QuestionMark);
			this.state = 141;
			this.match(CommonRegexParser.Colon);
			this.state = 142;
			this.alternation();
			this.state = 143;
			this.match(CommonRegexParser.CloseParen);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public option(): OptionContext {
		let _localctx: OptionContext = new OptionContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, CommonRegexParser.RULE_option);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 145;
			this.match(CommonRegexParser.OpenParen);
			this.state = 146;
			this.match(CommonRegexParser.QuestionMark);
			this.state = 148;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 147;
				this.option_flag();
				}
				}
				this.state = 150;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 50)) & ~0x1F) === 0 && ((1 << (_la - 50)) & ((1 << (CommonRegexParser.ILC - 50)) | (1 << (CommonRegexParser.MLC - 50)) | (1 << (CommonRegexParser.SLC - 50)))) !== 0));
			this.state = 152;
			this.match(CommonRegexParser.CloseParen);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public option_flag(): Option_flagContext {
		let _localctx: Option_flagContext = new Option_flagContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, CommonRegexParser.RULE_option_flag);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 154;
			_la = this._input.LA(1);
			if (!(((((_la - 50)) & ~0x1F) === 0 && ((1 << (_la - 50)) & ((1 << (CommonRegexParser.ILC - 50)) | (1 << (CommonRegexParser.MLC - 50)) | (1 << (CommonRegexParser.SLC - 50)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public atom(): AtomContext {
		let _localctx: AtomContext = new AtomContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, CommonRegexParser.RULE_atom);
		try {
			this.state = 165;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 156;
				this.shared_atom();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 157;
				this.literal();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 158;
				this.character_class();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 159;
				this.capture();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 160;
				this.non_capture();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 161;
				this.option();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 162;
				this.match(CommonRegexParser.Dot);
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 163;
				this.match(CommonRegexParser.Caret);
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 164;
				this.match(CommonRegexParser.EndOfSubject);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public cc_atom(): Cc_atomContext {
		let _localctx: Cc_atomContext = new Cc_atomContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, CommonRegexParser.RULE_cc_atom);
		try {
			this.state = 173;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 11, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 167;
				this.cc_literal();
				this.state = 168;
				this.match(CommonRegexParser.Hyphen);
				this.state = 169;
				this.cc_literal();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 171;
				this.shared_atom();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 172;
				this.cc_literal();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public shared_atom(): Shared_atomContext {
		let _localctx: Shared_atomContext = new Shared_atomContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, CommonRegexParser.RULE_shared_atom);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 175;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CommonRegexParser.ControlChar) | (1 << CommonRegexParser.DecimalDigit) | (1 << CommonRegexParser.NotDecimalDigit) | (1 << CommonRegexParser.CharWithProperty) | (1 << CommonRegexParser.CharWithoutProperty) | (1 << CommonRegexParser.WhiteSpace) | (1 << CommonRegexParser.NotWhiteSpace) | (1 << CommonRegexParser.WordChar) | (1 << CommonRegexParser.NotWordChar))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, CommonRegexParser.RULE_literal);
		try {
			this.state = 179;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CommonRegexParser.BellChar:
			case CommonRegexParser.EscapeChar:
			case CommonRegexParser.FormFeed:
			case CommonRegexParser.NewLine:
			case CommonRegexParser.CarriageReturn:
			case CommonRegexParser.Tab:
			case CommonRegexParser.Backslash:
			case CommonRegexParser.HexChar:
			case CommonRegexParser.Hyphen:
			case CommonRegexParser.OpenBrace:
			case CommonRegexParser.CloseBrace:
			case CommonRegexParser.Comma:
			case CommonRegexParser.LessThan:
			case CommonRegexParser.GreaterThan:
			case CommonRegexParser.SingleQuote:
			case CommonRegexParser.Underscore:
			case CommonRegexParser.Colon:
			case CommonRegexParser.Hash:
			case CommonRegexParser.Equals:
			case CommonRegexParser.Exclamation:
			case CommonRegexParser.Ampersand:
			case CommonRegexParser.ALC:
			case CommonRegexParser.BLC:
			case CommonRegexParser.CLC:
			case CommonRegexParser.DLC:
			case CommonRegexParser.ELC:
			case CommonRegexParser.FLC:
			case CommonRegexParser.GLC:
			case CommonRegexParser.HLC:
			case CommonRegexParser.ILC:
			case CommonRegexParser.JLC:
			case CommonRegexParser.KLC:
			case CommonRegexParser.LLC:
			case CommonRegexParser.MLC:
			case CommonRegexParser.NLC:
			case CommonRegexParser.OLC:
			case CommonRegexParser.PLC:
			case CommonRegexParser.QLC:
			case CommonRegexParser.RLC:
			case CommonRegexParser.SLC:
			case CommonRegexParser.TLC:
			case CommonRegexParser.ULC:
			case CommonRegexParser.VLC:
			case CommonRegexParser.WLC:
			case CommonRegexParser.XLC:
			case CommonRegexParser.YLC:
			case CommonRegexParser.ZLC:
			case CommonRegexParser.AUC:
			case CommonRegexParser.BUC:
			case CommonRegexParser.CUC:
			case CommonRegexParser.DUC:
			case CommonRegexParser.EUC:
			case CommonRegexParser.FUC:
			case CommonRegexParser.GUC:
			case CommonRegexParser.HUC:
			case CommonRegexParser.IUC:
			case CommonRegexParser.JUC:
			case CommonRegexParser.KUC:
			case CommonRegexParser.LUC:
			case CommonRegexParser.MUC:
			case CommonRegexParser.NUC:
			case CommonRegexParser.OUC:
			case CommonRegexParser.PUC:
			case CommonRegexParser.QUC:
			case CommonRegexParser.RUC:
			case CommonRegexParser.SUC:
			case CommonRegexParser.TUC:
			case CommonRegexParser.UUC:
			case CommonRegexParser.VUC:
			case CommonRegexParser.WUC:
			case CommonRegexParser.XUC:
			case CommonRegexParser.YUC:
			case CommonRegexParser.ZUC:
			case CommonRegexParser.D1:
			case CommonRegexParser.D2:
			case CommonRegexParser.D3:
			case CommonRegexParser.D4:
			case CommonRegexParser.D5:
			case CommonRegexParser.D6:
			case CommonRegexParser.D7:
			case CommonRegexParser.D8:
			case CommonRegexParser.D9:
			case CommonRegexParser.D0:
			case CommonRegexParser.OtherChar:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 177;
				this.shared_literal();
				}
				break;
			case CommonRegexParser.CharacterClassEnd:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 178;
				this.match(CommonRegexParser.CharacterClassEnd);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public cc_literal(): Cc_literalContext {
		let _localctx: Cc_literalContext = new Cc_literalContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, CommonRegexParser.RULE_cc_literal);
		try {
			this.state = 192;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CommonRegexParser.BellChar:
			case CommonRegexParser.EscapeChar:
			case CommonRegexParser.FormFeed:
			case CommonRegexParser.NewLine:
			case CommonRegexParser.CarriageReturn:
			case CommonRegexParser.Tab:
			case CommonRegexParser.Backslash:
			case CommonRegexParser.HexChar:
			case CommonRegexParser.Hyphen:
			case CommonRegexParser.OpenBrace:
			case CommonRegexParser.CloseBrace:
			case CommonRegexParser.Comma:
			case CommonRegexParser.LessThan:
			case CommonRegexParser.GreaterThan:
			case CommonRegexParser.SingleQuote:
			case CommonRegexParser.Underscore:
			case CommonRegexParser.Colon:
			case CommonRegexParser.Hash:
			case CommonRegexParser.Equals:
			case CommonRegexParser.Exclamation:
			case CommonRegexParser.Ampersand:
			case CommonRegexParser.ALC:
			case CommonRegexParser.BLC:
			case CommonRegexParser.CLC:
			case CommonRegexParser.DLC:
			case CommonRegexParser.ELC:
			case CommonRegexParser.FLC:
			case CommonRegexParser.GLC:
			case CommonRegexParser.HLC:
			case CommonRegexParser.ILC:
			case CommonRegexParser.JLC:
			case CommonRegexParser.KLC:
			case CommonRegexParser.LLC:
			case CommonRegexParser.MLC:
			case CommonRegexParser.NLC:
			case CommonRegexParser.OLC:
			case CommonRegexParser.PLC:
			case CommonRegexParser.QLC:
			case CommonRegexParser.RLC:
			case CommonRegexParser.SLC:
			case CommonRegexParser.TLC:
			case CommonRegexParser.ULC:
			case CommonRegexParser.VLC:
			case CommonRegexParser.WLC:
			case CommonRegexParser.XLC:
			case CommonRegexParser.YLC:
			case CommonRegexParser.ZLC:
			case CommonRegexParser.AUC:
			case CommonRegexParser.BUC:
			case CommonRegexParser.CUC:
			case CommonRegexParser.DUC:
			case CommonRegexParser.EUC:
			case CommonRegexParser.FUC:
			case CommonRegexParser.GUC:
			case CommonRegexParser.HUC:
			case CommonRegexParser.IUC:
			case CommonRegexParser.JUC:
			case CommonRegexParser.KUC:
			case CommonRegexParser.LUC:
			case CommonRegexParser.MUC:
			case CommonRegexParser.NUC:
			case CommonRegexParser.OUC:
			case CommonRegexParser.PUC:
			case CommonRegexParser.QUC:
			case CommonRegexParser.RUC:
			case CommonRegexParser.SUC:
			case CommonRegexParser.TUC:
			case CommonRegexParser.UUC:
			case CommonRegexParser.VUC:
			case CommonRegexParser.WUC:
			case CommonRegexParser.XUC:
			case CommonRegexParser.YUC:
			case CommonRegexParser.ZUC:
			case CommonRegexParser.D1:
			case CommonRegexParser.D2:
			case CommonRegexParser.D3:
			case CommonRegexParser.D4:
			case CommonRegexParser.D5:
			case CommonRegexParser.D6:
			case CommonRegexParser.D7:
			case CommonRegexParser.D8:
			case CommonRegexParser.D9:
			case CommonRegexParser.D0:
			case CommonRegexParser.OtherChar:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 181;
				this.shared_literal();
				}
				break;
			case CommonRegexParser.Dot:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 182;
				this.match(CommonRegexParser.Dot);
				}
				break;
			case CommonRegexParser.CharacterClassStart:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 183;
				this.match(CommonRegexParser.CharacterClassStart);
				}
				break;
			case CommonRegexParser.Caret:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 184;
				this.match(CommonRegexParser.Caret);
				}
				break;
			case CommonRegexParser.QuestionMark:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 185;
				this.match(CommonRegexParser.QuestionMark);
				}
				break;
			case CommonRegexParser.Plus:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 186;
				this.match(CommonRegexParser.Plus);
				}
				break;
			case CommonRegexParser.Star:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 187;
				this.match(CommonRegexParser.Star);
				}
				break;
			case CommonRegexParser.EndOfSubject:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 188;
				this.match(CommonRegexParser.EndOfSubject);
				}
				break;
			case CommonRegexParser.Pipe:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 189;
				this.match(CommonRegexParser.Pipe);
				}
				break;
			case CommonRegexParser.OpenParen:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 190;
				this.match(CommonRegexParser.OpenParen);
				}
				break;
			case CommonRegexParser.CloseParen:
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 191;
				this.match(CommonRegexParser.CloseParen);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public shared_literal(): Shared_literalContext {
		let _localctx: Shared_literalContext = new Shared_literalContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, CommonRegexParser.RULE_shared_literal);
		try {
			this.state = 218;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CommonRegexParser.Backslash:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 194;
				this.octal_char();
				}
				break;
			case CommonRegexParser.ALC:
			case CommonRegexParser.BLC:
			case CommonRegexParser.CLC:
			case CommonRegexParser.DLC:
			case CommonRegexParser.ELC:
			case CommonRegexParser.FLC:
			case CommonRegexParser.GLC:
			case CommonRegexParser.HLC:
			case CommonRegexParser.ILC:
			case CommonRegexParser.JLC:
			case CommonRegexParser.KLC:
			case CommonRegexParser.LLC:
			case CommonRegexParser.MLC:
			case CommonRegexParser.NLC:
			case CommonRegexParser.OLC:
			case CommonRegexParser.PLC:
			case CommonRegexParser.QLC:
			case CommonRegexParser.RLC:
			case CommonRegexParser.SLC:
			case CommonRegexParser.TLC:
			case CommonRegexParser.ULC:
			case CommonRegexParser.VLC:
			case CommonRegexParser.WLC:
			case CommonRegexParser.XLC:
			case CommonRegexParser.YLC:
			case CommonRegexParser.ZLC:
			case CommonRegexParser.AUC:
			case CommonRegexParser.BUC:
			case CommonRegexParser.CUC:
			case CommonRegexParser.DUC:
			case CommonRegexParser.EUC:
			case CommonRegexParser.FUC:
			case CommonRegexParser.GUC:
			case CommonRegexParser.HUC:
			case CommonRegexParser.IUC:
			case CommonRegexParser.JUC:
			case CommonRegexParser.KUC:
			case CommonRegexParser.LUC:
			case CommonRegexParser.MUC:
			case CommonRegexParser.NUC:
			case CommonRegexParser.OUC:
			case CommonRegexParser.PUC:
			case CommonRegexParser.QUC:
			case CommonRegexParser.RUC:
			case CommonRegexParser.SUC:
			case CommonRegexParser.TUC:
			case CommonRegexParser.UUC:
			case CommonRegexParser.VUC:
			case CommonRegexParser.WUC:
			case CommonRegexParser.XUC:
			case CommonRegexParser.YUC:
			case CommonRegexParser.ZUC:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 195;
				this.letter();
				}
				break;
			case CommonRegexParser.D1:
			case CommonRegexParser.D2:
			case CommonRegexParser.D3:
			case CommonRegexParser.D4:
			case CommonRegexParser.D5:
			case CommonRegexParser.D6:
			case CommonRegexParser.D7:
			case CommonRegexParser.D8:
			case CommonRegexParser.D9:
			case CommonRegexParser.D0:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 196;
				this.digit();
				}
				break;
			case CommonRegexParser.BellChar:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 197;
				this.match(CommonRegexParser.BellChar);
				}
				break;
			case CommonRegexParser.EscapeChar:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 198;
				this.match(CommonRegexParser.EscapeChar);
				}
				break;
			case CommonRegexParser.FormFeed:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 199;
				this.match(CommonRegexParser.FormFeed);
				}
				break;
			case CommonRegexParser.NewLine:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 200;
				this.match(CommonRegexParser.NewLine);
				}
				break;
			case CommonRegexParser.CarriageReturn:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 201;
				this.match(CommonRegexParser.CarriageReturn);
				}
				break;
			case CommonRegexParser.Tab:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 202;
				this.match(CommonRegexParser.Tab);
				}
				break;
			case CommonRegexParser.HexChar:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 203;
				this.match(CommonRegexParser.HexChar);
				}
				break;
			case CommonRegexParser.OpenBrace:
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 204;
				this.match(CommonRegexParser.OpenBrace);
				}
				break;
			case CommonRegexParser.CloseBrace:
				this.enterOuterAlt(_localctx, 12);
				{
				this.state = 205;
				this.match(CommonRegexParser.CloseBrace);
				}
				break;
			case CommonRegexParser.Comma:
				this.enterOuterAlt(_localctx, 13);
				{
				this.state = 206;
				this.match(CommonRegexParser.Comma);
				}
				break;
			case CommonRegexParser.Hyphen:
				this.enterOuterAlt(_localctx, 14);
				{
				this.state = 207;
				this.match(CommonRegexParser.Hyphen);
				}
				break;
			case CommonRegexParser.LessThan:
				this.enterOuterAlt(_localctx, 15);
				{
				this.state = 208;
				this.match(CommonRegexParser.LessThan);
				}
				break;
			case CommonRegexParser.GreaterThan:
				this.enterOuterAlt(_localctx, 16);
				{
				this.state = 209;
				this.match(CommonRegexParser.GreaterThan);
				}
				break;
			case CommonRegexParser.SingleQuote:
				this.enterOuterAlt(_localctx, 17);
				{
				this.state = 210;
				this.match(CommonRegexParser.SingleQuote);
				}
				break;
			case CommonRegexParser.Underscore:
				this.enterOuterAlt(_localctx, 18);
				{
				this.state = 211;
				this.match(CommonRegexParser.Underscore);
				}
				break;
			case CommonRegexParser.Colon:
				this.enterOuterAlt(_localctx, 19);
				{
				this.state = 212;
				this.match(CommonRegexParser.Colon);
				}
				break;
			case CommonRegexParser.Hash:
				this.enterOuterAlt(_localctx, 20);
				{
				this.state = 213;
				this.match(CommonRegexParser.Hash);
				}
				break;
			case CommonRegexParser.Equals:
				this.enterOuterAlt(_localctx, 21);
				{
				this.state = 214;
				this.match(CommonRegexParser.Equals);
				}
				break;
			case CommonRegexParser.Exclamation:
				this.enterOuterAlt(_localctx, 22);
				{
				this.state = 215;
				this.match(CommonRegexParser.Exclamation);
				}
				break;
			case CommonRegexParser.Ampersand:
				this.enterOuterAlt(_localctx, 23);
				{
				this.state = 216;
				this.match(CommonRegexParser.Ampersand);
				}
				break;
			case CommonRegexParser.OtherChar:
				this.enterOuterAlt(_localctx, 24);
				{
				this.state = 217;
				this.match(CommonRegexParser.OtherChar);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public number(): NumberContext {
		let _localctx: NumberContext = new NumberContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, CommonRegexParser.RULE_number);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 220;
			this.digits();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public octal_char(): Octal_charContext {
		let _localctx: Octal_charContext = new Octal_charContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, CommonRegexParser.RULE_octal_char);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 231;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				{
				this.state = 222;
				this.match(CommonRegexParser.Backslash);
				this.state = 223;
				_la = this._input.LA(1);
				if (!(((((_la - 94)) & ~0x1F) === 0 && ((1 << (_la - 94)) & ((1 << (CommonRegexParser.D1 - 94)) | (1 << (CommonRegexParser.D2 - 94)) | (1 << (CommonRegexParser.D3 - 94)) | (1 << (CommonRegexParser.D0 - 94)))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 224;
				this.octal_digit();
				this.state = 225;
				this.octal_digit();
				}
				break;

			case 2:
				{
				this.state = 227;
				this.match(CommonRegexParser.Backslash);
				this.state = 228;
				this.octal_digit();
				this.state = 229;
				this.octal_digit();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public octal_digit(): Octal_digitContext {
		let _localctx: Octal_digitContext = new Octal_digitContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, CommonRegexParser.RULE_octal_digit);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 233;
			_la = this._input.LA(1);
			if (!(((((_la - 94)) & ~0x1F) === 0 && ((1 << (_la - 94)) & ((1 << (CommonRegexParser.D1 - 94)) | (1 << (CommonRegexParser.D2 - 94)) | (1 << (CommonRegexParser.D3 - 94)) | (1 << (CommonRegexParser.D4 - 94)) | (1 << (CommonRegexParser.D5 - 94)) | (1 << (CommonRegexParser.D6 - 94)) | (1 << (CommonRegexParser.D7 - 94)) | (1 << (CommonRegexParser.D0 - 94)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public digits(): DigitsContext {
		let _localctx: DigitsContext = new DigitsContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, CommonRegexParser.RULE_digits);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 236;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 235;
				this.digit();
				}
				}
				this.state = 238;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 94)) & ~0x1F) === 0 && ((1 << (_la - 94)) & ((1 << (CommonRegexParser.D1 - 94)) | (1 << (CommonRegexParser.D2 - 94)) | (1 << (CommonRegexParser.D3 - 94)) | (1 << (CommonRegexParser.D4 - 94)) | (1 << (CommonRegexParser.D5 - 94)) | (1 << (CommonRegexParser.D6 - 94)) | (1 << (CommonRegexParser.D7 - 94)) | (1 << (CommonRegexParser.D8 - 94)) | (1 << (CommonRegexParser.D9 - 94)) | (1 << (CommonRegexParser.D0 - 94)))) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public digit(): DigitContext {
		let _localctx: DigitContext = new DigitContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, CommonRegexParser.RULE_digit);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 240;
			_la = this._input.LA(1);
			if (!(((((_la - 94)) & ~0x1F) === 0 && ((1 << (_la - 94)) & ((1 << (CommonRegexParser.D1 - 94)) | (1 << (CommonRegexParser.D2 - 94)) | (1 << (CommonRegexParser.D3 - 94)) | (1 << (CommonRegexParser.D4 - 94)) | (1 << (CommonRegexParser.D5 - 94)) | (1 << (CommonRegexParser.D6 - 94)) | (1 << (CommonRegexParser.D7 - 94)) | (1 << (CommonRegexParser.D8 - 94)) | (1 << (CommonRegexParser.D9 - 94)) | (1 << (CommonRegexParser.D0 - 94)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public name(): NameContext {
		let _localctx: NameContext = new NameContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, CommonRegexParser.RULE_name);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 242;
			this.alpha_nums();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public alpha_nums(): Alpha_numsContext {
		let _localctx: Alpha_numsContext = new Alpha_numsContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, CommonRegexParser.RULE_alpha_nums);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 246;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CommonRegexParser.ALC:
			case CommonRegexParser.BLC:
			case CommonRegexParser.CLC:
			case CommonRegexParser.DLC:
			case CommonRegexParser.ELC:
			case CommonRegexParser.FLC:
			case CommonRegexParser.GLC:
			case CommonRegexParser.HLC:
			case CommonRegexParser.ILC:
			case CommonRegexParser.JLC:
			case CommonRegexParser.KLC:
			case CommonRegexParser.LLC:
			case CommonRegexParser.MLC:
			case CommonRegexParser.NLC:
			case CommonRegexParser.OLC:
			case CommonRegexParser.PLC:
			case CommonRegexParser.QLC:
			case CommonRegexParser.RLC:
			case CommonRegexParser.SLC:
			case CommonRegexParser.TLC:
			case CommonRegexParser.ULC:
			case CommonRegexParser.VLC:
			case CommonRegexParser.WLC:
			case CommonRegexParser.XLC:
			case CommonRegexParser.YLC:
			case CommonRegexParser.ZLC:
			case CommonRegexParser.AUC:
			case CommonRegexParser.BUC:
			case CommonRegexParser.CUC:
			case CommonRegexParser.DUC:
			case CommonRegexParser.EUC:
			case CommonRegexParser.FUC:
			case CommonRegexParser.GUC:
			case CommonRegexParser.HUC:
			case CommonRegexParser.IUC:
			case CommonRegexParser.JUC:
			case CommonRegexParser.KUC:
			case CommonRegexParser.LUC:
			case CommonRegexParser.MUC:
			case CommonRegexParser.NUC:
			case CommonRegexParser.OUC:
			case CommonRegexParser.PUC:
			case CommonRegexParser.QUC:
			case CommonRegexParser.RUC:
			case CommonRegexParser.SUC:
			case CommonRegexParser.TUC:
			case CommonRegexParser.UUC:
			case CommonRegexParser.VUC:
			case CommonRegexParser.WUC:
			case CommonRegexParser.XUC:
			case CommonRegexParser.YUC:
			case CommonRegexParser.ZUC:
				{
				this.state = 244;
				this.letter();
				}
				break;
			case CommonRegexParser.Underscore:
				{
				this.state = 245;
				this.match(CommonRegexParser.Underscore);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 253;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CommonRegexParser.Underscore - 36)) | (1 << (CommonRegexParser.ALC - 36)) | (1 << (CommonRegexParser.BLC - 36)) | (1 << (CommonRegexParser.CLC - 36)) | (1 << (CommonRegexParser.DLC - 36)) | (1 << (CommonRegexParser.ELC - 36)) | (1 << (CommonRegexParser.FLC - 36)) | (1 << (CommonRegexParser.GLC - 36)) | (1 << (CommonRegexParser.HLC - 36)) | (1 << (CommonRegexParser.ILC - 36)) | (1 << (CommonRegexParser.JLC - 36)) | (1 << (CommonRegexParser.KLC - 36)) | (1 << (CommonRegexParser.LLC - 36)) | (1 << (CommonRegexParser.MLC - 36)) | (1 << (CommonRegexParser.NLC - 36)) | (1 << (CommonRegexParser.OLC - 36)) | (1 << (CommonRegexParser.PLC - 36)) | (1 << (CommonRegexParser.QLC - 36)) | (1 << (CommonRegexParser.RLC - 36)) | (1 << (CommonRegexParser.SLC - 36)) | (1 << (CommonRegexParser.TLC - 36)) | (1 << (CommonRegexParser.ULC - 36)) | (1 << (CommonRegexParser.VLC - 36)) | (1 << (CommonRegexParser.WLC - 36)) | (1 << (CommonRegexParser.XLC - 36)) | (1 << (CommonRegexParser.YLC - 36)) | (1 << (CommonRegexParser.ZLC - 36)))) !== 0) || ((((_la - 68)) & ~0x1F) === 0 && ((1 << (_la - 68)) & ((1 << (CommonRegexParser.AUC - 68)) | (1 << (CommonRegexParser.BUC - 68)) | (1 << (CommonRegexParser.CUC - 68)) | (1 << (CommonRegexParser.DUC - 68)) | (1 << (CommonRegexParser.EUC - 68)) | (1 << (CommonRegexParser.FUC - 68)) | (1 << (CommonRegexParser.GUC - 68)) | (1 << (CommonRegexParser.HUC - 68)) | (1 << (CommonRegexParser.IUC - 68)) | (1 << (CommonRegexParser.JUC - 68)) | (1 << (CommonRegexParser.KUC - 68)) | (1 << (CommonRegexParser.LUC - 68)) | (1 << (CommonRegexParser.MUC - 68)) | (1 << (CommonRegexParser.NUC - 68)) | (1 << (CommonRegexParser.OUC - 68)) | (1 << (CommonRegexParser.PUC - 68)) | (1 << (CommonRegexParser.QUC - 68)) | (1 << (CommonRegexParser.RUC - 68)) | (1 << (CommonRegexParser.SUC - 68)) | (1 << (CommonRegexParser.TUC - 68)) | (1 << (CommonRegexParser.UUC - 68)) | (1 << (CommonRegexParser.VUC - 68)) | (1 << (CommonRegexParser.WUC - 68)) | (1 << (CommonRegexParser.XUC - 68)) | (1 << (CommonRegexParser.YUC - 68)) | (1 << (CommonRegexParser.ZUC - 68)) | (1 << (CommonRegexParser.D1 - 68)) | (1 << (CommonRegexParser.D2 - 68)) | (1 << (CommonRegexParser.D3 - 68)) | (1 << (CommonRegexParser.D4 - 68)) | (1 << (CommonRegexParser.D5 - 68)) | (1 << (CommonRegexParser.D6 - 68)))) !== 0) || ((((_la - 100)) & ~0x1F) === 0 && ((1 << (_la - 100)) & ((1 << (CommonRegexParser.D7 - 100)) | (1 << (CommonRegexParser.D8 - 100)) | (1 << (CommonRegexParser.D9 - 100)) | (1 << (CommonRegexParser.D0 - 100)))) !== 0)) {
				{
				this.state = 251;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case CommonRegexParser.ALC:
				case CommonRegexParser.BLC:
				case CommonRegexParser.CLC:
				case CommonRegexParser.DLC:
				case CommonRegexParser.ELC:
				case CommonRegexParser.FLC:
				case CommonRegexParser.GLC:
				case CommonRegexParser.HLC:
				case CommonRegexParser.ILC:
				case CommonRegexParser.JLC:
				case CommonRegexParser.KLC:
				case CommonRegexParser.LLC:
				case CommonRegexParser.MLC:
				case CommonRegexParser.NLC:
				case CommonRegexParser.OLC:
				case CommonRegexParser.PLC:
				case CommonRegexParser.QLC:
				case CommonRegexParser.RLC:
				case CommonRegexParser.SLC:
				case CommonRegexParser.TLC:
				case CommonRegexParser.ULC:
				case CommonRegexParser.VLC:
				case CommonRegexParser.WLC:
				case CommonRegexParser.XLC:
				case CommonRegexParser.YLC:
				case CommonRegexParser.ZLC:
				case CommonRegexParser.AUC:
				case CommonRegexParser.BUC:
				case CommonRegexParser.CUC:
				case CommonRegexParser.DUC:
				case CommonRegexParser.EUC:
				case CommonRegexParser.FUC:
				case CommonRegexParser.GUC:
				case CommonRegexParser.HUC:
				case CommonRegexParser.IUC:
				case CommonRegexParser.JUC:
				case CommonRegexParser.KUC:
				case CommonRegexParser.LUC:
				case CommonRegexParser.MUC:
				case CommonRegexParser.NUC:
				case CommonRegexParser.OUC:
				case CommonRegexParser.PUC:
				case CommonRegexParser.QUC:
				case CommonRegexParser.RUC:
				case CommonRegexParser.SUC:
				case CommonRegexParser.TUC:
				case CommonRegexParser.UUC:
				case CommonRegexParser.VUC:
				case CommonRegexParser.WUC:
				case CommonRegexParser.XUC:
				case CommonRegexParser.YUC:
				case CommonRegexParser.ZUC:
					{
					this.state = 248;
					this.letter();
					}
					break;
				case CommonRegexParser.Underscore:
					{
					this.state = 249;
					this.match(CommonRegexParser.Underscore);
					}
					break;
				case CommonRegexParser.D1:
				case CommonRegexParser.D2:
				case CommonRegexParser.D3:
				case CommonRegexParser.D4:
				case CommonRegexParser.D5:
				case CommonRegexParser.D6:
				case CommonRegexParser.D7:
				case CommonRegexParser.D8:
				case CommonRegexParser.D9:
				case CommonRegexParser.D0:
					{
					this.state = 250;
					this.digit();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 255;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public non_close_parens(): Non_close_parensContext {
		let _localctx: Non_close_parensContext = new Non_close_parensContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, CommonRegexParser.RULE_non_close_parens);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 257;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 256;
				this.non_close_paren();
				}
				}
				this.state = 259;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CommonRegexParser.BellChar) | (1 << CommonRegexParser.ControlChar) | (1 << CommonRegexParser.EscapeChar) | (1 << CommonRegexParser.FormFeed) | (1 << CommonRegexParser.NewLine) | (1 << CommonRegexParser.CarriageReturn) | (1 << CommonRegexParser.Tab) | (1 << CommonRegexParser.Backslash) | (1 << CommonRegexParser.HexChar) | (1 << CommonRegexParser.Dot) | (1 << CommonRegexParser.DecimalDigit) | (1 << CommonRegexParser.NotDecimalDigit) | (1 << CommonRegexParser.CharWithProperty) | (1 << CommonRegexParser.CharWithoutProperty) | (1 << CommonRegexParser.WhiteSpace) | (1 << CommonRegexParser.NotWhiteSpace) | (1 << CommonRegexParser.WordChar) | (1 << CommonRegexParser.NotWordChar) | (1 << CommonRegexParser.CharacterClassStart) | (1 << CommonRegexParser.CharacterClassEnd) | (1 << CommonRegexParser.Caret) | (1 << CommonRegexParser.Hyphen) | (1 << CommonRegexParser.QuestionMark) | (1 << CommonRegexParser.Plus) | (1 << CommonRegexParser.Star) | (1 << CommonRegexParser.OpenBrace) | (1 << CommonRegexParser.CloseBrace) | (1 << CommonRegexParser.Comma) | (1 << CommonRegexParser.EndOfSubject) | (1 << CommonRegexParser.Pipe) | (1 << CommonRegexParser.OpenParen))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (CommonRegexParser.LessThan - 33)) | (1 << (CommonRegexParser.GreaterThan - 33)) | (1 << (CommonRegexParser.SingleQuote - 33)) | (1 << (CommonRegexParser.Underscore - 33)) | (1 << (CommonRegexParser.Colon - 33)) | (1 << (CommonRegexParser.Hash - 33)) | (1 << (CommonRegexParser.Equals - 33)) | (1 << (CommonRegexParser.Exclamation - 33)) | (1 << (CommonRegexParser.Ampersand - 33)) | (1 << (CommonRegexParser.ALC - 33)) | (1 << (CommonRegexParser.BLC - 33)) | (1 << (CommonRegexParser.CLC - 33)) | (1 << (CommonRegexParser.DLC - 33)) | (1 << (CommonRegexParser.ELC - 33)) | (1 << (CommonRegexParser.FLC - 33)) | (1 << (CommonRegexParser.GLC - 33)) | (1 << (CommonRegexParser.HLC - 33)) | (1 << (CommonRegexParser.ILC - 33)) | (1 << (CommonRegexParser.JLC - 33)) | (1 << (CommonRegexParser.KLC - 33)) | (1 << (CommonRegexParser.LLC - 33)) | (1 << (CommonRegexParser.MLC - 33)) | (1 << (CommonRegexParser.NLC - 33)) | (1 << (CommonRegexParser.OLC - 33)) | (1 << (CommonRegexParser.PLC - 33)) | (1 << (CommonRegexParser.QLC - 33)) | (1 << (CommonRegexParser.RLC - 33)) | (1 << (CommonRegexParser.SLC - 33)) | (1 << (CommonRegexParser.TLC - 33)) | (1 << (CommonRegexParser.ULC - 33)) | (1 << (CommonRegexParser.VLC - 33)) | (1 << (CommonRegexParser.WLC - 33)))) !== 0) || ((((_la - 65)) & ~0x1F) === 0 && ((1 << (_la - 65)) & ((1 << (CommonRegexParser.XLC - 65)) | (1 << (CommonRegexParser.YLC - 65)) | (1 << (CommonRegexParser.ZLC - 65)) | (1 << (CommonRegexParser.AUC - 65)) | (1 << (CommonRegexParser.BUC - 65)) | (1 << (CommonRegexParser.CUC - 65)) | (1 << (CommonRegexParser.DUC - 65)) | (1 << (CommonRegexParser.EUC - 65)) | (1 << (CommonRegexParser.FUC - 65)) | (1 << (CommonRegexParser.GUC - 65)) | (1 << (CommonRegexParser.HUC - 65)) | (1 << (CommonRegexParser.IUC - 65)) | (1 << (CommonRegexParser.JUC - 65)) | (1 << (CommonRegexParser.KUC - 65)) | (1 << (CommonRegexParser.LUC - 65)) | (1 << (CommonRegexParser.MUC - 65)) | (1 << (CommonRegexParser.NUC - 65)) | (1 << (CommonRegexParser.OUC - 65)) | (1 << (CommonRegexParser.PUC - 65)) | (1 << (CommonRegexParser.QUC - 65)) | (1 << (CommonRegexParser.RUC - 65)) | (1 << (CommonRegexParser.SUC - 65)) | (1 << (CommonRegexParser.TUC - 65)) | (1 << (CommonRegexParser.UUC - 65)) | (1 << (CommonRegexParser.VUC - 65)) | (1 << (CommonRegexParser.WUC - 65)) | (1 << (CommonRegexParser.XUC - 65)) | (1 << (CommonRegexParser.YUC - 65)) | (1 << (CommonRegexParser.ZUC - 65)) | (1 << (CommonRegexParser.D1 - 65)) | (1 << (CommonRegexParser.D2 - 65)) | (1 << (CommonRegexParser.D3 - 65)))) !== 0) || ((((_la - 97)) & ~0x1F) === 0 && ((1 << (_la - 97)) & ((1 << (CommonRegexParser.D4 - 97)) | (1 << (CommonRegexParser.D5 - 97)) | (1 << (CommonRegexParser.D6 - 97)) | (1 << (CommonRegexParser.D7 - 97)) | (1 << (CommonRegexParser.D8 - 97)) | (1 << (CommonRegexParser.D9 - 97)) | (1 << (CommonRegexParser.D0 - 97)) | (1 << (CommonRegexParser.OtherChar - 97)))) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public non_close_paren(): Non_close_parenContext {
		let _localctx: Non_close_parenContext = new Non_close_parenContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, CommonRegexParser.RULE_non_close_paren);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 261;
			_la = this._input.LA(1);
			if (_la <= 0 || (_la === CommonRegexParser.CloseParen)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public letter(): LetterContext {
		let _localctx: LetterContext = new LetterContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, CommonRegexParser.RULE_letter);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 263;
			_la = this._input.LA(1);
			if (!(((((_la - 42)) & ~0x1F) === 0 && ((1 << (_la - 42)) & ((1 << (CommonRegexParser.ALC - 42)) | (1 << (CommonRegexParser.BLC - 42)) | (1 << (CommonRegexParser.CLC - 42)) | (1 << (CommonRegexParser.DLC - 42)) | (1 << (CommonRegexParser.ELC - 42)) | (1 << (CommonRegexParser.FLC - 42)) | (1 << (CommonRegexParser.GLC - 42)) | (1 << (CommonRegexParser.HLC - 42)) | (1 << (CommonRegexParser.ILC - 42)) | (1 << (CommonRegexParser.JLC - 42)) | (1 << (CommonRegexParser.KLC - 42)) | (1 << (CommonRegexParser.LLC - 42)) | (1 << (CommonRegexParser.MLC - 42)) | (1 << (CommonRegexParser.NLC - 42)) | (1 << (CommonRegexParser.OLC - 42)) | (1 << (CommonRegexParser.PLC - 42)) | (1 << (CommonRegexParser.QLC - 42)) | (1 << (CommonRegexParser.RLC - 42)) | (1 << (CommonRegexParser.SLC - 42)) | (1 << (CommonRegexParser.TLC - 42)) | (1 << (CommonRegexParser.ULC - 42)) | (1 << (CommonRegexParser.VLC - 42)) | (1 << (CommonRegexParser.WLC - 42)) | (1 << (CommonRegexParser.XLC - 42)) | (1 << (CommonRegexParser.YLC - 42)) | (1 << (CommonRegexParser.ZLC - 42)) | (1 << (CommonRegexParser.AUC - 42)) | (1 << (CommonRegexParser.BUC - 42)) | (1 << (CommonRegexParser.CUC - 42)) | (1 << (CommonRegexParser.DUC - 42)) | (1 << (CommonRegexParser.EUC - 42)) | (1 << (CommonRegexParser.FUC - 42)))) !== 0) || ((((_la - 74)) & ~0x1F) === 0 && ((1 << (_la - 74)) & ((1 << (CommonRegexParser.GUC - 74)) | (1 << (CommonRegexParser.HUC - 74)) | (1 << (CommonRegexParser.IUC - 74)) | (1 << (CommonRegexParser.JUC - 74)) | (1 << (CommonRegexParser.KUC - 74)) | (1 << (CommonRegexParser.LUC - 74)) | (1 << (CommonRegexParser.MUC - 74)) | (1 << (CommonRegexParser.NUC - 74)) | (1 << (CommonRegexParser.OUC - 74)) | (1 << (CommonRegexParser.PUC - 74)) | (1 << (CommonRegexParser.QUC - 74)) | (1 << (CommonRegexParser.RUC - 74)) | (1 << (CommonRegexParser.SUC - 74)) | (1 << (CommonRegexParser.TUC - 74)) | (1 << (CommonRegexParser.UUC - 74)) | (1 << (CommonRegexParser.VUC - 74)) | (1 << (CommonRegexParser.WUC - 74)) | (1 << (CommonRegexParser.XUC - 74)) | (1 << (CommonRegexParser.YUC - 74)) | (1 << (CommonRegexParser.ZUC - 74)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03j\u010C\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x03" +
		"\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x07\x03?\n\x03\f\x03\x0E" +
		"\x03B\v\x03\x03\x04\x07\x04E\n\x04\f\x04\x0E\x04H\v\x04\x03\x05\x03\x05" +
		"\x05\x05L\n\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x06" +
		"f\n\x06\x03\x07\x03\x07\x03\x07\x05\x07k\n\x07\x03\b\x03\b\x03\b\x06\b" +
		"p\n\b\r\b\x0E\bq\x03\b\x03\b\x03\b\x03\b\x06\bx\n\b\r\b\x0E\by\x03\b\x03" +
		"\b\x05\b~\n\b\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x05\t\x8C\n\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\v" +
		"\x03\v\x03\v\x06\v\x97\n\v\r\v\x0E\v\x98\x03\v\x03\v\x03\f\x03\f\x03\r" +
		"\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\xA8\n\r\x03\x0E" +
		"\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E\xB0\n\x0E\x03\x0F\x03" +
		"\x0F\x03\x10\x03\x10\x05\x10\xB6\n\x10\x03\x11\x03\x11\x03\x11\x03\x11" +
		"\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x05\x11\xC3\n" +
		"\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x05\x12\xDD\n\x12" +
		"\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14" +
		"\x03\x14\x03\x14\x05\x14\xEA\n\x14\x03\x15\x03\x15\x03\x16\x06\x16\xEF" +
		"\n\x16\r\x16\x0E\x16\xF0\x03\x17\x03\x17\x03\x18\x03\x18\x03\x19\x03\x19" +
		"\x05\x19\xF9\n\x19\x03\x19\x03\x19\x03\x19\x07\x19\xFE\n\x19\f\x19\x0E" +
		"\x19\u0101\v\x19\x03\x1A\x06\x1A\u0104\n\x1A\r\x1A\x0E\x1A\u0105\x03\x1B" +
		"\x03\x1B\x03\x1C\x03\x1C\x03\x1C\x02\x02\x02\x1D\x02\x02\x04\x02\x06\x02" +
		"\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A" +
		"\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x02" +
		"4\x026\x02\x02\t\x05\x024488>>\x04\x02\x04\x04\r\x14\x04\x02`bii\x04\x02" +
		"`fii\x03\x02`i\x03\x02\"\"\x03\x02,_\u0132\x028\x03\x02\x02\x02\x04;\x03" +
		"\x02\x02\x02\x06F\x03\x02\x02\x02\bI\x03\x02\x02\x02\ne\x03\x02\x02\x02" +
		"\fj\x03\x02\x02\x02\x0E}\x03\x02\x02\x02\x10\x8B\x03\x02\x02\x02\x12\x8D" +
		"\x03\x02\x02\x02\x14\x93\x03\x02\x02\x02\x16\x9C\x03\x02\x02\x02\x18\xA7" +
		"\x03\x02\x02\x02\x1A\xAF\x03\x02\x02\x02\x1C\xB1\x03\x02\x02\x02\x1E\xB5" +
		"\x03\x02\x02\x02 \xC2\x03\x02\x02\x02\"\xDC\x03\x02\x02\x02$\xDE\x03\x02" +
		"\x02\x02&\xE9\x03\x02\x02\x02(\xEB\x03\x02\x02\x02*\xEE\x03\x02\x02\x02" +
		",\xF2\x03\x02\x02\x02.\xF4\x03\x02\x02\x020\xF8\x03\x02\x02\x022\u0103" +
		"\x03\x02\x02\x024\u0107\x03\x02\x02\x026\u0109\x03\x02\x02\x0289\x05\x04" +
		"\x03\x029:\x07\x02\x02\x03:\x03\x03\x02\x02\x02;@\x05\x06\x04\x02<=\x07" +
		" \x02\x02=?\x05\x06\x04\x02><\x03\x02\x02\x02?B\x03\x02\x02\x02@>\x03" +
		"\x02\x02\x02@A\x03\x02\x02\x02A\x05\x03\x02\x02\x02B@\x03\x02\x02\x02" +
		"CE\x05\b\x05\x02DC\x03\x02\x02\x02EH\x03\x02\x02\x02FD\x03\x02\x02\x02" +
		"FG\x03\x02\x02\x02G\x07\x03\x02\x02\x02HF\x03\x02\x02\x02IK\x05\x18\r" +
		"\x02JL\x05\n\x06\x02KJ\x03\x02\x02\x02KL\x03\x02\x02\x02L\t\x03\x02\x02" +
		"\x02MN\x07\x19\x02\x02Nf\x05\f\x07\x02OP\x07\x1A\x02\x02Pf\x05\f\x07\x02" +
		"QR\x07\x1B\x02\x02Rf\x05\f\x07\x02ST\x07\x1C\x02\x02TU\x05$\x13\x02UV" +
		"\x07\x1D\x02\x02VW\x05\f\x07\x02Wf\x03\x02\x02\x02XY\x07\x1C\x02\x02Y" +
		"Z\x05$\x13\x02Z[\x07\x1E\x02\x02[\\\x07\x1D\x02\x02\\]\x05\f\x07\x02]" +
		"f\x03\x02\x02\x02^_\x07\x1C\x02\x02_`\x05$\x13\x02`a\x07\x1E\x02\x02a" +
		"b\x05$\x13\x02bc\x07\x1D\x02\x02cd\x05\f\x07\x02df\x03\x02\x02\x02eM\x03" +
		"\x02\x02\x02eO\x03\x02\x02\x02eQ\x03\x02\x02\x02eS\x03\x02\x02\x02eX\x03" +
		"\x02\x02\x02e^\x03\x02\x02\x02f\v\x03\x02\x02\x02gk\x07\x1A\x02\x02hk" +
		"\x07\x19\x02\x02ik\x03\x02\x02\x02jg\x03\x02\x02\x02jh\x03\x02\x02\x02" +
		"ji\x03\x02\x02\x02k\r\x03\x02\x02\x02lm\x07\x15\x02\x02mo\x07\x17\x02" +
		"\x02np\x05\x1A\x0E\x02on\x03\x02\x02\x02pq\x03\x02\x02\x02qo\x03\x02\x02" +
		"\x02qr\x03\x02\x02\x02rs\x03\x02\x02\x02st\x07\x16\x02\x02t~\x03\x02\x02" +
		"\x02uw\x07\x15\x02\x02vx\x05\x1A\x0E\x02wv\x03\x02\x02\x02xy\x03\x02\x02" +
		"\x02yw\x03\x02\x02\x02yz\x03\x02\x02\x02z{\x03\x02\x02\x02{|\x07\x16\x02" +
		"\x02|~\x03\x02\x02\x02}l\x03\x02\x02\x02}u\x03\x02\x02\x02~\x0F\x03\x02" +
		"\x02\x02\x7F\x80\x07!\x02\x02\x80\x81\x07\x19\x02\x02\x81\x82\x07#\x02" +
		"\x02\x82\x83\x05.\x18\x02\x83\x84\x07$\x02\x02\x84\x85\x05\x04\x03\x02" +
		"\x85\x86\x07\"\x02\x02\x86\x8C\x03\x02\x02\x02\x87\x88\x07!\x02\x02\x88" +
		"\x89\x05\x04\x03\x02\x89\x8A\x07\"\x02\x02\x8A\x8C\x03\x02\x02\x02\x8B" +
		"\x7F\x03\x02\x02\x02\x8B\x87\x03\x02\x02\x02\x8C\x11\x03\x02\x02\x02\x8D" +
		"\x8E\x07!\x02\x02\x8E\x8F\x07\x19\x02\x02\x8F\x90\x07\'\x02\x02\x90\x91" +
		"\x05\x04\x03\x02\x91\x92\x07\"\x02\x02\x92\x13\x03\x02\x02\x02\x93\x94" +
		"\x07!\x02\x02\x94\x96\x07\x19\x02\x02\x95\x97\x05\x16\f\x02\x96\x95\x03" +
		"\x02\x02\x02\x97\x98\x03\x02\x02\x02\x98\x96\x03\x02\x02\x02\x98\x99\x03" +
		"\x02\x02\x02\x99\x9A\x03\x02\x02\x02\x9A\x9B\x07\"\x02\x02\x9B\x15\x03" +
		"\x02\x02\x02\x9C\x9D\t\x02\x02\x02\x9D\x17\x03\x02\x02\x02\x9E\xA8\x05" +
		"\x1C\x0F\x02\x9F\xA8\x05\x1E\x10\x02\xA0\xA8\x05\x0E\b\x02\xA1\xA8\x05" +
		"\x10\t\x02\xA2\xA8\x05\x12\n\x02\xA3\xA8\x05\x14\v\x02\xA4\xA8\x07\f\x02" +
		"\x02\xA5\xA8\x07\x17\x02\x02\xA6\xA8\x07\x1F\x02\x02\xA7\x9E\x03\x02\x02" +
		"\x02\xA7\x9F\x03\x02\x02\x02\xA7\xA0\x03\x02\x02\x02\xA7\xA1\x03\x02\x02" +
		"\x02\xA7\xA2\x03\x02\x02\x02\xA7\xA3\x03\x02\x02\x02\xA7\xA4\x03\x02\x02" +
		"\x02\xA7\xA5\x03\x02\x02\x02\xA7\xA6\x03\x02\x02\x02\xA8\x19\x03\x02\x02" +
		"\x02\xA9\xAA\x05 \x11\x02\xAA\xAB\x07\x18\x02\x02\xAB\xAC\x05 \x11\x02" +
		"\xAC\xB0\x03\x02\x02\x02\xAD\xB0\x05\x1C\x0F\x02\xAE\xB0\x05 \x11\x02" +
		"\xAF\xA9\x03\x02\x02\x02\xAF\xAD\x03\x02\x02\x02\xAF\xAE\x03\x02\x02\x02" +
		"\xB0\x1B\x03\x02\x02\x02\xB1\xB2\t\x03\x02\x02\xB2\x1D\x03\x02\x02\x02" +
		"\xB3\xB6\x05\"\x12\x02\xB4\xB6\x07\x16\x02\x02\xB5\xB3\x03\x02\x02\x02" +
		"\xB5\xB4\x03\x02\x02\x02\xB6\x1F\x03\x02\x02\x02\xB7\xC3\x05\"\x12\x02" +
		"\xB8\xC3\x07\f\x02\x02\xB9\xC3\x07\x15\x02\x02\xBA\xC3\x07\x17\x02\x02" +
		"\xBB\xC3\x07\x19\x02\x02\xBC\xC3\x07\x1A\x02\x02\xBD\xC3\x07\x1B\x02\x02" +
		"\xBE\xC3\x07\x1F\x02\x02\xBF\xC3\x07 \x02\x02\xC0\xC3\x07!\x02\x02\xC1" +
		"\xC3\x07\"\x02\x02\xC2\xB7\x03\x02\x02\x02\xC2\xB8\x03\x02\x02\x02\xC2" +
		"\xB9\x03\x02\x02\x02\xC2\xBA\x03\x02\x02\x02\xC2\xBB\x03\x02\x02\x02\xC2" +
		"\xBC\x03\x02\x02\x02\xC2\xBD\x03\x02\x02\x02\xC2\xBE\x03\x02\x02\x02\xC2" +
		"\xBF\x03\x02\x02\x02\xC2\xC0\x03\x02\x02\x02\xC2\xC1\x03\x02\x02\x02\xC3" +
		"!\x03\x02\x02\x02\xC4\xDD\x05&\x14\x02\xC5\xDD\x056\x1C\x02\xC6\xDD\x05" +
		",\x17\x02\xC7\xDD\x07\x03\x02\x02\xC8\xDD\x07\x05\x02\x02\xC9\xDD\x07" +
		"\x06\x02\x02\xCA\xDD\x07\x07\x02\x02\xCB\xDD\x07\b\x02\x02\xCC\xDD\x07" +
		"\t\x02\x02\xCD\xDD\x07\v\x02\x02\xCE\xDD\x07\x1C\x02\x02\xCF\xDD\x07\x1D" +
		"\x02\x02\xD0\xDD\x07\x1E\x02\x02\xD1\xDD\x07\x18\x02\x02\xD2\xDD\x07#" +
		"\x02\x02\xD3\xDD\x07$\x02\x02\xD4\xDD\x07%\x02\x02\xD5\xDD\x07&\x02\x02" +
		"\xD6\xDD\x07\'\x02\x02\xD7\xDD\x07(\x02\x02\xD8\xDD\x07)\x02\x02\xD9\xDD" +
		"\x07*\x02\x02\xDA\xDD\x07+\x02\x02\xDB\xDD\x07j\x02\x02\xDC\xC4\x03\x02" +
		"\x02\x02\xDC\xC5\x03\x02\x02\x02\xDC\xC6\x03\x02\x02\x02\xDC\xC7\x03\x02" +
		"\x02\x02\xDC\xC8\x03\x02\x02\x02\xDC\xC9\x03\x02\x02\x02\xDC\xCA\x03\x02" +
		"\x02\x02\xDC\xCB\x03\x02\x02\x02\xDC\xCC\x03\x02\x02\x02\xDC\xCD\x03\x02" +
		"\x02\x02\xDC\xCE\x03\x02\x02\x02\xDC\xCF\x03\x02\x02\x02\xDC\xD0\x03\x02" +
		"\x02\x02\xDC\xD1\x03\x02\x02\x02\xDC\xD2\x03\x02\x02\x02\xDC\xD3\x03\x02" +
		"\x02\x02\xDC\xD4\x03\x02\x02\x02\xDC\xD5\x03\x02\x02\x02\xDC\xD6\x03\x02" +
		"\x02\x02\xDC\xD7\x03\x02\x02\x02\xDC\xD8\x03\x02\x02\x02\xDC\xD9\x03\x02" +
		"\x02\x02\xDC\xDA\x03\x02\x02\x02\xDC\xDB\x03\x02\x02\x02\xDD#\x03\x02" +
		"\x02\x02\xDE\xDF\x05*\x16\x02\xDF%\x03\x02\x02\x02\xE0\xE1\x07\n\x02\x02" +
		"\xE1\xE2\t\x04\x02\x02\xE2\xE3\x05(\x15\x02\xE3\xE4\x05(\x15\x02\xE4\xEA" +
		"\x03\x02\x02\x02\xE5\xE6\x07\n\x02\x02\xE6\xE7\x05(\x15\x02\xE7\xE8\x05" +
		"(\x15\x02\xE8\xEA\x03\x02\x02\x02\xE9\xE0\x03\x02\x02\x02\xE9\xE5\x03" +
		"\x02\x02\x02\xEA\'\x03\x02\x02\x02\xEB\xEC\t\x05\x02\x02\xEC)\x03\x02" +
		"\x02\x02\xED\xEF\x05,\x17\x02\xEE\xED\x03\x02\x02\x02\xEF\xF0\x03\x02" +
		"\x02\x02\xF0\xEE\x03\x02\x02\x02\xF0\xF1\x03\x02\x02\x02\xF1+\x03\x02" +
		"\x02\x02\xF2\xF3\t\x06\x02\x02\xF3-\x03\x02\x02\x02\xF4\xF5\x050\x19\x02" +
		"\xF5/\x03\x02\x02\x02\xF6\xF9\x056\x1C\x02\xF7\xF9\x07&\x02\x02\xF8\xF6" +
		"\x03\x02\x02\x02\xF8\xF7\x03\x02\x02\x02\xF9\xFF\x03\x02\x02\x02\xFA\xFE" +
		"\x056\x1C\x02\xFB\xFE\x07&\x02\x02\xFC\xFE\x05,\x17\x02\xFD\xFA\x03\x02" +
		"\x02\x02\xFD\xFB\x03\x02\x02\x02\xFD\xFC\x03\x02\x02\x02\xFE\u0101\x03" +
		"\x02\x02\x02\xFF\xFD\x03\x02\x02\x02\xFF\u0100\x03\x02\x02\x02\u01001" +
		"\x03\x02\x02\x02\u0101\xFF\x03\x02\x02\x02\u0102\u0104\x054\x1B\x02\u0103" +
		"\u0102\x03\x02\x02\x02\u0104\u0105\x03\x02\x02\x02\u0105\u0103\x03\x02" +
		"\x02\x02\u0105\u0106\x03\x02\x02\x02\u01063\x03\x02\x02\x02\u0107\u0108" +
		"\n\x07\x02\x02\u01085\x03\x02\x02\x02\u0109\u010A\t\b\x02\x02\u010A7\x03" +
		"\x02\x02\x02\x17@FKejqy}\x8B\x98\xA7\xAF\xB5\xC2\xDC\xE9\xF0\xF8\xFD\xFF" +
		"\u0105";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CommonRegexParser.__ATN) {
			CommonRegexParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CommonRegexParser._serializedATN));
		}

		return CommonRegexParser.__ATN;
	}

}

export class ParseContext extends ParserRuleContext {
	public alternation(): AlternationContext {
		return this.getRuleContext(0, AlternationContext);
	}
	public EOF(): TerminalNode { return this.getToken(CommonRegexParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_parse; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterParse) {
			listener.enterParse(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitParse) {
			listener.exitParse(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitParse) {
			return visitor.visitParse(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AlternationContext extends ParserRuleContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_alternation; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterAlternation) {
			listener.enterAlternation(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitAlternation) {
			listener.exitAlternation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitAlternation) {
			return visitor.visitAlternation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	public element(): ElementContext[];
	public element(i: number): ElementContext;
	public element(i?: number): ElementContext | ElementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ElementContext);
		} else {
			return this.getRuleContext(i, ElementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_expr; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterExpr) {
			listener.enterExpr(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitExpr) {
			listener.exitExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitExpr) {
			return visitor.visitExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ElementContext extends ParserRuleContext {
	public atom(): AtomContext {
		return this.getRuleContext(0, AtomContext);
	}
	public quantifier(): QuantifierContext | undefined {
		return this.tryGetRuleContext(0, QuantifierContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_element; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterElement) {
			listener.enterElement(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitElement) {
			listener.exitElement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitElement) {
			return visitor.visitElement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class QuantifierContext extends ParserRuleContext {
	public quantifier_type(): Quantifier_typeContext {
		return this.getRuleContext(0, Quantifier_typeContext);
	}
	public number(): NumberContext[];
	public number(i: number): NumberContext;
	public number(i?: number): NumberContext | NumberContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NumberContext);
		} else {
			return this.getRuleContext(i, NumberContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_quantifier; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterQuantifier) {
			listener.enterQuantifier(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitQuantifier) {
			listener.exitQuantifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitQuantifier) {
			return visitor.visitQuantifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Quantifier_typeContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_quantifier_type; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterQuantifier_type) {
			listener.enterQuantifier_type(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitQuantifier_type) {
			listener.exitQuantifier_type(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitQuantifier_type) {
			return visitor.visitQuantifier_type(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Character_classContext extends ParserRuleContext {
	public cc_atom(): Cc_atomContext[];
	public cc_atom(i: number): Cc_atomContext;
	public cc_atom(i?: number): Cc_atomContext | Cc_atomContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Cc_atomContext);
		} else {
			return this.getRuleContext(i, Cc_atomContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_character_class; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterCharacter_class) {
			listener.enterCharacter_class(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitCharacter_class) {
			listener.exitCharacter_class(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitCharacter_class) {
			return visitor.visitCharacter_class(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CaptureContext extends ParserRuleContext {
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
	}
	public alternation(): AlternationContext {
		return this.getRuleContext(0, AlternationContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_capture; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterCapture) {
			listener.enterCapture(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitCapture) {
			listener.exitCapture(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitCapture) {
			return visitor.visitCapture(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Non_captureContext extends ParserRuleContext {
	public alternation(): AlternationContext {
		return this.getRuleContext(0, AlternationContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_non_capture; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterNon_capture) {
			listener.enterNon_capture(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitNon_capture) {
			listener.exitNon_capture(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitNon_capture) {
			return visitor.visitNon_capture(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptionContext extends ParserRuleContext {
	public option_flag(): Option_flagContext[];
	public option_flag(i: number): Option_flagContext;
	public option_flag(i?: number): Option_flagContext | Option_flagContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Option_flagContext);
		} else {
			return this.getRuleContext(i, Option_flagContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_option; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterOption) {
			listener.enterOption(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitOption) {
			listener.exitOption(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitOption) {
			return visitor.visitOption(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Option_flagContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_option_flag; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterOption_flag) {
			listener.enterOption_flag(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitOption_flag) {
			listener.exitOption_flag(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitOption_flag) {
			return visitor.visitOption_flag(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AtomContext extends ParserRuleContext {
	public shared_atom(): Shared_atomContext | undefined {
		return this.tryGetRuleContext(0, Shared_atomContext);
	}
	public literal(): LiteralContext | undefined {
		return this.tryGetRuleContext(0, LiteralContext);
	}
	public character_class(): Character_classContext | undefined {
		return this.tryGetRuleContext(0, Character_classContext);
	}
	public capture(): CaptureContext | undefined {
		return this.tryGetRuleContext(0, CaptureContext);
	}
	public non_capture(): Non_captureContext | undefined {
		return this.tryGetRuleContext(0, Non_captureContext);
	}
	public option(): OptionContext | undefined {
		return this.tryGetRuleContext(0, OptionContext);
	}
	public Dot(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Dot, 0); }
	public Caret(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Caret, 0); }
	public EndOfSubject(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.EndOfSubject, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_atom; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterAtom) {
			listener.enterAtom(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitAtom) {
			listener.exitAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitAtom) {
			return visitor.visitAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Cc_atomContext extends ParserRuleContext {
	public cc_literal(): Cc_literalContext[];
	public cc_literal(i: number): Cc_literalContext;
	public cc_literal(i?: number): Cc_literalContext | Cc_literalContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Cc_literalContext);
		} else {
			return this.getRuleContext(i, Cc_literalContext);
		}
	}
	public Hyphen(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Hyphen, 0); }
	public shared_atom(): Shared_atomContext | undefined {
		return this.tryGetRuleContext(0, Shared_atomContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_cc_atom; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterCc_atom) {
			listener.enterCc_atom(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitCc_atom) {
			listener.exitCc_atom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitCc_atom) {
			return visitor.visitCc_atom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shared_atomContext extends ParserRuleContext {
	public ControlChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ControlChar, 0); }
	public DecimalDigit(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.DecimalDigit, 0); }
	public NotDecimalDigit(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.NotDecimalDigit, 0); }
	public CharWithProperty(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CharWithProperty, 0); }
	public CharWithoutProperty(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CharWithoutProperty, 0); }
	public WhiteSpace(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.WhiteSpace, 0); }
	public NotWhiteSpace(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.NotWhiteSpace, 0); }
	public WordChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.WordChar, 0); }
	public NotWordChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.NotWordChar, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_shared_atom; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterShared_atom) {
			listener.enterShared_atom(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitShared_atom) {
			listener.exitShared_atom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitShared_atom) {
			return visitor.visitShared_atom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	public shared_literal(): Shared_literalContext | undefined {
		return this.tryGetRuleContext(0, Shared_literalContext);
	}
	public CharacterClassEnd(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CharacterClassEnd, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_literal; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterLiteral) {
			listener.enterLiteral(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitLiteral) {
			listener.exitLiteral(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitLiteral) {
			return visitor.visitLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Cc_literalContext extends ParserRuleContext {
	public shared_literal(): Shared_literalContext | undefined {
		return this.tryGetRuleContext(0, Shared_literalContext);
	}
	public Dot(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Dot, 0); }
	public CharacterClassStart(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CharacterClassStart, 0); }
	public Caret(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Caret, 0); }
	public QuestionMark(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.QuestionMark, 0); }
	public Plus(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Plus, 0); }
	public Star(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Star, 0); }
	public EndOfSubject(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.EndOfSubject, 0); }
	public Pipe(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Pipe, 0); }
	public OpenParen(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.OpenParen, 0); }
	public CloseParen(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CloseParen, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_cc_literal; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterCc_literal) {
			listener.enterCc_literal(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitCc_literal) {
			listener.exitCc_literal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitCc_literal) {
			return visitor.visitCc_literal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shared_literalContext extends ParserRuleContext {
	public octal_char(): Octal_charContext | undefined {
		return this.tryGetRuleContext(0, Octal_charContext);
	}
	public letter(): LetterContext | undefined {
		return this.tryGetRuleContext(0, LetterContext);
	}
	public digit(): DigitContext | undefined {
		return this.tryGetRuleContext(0, DigitContext);
	}
	public BellChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.BellChar, 0); }
	public EscapeChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.EscapeChar, 0); }
	public FormFeed(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.FormFeed, 0); }
	public NewLine(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.NewLine, 0); }
	public CarriageReturn(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CarriageReturn, 0); }
	public Tab(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Tab, 0); }
	public HexChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.HexChar, 0); }
	public OpenBrace(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.OpenBrace, 0); }
	public CloseBrace(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CloseBrace, 0); }
	public Comma(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Comma, 0); }
	public Hyphen(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Hyphen, 0); }
	public LessThan(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.LessThan, 0); }
	public GreaterThan(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.GreaterThan, 0); }
	public SingleQuote(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.SingleQuote, 0); }
	public Underscore(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Underscore, 0); }
	public Colon(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Colon, 0); }
	public Hash(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Hash, 0); }
	public Equals(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Equals, 0); }
	public Exclamation(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Exclamation, 0); }
	public Ampersand(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Ampersand, 0); }
	public OtherChar(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.OtherChar, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_shared_literal; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterShared_literal) {
			listener.enterShared_literal(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitShared_literal) {
			listener.exitShared_literal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitShared_literal) {
			return visitor.visitShared_literal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NumberContext extends ParserRuleContext {
	public digits(): DigitsContext {
		return this.getRuleContext(0, DigitsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_number; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterNumber) {
			listener.enterNumber(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitNumber) {
			listener.exitNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitNumber) {
			return visitor.visitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Octal_charContext extends ParserRuleContext {
	public Backslash(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.Backslash, 0); }
	public octal_digit(): Octal_digitContext[];
	public octal_digit(i: number): Octal_digitContext;
	public octal_digit(i?: number): Octal_digitContext | Octal_digitContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Octal_digitContext);
		} else {
			return this.getRuleContext(i, Octal_digitContext);
		}
	}
	public D0(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D0, 0); }
	public D1(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D1, 0); }
	public D2(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D2, 0); }
	public D3(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D3, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_octal_char; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterOctal_char) {
			listener.enterOctal_char(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitOctal_char) {
			listener.exitOctal_char(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitOctal_char) {
			return visitor.visitOctal_char(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Octal_digitContext extends ParserRuleContext {
	public D0(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D0, 0); }
	public D1(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D1, 0); }
	public D2(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D2, 0); }
	public D3(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D3, 0); }
	public D4(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D4, 0); }
	public D5(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D5, 0); }
	public D6(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D6, 0); }
	public D7(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D7, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_octal_digit; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterOctal_digit) {
			listener.enterOctal_digit(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitOctal_digit) {
			listener.exitOctal_digit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitOctal_digit) {
			return visitor.visitOctal_digit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DigitsContext extends ParserRuleContext {
	public digit(): DigitContext[];
	public digit(i: number): DigitContext;
	public digit(i?: number): DigitContext | DigitContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DigitContext);
		} else {
			return this.getRuleContext(i, DigitContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_digits; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterDigits) {
			listener.enterDigits(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitDigits) {
			listener.exitDigits(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitDigits) {
			return visitor.visitDigits(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DigitContext extends ParserRuleContext {
	public D0(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D0, 0); }
	public D1(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D1, 0); }
	public D2(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D2, 0); }
	public D3(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D3, 0); }
	public D4(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D4, 0); }
	public D5(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D5, 0); }
	public D6(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D6, 0); }
	public D7(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D7, 0); }
	public D8(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D8, 0); }
	public D9(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.D9, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_digit; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterDigit) {
			listener.enterDigit(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitDigit) {
			listener.exitDigit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitDigit) {
			return visitor.visitDigit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameContext extends ParserRuleContext {
	public alpha_nums(): Alpha_numsContext {
		return this.getRuleContext(0, Alpha_numsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_name; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterName) {
			listener.enterName(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitName) {
			listener.exitName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitName) {
			return visitor.visitName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Alpha_numsContext extends ParserRuleContext {
	public letter(): LetterContext[];
	public letter(i: number): LetterContext;
	public letter(i?: number): LetterContext | LetterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(LetterContext);
		} else {
			return this.getRuleContext(i, LetterContext);
		}
	}
	public Underscore(): TerminalNode[];
	public Underscore(i: number): TerminalNode;
	public Underscore(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CommonRegexParser.Underscore);
		} else {
			return this.getToken(CommonRegexParser.Underscore, i);
		}
	}
	public digit(): DigitContext[];
	public digit(i: number): DigitContext;
	public digit(i?: number): DigitContext | DigitContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DigitContext);
		} else {
			return this.getRuleContext(i, DigitContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_alpha_nums; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterAlpha_nums) {
			listener.enterAlpha_nums(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitAlpha_nums) {
			listener.exitAlpha_nums(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitAlpha_nums) {
			return visitor.visitAlpha_nums(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Non_close_parensContext extends ParserRuleContext {
	public non_close_paren(): Non_close_parenContext[];
	public non_close_paren(i: number): Non_close_parenContext;
	public non_close_paren(i?: number): Non_close_parenContext | Non_close_parenContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Non_close_parenContext);
		} else {
			return this.getRuleContext(i, Non_close_parenContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_non_close_parens; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterNon_close_parens) {
			listener.enterNon_close_parens(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitNon_close_parens) {
			listener.exitNon_close_parens(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitNon_close_parens) {
			return visitor.visitNon_close_parens(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Non_close_parenContext extends ParserRuleContext {
	public CloseParen(): TerminalNode { return this.getToken(CommonRegexParser.CloseParen, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_non_close_paren; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterNon_close_paren) {
			listener.enterNon_close_paren(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitNon_close_paren) {
			listener.exitNon_close_paren(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitNon_close_paren) {
			return visitor.visitNon_close_paren(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LetterContext extends ParserRuleContext {
	public ALC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ALC, 0); }
	public BLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.BLC, 0); }
	public CLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CLC, 0); }
	public DLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.DLC, 0); }
	public ELC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ELC, 0); }
	public FLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.FLC, 0); }
	public GLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.GLC, 0); }
	public HLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.HLC, 0); }
	public ILC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ILC, 0); }
	public JLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.JLC, 0); }
	public KLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.KLC, 0); }
	public LLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.LLC, 0); }
	public MLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.MLC, 0); }
	public NLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.NLC, 0); }
	public OLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.OLC, 0); }
	public PLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.PLC, 0); }
	public QLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.QLC, 0); }
	public RLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.RLC, 0); }
	public SLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.SLC, 0); }
	public TLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.TLC, 0); }
	public ULC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ULC, 0); }
	public VLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.VLC, 0); }
	public WLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.WLC, 0); }
	public XLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.XLC, 0); }
	public YLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.YLC, 0); }
	public ZLC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ZLC, 0); }
	public AUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.AUC, 0); }
	public BUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.BUC, 0); }
	public CUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.CUC, 0); }
	public DUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.DUC, 0); }
	public EUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.EUC, 0); }
	public FUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.FUC, 0); }
	public GUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.GUC, 0); }
	public HUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.HUC, 0); }
	public IUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.IUC, 0); }
	public JUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.JUC, 0); }
	public KUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.KUC, 0); }
	public LUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.LUC, 0); }
	public MUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.MUC, 0); }
	public NUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.NUC, 0); }
	public OUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.OUC, 0); }
	public PUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.PUC, 0); }
	public QUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.QUC, 0); }
	public RUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.RUC, 0); }
	public SUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.SUC, 0); }
	public TUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.TUC, 0); }
	public UUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.UUC, 0); }
	public VUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.VUC, 0); }
	public WUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.WUC, 0); }
	public XUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.XUC, 0); }
	public YUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.YUC, 0); }
	public ZUC(): TerminalNode | undefined { return this.tryGetToken(CommonRegexParser.ZUC, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CommonRegexParser.RULE_letter; }
	// @Override
	public enterRule(listener: CommonRegexListener): void {
		if (listener.enterLetter) {
			listener.enterLetter(this);
		}
	}
	// @Override
	public exitRule(listener: CommonRegexListener): void {
		if (listener.exitLetter) {
			listener.exitLetter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CommonRegexVisitor<Result>): Result {
		if (visitor.visitLetter) {
			return visitor.visitLetter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


