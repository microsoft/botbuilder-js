// Generated from ../LGTemplateParser.g4 by ANTLR 4.6-SNAPSHOT


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

import { LGTemplateParserListener } from "./LGTemplateParserListener";
import { LGTemplateParserVisitor } from "./LGTemplateParserVisitor";


export class LGTemplateParser extends Parser {
	public static readonly WS = 1;
	public static readonly NEWLINE = 2;
	public static readonly COMMENTS = 3;
	public static readonly DASH = 4;
	public static readonly OBJECT_DEFINITION = 5;
	public static readonly EXPRESSION_FRAGMENT = 6;
	public static readonly LEFT_SQUARE_BRACKET = 7;
	public static readonly INVALID_TOKEN = 8;
	public static readonly WS_IN_BODY = 9;
	public static readonly MULTILINE_PREFIX = 10;
	public static readonly NEWLINE_IN_BODY = 11;
	public static readonly IF = 12;
	public static readonly ELSEIF = 13;
	public static readonly ELSE = 14;
	public static readonly SWITCH = 15;
	public static readonly CASE = 16;
	public static readonly DEFAULT = 17;
	public static readonly ESCAPE_CHARACTER = 18;
	public static readonly EXPRESSION = 19;
	public static readonly TEXT = 20;
	public static readonly MULTILINE_SUFFIX = 21;
	public static readonly WS_IN_STRUCTURE_NAME = 22;
	public static readonly NEWLINE_IN_STRUCTURE_NAME = 23;
	public static readonly STRUCTURE_NAME = 24;
	public static readonly TEXT_IN_STRUCTURE_NAME = 25;
	public static readonly STRUCTURED_COMMENTS = 26;
	public static readonly WS_IN_STRUCTURE_BODY = 27;
	public static readonly STRUCTURED_NEWLINE = 28;
	public static readonly STRUCTURED_BODY_END = 29;
	public static readonly STRUCTURE_IDENTIFIER = 30;
	public static readonly STRUCTURE_EQUALS = 31;
	public static readonly STRUCTURE_OR_MARK = 32;
	public static readonly ESCAPE_CHARACTER_IN_STRUCTURE_BODY = 33;
	public static readonly EXPRESSION_IN_STRUCTURE_BODY = 34;
	public static readonly TEXT_IN_STRUCTURE_BODY = 35;
	public static readonly RULE_template = 0;
	public static readonly RULE_body = 1;
	public static readonly RULE_structuredTemplateBody = 2;
	public static readonly RULE_structuredBodyNameLine = 3;
	public static readonly RULE_errorStructuredName = 4;
	public static readonly RULE_structuredBodyContentLine = 5;
	public static readonly RULE_errorStructureLine = 6;
	public static readonly RULE_keyValueStructureLine = 7;
	public static readonly RULE_keyValueStructureValue = 8;
	public static readonly RULE_objectStructureLine = 9;
	public static readonly RULE_structuredBodyEndLine = 10;
	public static readonly RULE_normalTemplateBody = 11;
	public static readonly RULE_templateString = 12;
	public static readonly RULE_normalTemplateString = 13;
	public static readonly RULE_errorTemplateString = 14;
	public static readonly RULE_ifElseTemplateBody = 15;
	public static readonly RULE_ifConditionRule = 16;
	public static readonly RULE_ifCondition = 17;
	public static readonly RULE_switchCaseTemplateBody = 18;
	public static readonly RULE_switchCaseRule = 19;
	public static readonly RULE_switchCaseStat = 20;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"template", "body", "structuredTemplateBody", "structuredBodyNameLine", 
		"errorStructuredName", "structuredBodyContentLine", "errorStructureLine", 
		"keyValueStructureLine", "keyValueStructureValue", "objectStructureLine", 
		"structuredBodyEndLine", "normalTemplateBody", "templateString", "normalTemplateString", 
		"errorTemplateString", "ifElseTemplateBody", "ifConditionRule", "ifCondition", 
		"switchCaseTemplateBody", "switchCaseRule", "switchCaseStat",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, "'|'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "WS", "NEWLINE", "COMMENTS", "DASH", "OBJECT_DEFINITION", "EXPRESSION_FRAGMENT", 
		"LEFT_SQUARE_BRACKET", "INVALID_TOKEN", "WS_IN_BODY", "MULTILINE_PREFIX", 
		"NEWLINE_IN_BODY", "IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", 
		"ESCAPE_CHARACTER", "EXPRESSION", "TEXT", "MULTILINE_SUFFIX", "WS_IN_STRUCTURE_NAME", 
		"NEWLINE_IN_STRUCTURE_NAME", "STRUCTURE_NAME", "TEXT_IN_STRUCTURE_NAME", 
		"STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", "STRUCTURED_NEWLINE", "STRUCTURED_BODY_END", 
		"STRUCTURE_IDENTIFIER", "STRUCTURE_EQUALS", "STRUCTURE_OR_MARK", "ESCAPE_CHARACTER_IN_STRUCTURE_BODY", 
		"EXPRESSION_IN_STRUCTURE_BODY", "TEXT_IN_STRUCTURE_BODY",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGTemplateParser._LITERAL_NAMES, LGTemplateParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGTemplateParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "LGTemplateParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return LGTemplateParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return LGTemplateParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(LGTemplateParser._ATN, this);
	}
	// @RuleVersion(0)
	public template(): TemplateContext {
		let _localctx: TemplateContext = new TemplateContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, LGTemplateParser.RULE_template);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 42;
			this.body();
			this.state = 43;
			this.match(LGTemplateParser.EOF);
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
	public body(): BodyContext {
		let _localctx: BodyContext = new BodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, LGTemplateParser.RULE_body);
		try {
			this.state = 49;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				_localctx = new NormalBodyContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 45;
				this.normalTemplateBody();
				}
				break;

			case 2:
				_localctx = new IfElseBodyContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 46;
				this.ifElseTemplateBody();
				}
				break;

			case 3:
				_localctx = new SwitchCaseBodyContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 47;
				this.switchCaseTemplateBody();
				}
				break;

			case 4:
				_localctx = new StructuredBodyContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 48;
				this.structuredTemplateBody();
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
	public structuredTemplateBody(): StructuredTemplateBodyContext {
		let _localctx: StructuredTemplateBodyContext = new StructuredTemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, LGTemplateParser.RULE_structuredTemplateBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 51;
			this.structuredBodyNameLine();
			this.state = 61;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (LGTemplateParser.STRUCTURED_NEWLINE - 28)) | (1 << (LGTemplateParser.STRUCTURE_IDENTIFIER - 28)) | (1 << (LGTemplateParser.STRUCTURE_EQUALS - 28)) | (1 << (LGTemplateParser.STRUCTURE_OR_MARK - 28)) | (1 << (LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 28)) | (1 << (LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY - 28)) | (1 << (LGTemplateParser.TEXT_IN_STRUCTURE_BODY - 28)))) !== 0)) {
				{
				this.state = 57;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					this.state = 57;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
					case 1:
						{
						{
						this.state = 53;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === LGTemplateParser.STRUCTURE_IDENTIFIER || _la === LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY) {
							{
							this.state = 52;
							this.structuredBodyContentLine();
							}
						}

						this.state = 55;
						this.match(LGTemplateParser.STRUCTURED_NEWLINE);
						}
						}
						break;

					case 2:
						{
						this.state = 56;
						this.errorStructureLine();
						}
						break;
					}
					}
					this.state = 59;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (LGTemplateParser.STRUCTURED_NEWLINE - 28)) | (1 << (LGTemplateParser.STRUCTURE_IDENTIFIER - 28)) | (1 << (LGTemplateParser.STRUCTURE_EQUALS - 28)) | (1 << (LGTemplateParser.STRUCTURE_OR_MARK - 28)) | (1 << (LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 28)) | (1 << (LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY - 28)) | (1 << (LGTemplateParser.TEXT_IN_STRUCTURE_BODY - 28)))) !== 0));
				}
			}

			this.state = 64;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGTemplateParser.STRUCTURED_BODY_END) {
				{
				this.state = 63;
				this.structuredBodyEndLine();
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
	public structuredBodyNameLine(): StructuredBodyNameLineContext {
		let _localctx: StructuredBodyNameLineContext = new StructuredBodyNameLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, LGTemplateParser.RULE_structuredBodyNameLine);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 66;
			this.match(LGTemplateParser.LEFT_SQUARE_BRACKET);
			this.state = 69;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				{
				this.state = 67;
				this.match(LGTemplateParser.STRUCTURE_NAME);
				}
				break;

			case 2:
				{
				this.state = 68;
				this.errorStructuredName();
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
	public errorStructuredName(): ErrorStructuredNameContext {
		let _localctx: ErrorStructuredNameContext = new ErrorStructuredNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, LGTemplateParser.RULE_errorStructuredName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 74;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === LGTemplateParser.STRUCTURE_NAME || _la === LGTemplateParser.TEXT_IN_STRUCTURE_NAME) {
				{
				{
				this.state = 71;
				_la = this._input.LA(1);
				if (!(_la === LGTemplateParser.STRUCTURE_NAME || _la === LGTemplateParser.TEXT_IN_STRUCTURE_NAME)) {
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
				this.state = 76;
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
	public structuredBodyContentLine(): StructuredBodyContentLineContext {
		let _localctx: StructuredBodyContentLineContext = new StructuredBodyContentLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, LGTemplateParser.RULE_structuredBodyContentLine);
		try {
			this.state = 79;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case LGTemplateParser.STRUCTURE_IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 77;
				this.keyValueStructureLine();
				}
				break;
			case LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 78;
				this.objectStructureLine();
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
	public errorStructureLine(): ErrorStructureLineContext {
		let _localctx: ErrorStructureLineContext = new ErrorStructureLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, LGTemplateParser.RULE_errorStructureLine);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 82;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 81;
					_la = this._input.LA(1);
					if (!(((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & ((1 << (LGTemplateParser.STRUCTURE_IDENTIFIER - 30)) | (1 << (LGTemplateParser.STRUCTURE_EQUALS - 30)) | (1 << (LGTemplateParser.STRUCTURE_OR_MARK - 30)) | (1 << (LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 30)) | (1 << (LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY - 30)) | (1 << (LGTemplateParser.TEXT_IN_STRUCTURE_BODY - 30)))) !== 0))) {
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
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 84;
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
	public keyValueStructureLine(): KeyValueStructureLineContext {
		let _localctx: KeyValueStructureLineContext = new KeyValueStructureLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, LGTemplateParser.RULE_keyValueStructureLine);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 86;
			this.match(LGTemplateParser.STRUCTURE_IDENTIFIER);
			this.state = 87;
			this.match(LGTemplateParser.STRUCTURE_EQUALS);
			this.state = 88;
			this.keyValueStructureValue();
			this.state = 93;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === LGTemplateParser.STRUCTURE_OR_MARK) {
				{
				{
				this.state = 89;
				this.match(LGTemplateParser.STRUCTURE_OR_MARK);
				this.state = 90;
				this.keyValueStructureValue();
				}
				}
				this.state = 95;
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
	public keyValueStructureValue(): KeyValueStructureValueContext {
		let _localctx: KeyValueStructureValueContext = new KeyValueStructureValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, LGTemplateParser.RULE_keyValueStructureValue);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 97;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 96;
				_la = this._input.LA(1);
				if (!(((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 33)) | (1 << (LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY - 33)) | (1 << (LGTemplateParser.TEXT_IN_STRUCTURE_BODY - 33)))) !== 0))) {
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
				this.state = 99;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 33)) | (1 << (LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY - 33)) | (1 << (LGTemplateParser.TEXT_IN_STRUCTURE_BODY - 33)))) !== 0));
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
	public objectStructureLine(): ObjectStructureLineContext {
		let _localctx: ObjectStructureLineContext = new ObjectStructureLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, LGTemplateParser.RULE_objectStructureLine);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 101;
			this.match(LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY);
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
	public structuredBodyEndLine(): StructuredBodyEndLineContext {
		let _localctx: StructuredBodyEndLineContext = new StructuredBodyEndLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, LGTemplateParser.RULE_structuredBodyEndLine);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 103;
			this.match(LGTemplateParser.STRUCTURED_BODY_END);
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
		this.enterRule(_localctx, 22, LGTemplateParser.RULE_normalTemplateBody);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 106;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 105;
					this.templateString();
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 108;
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
	public templateString(): TemplateStringContext {
		let _localctx: TemplateStringContext = new TemplateStringContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, LGTemplateParser.RULE_templateString);
		try {
			this.state = 112;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case LGTemplateParser.DASH:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 110;
				this.normalTemplateString();
				}
				break;
			case LGTemplateParser.INVALID_TOKEN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 111;
				this.errorTemplateString();
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
	public normalTemplateString(): NormalTemplateStringContext {
		let _localctx: NormalTemplateStringContext = new NormalTemplateStringContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, LGTemplateParser.RULE_normalTemplateString);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 114;
			this.match(LGTemplateParser.DASH);
			this.state = 116;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGTemplateParser.MULTILINE_PREFIX) {
				{
				this.state = 115;
				this.match(LGTemplateParser.MULTILINE_PREFIX);
				}
			}

			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.ESCAPE_CHARACTER) | (1 << LGTemplateParser.EXPRESSION) | (1 << LGTemplateParser.TEXT))) !== 0)) {
				{
				{
				this.state = 118;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.ESCAPE_CHARACTER) | (1 << LGTemplateParser.EXPRESSION) | (1 << LGTemplateParser.TEXT))) !== 0))) {
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
				this.state = 123;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === LGTemplateParser.MULTILINE_SUFFIX) {
				{
				this.state = 124;
				this.match(LGTemplateParser.MULTILINE_SUFFIX);
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
	public errorTemplateString(): ErrorTemplateStringContext {
		let _localctx: ErrorTemplateStringContext = new ErrorTemplateStringContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, LGTemplateParser.RULE_errorTemplateString);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 128;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 127;
					this.match(LGTemplateParser.INVALID_TOKEN);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 130;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
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
	public ifElseTemplateBody(): IfElseTemplateBodyContext {
		let _localctx: IfElseTemplateBodyContext = new IfElseTemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, LGTemplateParser.RULE_ifElseTemplateBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 133;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 132;
				this.ifConditionRule();
				}
				}
				this.state = 135;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === LGTemplateParser.DASH);
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
		this.enterRule(_localctx, 32, LGTemplateParser.RULE_ifConditionRule);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 137;
			this.ifCondition();
			this.state = 139;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				{
				this.state = 138;
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
		this.enterRule(_localctx, 34, LGTemplateParser.RULE_ifCondition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 141;
			this.match(LGTemplateParser.DASH);
			this.state = 142;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.IF) | (1 << LGTemplateParser.ELSEIF) | (1 << LGTemplateParser.ELSE))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 146;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.WS) | (1 << LGTemplateParser.EXPRESSION) | (1 << LGTemplateParser.TEXT))) !== 0)) {
				{
				{
				this.state = 143;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.WS) | (1 << LGTemplateParser.EXPRESSION) | (1 << LGTemplateParser.TEXT))) !== 0))) {
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
				this.state = 148;
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
	public switchCaseTemplateBody(): SwitchCaseTemplateBodyContext {
		let _localctx: SwitchCaseTemplateBodyContext = new SwitchCaseTemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, LGTemplateParser.RULE_switchCaseTemplateBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 150;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 149;
				this.switchCaseRule();
				}
				}
				this.state = 152;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === LGTemplateParser.DASH);
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
	public switchCaseRule(): SwitchCaseRuleContext {
		let _localctx: SwitchCaseRuleContext = new SwitchCaseRuleContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, LGTemplateParser.RULE_switchCaseRule);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 154;
			this.switchCaseStat();
			this.state = 156;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				{
				this.state = 155;
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
	public switchCaseStat(): SwitchCaseStatContext {
		let _localctx: SwitchCaseStatContext = new SwitchCaseStatContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, LGTemplateParser.RULE_switchCaseStat);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 158;
			this.match(LGTemplateParser.DASH);
			this.state = 159;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.SWITCH) | (1 << LGTemplateParser.CASE) | (1 << LGTemplateParser.DEFAULT))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 163;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.WS) | (1 << LGTemplateParser.EXPRESSION) | (1 << LGTemplateParser.TEXT))) !== 0)) {
				{
				{
				this.state = 160;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGTemplateParser.WS) | (1 << LGTemplateParser.EXPRESSION) | (1 << LGTemplateParser.TEXT))) !== 0))) {
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
				this.state = 165;
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
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03%\xA9\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x03\x02\x03\x02\x03" +
		"\x02\x03\x03\x03\x03\x03\x03\x03\x03\x05\x034\n\x03\x03\x04\x03\x04\x05" +
		"\x048\n\x04\x03\x04\x03\x04\x06\x04<\n\x04\r\x04\x0E\x04=\x05\x04@\n\x04" +
		"\x03\x04\x05\x04C\n\x04\x03\x05\x03\x05\x03\x05\x05\x05H\n\x05\x03\x06" +
		"\x07\x06K\n\x06\f\x06\x0E\x06N\v\x06\x03\x07\x03\x07\x05\x07R\n\x07\x03" +
		"\b\x06\bU\n\b\r\b\x0E\bV\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t^\n\t\f\t" +
		"\x0E\ta\v\t\x03\n\x06\nd\n\n\r\n\x0E\ne\x03\v\x03\v\x03\f\x03\f\x03\r" +
		"\x06\rm\n\r\r\r\x0E\rn\x03\x0E\x03\x0E\x05\x0Es\n\x0E\x03\x0F\x03\x0F" +
		"\x05\x0Fw\n\x0F\x03\x0F\x07\x0Fz\n\x0F\f\x0F\x0E\x0F}\v\x0F\x03\x0F\x05" +
		"\x0F\x80\n\x0F\x03\x10\x06\x10\x83\n\x10\r\x10\x0E\x10\x84\x03\x11\x06" +
		"\x11\x88\n\x11\r\x11\x0E\x11\x89\x03\x12\x03\x12\x05\x12\x8E\n\x12\x03" +
		"\x13\x03\x13\x03\x13\x07\x13\x93\n\x13\f\x13\x0E\x13\x96\v\x13\x03\x14" +
		"\x06\x14\x99\n\x14\r\x14\x0E\x14\x9A\x03\x15\x03\x15\x05\x15\x9F\n\x15" +
		"\x03\x16\x03\x16\x03\x16\x07\x16\xA4\n\x16\f\x16\x0E\x16\xA7\v\x16\x03" +
		"\x16\x02\x02\x02\x17\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02" +
		"\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02" +
		"\"\x02$\x02&\x02(\x02*\x02\x02\t\x03\x02\x1A\x1B\x03\x02 %\x03\x02#%\x03" +
		"\x02\x14\x16\x03\x02\x0E\x10\x04\x02\x03\x03\x15\x16\x03\x02\x11\x13\xAD" +
		"\x02,\x03\x02\x02\x02\x043\x03\x02\x02\x02\x065\x03\x02\x02\x02\bD\x03" +
		"\x02\x02\x02\nL\x03\x02\x02\x02\fQ\x03\x02\x02\x02\x0ET\x03\x02\x02\x02" +
		"\x10X\x03\x02\x02\x02\x12c\x03\x02\x02\x02\x14g\x03\x02\x02\x02\x16i\x03" +
		"\x02\x02\x02\x18l\x03\x02\x02\x02\x1Ar\x03\x02\x02\x02\x1Ct\x03\x02\x02" +
		"\x02\x1E\x82\x03\x02\x02\x02 \x87\x03\x02\x02\x02\"\x8B\x03\x02\x02\x02" +
		"$\x8F\x03\x02\x02\x02&\x98\x03\x02\x02\x02(\x9C\x03\x02\x02\x02*\xA0\x03" +
		"\x02\x02\x02,-\x05\x04\x03\x02-.\x07\x02\x02\x03.\x03\x03\x02\x02\x02" +
		"/4\x05\x18\r\x0204\x05 \x11\x0214\x05&\x14\x0224\x05\x06\x04\x023/\x03" +
		"\x02\x02\x0230\x03\x02\x02\x0231\x03\x02\x02\x0232\x03\x02\x02\x024\x05" +
		"\x03\x02\x02\x025?\x05\b\x05\x0268\x05\f\x07\x0276\x03\x02\x02\x0278\x03" +
		"\x02\x02\x0289\x03\x02\x02\x029<\x07\x1E\x02\x02:<\x05\x0E\b\x02;7\x03" +
		"\x02\x02\x02;:\x03\x02\x02\x02<=\x03\x02\x02\x02=;\x03\x02\x02\x02=>\x03" +
		"\x02\x02\x02>@\x03\x02\x02\x02?;\x03\x02\x02\x02?@\x03\x02\x02\x02@B\x03" +
		"\x02\x02\x02AC\x05\x16\f\x02BA\x03\x02\x02\x02BC\x03\x02\x02\x02C\x07" +
		"\x03\x02\x02\x02DG\x07\t\x02\x02EH\x07\x1A\x02\x02FH\x05\n\x06\x02GE\x03" +
		"\x02\x02\x02GF\x03\x02\x02\x02H\t\x03\x02\x02\x02IK\t\x02\x02\x02JI\x03" +
		"\x02\x02\x02KN\x03\x02\x02\x02LJ\x03\x02\x02\x02LM\x03\x02\x02\x02M\v" +
		"\x03\x02\x02\x02NL\x03\x02\x02\x02OR\x05\x10\t\x02PR\x05\x14\v\x02QO\x03" +
		"\x02\x02\x02QP\x03\x02\x02\x02R\r\x03\x02\x02\x02SU\t\x03\x02\x02TS\x03" +
		"\x02\x02\x02UV\x03\x02\x02\x02VT\x03\x02\x02\x02VW\x03\x02\x02\x02W\x0F" +
		"\x03\x02\x02\x02XY\x07 \x02\x02YZ\x07!\x02\x02Z_\x05\x12\n\x02[\\\x07" +
		"\"\x02\x02\\^\x05\x12\n\x02][\x03\x02\x02\x02^a\x03\x02\x02\x02_]\x03" +
		"\x02\x02\x02_`\x03\x02\x02\x02`\x11\x03\x02\x02\x02a_\x03\x02\x02\x02" +
		"bd\t\x04\x02\x02cb\x03\x02\x02\x02de\x03\x02\x02\x02ec\x03\x02\x02\x02" +
		"ef\x03\x02\x02\x02f\x13\x03\x02\x02\x02gh\x07$\x02\x02h\x15\x03\x02\x02" +
		"\x02ij\x07\x1F\x02\x02j\x17\x03\x02\x02\x02km\x05\x1A\x0E\x02lk\x03\x02" +
		"\x02\x02mn\x03\x02\x02\x02nl\x03\x02\x02\x02no\x03\x02\x02\x02o\x19\x03" +
		"\x02\x02\x02ps\x05\x1C\x0F\x02qs\x05\x1E\x10\x02rp\x03\x02\x02\x02rq\x03" +
		"\x02\x02\x02s\x1B\x03\x02\x02\x02tv\x07\x06\x02\x02uw\x07\f\x02\x02vu" +
		"\x03\x02\x02\x02vw\x03\x02\x02\x02w{\x03\x02\x02\x02xz\t\x05\x02\x02y" +
		"x\x03\x02\x02\x02z}\x03\x02\x02\x02{y\x03\x02\x02\x02{|\x03\x02\x02\x02" +
		"|\x7F\x03\x02\x02\x02}{\x03\x02\x02\x02~\x80\x07\x17\x02\x02\x7F~\x03" +
		"\x02\x02\x02\x7F\x80\x03\x02\x02\x02\x80\x1D\x03\x02\x02\x02\x81\x83\x07" +
		"\n\x02\x02\x82\x81\x03\x02\x02\x02\x83\x84\x03\x02\x02\x02\x84\x82\x03" +
		"\x02\x02\x02\x84\x85\x03\x02\x02\x02\x85\x1F\x03\x02\x02\x02\x86\x88\x05" +
		"\"\x12\x02\x87\x86\x03\x02\x02\x02\x88\x89\x03\x02\x02\x02\x89\x87\x03" +
		"\x02\x02\x02\x89\x8A\x03\x02\x02\x02\x8A!\x03\x02\x02\x02\x8B\x8D\x05" +
		"$\x13\x02\x8C\x8E\x05\x18\r\x02\x8D\x8C\x03\x02\x02\x02\x8D\x8E\x03\x02" +
		"\x02\x02\x8E#\x03\x02\x02\x02\x8F\x90\x07\x06\x02\x02\x90\x94\t\x06\x02" +
		"\x02\x91\x93\t\x07\x02\x02\x92\x91\x03\x02\x02\x02\x93\x96\x03\x02\x02" +
		"\x02\x94\x92\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02\x95%\x03\x02\x02" +
		"\x02\x96\x94\x03\x02\x02\x02\x97\x99\x05(\x15\x02\x98\x97\x03\x02\x02" +
		"\x02\x99\x9A\x03\x02\x02\x02\x9A\x98\x03\x02\x02\x02\x9A\x9B\x03\x02\x02" +
		"\x02\x9B\'\x03\x02\x02\x02\x9C\x9E\x05*\x16\x02\x9D\x9F\x05\x18\r\x02" +
		"\x9E\x9D\x03\x02\x02\x02\x9E\x9F\x03\x02\x02\x02\x9F)\x03\x02\x02\x02" +
		"\xA0\xA1\x07\x06\x02\x02\xA1\xA5\t\b\x02\x02\xA2\xA4\t\x07\x02\x02\xA3" +
		"\xA2\x03\x02\x02\x02\xA4\xA7\x03\x02\x02\x02\xA5\xA3\x03\x02\x02\x02\xA5" +
		"\xA6\x03\x02\x02\x02\xA6+\x03\x02\x02\x02\xA7\xA5\x03\x02\x02\x02\x1A" +
		"37;=?BGLQV_enrv{\x7F\x84\x89\x8D\x94\x9A\x9E\xA5";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGTemplateParser.__ATN) {
			LGTemplateParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGTemplateParser._serializedATN));
		}

		return LGTemplateParser.__ATN;
	}

}

export class TemplateContext extends ParserRuleContext {
	public body(): BodyContext {
		return this.getRuleContext(0, BodyContext);
	}
	public EOF(): TerminalNode { return this.getToken(LGTemplateParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_template; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterTemplate) {
			listener.enterTemplate(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitTemplate) {
			listener.exitTemplate(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitTemplate) {
			return visitor.visitTemplate(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BodyContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_body; }
	public copyFrom(ctx: BodyContext): void {
		super.copyFrom(ctx);
	}
}
export class SwitchCaseBodyContext extends BodyContext {
	public switchCaseTemplateBody(): SwitchCaseTemplateBodyContext {
		return this.getRuleContext(0, SwitchCaseTemplateBodyContext);
	}
	constructor(ctx: BodyContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterSwitchCaseBody) {
			listener.enterSwitchCaseBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitSwitchCaseBody) {
			listener.exitSwitchCaseBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitSwitchCaseBody) {
			return visitor.visitSwitchCaseBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NormalBodyContext extends BodyContext {
	public normalTemplateBody(): NormalTemplateBodyContext {
		return this.getRuleContext(0, NormalTemplateBodyContext);
	}
	constructor(ctx: BodyContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterNormalBody) {
			listener.enterNormalBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitNormalBody) {
			listener.exitNormalBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitNormalBody) {
			return visitor.visitNormalBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StructuredBodyContext extends BodyContext {
	public structuredTemplateBody(): StructuredTemplateBodyContext {
		return this.getRuleContext(0, StructuredTemplateBodyContext);
	}
	constructor(ctx: BodyContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterStructuredBody) {
			listener.enterStructuredBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitStructuredBody) {
			listener.exitStructuredBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitStructuredBody) {
			return visitor.visitStructuredBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfElseBodyContext extends BodyContext {
	public ifElseTemplateBody(): IfElseTemplateBodyContext {
		return this.getRuleContext(0, IfElseTemplateBodyContext);
	}
	constructor(ctx: BodyContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterIfElseBody) {
			listener.enterIfElseBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitIfElseBody) {
			listener.exitIfElseBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitIfElseBody) {
			return visitor.visitIfElseBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructuredTemplateBodyContext extends ParserRuleContext {
	public structuredBodyNameLine(): StructuredBodyNameLineContext {
		return this.getRuleContext(0, StructuredBodyNameLineContext);
	}
	public structuredBodyEndLine(): StructuredBodyEndLineContext | undefined {
		return this.tryGetRuleContext(0, StructuredBodyEndLineContext);
	}
	public errorStructureLine(): ErrorStructureLineContext[];
	public errorStructureLine(i: number): ErrorStructureLineContext;
	public errorStructureLine(i?: number): ErrorStructureLineContext | ErrorStructureLineContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ErrorStructureLineContext);
		} else {
			return this.getRuleContext(i, ErrorStructureLineContext);
		}
	}
	public STRUCTURED_NEWLINE(): TerminalNode[];
	public STRUCTURED_NEWLINE(i: number): TerminalNode;
	public STRUCTURED_NEWLINE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.STRUCTURED_NEWLINE);
		} else {
			return this.getToken(LGTemplateParser.STRUCTURED_NEWLINE, i);
		}
	}
	public structuredBodyContentLine(): StructuredBodyContentLineContext[];
	public structuredBodyContentLine(i: number): StructuredBodyContentLineContext;
	public structuredBodyContentLine(i?: number): StructuredBodyContentLineContext | StructuredBodyContentLineContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StructuredBodyContentLineContext);
		} else {
			return this.getRuleContext(i, StructuredBodyContentLineContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_structuredTemplateBody; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterStructuredTemplateBody) {
			listener.enterStructuredTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitStructuredTemplateBody) {
			listener.exitStructuredTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitStructuredTemplateBody) {
			return visitor.visitStructuredTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructuredBodyNameLineContext extends ParserRuleContext {
	public LEFT_SQUARE_BRACKET(): TerminalNode { return this.getToken(LGTemplateParser.LEFT_SQUARE_BRACKET, 0); }
	public STRUCTURE_NAME(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.STRUCTURE_NAME, 0); }
	public errorStructuredName(): ErrorStructuredNameContext | undefined {
		return this.tryGetRuleContext(0, ErrorStructuredNameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_structuredBodyNameLine; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterStructuredBodyNameLine) {
			listener.enterStructuredBodyNameLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitStructuredBodyNameLine) {
			listener.exitStructuredBodyNameLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitStructuredBodyNameLine) {
			return visitor.visitStructuredBodyNameLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ErrorStructuredNameContext extends ParserRuleContext {
	public STRUCTURE_NAME(): TerminalNode[];
	public STRUCTURE_NAME(i: number): TerminalNode;
	public STRUCTURE_NAME(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.STRUCTURE_NAME);
		} else {
			return this.getToken(LGTemplateParser.STRUCTURE_NAME, i);
		}
	}
	public TEXT_IN_STRUCTURE_NAME(): TerminalNode[];
	public TEXT_IN_STRUCTURE_NAME(i: number): TerminalNode;
	public TEXT_IN_STRUCTURE_NAME(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.TEXT_IN_STRUCTURE_NAME);
		} else {
			return this.getToken(LGTemplateParser.TEXT_IN_STRUCTURE_NAME, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_errorStructuredName; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterErrorStructuredName) {
			listener.enterErrorStructuredName(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitErrorStructuredName) {
			listener.exitErrorStructuredName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitErrorStructuredName) {
			return visitor.visitErrorStructuredName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructuredBodyContentLineContext extends ParserRuleContext {
	public keyValueStructureLine(): KeyValueStructureLineContext | undefined {
		return this.tryGetRuleContext(0, KeyValueStructureLineContext);
	}
	public objectStructureLine(): ObjectStructureLineContext | undefined {
		return this.tryGetRuleContext(0, ObjectStructureLineContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_structuredBodyContentLine; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterStructuredBodyContentLine) {
			listener.enterStructuredBodyContentLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitStructuredBodyContentLine) {
			listener.exitStructuredBodyContentLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitStructuredBodyContentLine) {
			return visitor.visitStructuredBodyContentLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ErrorStructureLineContext extends ParserRuleContext {
	public STRUCTURE_IDENTIFIER(): TerminalNode[];
	public STRUCTURE_IDENTIFIER(i: number): TerminalNode;
	public STRUCTURE_IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.STRUCTURE_IDENTIFIER);
		} else {
			return this.getToken(LGTemplateParser.STRUCTURE_IDENTIFIER, i);
		}
	}
	public STRUCTURE_EQUALS(): TerminalNode[];
	public STRUCTURE_EQUALS(i: number): TerminalNode;
	public STRUCTURE_EQUALS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.STRUCTURE_EQUALS);
		} else {
			return this.getToken(LGTemplateParser.STRUCTURE_EQUALS, i);
		}
	}
	public STRUCTURE_OR_MARK(): TerminalNode[];
	public STRUCTURE_OR_MARK(i: number): TerminalNode;
	public STRUCTURE_OR_MARK(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.STRUCTURE_OR_MARK);
		} else {
			return this.getToken(LGTemplateParser.STRUCTURE_OR_MARK, i);
		}
	}
	public TEXT_IN_STRUCTURE_BODY(): TerminalNode[];
	public TEXT_IN_STRUCTURE_BODY(i: number): TerminalNode;
	public TEXT_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.TEXT_IN_STRUCTURE_BODY);
		} else {
			return this.getToken(LGTemplateParser.TEXT_IN_STRUCTURE_BODY, i);
		}
	}
	public EXPRESSION_IN_STRUCTURE_BODY(): TerminalNode[];
	public EXPRESSION_IN_STRUCTURE_BODY(i: number): TerminalNode;
	public EXPRESSION_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY);
		} else {
			return this.getToken(LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY, i);
		}
	}
	public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(): TerminalNode[];
	public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i: number): TerminalNode;
	public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY);
		} else {
			return this.getToken(LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_errorStructureLine; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterErrorStructureLine) {
			listener.enterErrorStructureLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitErrorStructureLine) {
			listener.exitErrorStructureLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitErrorStructureLine) {
			return visitor.visitErrorStructureLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeyValueStructureLineContext extends ParserRuleContext {
	public STRUCTURE_IDENTIFIER(): TerminalNode { return this.getToken(LGTemplateParser.STRUCTURE_IDENTIFIER, 0); }
	public STRUCTURE_EQUALS(): TerminalNode { return this.getToken(LGTemplateParser.STRUCTURE_EQUALS, 0); }
	public keyValueStructureValue(): KeyValueStructureValueContext[];
	public keyValueStructureValue(i: number): KeyValueStructureValueContext;
	public keyValueStructureValue(i?: number): KeyValueStructureValueContext | KeyValueStructureValueContext[] {
		if (i === undefined) {
			return this.getRuleContexts(KeyValueStructureValueContext);
		} else {
			return this.getRuleContext(i, KeyValueStructureValueContext);
		}
	}
	public STRUCTURE_OR_MARK(): TerminalNode[];
	public STRUCTURE_OR_MARK(i: number): TerminalNode;
	public STRUCTURE_OR_MARK(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.STRUCTURE_OR_MARK);
		} else {
			return this.getToken(LGTemplateParser.STRUCTURE_OR_MARK, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_keyValueStructureLine; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterKeyValueStructureLine) {
			listener.enterKeyValueStructureLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitKeyValueStructureLine) {
			listener.exitKeyValueStructureLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitKeyValueStructureLine) {
			return visitor.visitKeyValueStructureLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeyValueStructureValueContext extends ParserRuleContext {
	public TEXT_IN_STRUCTURE_BODY(): TerminalNode[];
	public TEXT_IN_STRUCTURE_BODY(i: number): TerminalNode;
	public TEXT_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.TEXT_IN_STRUCTURE_BODY);
		} else {
			return this.getToken(LGTemplateParser.TEXT_IN_STRUCTURE_BODY, i);
		}
	}
	public EXPRESSION_IN_STRUCTURE_BODY(): TerminalNode[];
	public EXPRESSION_IN_STRUCTURE_BODY(i: number): TerminalNode;
	public EXPRESSION_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY);
		} else {
			return this.getToken(LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY, i);
		}
	}
	public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(): TerminalNode[];
	public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i: number): TerminalNode;
	public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY);
		} else {
			return this.getToken(LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_keyValueStructureValue; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterKeyValueStructureValue) {
			listener.enterKeyValueStructureValue(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitKeyValueStructureValue) {
			listener.exitKeyValueStructureValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitKeyValueStructureValue) {
			return visitor.visitKeyValueStructureValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ObjectStructureLineContext extends ParserRuleContext {
	public EXPRESSION_IN_STRUCTURE_BODY(): TerminalNode { return this.getToken(LGTemplateParser.EXPRESSION_IN_STRUCTURE_BODY, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_objectStructureLine; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterObjectStructureLine) {
			listener.enterObjectStructureLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitObjectStructureLine) {
			listener.exitObjectStructureLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitObjectStructureLine) {
			return visitor.visitObjectStructureLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructuredBodyEndLineContext extends ParserRuleContext {
	public STRUCTURED_BODY_END(): TerminalNode { return this.getToken(LGTemplateParser.STRUCTURED_BODY_END, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_structuredBodyEndLine; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterStructuredBodyEndLine) {
			listener.enterStructuredBodyEndLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitStructuredBodyEndLine) {
			listener.exitStructuredBodyEndLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitStructuredBodyEndLine) {
			return visitor.visitStructuredBodyEndLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalTemplateBodyContext extends ParserRuleContext {
	public templateString(): TemplateStringContext[];
	public templateString(i: number): TemplateStringContext;
	public templateString(i?: number): TemplateStringContext | TemplateStringContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TemplateStringContext);
		} else {
			return this.getRuleContext(i, TemplateStringContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_normalTemplateBody; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterNormalTemplateBody) {
			listener.enterNormalTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitNormalTemplateBody) {
			listener.exitNormalTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitNormalTemplateBody) {
			return visitor.visitNormalTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateStringContext extends ParserRuleContext {
	public normalTemplateString(): NormalTemplateStringContext | undefined {
		return this.tryGetRuleContext(0, NormalTemplateStringContext);
	}
	public errorTemplateString(): ErrorTemplateStringContext | undefined {
		return this.tryGetRuleContext(0, ErrorTemplateStringContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_templateString; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterTemplateString) {
			listener.enterTemplateString(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitTemplateString) {
			listener.exitTemplateString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitTemplateString) {
			return visitor.visitTemplateString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalTemplateStringContext extends ParserRuleContext {
	public DASH(): TerminalNode { return this.getToken(LGTemplateParser.DASH, 0); }
	public MULTILINE_PREFIX(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.MULTILINE_PREFIX, 0); }
	public MULTILINE_SUFFIX(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.MULTILINE_SUFFIX, 0); }
	public TEXT(): TerminalNode[];
	public TEXT(i: number): TerminalNode;
	public TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.TEXT);
		} else {
			return this.getToken(LGTemplateParser.TEXT, i);
		}
	}
	public EXPRESSION(): TerminalNode[];
	public EXPRESSION(i: number): TerminalNode;
	public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.EXPRESSION);
		} else {
			return this.getToken(LGTemplateParser.EXPRESSION, i);
		}
	}
	public ESCAPE_CHARACTER(): TerminalNode[];
	public ESCAPE_CHARACTER(i: number): TerminalNode;
	public ESCAPE_CHARACTER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.ESCAPE_CHARACTER);
		} else {
			return this.getToken(LGTemplateParser.ESCAPE_CHARACTER, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_normalTemplateString; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterNormalTemplateString) {
			listener.enterNormalTemplateString(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitNormalTemplateString) {
			listener.exitNormalTemplateString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitNormalTemplateString) {
			return visitor.visitNormalTemplateString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ErrorTemplateStringContext extends ParserRuleContext {
	public INVALID_TOKEN(): TerminalNode[];
	public INVALID_TOKEN(i: number): TerminalNode;
	public INVALID_TOKEN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.INVALID_TOKEN);
		} else {
			return this.getToken(LGTemplateParser.INVALID_TOKEN, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_errorTemplateString; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterErrorTemplateString) {
			listener.enterErrorTemplateString(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitErrorTemplateString) {
			listener.exitErrorTemplateString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitErrorTemplateString) {
			return visitor.visitErrorTemplateString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfElseTemplateBodyContext extends ParserRuleContext {
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
	public get ruleIndex(): number { return LGTemplateParser.RULE_ifElseTemplateBody; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterIfElseTemplateBody) {
			listener.enterIfElseTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitIfElseTemplateBody) {
			listener.exitIfElseTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitIfElseTemplateBody) {
			return visitor.visitIfElseTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfConditionRuleContext extends ParserRuleContext {
	public ifCondition(): IfConditionContext {
		return this.getRuleContext(0, IfConditionContext);
	}
	public normalTemplateBody(): NormalTemplateBodyContext | undefined {
		return this.tryGetRuleContext(0, NormalTemplateBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_ifConditionRule; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterIfConditionRule) {
			listener.enterIfConditionRule(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitIfConditionRule) {
			listener.exitIfConditionRule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitIfConditionRule) {
			return visitor.visitIfConditionRule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfConditionContext extends ParserRuleContext {
	public DASH(): TerminalNode { return this.getToken(LGTemplateParser.DASH, 0); }
	public IF(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.IF, 0); }
	public ELSE(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.ELSE, 0); }
	public ELSEIF(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.ELSEIF, 0); }
	public WS(): TerminalNode[];
	public WS(i: number): TerminalNode;
	public WS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.WS);
		} else {
			return this.getToken(LGTemplateParser.WS, i);
		}
	}
	public TEXT(): TerminalNode[];
	public TEXT(i: number): TerminalNode;
	public TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.TEXT);
		} else {
			return this.getToken(LGTemplateParser.TEXT, i);
		}
	}
	public EXPRESSION(): TerminalNode[];
	public EXPRESSION(i: number): TerminalNode;
	public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.EXPRESSION);
		} else {
			return this.getToken(LGTemplateParser.EXPRESSION, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_ifCondition; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterIfCondition) {
			listener.enterIfCondition(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitIfCondition) {
			listener.exitIfCondition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitIfCondition) {
			return visitor.visitIfCondition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SwitchCaseTemplateBodyContext extends ParserRuleContext {
	public switchCaseRule(): SwitchCaseRuleContext[];
	public switchCaseRule(i: number): SwitchCaseRuleContext;
	public switchCaseRule(i?: number): SwitchCaseRuleContext | SwitchCaseRuleContext[] {
		if (i === undefined) {
			return this.getRuleContexts(SwitchCaseRuleContext);
		} else {
			return this.getRuleContext(i, SwitchCaseRuleContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_switchCaseTemplateBody; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterSwitchCaseTemplateBody) {
			listener.enterSwitchCaseTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitSwitchCaseTemplateBody) {
			listener.exitSwitchCaseTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitSwitchCaseTemplateBody) {
			return visitor.visitSwitchCaseTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SwitchCaseRuleContext extends ParserRuleContext {
	public switchCaseStat(): SwitchCaseStatContext {
		return this.getRuleContext(0, SwitchCaseStatContext);
	}
	public normalTemplateBody(): NormalTemplateBodyContext | undefined {
		return this.tryGetRuleContext(0, NormalTemplateBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_switchCaseRule; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterSwitchCaseRule) {
			listener.enterSwitchCaseRule(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitSwitchCaseRule) {
			listener.exitSwitchCaseRule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitSwitchCaseRule) {
			return visitor.visitSwitchCaseRule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SwitchCaseStatContext extends ParserRuleContext {
	public DASH(): TerminalNode { return this.getToken(LGTemplateParser.DASH, 0); }
	public SWITCH(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.SWITCH, 0); }
	public CASE(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.CASE, 0); }
	public DEFAULT(): TerminalNode | undefined { return this.tryGetToken(LGTemplateParser.DEFAULT, 0); }
	public WS(): TerminalNode[];
	public WS(i: number): TerminalNode;
	public WS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.WS);
		} else {
			return this.getToken(LGTemplateParser.WS, i);
		}
	}
	public TEXT(): TerminalNode[];
	public TEXT(i: number): TerminalNode;
	public TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.TEXT);
		} else {
			return this.getToken(LGTemplateParser.TEXT, i);
		}
	}
	public EXPRESSION(): TerminalNode[];
	public EXPRESSION(i: number): TerminalNode;
	public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(LGTemplateParser.EXPRESSION);
		} else {
			return this.getToken(LGTemplateParser.EXPRESSION, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGTemplateParser.RULE_switchCaseStat; }
	// @Override
	public enterRule(listener: LGTemplateParserListener): void {
		if (listener.enterSwitchCaseStat) {
			listener.enterSwitchCaseStat(this);
		}
	}
	// @Override
	public exitRule(listener: LGTemplateParserListener): void {
		if (listener.exitSwitchCaseStat) {
			listener.exitSwitchCaseStat(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGTemplateParserVisitor<Result>): Result {
		if (visitor.visitSwitchCaseStat) {
			return visitor.visitSwitchCaseStat(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


