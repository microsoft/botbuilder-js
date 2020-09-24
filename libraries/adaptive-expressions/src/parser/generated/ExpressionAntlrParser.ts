// Generated from src/parser/ExpressionAntlrParser.g4 by ANTLR 4.7.3-SNAPSHOT

/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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

import { ExpressionAntlrParserListener } from "./ExpressionAntlrParserListener";
import { ExpressionAntlrParserVisitor } from "./ExpressionAntlrParserVisitor";


export class ExpressionAntlrParser extends Parser {
	public static readonly STRING_INTERPOLATION_START = 1;
	public static readonly PLUS = 2;
	public static readonly SUBSTRACT = 3;
	public static readonly NON = 4;
	public static readonly XOR = 5;
	public static readonly ASTERISK = 6;
	public static readonly SLASH = 7;
	public static readonly PERCENT = 8;
	public static readonly DOUBLE_EQUAL = 9;
	public static readonly NOT_EQUAL = 10;
	public static readonly SINGLE_AND = 11;
	public static readonly DOUBLE_AND = 12;
	public static readonly DOUBLE_VERTICAL_CYLINDER = 13;
	public static readonly LESS_THAN = 14;
	public static readonly MORE_THAN = 15;
	public static readonly LESS_OR_EQUAl = 16;
	public static readonly MORE_OR_EQUAL = 17;
	public static readonly OPEN_BRACKET = 18;
	public static readonly CLOSE_BRACKET = 19;
	public static readonly DOT = 20;
	public static readonly OPEN_SQUARE_BRACKET = 21;
	public static readonly CLOSE_SQUARE_BRACKET = 22;
	public static readonly OPEN_CURLY_BRACKET = 23;
	public static readonly CLOSE_CURLY_BRACKET = 24;
	public static readonly COMMA = 25;
	public static readonly COLON = 26;
	public static readonly ARROW = 27;
	public static readonly NULL_COALESCE = 28;
	public static readonly QUESTION_MARK = 29;
	public static readonly NUMBER = 30;
	public static readonly WHITESPACE = 31;
	public static readonly IDENTIFIER = 32;
	public static readonly NEWLINE = 33;
	public static readonly STRING = 34;
	public static readonly INVALID_TOKEN_DEFAULT_MODE = 35;
	public static readonly TEMPLATE = 36;
	public static readonly ESCAPE_CHARACTER = 37;
	public static readonly TEXT_CONTENT = 38;
	public static readonly RULE_file = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_primaryExpression = 2;
	public static readonly RULE_stringInterpolation = 3;
	public static readonly RULE_textContent = 4;
	public static readonly RULE_argsList = 5;
	public static readonly RULE_lambda = 6;
	public static readonly RULE_keyValuePairList = 7;
	public static readonly RULE_keyValuePair = 8;
	public static readonly RULE_key = 9;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"file", "expression", "primaryExpression", "stringInterpolation", "textContent", 
		"argsList", "lambda", "keyValuePairList", "keyValuePair", "key",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'+'", "'-'", "'!'", "'^'", "'*'", "'/'", "'%'", 
		"'=='", undefined, "'&'", "'&&'", "'||'", "'<'", "'>'", "'<='", "'>='", 
		"'('", "')'", "'.'", "'['", "']'", "'{'", "'}'", "','", "':'", "'=>'", 
		"'??'", "'?'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "STRING_INTERPOLATION_START", "PLUS", "SUBSTRACT", "NON", "XOR", 
		"ASTERISK", "SLASH", "PERCENT", "DOUBLE_EQUAL", "NOT_EQUAL", "SINGLE_AND", 
		"DOUBLE_AND", "DOUBLE_VERTICAL_CYLINDER", "LESS_THAN", "MORE_THAN", "LESS_OR_EQUAl", 
		"MORE_OR_EQUAL", "OPEN_BRACKET", "CLOSE_BRACKET", "DOT", "OPEN_SQUARE_BRACKET", 
		"CLOSE_SQUARE_BRACKET", "OPEN_CURLY_BRACKET", "CLOSE_CURLY_BRACKET", "COMMA", 
		"COLON", "ARROW", "NULL_COALESCE", "QUESTION_MARK", "NUMBER", "WHITESPACE", 
		"IDENTIFIER", "NEWLINE", "STRING", "INVALID_TOKEN_DEFAULT_MODE", "TEMPLATE", 
		"ESCAPE_CHARACTER", "TEXT_CONTENT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(ExpressionAntlrParser._LITERAL_NAMES, ExpressionAntlrParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return ExpressionAntlrParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "ExpressionAntlrParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return ExpressionAntlrParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return ExpressionAntlrParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(ExpressionAntlrParser._ATN, this);
	}
	// @RuleVersion(0)
	public file(): FileContext {
		let _localctx: FileContext = new FileContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, ExpressionAntlrParser.RULE_file);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 20;
			this.expression(0);
			this.state = 21;
			this.match(ExpressionAntlrParser.EOF);
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

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 2;
		this.enterRecursionRule(_localctx, 2, ExpressionAntlrParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 27;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ExpressionAntlrParser.PLUS:
			case ExpressionAntlrParser.SUBSTRACT:
			case ExpressionAntlrParser.NON:
				{
				_localctx = new UnaryOpExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 24;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExpressionAntlrParser.PLUS) | (1 << ExpressionAntlrParser.SUBSTRACT) | (1 << ExpressionAntlrParser.NON))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 25;
				this.expression(12);
				}
				break;
			case ExpressionAntlrParser.STRING_INTERPOLATION_START:
			case ExpressionAntlrParser.OPEN_BRACKET:
			case ExpressionAntlrParser.OPEN_SQUARE_BRACKET:
			case ExpressionAntlrParser.OPEN_CURLY_BRACKET:
			case ExpressionAntlrParser.NUMBER:
			case ExpressionAntlrParser.IDENTIFIER:
			case ExpressionAntlrParser.STRING:
				{
				_localctx = new PrimaryExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 26;
				this.primaryExpression(0);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 64;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 62;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
					case 1:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 29;
						if (!(this.precpred(this._ctx, 11))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 11)");
						}
						this.state = 30;
						this.match(ExpressionAntlrParser.XOR);
						this.state = 31;
						this.expression(11);
						}
						break;

					case 2:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 32;
						if (!(this.precpred(this._ctx, 10))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 10)");
						}
						this.state = 33;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExpressionAntlrParser.ASTERISK) | (1 << ExpressionAntlrParser.SLASH) | (1 << ExpressionAntlrParser.PERCENT))) !== 0))) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 34;
						this.expression(11);
						}
						break;

					case 3:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 35;
						if (!(this.precpred(this._ctx, 9))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 9)");
						}
						this.state = 36;
						_la = this._input.LA(1);
						if (!(_la === ExpressionAntlrParser.PLUS || _la === ExpressionAntlrParser.SUBSTRACT)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 37;
						this.expression(10);
						}
						break;

					case 4:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 38;
						if (!(this.precpred(this._ctx, 8))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 8)");
						}
						this.state = 39;
						_la = this._input.LA(1);
						if (!(_la === ExpressionAntlrParser.DOUBLE_EQUAL || _la === ExpressionAntlrParser.NOT_EQUAL)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 40;
						this.expression(9);
						}
						break;

					case 5:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 41;
						if (!(this.precpred(this._ctx, 7))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 7)");
						}
						{
						this.state = 42;
						this.match(ExpressionAntlrParser.SINGLE_AND);
						}
						this.state = 43;
						this.expression(8);
						}
						break;

					case 6:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 44;
						if (!(this.precpred(this._ctx, 6))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 6)");
						}
						this.state = 45;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExpressionAntlrParser.LESS_THAN) | (1 << ExpressionAntlrParser.MORE_THAN) | (1 << ExpressionAntlrParser.LESS_OR_EQUAl) | (1 << ExpressionAntlrParser.MORE_OR_EQUAL))) !== 0))) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 46;
						this.expression(7);
						}
						break;

					case 7:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 47;
						if (!(this.precpred(this._ctx, 5))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						}
						this.state = 48;
						this.match(ExpressionAntlrParser.DOUBLE_AND);
						this.state = 49;
						this.expression(6);
						}
						break;

					case 8:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 50;
						if (!(this.precpred(this._ctx, 4))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 4)");
						}
						this.state = 51;
						this.match(ExpressionAntlrParser.DOUBLE_VERTICAL_CYLINDER);
						this.state = 52;
						this.expression(5);
						}
						break;

					case 9:
						{
						_localctx = new BinaryOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 53;
						if (!(this.precpred(this._ctx, 3))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 3)");
						}
						this.state = 54;
						this.match(ExpressionAntlrParser.NULL_COALESCE);
						this.state = 55;
						this.expression(4);
						}
						break;

					case 10:
						{
						_localctx = new TripleOpExpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_expression);
						this.state = 56;
						if (!(this.precpred(this._ctx, 2))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 2)");
						}
						this.state = 57;
						this.match(ExpressionAntlrParser.QUESTION_MARK);
						this.state = 58;
						this.expression(0);
						this.state = 59;
						this.match(ExpressionAntlrParser.COLON);
						this.state = 60;
						this.expression(3);
						}
						break;
					}
					}
				}
				this.state = 66;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx);
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
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public primaryExpression(): PrimaryExpressionContext;
	public primaryExpression(_p: number): PrimaryExpressionContext;
	// @RuleVersion(0)
	public primaryExpression(_p?: number): PrimaryExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: PrimaryExpressionContext = new PrimaryExpressionContext(this._ctx, _parentState);
		let _prevctx: PrimaryExpressionContext = _localctx;
		let _startState: number = 4;
		this.enterRecursionRule(_localctx, 4, ExpressionAntlrParser.RULE_primaryExpression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 86;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ExpressionAntlrParser.OPEN_BRACKET:
				{
				_localctx = new ParenthesisExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 68;
				this.match(ExpressionAntlrParser.OPEN_BRACKET);
				this.state = 69;
				this.expression(0);
				this.state = 70;
				this.match(ExpressionAntlrParser.CLOSE_BRACKET);
				}
				break;
			case ExpressionAntlrParser.OPEN_SQUARE_BRACKET:
				{
				_localctx = new ArrayCreationExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 72;
				this.match(ExpressionAntlrParser.OPEN_SQUARE_BRACKET);
				this.state = 74;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExpressionAntlrParser.STRING_INTERPOLATION_START) | (1 << ExpressionAntlrParser.PLUS) | (1 << ExpressionAntlrParser.SUBSTRACT) | (1 << ExpressionAntlrParser.NON) | (1 << ExpressionAntlrParser.OPEN_BRACKET) | (1 << ExpressionAntlrParser.OPEN_SQUARE_BRACKET) | (1 << ExpressionAntlrParser.OPEN_CURLY_BRACKET) | (1 << ExpressionAntlrParser.NUMBER))) !== 0) || _la === ExpressionAntlrParser.IDENTIFIER || _la === ExpressionAntlrParser.STRING) {
					{
					this.state = 73;
					this.argsList();
					}
				}

				this.state = 76;
				this.match(ExpressionAntlrParser.CLOSE_SQUARE_BRACKET);
				}
				break;
			case ExpressionAntlrParser.OPEN_CURLY_BRACKET:
				{
				_localctx = new JsonCreationExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 77;
				this.match(ExpressionAntlrParser.OPEN_CURLY_BRACKET);
				this.state = 79;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === ExpressionAntlrParser.IDENTIFIER || _la === ExpressionAntlrParser.STRING) {
					{
					this.state = 78;
					this.keyValuePairList();
					}
				}

				this.state = 81;
				this.match(ExpressionAntlrParser.CLOSE_CURLY_BRACKET);
				}
				break;
			case ExpressionAntlrParser.NUMBER:
				{
				_localctx = new NumericAtomContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 82;
				this.match(ExpressionAntlrParser.NUMBER);
				}
				break;
			case ExpressionAntlrParser.STRING:
				{
				_localctx = new StringAtomContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 83;
				this.match(ExpressionAntlrParser.STRING);
				}
				break;
			case ExpressionAntlrParser.IDENTIFIER:
				{
				_localctx = new IdAtomContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 84;
				this.match(ExpressionAntlrParser.IDENTIFIER);
				}
				break;
			case ExpressionAntlrParser.STRING_INTERPOLATION_START:
				{
				_localctx = new StringInterpolationAtomContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 85;
				this.stringInterpolation();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 107;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 105;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
					case 1:
						{
						_localctx = new MemberAccessExpContext(new PrimaryExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_primaryExpression);
						this.state = 88;
						if (!(this.precpred(this._ctx, 3))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 3)");
						}
						this.state = 89;
						this.match(ExpressionAntlrParser.DOT);
						this.state = 90;
						this.match(ExpressionAntlrParser.IDENTIFIER);
						}
						break;

					case 2:
						{
						_localctx = new FuncInvokeExpContext(new PrimaryExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_primaryExpression);
						this.state = 91;
						if (!(this.precpred(this._ctx, 2))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 2)");
						}
						this.state = 93;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === ExpressionAntlrParser.NON) {
							{
							this.state = 92;
							this.match(ExpressionAntlrParser.NON);
							}
						}

						this.state = 95;
						this.match(ExpressionAntlrParser.OPEN_BRACKET);
						this.state = 97;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExpressionAntlrParser.STRING_INTERPOLATION_START) | (1 << ExpressionAntlrParser.PLUS) | (1 << ExpressionAntlrParser.SUBSTRACT) | (1 << ExpressionAntlrParser.NON) | (1 << ExpressionAntlrParser.OPEN_BRACKET) | (1 << ExpressionAntlrParser.OPEN_SQUARE_BRACKET) | (1 << ExpressionAntlrParser.OPEN_CURLY_BRACKET) | (1 << ExpressionAntlrParser.NUMBER))) !== 0) || _la === ExpressionAntlrParser.IDENTIFIER || _la === ExpressionAntlrParser.STRING) {
							{
							this.state = 96;
							this.argsList();
							}
						}

						this.state = 99;
						this.match(ExpressionAntlrParser.CLOSE_BRACKET);
						}
						break;

					case 3:
						{
						_localctx = new IndexAccessExpContext(new PrimaryExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExpressionAntlrParser.RULE_primaryExpression);
						this.state = 100;
						if (!(this.precpred(this._ctx, 1))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 1)");
						}
						this.state = 101;
						this.match(ExpressionAntlrParser.OPEN_SQUARE_BRACKET);
						this.state = 102;
						this.expression(0);
						this.state = 103;
						this.match(ExpressionAntlrParser.CLOSE_SQUARE_BRACKET);
						}
						break;
					}
					}
				}
				this.state = 109;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
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
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public stringInterpolation(): StringInterpolationContext {
		let _localctx: StringInterpolationContext = new StringInterpolationContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, ExpressionAntlrParser.RULE_stringInterpolation);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 110;
			this.match(ExpressionAntlrParser.STRING_INTERPOLATION_START);
			this.state = 116;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (ExpressionAntlrParser.TEMPLATE - 36)) | (1 << (ExpressionAntlrParser.ESCAPE_CHARACTER - 36)) | (1 << (ExpressionAntlrParser.TEXT_CONTENT - 36)))) !== 0)) {
				{
				this.state = 114;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case ExpressionAntlrParser.ESCAPE_CHARACTER:
					{
					this.state = 111;
					this.match(ExpressionAntlrParser.ESCAPE_CHARACTER);
					}
					break;
				case ExpressionAntlrParser.TEMPLATE:
					{
					this.state = 112;
					this.match(ExpressionAntlrParser.TEMPLATE);
					}
					break;
				case ExpressionAntlrParser.TEXT_CONTENT:
					{
					this.state = 113;
					this.textContent();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 118;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 119;
			this.match(ExpressionAntlrParser.STRING_INTERPOLATION_START);
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
	public textContent(): TextContentContext {
		let _localctx: TextContentContext = new TextContentContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, ExpressionAntlrParser.RULE_textContent);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 122;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 121;
					this.match(ExpressionAntlrParser.TEXT_CONTENT);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 124;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 12, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
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
	public argsList(): ArgsListContext {
		let _localctx: ArgsListContext = new ArgsListContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, ExpressionAntlrParser.RULE_argsList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 128;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
			case 1:
				{
				this.state = 126;
				this.lambda();
				}
				break;

			case 2:
				{
				this.state = 127;
				this.expression(0);
				}
				break;
			}
			this.state = 137;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ExpressionAntlrParser.COMMA) {
				{
				{
				this.state = 130;
				this.match(ExpressionAntlrParser.COMMA);
				this.state = 133;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 14, this._ctx) ) {
				case 1:
					{
					this.state = 131;
					this.lambda();
					}
					break;

				case 2:
					{
					this.state = 132;
					this.expression(0);
					}
					break;
				}
				}
				}
				this.state = 139;
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
	public lambda(): LambdaContext {
		let _localctx: LambdaContext = new LambdaContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, ExpressionAntlrParser.RULE_lambda);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 140;
			this.match(ExpressionAntlrParser.IDENTIFIER);
			this.state = 141;
			this.match(ExpressionAntlrParser.ARROW);
			this.state = 142;
			this.expression(0);
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
	public keyValuePairList(): KeyValuePairListContext {
		let _localctx: KeyValuePairListContext = new KeyValuePairListContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, ExpressionAntlrParser.RULE_keyValuePairList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 144;
			this.keyValuePair();
			this.state = 149;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ExpressionAntlrParser.COMMA) {
				{
				{
				this.state = 145;
				this.match(ExpressionAntlrParser.COMMA);
				this.state = 146;
				this.keyValuePair();
				}
				}
				this.state = 151;
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
	public keyValuePair(): KeyValuePairContext {
		let _localctx: KeyValuePairContext = new KeyValuePairContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, ExpressionAntlrParser.RULE_keyValuePair);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 152;
			this.key();
			this.state = 153;
			this.match(ExpressionAntlrParser.COLON);
			this.state = 154;
			this.expression(0);
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
	public key(): KeyContext {
		let _localctx: KeyContext = new KeyContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, ExpressionAntlrParser.RULE_key);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 156;
			_la = this._input.LA(1);
			if (!(_la === ExpressionAntlrParser.IDENTIFIER || _la === ExpressionAntlrParser.STRING)) {
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

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);

		case 2:
			return this.primaryExpression_sempred(_localctx as PrimaryExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 11);

		case 1:
			return this.precpred(this._ctx, 10);

		case 2:
			return this.precpred(this._ctx, 9);

		case 3:
			return this.precpred(this._ctx, 8);

		case 4:
			return this.precpred(this._ctx, 7);

		case 5:
			return this.precpred(this._ctx, 6);

		case 6:
			return this.precpred(this._ctx, 5);

		case 7:
			return this.precpred(this._ctx, 4);

		case 8:
			return this.precpred(this._ctx, 3);

		case 9:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private primaryExpression_sempred(_localctx: PrimaryExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 10:
			return this.precpred(this._ctx, 3);

		case 11:
			return this.precpred(this._ctx, 2);

		case 12:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03(\xA1\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x03\x02\x03\x02\x03\x02" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03\x1E\n\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x07\x03A\n\x03\f\x03\x0E\x03D\v\x03\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04M\n\x04\x03\x04" +
		"\x03\x04\x03\x04\x05\x04R\n\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x05\x04Y\n\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04`\n\x04" +
		"\x03\x04\x03\x04\x05\x04d\n\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x07\x04l\n\x04\f\x04\x0E\x04o\v\x04\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x07\x05u\n\x05\f\x05\x0E\x05x\v\x05\x03\x05\x03\x05\x03\x06\x06\x06" +
		"}\n\x06\r\x06\x0E\x06~\x03\x07\x03\x07\x05\x07\x83\n\x07\x03\x07\x03\x07" +
		"\x03\x07\x05\x07\x88\n\x07\x07\x07\x8A\n\x07\f\x07\x0E\x07\x8D\v\x07\x03" +
		"\b\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x07\t\x96\n\t\f\t\x0E\t\x99\v\t" +
		"\x03\n\x03\n\x03\n\x03\n\x03\v\x03\v\x03\v\x02\x02\x04\x04\x06\f\x02\x02" +
		"\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x02" +
		"\b\x03\x02\x04\x06\x03\x02\b\n\x03\x02\x04\x05\x03\x02\v\f\x03\x02\x10" +
		"\x13\x04\x02\"\"$$\x02\xB6\x02\x16\x03\x02\x02\x02\x04\x1D\x03\x02\x02" +
		"\x02\x06X\x03\x02\x02\x02\bp\x03\x02\x02\x02\n|\x03\x02\x02\x02\f\x82" +
		"\x03\x02\x02\x02\x0E\x8E\x03\x02\x02\x02\x10\x92\x03\x02\x02\x02\x12\x9A" +
		"\x03\x02\x02\x02\x14\x9E\x03\x02\x02\x02\x16\x17\x05\x04\x03\x02\x17\x18" +
		"\x07\x02\x02\x03\x18\x03\x03\x02\x02\x02\x19\x1A\b\x03\x01\x02\x1A\x1B" +
		"\t\x02\x02\x02\x1B\x1E\x05\x04\x03\x0E\x1C\x1E\x05\x06\x04\x02\x1D\x19" +
		"\x03\x02\x02\x02\x1D\x1C\x03\x02\x02\x02\x1EB\x03\x02\x02\x02\x1F \f\r" +
		"\x02\x02 !\x07\x07\x02\x02!A\x05\x04\x03\r\"#\f\f\x02\x02#$\t\x03\x02" +
		"\x02$A\x05\x04\x03\r%&\f\v\x02\x02&\'\t\x04\x02\x02\'A\x05\x04\x03\f(" +
		")\f\n\x02\x02)*\t\x05\x02\x02*A\x05\x04\x03\v+,\f\t\x02\x02,-\x07\r\x02" +
		"\x02-A\x05\x04\x03\n./\f\b\x02\x02/0\t\x06\x02\x020A\x05\x04\x03\t12\f" +
		"\x07\x02\x0223\x07\x0E\x02\x023A\x05\x04\x03\b45\f\x06\x02\x0256\x07\x0F" +
		"\x02\x026A\x05\x04\x03\x0778\f\x05\x02\x0289\x07\x1E\x02\x029A\x05\x04" +
		"\x03\x06:;\f\x04\x02\x02;<\x07\x1F\x02\x02<=\x05\x04\x03\x02=>\x07\x1C" +
		"\x02\x02>?\x05\x04\x03\x05?A\x03\x02\x02\x02@\x1F\x03\x02\x02\x02@\"\x03" +
		"\x02\x02\x02@%\x03\x02\x02\x02@(\x03\x02\x02\x02@+\x03\x02\x02\x02@.\x03" +
		"\x02\x02\x02@1\x03\x02\x02\x02@4\x03\x02\x02\x02@7\x03\x02\x02\x02@:\x03" +
		"\x02\x02\x02AD\x03\x02\x02\x02B@\x03\x02\x02\x02BC\x03\x02\x02\x02C\x05" +
		"\x03\x02\x02\x02DB\x03\x02\x02\x02EF\b\x04\x01\x02FG\x07\x14\x02\x02G" +
		"H\x05\x04\x03\x02HI\x07\x15\x02\x02IY\x03\x02\x02\x02JL\x07\x17\x02\x02" +
		"KM\x05\f\x07\x02LK\x03\x02\x02\x02LM\x03\x02\x02\x02MN\x03\x02\x02\x02" +
		"NY\x07\x18\x02\x02OQ\x07\x19\x02\x02PR\x05\x10\t\x02QP\x03\x02\x02\x02" +
		"QR\x03\x02\x02\x02RS\x03\x02\x02\x02SY\x07\x1A\x02\x02TY\x07 \x02\x02" +
		"UY\x07$\x02\x02VY\x07\"\x02\x02WY\x05\b\x05\x02XE\x03\x02\x02\x02XJ\x03" +
		"\x02\x02\x02XO\x03\x02\x02\x02XT\x03\x02\x02\x02XU\x03\x02\x02\x02XV\x03" +
		"\x02\x02\x02XW\x03\x02\x02\x02Ym\x03\x02\x02\x02Z[\f\x05\x02\x02[\\\x07" +
		"\x16\x02\x02\\l\x07\"\x02\x02]_\f\x04\x02\x02^`\x07\x06\x02\x02_^\x03" +
		"\x02\x02\x02_`\x03\x02\x02\x02`a\x03\x02\x02\x02ac\x07\x14\x02\x02bd\x05" +
		"\f\x07\x02cb\x03\x02\x02\x02cd\x03\x02\x02\x02de\x03\x02\x02\x02el\x07" +
		"\x15\x02\x02fg\f\x03\x02\x02gh\x07\x17\x02\x02hi\x05\x04\x03\x02ij\x07" +
		"\x18\x02\x02jl\x03\x02\x02\x02kZ\x03\x02\x02\x02k]\x03\x02\x02\x02kf\x03" +
		"\x02\x02\x02lo\x03\x02\x02\x02mk\x03\x02\x02\x02mn\x03\x02\x02\x02n\x07" +
		"\x03\x02\x02\x02om\x03\x02\x02\x02pv\x07\x03\x02\x02qu\x07\'\x02\x02r" +
		"u\x07&\x02\x02su\x05\n\x06\x02tq\x03\x02\x02\x02tr\x03\x02\x02\x02ts\x03" +
		"\x02\x02\x02ux\x03\x02\x02\x02vt\x03\x02\x02\x02vw\x03\x02\x02\x02wy\x03" +
		"\x02\x02\x02xv\x03\x02\x02\x02yz\x07\x03\x02\x02z\t\x03\x02\x02\x02{}" +
		"\x07(\x02\x02|{\x03\x02\x02\x02}~\x03\x02\x02\x02~|\x03\x02\x02\x02~\x7F" +
		"\x03\x02\x02\x02\x7F\v\x03\x02\x02\x02\x80\x83\x05\x0E\b\x02\x81\x83\x05" +
		"\x04\x03\x02\x82\x80\x03\x02\x02\x02\x82\x81\x03\x02\x02\x02\x83\x8B\x03" +
		"\x02\x02\x02\x84\x87\x07\x1B\x02\x02\x85\x88\x05\x0E\b\x02\x86\x88\x05" +
		"\x04\x03\x02\x87\x85\x03\x02\x02\x02\x87\x86\x03\x02\x02\x02\x88\x8A\x03" +
		"\x02\x02\x02\x89\x84\x03\x02\x02\x02\x8A\x8D\x03\x02\x02\x02\x8B\x89\x03" +
		"\x02\x02\x02\x8B\x8C\x03\x02\x02\x02\x8C\r\x03\x02\x02\x02\x8D\x8B\x03" +
		"\x02\x02\x02\x8E\x8F\x07\"\x02\x02\x8F\x90\x07\x1D\x02\x02\x90\x91\x05" +
		"\x04\x03\x02\x91\x0F\x03\x02\x02\x02\x92\x97\x05\x12\n\x02\x93\x94\x07" +
		"\x1B\x02\x02\x94\x96\x05\x12\n\x02\x95\x93\x03\x02\x02\x02\x96\x99\x03" +
		"\x02\x02\x02\x97\x95\x03\x02\x02\x02\x97\x98\x03\x02\x02\x02\x98\x11\x03" +
		"\x02\x02\x02\x99\x97\x03\x02\x02\x02\x9A\x9B\x05\x14\v\x02\x9B\x9C\x07" +
		"\x1C\x02\x02\x9C\x9D\x05\x04\x03\x02\x9D\x13\x03\x02\x02\x02\x9E\x9F\t" +
		"\x07\x02\x02\x9F\x15\x03\x02\x02\x02\x13\x1D@BLQX_ckmtv~\x82\x87\x8B\x97";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ExpressionAntlrParser.__ATN) {
			ExpressionAntlrParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(ExpressionAntlrParser._serializedATN));
		}

		return ExpressionAntlrParser.__ATN;
	}

}

export class FileContext extends ParserRuleContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public EOF(): TerminalNode { return this.getToken(ExpressionAntlrParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_file; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterFile) {
			listener.enterFile(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitFile) {
			listener.exitFile(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitFile) {
			return visitor.visitFile(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class UnaryOpExpContext extends ExpressionContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public NON(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.NON, 0); }
	public SUBSTRACT(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.SUBSTRACT, 0); }
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.PLUS, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterUnaryOpExp) {
			listener.enterUnaryOpExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitUnaryOpExp) {
			listener.exitUnaryOpExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitUnaryOpExp) {
			return visitor.visitUnaryOpExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BinaryOpExpContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public XOR(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.XOR, 0); }
	public ASTERISK(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.ASTERISK, 0); }
	public SLASH(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.SLASH, 0); }
	public PERCENT(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.PERCENT, 0); }
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.PLUS, 0); }
	public SUBSTRACT(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.SUBSTRACT, 0); }
	public DOUBLE_EQUAL(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.DOUBLE_EQUAL, 0); }
	public NOT_EQUAL(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.NOT_EQUAL, 0); }
	public SINGLE_AND(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.SINGLE_AND, 0); }
	public LESS_THAN(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.LESS_THAN, 0); }
	public LESS_OR_EQUAl(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.LESS_OR_EQUAl, 0); }
	public MORE_THAN(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.MORE_THAN, 0); }
	public MORE_OR_EQUAL(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.MORE_OR_EQUAL, 0); }
	public DOUBLE_AND(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.DOUBLE_AND, 0); }
	public DOUBLE_VERTICAL_CYLINDER(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.DOUBLE_VERTICAL_CYLINDER, 0); }
	public NULL_COALESCE(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.NULL_COALESCE, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterBinaryOpExp) {
			listener.enterBinaryOpExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitBinaryOpExp) {
			listener.exitBinaryOpExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitBinaryOpExp) {
			return visitor.visitBinaryOpExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TripleOpExpContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public QUESTION_MARK(): TerminalNode { return this.getToken(ExpressionAntlrParser.QUESTION_MARK, 0); }
	public COLON(): TerminalNode { return this.getToken(ExpressionAntlrParser.COLON, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterTripleOpExp) {
			listener.enterTripleOpExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitTripleOpExp) {
			listener.exitTripleOpExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitTripleOpExp) {
			return visitor.visitTripleOpExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PrimaryExpContext extends ExpressionContext {
	public primaryExpression(): PrimaryExpressionContext {
		return this.getRuleContext(0, PrimaryExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterPrimaryExp) {
			listener.enterPrimaryExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitPrimaryExp) {
			listener.exitPrimaryExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitPrimaryExp) {
			return visitor.visitPrimaryExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PrimaryExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_primaryExpression; }
	public copyFrom(ctx: PrimaryExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class ParenthesisExpContext extends PrimaryExpressionContext {
	public OPEN_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.OPEN_BRACKET, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public CLOSE_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.CLOSE_BRACKET, 0); }
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterParenthesisExp) {
			listener.enterParenthesisExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitParenthesisExp) {
			listener.exitParenthesisExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitParenthesisExp) {
			return visitor.visitParenthesisExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ArrayCreationExpContext extends PrimaryExpressionContext {
	public OPEN_SQUARE_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.OPEN_SQUARE_BRACKET, 0); }
	public CLOSE_SQUARE_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.CLOSE_SQUARE_BRACKET, 0); }
	public argsList(): ArgsListContext | undefined {
		return this.tryGetRuleContext(0, ArgsListContext);
	}
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterArrayCreationExp) {
			listener.enterArrayCreationExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitArrayCreationExp) {
			listener.exitArrayCreationExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitArrayCreationExp) {
			return visitor.visitArrayCreationExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class JsonCreationExpContext extends PrimaryExpressionContext {
	public OPEN_CURLY_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.OPEN_CURLY_BRACKET, 0); }
	public CLOSE_CURLY_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.CLOSE_CURLY_BRACKET, 0); }
	public keyValuePairList(): KeyValuePairListContext | undefined {
		return this.tryGetRuleContext(0, KeyValuePairListContext);
	}
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterJsonCreationExp) {
			listener.enterJsonCreationExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitJsonCreationExp) {
			listener.exitJsonCreationExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitJsonCreationExp) {
			return visitor.visitJsonCreationExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NumericAtomContext extends PrimaryExpressionContext {
	public NUMBER(): TerminalNode { return this.getToken(ExpressionAntlrParser.NUMBER, 0); }
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterNumericAtom) {
			listener.enterNumericAtom(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitNumericAtom) {
			listener.exitNumericAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitNumericAtom) {
			return visitor.visitNumericAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringAtomContext extends PrimaryExpressionContext {
	public STRING(): TerminalNode { return this.getToken(ExpressionAntlrParser.STRING, 0); }
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterStringAtom) {
			listener.enterStringAtom(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitStringAtom) {
			listener.exitStringAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitStringAtom) {
			return visitor.visitStringAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IdAtomContext extends PrimaryExpressionContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(ExpressionAntlrParser.IDENTIFIER, 0); }
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterIdAtom) {
			listener.enterIdAtom(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitIdAtom) {
			listener.exitIdAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitIdAtom) {
			return visitor.visitIdAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringInterpolationAtomContext extends PrimaryExpressionContext {
	public stringInterpolation(): StringInterpolationContext {
		return this.getRuleContext(0, StringInterpolationContext);
	}
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterStringInterpolationAtom) {
			listener.enterStringInterpolationAtom(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitStringInterpolationAtom) {
			listener.exitStringInterpolationAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitStringInterpolationAtom) {
			return visitor.visitStringInterpolationAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MemberAccessExpContext extends PrimaryExpressionContext {
	public primaryExpression(): PrimaryExpressionContext {
		return this.getRuleContext(0, PrimaryExpressionContext);
	}
	public DOT(): TerminalNode { return this.getToken(ExpressionAntlrParser.DOT, 0); }
	public IDENTIFIER(): TerminalNode { return this.getToken(ExpressionAntlrParser.IDENTIFIER, 0); }
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterMemberAccessExp) {
			listener.enterMemberAccessExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitMemberAccessExp) {
			listener.exitMemberAccessExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitMemberAccessExp) {
			return visitor.visitMemberAccessExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FuncInvokeExpContext extends PrimaryExpressionContext {
	public primaryExpression(): PrimaryExpressionContext {
		return this.getRuleContext(0, PrimaryExpressionContext);
	}
	public OPEN_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.OPEN_BRACKET, 0); }
	public CLOSE_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.CLOSE_BRACKET, 0); }
	public NON(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.NON, 0); }
	public argsList(): ArgsListContext | undefined {
		return this.tryGetRuleContext(0, ArgsListContext);
	}
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterFuncInvokeExp) {
			listener.enterFuncInvokeExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitFuncInvokeExp) {
			listener.exitFuncInvokeExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitFuncInvokeExp) {
			return visitor.visitFuncInvokeExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IndexAccessExpContext extends PrimaryExpressionContext {
	public primaryExpression(): PrimaryExpressionContext {
		return this.getRuleContext(0, PrimaryExpressionContext);
	}
	public OPEN_SQUARE_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.OPEN_SQUARE_BRACKET, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public CLOSE_SQUARE_BRACKET(): TerminalNode { return this.getToken(ExpressionAntlrParser.CLOSE_SQUARE_BRACKET, 0); }
	constructor(ctx: PrimaryExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterIndexAccessExp) {
			listener.enterIndexAccessExp(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitIndexAccessExp) {
			listener.exitIndexAccessExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitIndexAccessExp) {
			return visitor.visitIndexAccessExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringInterpolationContext extends ParserRuleContext {
	public STRING_INTERPOLATION_START(): TerminalNode[];
	public STRING_INTERPOLATION_START(i: number): TerminalNode;
	public STRING_INTERPOLATION_START(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ExpressionAntlrParser.STRING_INTERPOLATION_START);
		} else {
			return this.getToken(ExpressionAntlrParser.STRING_INTERPOLATION_START, i);
		}
	}
	public ESCAPE_CHARACTER(): TerminalNode[];
	public ESCAPE_CHARACTER(i: number): TerminalNode;
	public ESCAPE_CHARACTER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ExpressionAntlrParser.ESCAPE_CHARACTER);
		} else {
			return this.getToken(ExpressionAntlrParser.ESCAPE_CHARACTER, i);
		}
	}
	public TEMPLATE(): TerminalNode[];
	public TEMPLATE(i: number): TerminalNode;
	public TEMPLATE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ExpressionAntlrParser.TEMPLATE);
		} else {
			return this.getToken(ExpressionAntlrParser.TEMPLATE, i);
		}
	}
	public textContent(): TextContentContext[];
	public textContent(i: number): TextContentContext;
	public textContent(i?: number): TextContentContext | TextContentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TextContentContext);
		} else {
			return this.getRuleContext(i, TextContentContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_stringInterpolation; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterStringInterpolation) {
			listener.enterStringInterpolation(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitStringInterpolation) {
			listener.exitStringInterpolation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitStringInterpolation) {
			return visitor.visitStringInterpolation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TextContentContext extends ParserRuleContext {
	public TEXT_CONTENT(): TerminalNode[];
	public TEXT_CONTENT(i: number): TerminalNode;
	public TEXT_CONTENT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ExpressionAntlrParser.TEXT_CONTENT);
		} else {
			return this.getToken(ExpressionAntlrParser.TEXT_CONTENT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_textContent; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterTextContent) {
			listener.enterTextContent(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitTextContent) {
			listener.exitTextContent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitTextContent) {
			return visitor.visitTextContent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArgsListContext extends ParserRuleContext {
	public lambda(): LambdaContext[];
	public lambda(i: number): LambdaContext;
	public lambda(i?: number): LambdaContext | LambdaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(LambdaContext);
		} else {
			return this.getRuleContext(i, LambdaContext);
		}
	}
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ExpressionAntlrParser.COMMA);
		} else {
			return this.getToken(ExpressionAntlrParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_argsList; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterArgsList) {
			listener.enterArgsList(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitArgsList) {
			listener.exitArgsList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitArgsList) {
			return visitor.visitArgsList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(ExpressionAntlrParser.IDENTIFIER, 0); }
	public ARROW(): TerminalNode { return this.getToken(ExpressionAntlrParser.ARROW, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_lambda; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterLambda) {
			listener.enterLambda(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitLambda) {
			listener.exitLambda(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitLambda) {
			return visitor.visitLambda(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeyValuePairListContext extends ParserRuleContext {
	public keyValuePair(): KeyValuePairContext[];
	public keyValuePair(i: number): KeyValuePairContext;
	public keyValuePair(i?: number): KeyValuePairContext | KeyValuePairContext[] {
		if (i === undefined) {
			return this.getRuleContexts(KeyValuePairContext);
		} else {
			return this.getRuleContext(i, KeyValuePairContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ExpressionAntlrParser.COMMA);
		} else {
			return this.getToken(ExpressionAntlrParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_keyValuePairList; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterKeyValuePairList) {
			listener.enterKeyValuePairList(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitKeyValuePairList) {
			listener.exitKeyValuePairList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitKeyValuePairList) {
			return visitor.visitKeyValuePairList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeyValuePairContext extends ParserRuleContext {
	public key(): KeyContext {
		return this.getRuleContext(0, KeyContext);
	}
	public COLON(): TerminalNode { return this.getToken(ExpressionAntlrParser.COLON, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_keyValuePair; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterKeyValuePair) {
			listener.enterKeyValuePair(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitKeyValuePair) {
			listener.exitKeyValuePair(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitKeyValuePair) {
			return visitor.visitKeyValuePair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeyContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.IDENTIFIER, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(ExpressionAntlrParser.STRING, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ExpressionAntlrParser.RULE_key; }
	// @Override
	public enterRule(listener: ExpressionAntlrParserListener): void {
		if (listener.enterKey) {
			listener.enterKey(this);
		}
	}
	// @Override
	public exitRule(listener: ExpressionAntlrParserListener): void {
		if (listener.exitKey) {
			listener.exitKey(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ExpressionAntlrParserVisitor<Result>): Result {
		if (visitor.visitKey) {
			return visitor.visitKey(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


