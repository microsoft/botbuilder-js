// Generated from LGFileParser.g4 by ANTLR 4.6-SNAPSHOT


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

import { LGFileParserListener } from "./LGFileParserListener";
import { LGFileParserVisitor } from "./LGFileParserVisitor";


export class LGFileParser extends Parser {
	public static readonly COMMENTS = 1;
	public static readonly WS = 2;
	public static readonly NEWLINE = 3;
	public static readonly HASH = 4;
	public static readonly DASH = 5;
	public static readonly WS_IN_NAME = 6;
	public static readonly IDENTIFIER = 7;
	public static readonly DOT = 8;
	public static readonly OPEN_PARENTHESIS = 9;
	public static readonly CLOSE_PARENTHESIS = 10;
	public static readonly COMMA = 11;
	public static readonly INVALID_SEPERATE_CHAR = 12;
	public static readonly WS_IN_BODY_IGNORED = 13;
	public static readonly IFELSE = 14;
	public static readonly MULTI_LINE_TEXT = 15;
	public static readonly ESCAPE_CHARACTER = 16;
	public static readonly INVALID_ESCAPE = 17;
	public static readonly EXPRESSION = 18;
	public static readonly TEMPLATE_REF = 19;
	public static readonly TEXT_SEPARATOR = 20;
	public static readonly TEXT = 21;
	public static readonly RULE_file = 0;
	public static readonly RULE_paragraph = 1;
	public static readonly RULE_newline = 2;
	public static readonly RULE_templateDefinition = 3;
	public static readonly RULE_templateNameLine = 4;
	public static readonly RULE_templateName = 5;
	public static readonly RULE_parameters = 6;
	public static readonly RULE_templateBody = 7;
	public static readonly RULE_normalTemplateBody = 8;
	public static readonly RULE_normalTemplateString = 9;
	public static readonly RULE_conditionalTemplateBody = 10;
	public static readonly RULE_ifConditionRule = 11;
	public static readonly RULE_ifCondition = 12;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"file", "paragraph", "newline", "templateDefinition", "templateNameLine", 
		"templateName", "parameters", "templateBody", "normalTemplateBody", "normalTemplateString", 
		"conditionalTemplateBody", "ifConditionRule", "ifCondition",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, "'#'", undefined, undefined, 
		undefined, "'.'", "'('", "')'", "','",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "WS_IN_NAME", 
		"IDENTIFIER", "DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", "COMMA", 
		"INVALID_SEPERATE_CHAR", "WS_IN_BODY_IGNORED", "IFELSE", "MULTI_LINE_TEXT", 
		"ESCAPE_CHARACTER", "INVALID_ESCAPE", "EXPRESSION", "TEMPLATE_REF", "TEXT_SEPARATOR", 
		"TEXT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileParser._LITERAL_NAMES, LGFileParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "LGFileParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return LGFileParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return LGFileParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(LGFileParser._ATN, this);
	}
	// @RuleVersion(0)
	public file(): FileContext {
		let _localctx: FileContext = new FileContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, LGFileParser.RULE_file);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 27;
			this._errHandler.sync(this);
			_alt = 1 + 1;
			do {
				switch (_alt) {
				case 1 + 1:
					{
					{
					this.state = 26;
					this.paragraph();
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 29;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 0, this._ctx);
			} while (_alt !== 1 && _alt !== ATN.INVALID_ALT_NUMBER);
			this.state = 31;
			this.match(LGFileParser.EOF);
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
	public paragraph(): ParagraphContext {
		let _localctx: ParagraphContext = new ParagraphContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, LGFileParser.RULE_paragraph);
		try {
			this.state = 35;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case LGFileParser.EOF:
			case LGFileParser.NEWLINE:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 33;
				this.newline();
				}
				break;
			case LGFileParser.HASH:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 34;
				this.templateDefinition();
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
	public newline(): NewlineContext {
		let _localctx: NewlineContext = new NewlineContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, LGFileParser.RULE_newline);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 37;
			_la = this._input.LA(1);
			if (!(_la === LGFileParser.EOF || _la === LGFileParser.NEWLINE)) {
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
	public templateDefinition(): TemplateDefinitionContext {
		let _localctx: TemplateDefinitionContext = new TemplateDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, LGFileParser.RULE_templateDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 39;
			this.templateNameLine();
			this.state = 40;
			this.newline();
			this.state = 42;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGFileParser.DASH) {
				{
				this.state = 41;
				this.templateBody();
				}
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
	public templateNameLine(): TemplateNameLineContext {
		let _localctx: TemplateNameLineContext = new TemplateNameLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, LGFileParser.RULE_templateNameLine);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 44;
			this.match(LGFileParser.HASH);
			this.state = 45;
			this.templateName();
			this.state = 47;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGFileParser.IDENTIFIER || _la === LGFileParser.OPEN_PARENTHESIS) {
				{
				this.state = 46;
				this.parameters();
				}
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
	public templateName(): TemplateNameContext {
		let _localctx: TemplateNameContext = new TemplateNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, LGFileParser.RULE_templateName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 49;
			this.match(LGFileParser.IDENTIFIER);
			this.state = 54;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === LGFileParser.DOT) {
				{
				{
				this.state = 50;
				this.match(LGFileParser.DOT);
				this.state = 51;
				this.match(LGFileParser.IDENTIFIER);
				}
				}
				this.state = 56;
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
	public parameters(): ParametersContext {
		let _localctx: ParametersContext = new ParametersContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, LGFileParser.RULE_parameters);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 58;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGFileParser.OPEN_PARENTHESIS) {
				{
				this.state = 57;
				this.match(LGFileParser.OPEN_PARENTHESIS);
				}
			}

			this.state = 60;
			this.match(LGFileParser.IDENTIFIER);
			this.state = 65;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === LGFileParser.COMMA || _la === LGFileParser.INVALID_SEPERATE_CHAR) {
				{
				{
				this.state = 61;
				_la = this._input.LA(1);
				if (!(_la === LGFileParser.COMMA || _la === LGFileParser.INVALID_SEPERATE_CHAR)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 62;
				this.match(LGFileParser.IDENTIFIER);
				}
				}
				this.state = 67;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 69;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGFileParser.CLOSE_PARENTHESIS) {
				{
				this.state = 68;
				this.match(LGFileParser.CLOSE_PARENTHESIS);
				}
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
	public templateBody(): TemplateBodyContext {
		let _localctx: TemplateBodyContext = new TemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, LGFileParser.RULE_templateBody);
		try {
			this.state = 73;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				_localctx = new NormalBodyContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 71;
				this.normalTemplateBody();
				}
				break;

			case 2:
				_localctx = new ConditionalBodyContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 72;
				this.conditionalTemplateBody();
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
	public normalTemplateBody(): NormalTemplateBodyContext {
		let _localctx: NormalTemplateBodyContext = new NormalTemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, LGFileParser.RULE_normalTemplateBody);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 78;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 75;
					this.normalTemplateString();
					this.state = 76;
					this.newline();
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 80;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
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
	public normalTemplateString(): NormalTemplateStringContext {
		let _localctx: NormalTemplateStringContext = new NormalTemplateStringContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, LGFileParser.RULE_normalTemplateString);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 82;
			this.match(LGFileParser.DASH);
			this.state = 86;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.MULTI_LINE_TEXT) | (1 << LGFileParser.ESCAPE_CHARACTER) | (1 << LGFileParser.INVALID_ESCAPE) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEMPLATE_REF) | (1 << LGFileParser.TEXT_SEPARATOR) | (1 << LGFileParser.TEXT))) !== 0)) {
				{
				{
				this.state = 83;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.MULTI_LINE_TEXT) | (1 << LGFileParser.ESCAPE_CHARACTER) | (1 << LGFileParser.INVALID_ESCAPE) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEMPLATE_REF) | (1 << LGFileParser.TEXT_SEPARATOR) | (1 << LGFileParser.TEXT))) !== 0))) {
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
				this.state = 88;
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
	public conditionalTemplateBody(): ConditionalTemplateBodyContext {
		let _localctx: ConditionalTemplateBodyContext = new ConditionalTemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, LGFileParser.RULE_conditionalTemplateBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 90;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 89;
				this.ifConditionRule();
				}
				}
				this.state = 92;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === LGFileParser.DASH);
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
	public ifConditionRule(): IfConditionRuleContext {
		let _localctx: IfConditionRuleContext = new IfConditionRuleContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, LGFileParser.RULE_ifConditionRule);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 94;
			this.ifCondition();
			this.state = 95;
			this.newline();
			this.state = 97;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
			case 1:
				{
				this.state = 96;
				this.normalTemplateBody();
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
	public ifCondition(): IfConditionContext {
		let _localctx: IfConditionContext = new IfConditionContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, LGFileParser.RULE_ifCondition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 99;
			this.match(LGFileParser.DASH);
			this.state = 100;
			this.match(LGFileParser.IFELSE);
			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0)) {
				{
				{
				this.state = 101;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0))) {
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
				this.state = 106;
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

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\x17n\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x03\x02\x06\x02\x1E\n\x02\r\x02\x0E\x02\x1F\x03\x02\x03\x02" +
		"\x03\x03\x03\x03\x05\x03&\n\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05" +
		"\x05\x05-\n\x05\x03\x06\x03\x06\x03\x06\x05\x062\n\x06\x03\x07\x03\x07" +
		"\x03\x07\x07\x077\n\x07\f\x07\x0E\x07:\v\x07\x03\b\x05\b=\n\b\x03\b\x03" +
		"\b\x03\b\x07\bB\n\b\f\b\x0E\bE\v\b\x03\b\x05\bH\n\b\x03\t\x03\t\x05\t" +
		"L\n\t\x03\n\x03\n\x03\n\x06\nQ\n\n\r\n\x0E\nR\x03\v\x03\v\x07\vW\n\v\f" +
		"\v\x0E\vZ\v\v\x03\f\x06\f]\n\f\r\f\x0E\f^\x03\r\x03\r\x03\r\x05\rd\n\r" +
		"\x03\x0E\x03\x0E\x03\x0E\x07\x0Ei\n\x0E\f\x0E\x0E\x0El\v\x0E\x03\x0E\x03" +
		"\x1F\x02\x02\x0F\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10" +
		"\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x02\x06\x03\x03\x05\x05\x03" +
		"\x02\r\x0E\x04\x02\x04\x04\x11\x17\x05\x02\x04\x04\x14\x14\x17\x17n\x02" +
		"\x1D\x03\x02\x02\x02\x04%\x03\x02\x02\x02\x06\'\x03\x02\x02\x02\b)\x03" +
		"\x02\x02\x02\n.\x03\x02\x02\x02\f3\x03\x02\x02\x02\x0E<\x03\x02\x02\x02" +
		"\x10K\x03\x02\x02\x02\x12P\x03\x02\x02\x02\x14T\x03\x02\x02\x02\x16\\" +
		"\x03\x02\x02\x02\x18`\x03\x02\x02\x02\x1Ae\x03\x02\x02\x02\x1C\x1E\x05" +
		"\x04\x03\x02\x1D\x1C\x03\x02\x02\x02\x1E\x1F\x03\x02\x02\x02\x1F \x03" +
		"\x02\x02\x02\x1F\x1D\x03\x02\x02\x02 !\x03\x02\x02\x02!\"\x07\x02\x02" +
		"\x03\"\x03\x03\x02\x02\x02#&\x05\x06\x04\x02$&\x05\b\x05\x02%#\x03\x02" +
		"\x02\x02%$\x03\x02\x02\x02&\x05\x03\x02\x02\x02\'(\t\x02\x02\x02(\x07" +
		"\x03\x02\x02\x02)*\x05\n\x06\x02*,\x05\x06\x04\x02+-\x05\x10\t\x02,+\x03" +
		"\x02\x02\x02,-\x03\x02\x02\x02-\t\x03\x02\x02\x02./\x07\x06\x02\x02/1" +
		"\x05\f\x07\x0202\x05\x0E\b\x0210\x03\x02\x02\x0212\x03\x02\x02\x022\v" +
		"\x03\x02\x02\x0238\x07\t\x02\x0245\x07\n\x02\x0257\x07\t\x02\x0264\x03" +
		"\x02\x02\x027:\x03\x02\x02\x0286\x03\x02\x02\x0289\x03\x02\x02\x029\r" +
		"\x03\x02\x02\x02:8\x03\x02\x02\x02;=\x07\v\x02\x02<;\x03\x02\x02\x02<" +
		"=\x03\x02\x02\x02=>\x03\x02\x02\x02>C\x07\t\x02\x02?@\t\x03\x02\x02@B" +
		"\x07\t\x02\x02A?\x03\x02\x02\x02BE\x03\x02\x02\x02CA\x03\x02\x02\x02C" +
		"D\x03\x02\x02\x02DG\x03\x02\x02\x02EC\x03\x02\x02\x02FH\x07\f\x02\x02" +
		"GF\x03\x02\x02\x02GH\x03\x02\x02\x02H\x0F\x03\x02\x02\x02IL\x05\x12\n" +
		"\x02JL\x05\x16\f\x02KI\x03\x02\x02\x02KJ\x03\x02\x02\x02L\x11\x03\x02" +
		"\x02\x02MN\x05\x14\v\x02NO\x05\x06\x04\x02OQ\x03\x02\x02\x02PM\x03\x02" +
		"\x02\x02QR\x03\x02\x02\x02RP\x03\x02\x02\x02RS\x03\x02\x02\x02S\x13\x03" +
		"\x02\x02\x02TX\x07\x07\x02\x02UW\t\x04\x02\x02VU\x03\x02\x02\x02WZ\x03" +
		"\x02\x02\x02XV\x03\x02\x02\x02XY\x03\x02\x02\x02Y\x15\x03\x02\x02\x02" +
		"ZX\x03\x02\x02\x02[]\x05\x18\r\x02\\[\x03\x02\x02\x02]^\x03\x02\x02\x02" +
		"^\\\x03\x02\x02\x02^_\x03\x02\x02\x02_\x17\x03\x02\x02\x02`a\x05\x1A\x0E" +
		"\x02ac\x05\x06\x04\x02bd\x05\x12\n\x02cb\x03\x02\x02\x02cd\x03\x02\x02" +
		"\x02d\x19\x03\x02\x02\x02ef\x07\x07\x02\x02fj\x07\x10\x02\x02gi\t\x05" +
		"\x02\x02hg\x03\x02\x02\x02il\x03\x02\x02\x02jh\x03\x02\x02\x02jk\x03\x02" +
		"\x02\x02k\x1B\x03\x02\x02\x02lj\x03\x02\x02\x02\x10\x1F%,18<CGKRX^cj";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileParser.__ATN) {
			LGFileParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileParser._serializedATN));
		}

		return LGFileParser.__ATN;
	}

}

export class FileContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(LGFileParser.EOF, 0); }
	public paragraph(): ParagraphContext[];
	public paragraph(i: number): ParagraphContext;
	public paragraph(i?: number): ParagraphContext | ParagraphContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParagraphContext);
		} else {
			return this.getRuleContext(i, ParagraphContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_file; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterFile) {
			listener.enterFile(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitFile) {
			listener.exitFile(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitFile) {
			return visitor.visitFile(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParagraphContext extends ParserRuleContext {
	public newline(): NewlineContext | undefined {
		return this.tryGetRuleContext(0, NewlineContext);
	}
	public templateDefinition(): TemplateDefinitionContext | undefined {
		return this.tryGetRuleContext(0, TemplateDefinitionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_paragraph; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterParagraph) {
			listener.enterParagraph(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitParagraph) {
			listener.exitParagraph(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitParagraph) {
			return visitor.visitParagraph(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NewlineContext extends ParserRuleContext {
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	public EOF(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_newline; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterNewline) {
			listener.enterNewline(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitNewline) {
			listener.exitNewline(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitNewline) {
			return visitor.visitNewline(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateDefinitionContext extends ParserRuleContext {
	public templateNameLine(): TemplateNameLineContext {
		return this.getRuleContext(0, TemplateNameLineContext);
	}
	public newline(): NewlineContext {
		return this.getRuleContext(0, NewlineContext);
	}
	public templateBody(): TemplateBodyContext | undefined {
		return this.tryGetRuleContext(0, TemplateBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateDefinition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateDefinition) {
			listener.enterTemplateDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateDefinition) {
			listener.exitTemplateDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateDefinition) {
			return visitor.visitTemplateDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateNameLineContext extends ParserRuleContext {
	public HASH(): TerminalNode { return this.getToken(LGFileParser.HASH, 0); }
	public templateName(): TemplateNameContext {
		return this.getRuleContext(0, TemplateNameContext);
	}
	public parameters(): ParametersContext | undefined {
		return this.tryGetRuleContext(0, ParametersContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateNameLine; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateNameLine) {
			listener.enterTemplateNameLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateNameLine) {
			listener.exitTemplateNameLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateNameLine) {
			return visitor.visitTemplateNameLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.IDENTIFIER);
		} else {
			return this.getToken(LGFileParser.IDENTIFIER, i);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.DOT);
		} else {
			return this.getToken(LGFileParser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateName; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateName) {
			listener.enterTemplateName(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateName) {
			listener.exitTemplateName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateName) {
			return visitor.visitTemplateName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParametersContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.IDENTIFIER);
		} else {
			return this.getToken(LGFileParser.IDENTIFIER, i);
		}
	}
	public OPEN_PARENTHESIS(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.OPEN_PARENTHESIS, 0); }
	public CLOSE_PARENTHESIS(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.CLOSE_PARENTHESIS, 0); }
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.COMMA);
		} else {
			return this.getToken(LGFileParser.COMMA, i);
		}
	}
	public INVALID_SEPERATE_CHAR(): TerminalNode[];
	public INVALID_SEPERATE_CHAR(i: number): TerminalNode;
	public INVALID_SEPERATE_CHAR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.INVALID_SEPERATE_CHAR);
		} else {
			return this.getToken(LGFileParser.INVALID_SEPERATE_CHAR, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_parameters; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterParameters) {
			listener.enterParameters(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitParameters) {
			listener.exitParameters(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitParameters) {
			return visitor.visitParameters(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateBodyContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateBody; }
	public copyFrom(ctx: TemplateBodyContext): void {
		super.copyFrom(ctx);
	}
}
export class NormalBodyContext extends TemplateBodyContext {
	public normalTemplateBody(): NormalTemplateBodyContext {
		return this.getRuleContext(0, NormalTemplateBodyContext);
	}
	constructor(ctx: TemplateBodyContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterNormalBody) {
			listener.enterNormalBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitNormalBody) {
			listener.exitNormalBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitNormalBody) {
			return visitor.visitNormalBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConditionalBodyContext extends TemplateBodyContext {
	public conditionalTemplateBody(): ConditionalTemplateBodyContext {
		return this.getRuleContext(0, ConditionalTemplateBodyContext);
	}
	constructor(ctx: TemplateBodyContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterConditionalBody) {
			listener.enterConditionalBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitConditionalBody) {
			listener.exitConditionalBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitConditionalBody) {
			return visitor.visitConditionalBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalTemplateBodyContext extends ParserRuleContext {
	public normalTemplateString(): NormalTemplateStringContext[];
	public normalTemplateString(i: number): NormalTemplateStringContext;
	public normalTemplateString(i?: number): NormalTemplateStringContext | NormalTemplateStringContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NormalTemplateStringContext);
		} else {
			return this.getRuleContext(i, NormalTemplateStringContext);
		}
	}
	public newline(): NewlineContext[];
	public newline(i: number): NewlineContext;
	public newline(i?: number): NewlineContext | NewlineContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NewlineContext);
		} else {
			return this.getRuleContext(i, NewlineContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_normalTemplateBody; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterNormalTemplateBody) {
			listener.enterNormalTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitNormalTemplateBody) {
			listener.exitNormalTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitNormalTemplateBody) {
			return visitor.visitNormalTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalTemplateStringContext extends ParserRuleContext {
	public DASH(): TerminalNode { return this.getToken(LGFileParser.DASH, 0); }
	public WS(): TerminalNode[];
	public WS(i: number): TerminalNode;
	public WS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.WS);
		} else {
			return this.getToken(LGFileParser.WS, i);
		}
	}
	public TEXT(): TerminalNode[];
	public TEXT(i: number): TerminalNode;
	public TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.TEXT);
		} else {
			return this.getToken(LGFileParser.TEXT, i);
		}
	}
	public EXPRESSION(): TerminalNode[];
	public EXPRESSION(i: number): TerminalNode;
	public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.EXPRESSION);
		} else {
			return this.getToken(LGFileParser.EXPRESSION, i);
		}
	}
	public TEMPLATE_REF(): TerminalNode[];
	public TEMPLATE_REF(i: number): TerminalNode;
	public TEMPLATE_REF(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.TEMPLATE_REF);
		} else {
			return this.getToken(LGFileParser.TEMPLATE_REF, i);
		}
	}
	public TEXT_SEPARATOR(): TerminalNode[];
	public TEXT_SEPARATOR(i: number): TerminalNode;
	public TEXT_SEPARATOR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.TEXT_SEPARATOR);
		} else {
			return this.getToken(LGFileParser.TEXT_SEPARATOR, i);
		}
	}
	public MULTI_LINE_TEXT(): TerminalNode[];
	public MULTI_LINE_TEXT(i: number): TerminalNode;
	public MULTI_LINE_TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.MULTI_LINE_TEXT);
		} else {
			return this.getToken(LGFileParser.MULTI_LINE_TEXT, i);
		}
	}
	public ESCAPE_CHARACTER(): TerminalNode[];
	public ESCAPE_CHARACTER(i: number): TerminalNode;
	public ESCAPE_CHARACTER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.ESCAPE_CHARACTER);
		} else {
			return this.getToken(LGFileParser.ESCAPE_CHARACTER, i);
		}
	}
	public INVALID_ESCAPE(): TerminalNode[];
	public INVALID_ESCAPE(i: number): TerminalNode;
	public INVALID_ESCAPE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.INVALID_ESCAPE);
		} else {
			return this.getToken(LGFileParser.INVALID_ESCAPE, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_normalTemplateString; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterNormalTemplateString) {
			listener.enterNormalTemplateString(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitNormalTemplateString) {
			listener.exitNormalTemplateString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitNormalTemplateString) {
			return visitor.visitNormalTemplateString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConditionalTemplateBodyContext extends ParserRuleContext {
	public ifConditionRule(): IfConditionRuleContext[];
	public ifConditionRule(i: number): IfConditionRuleContext;
	public ifConditionRule(i?: number): IfConditionRuleContext | IfConditionRuleContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IfConditionRuleContext);
		} else {
			return this.getRuleContext(i, IfConditionRuleContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_conditionalTemplateBody; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterConditionalTemplateBody) {
			listener.enterConditionalTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitConditionalTemplateBody) {
			listener.exitConditionalTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitConditionalTemplateBody) {
			return visitor.visitConditionalTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfConditionRuleContext extends ParserRuleContext {
	public ifCondition(): IfConditionContext {
		return this.getRuleContext(0, IfConditionContext);
	}
	public newline(): NewlineContext {
		return this.getRuleContext(0, NewlineContext);
	}
	public normalTemplateBody(): NormalTemplateBodyContext | undefined {
		return this.tryGetRuleContext(0, NormalTemplateBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_ifConditionRule; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterIfConditionRule) {
			listener.enterIfConditionRule(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitIfConditionRule) {
			listener.exitIfConditionRule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitIfConditionRule) {
			return visitor.visitIfConditionRule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfConditionContext extends ParserRuleContext {
	public DASH(): TerminalNode { return this.getToken(LGFileParser.DASH, 0); }
	public IFELSE(): TerminalNode { return this.getToken(LGFileParser.IFELSE, 0); }
	public WS(): TerminalNode[];
	public WS(i: number): TerminalNode;
	public WS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.WS);
		} else {
			return this.getToken(LGFileParser.WS, i);
		}
	}
	public TEXT(): TerminalNode[];
	public TEXT(i: number): TerminalNode;
	public TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.TEXT);
		} else {
			return this.getToken(LGFileParser.TEXT, i);
		}
	}
	public EXPRESSION(): TerminalNode[];
	public EXPRESSION(i: number): TerminalNode;
	public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGFileParser.EXPRESSION);
		} else {
			return this.getToken(LGFileParser.EXPRESSION, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_ifCondition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterIfCondition) {
			listener.enterIfCondition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitIfCondition) {
			listener.exitIfCondition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitIfCondition) {
			return visitor.visitIfCondition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


