// Generated from ../LGFileLexer.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class LGFileLexer extends Lexer {
	public static readonly COMMENTS = 1;
	public static readonly WS = 2;
	public static readonly NEWLINE = 3;
	public static readonly HASH = 4;
	public static readonly DASH = 5;
	public static readonly LEFT_SQUARE_BRACKET = 6;
	public static readonly RIGHT_SQUARE_BRACKET = 7;
	public static readonly IMPORT_DESC = 8;
	public static readonly IMPORT_PATH = 9;
	public static readonly INVALID_TOKEN_DEFAULT_MODE = 10;
	public static readonly WS_IN_NAME = 11;
	public static readonly IDENTIFIER = 12;
	public static readonly DOT = 13;
	public static readonly OPEN_PARENTHESIS = 14;
	public static readonly CLOSE_PARENTHESIS = 15;
	public static readonly COMMA = 16;
	public static readonly TEXT_IN_NAME = 17;
	public static readonly WS_IN_BODY_IGNORED = 18;
	public static readonly IF = 19;
	public static readonly ELSEIF = 20;
	public static readonly ELSE = 21;
	public static readonly SWITCH = 22;
	public static readonly CASE = 23;
	public static readonly DEFAULT = 24;
	public static readonly MULTI_LINE_TEXT = 25;
	public static readonly ESCAPE_CHARACTER = 26;
	public static readonly EXPRESSION = 27;
	public static readonly TEMPLATE_REF = 28;
	public static readonly TEXT_SEPARATOR = 29;
	public static readonly TEXT = 30;
	public static readonly STRUCTURED_COMMENTS = 31;
	public static readonly STRUCTURED_NEWLINE = 32;
	public static readonly STRUCTURED_TEMPLATE_BODY_END = 33;
	public static readonly STRUCTURED_CONTENT = 34;
	public static readonly TEMPLATE_NAME_MODE = 1;
	public static readonly TEMPLATE_BODY_MODE = 2;
	public static readonly STRUCTURED_TEMPLATE_BODY_MODE = 3;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "TEMPLATE_NAME_MODE", "TEMPLATE_BODY_MODE", "STRUCTURED_TEMPLATE_BODY_MODE",
	];

	public static readonly ruleNames: string[] = [
		"LETTER", "NUMBER", "WHITESPACE", "A", "C", "D", "E", "F", "H", "I", "L", 
		"S", "T", "U", "W", "STRING_LITERAL", "COMMENTS", "WS", "NEWLINE", "HASH", 
		"DASH", "LEFT_SQUARE_BRACKET", "RIGHT_SQUARE_BRACKET", "IMPORT_DESC", 
		"IMPORT_PATH", "INVALID_TOKEN_DEFAULT_MODE", "WS_IN_NAME", "NEWLINE_IN_NAME", 
		"IDENTIFIER", "DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", "COMMA", 
		"TEXT_IN_NAME", "WS_IN_BODY_IGNORED", "WS_IN_BODY", "NEWLINE_IN_BODY", 
		"IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", "MULTI_LINE_TEXT", 
		"ESCAPE_CHARACTER", "EXPRESSION", "TEMPLATE_REF", "TEXT_SEPARATOR", "TEXT", 
		"STRUCTURED_COMMENTS", "STRUCTURED_NEWLINE", "STRUCTURED_TEMPLATE_BODY_END", 
		"STRUCTURED_CONTENT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, "'#'", undefined, "'['", "']'", 
		undefined, undefined, undefined, undefined, undefined, "'.'", "'('", "')'", 
		"','",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "LEFT_SQUARE_BRACKET", 
		"RIGHT_SQUARE_BRACKET", "IMPORT_DESC", "IMPORT_PATH", "INVALID_TOKEN_DEFAULT_MODE", 
		"WS_IN_NAME", "IDENTIFIER", "DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", 
		"COMMA", "TEXT_IN_NAME", "WS_IN_BODY_IGNORED", "IF", "ELSEIF", "ELSE", 
		"SWITCH", "CASE", "DEFAULT", "MULTI_LINE_TEXT", "ESCAPE_CHARACTER", "EXPRESSION", 
		"TEMPLATE_REF", "TEXT_SEPARATOR", "TEXT", "STRUCTURED_COMMENTS", "STRUCTURED_NEWLINE", 
		"STRUCTURED_TEMPLATE_BODY_END", "STRUCTURED_CONTENT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileLexer._LITERAL_NAMES, LGFileLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  ignoreWS = true;             // usually we ignore whitespace, but inside template, whitespace is significant
	  expectKeywords = false;        // whether we are expecting IF/ELSEIF/ELSE or Switch/Case/Default keywords


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(LGFileLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "LGFileLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return LGFileLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return LGFileLexer._serializedATN; }

	// @Override
	public get modeNames(): string[] { return LGFileLexer.modeNames; }

	// @Override
	public action(_localctx: RuleContext, ruleIndex: number, actionIndex: number): void {
		switch (ruleIndex) {
		case 20:
			this.DASH_action(_localctx, actionIndex);
			break;

		case 36:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 37:
			this.IF_action(_localctx, actionIndex);
			break;

		case 38:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 39:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 40:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 41:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 42:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 43:
			this.MULTI_LINE_TEXT_action(_localctx, actionIndex);
			break;

		case 44:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 45:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 46:
			this.TEMPLATE_REF_action(_localctx, actionIndex);
			break;

		case 47:
			this.TEXT_SEPARATOR_action(_localctx, actionIndex);
			break;

		case 48:
			this.TEXT_action(_localctx, actionIndex);
			break;
		}
	}
	private DASH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			this.expectKeywords = true;
			break;
		}
	}
	private NEWLINE_IN_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 1:
			this.ignoreWS = true;
			break;
		}
	}
	private IF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 2:
			 this.ignoreWS = true;
			break;
		}
	}
	private ELSEIF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 3:
			 this.ignoreWS = true;
			break;
		}
	}
	private ELSE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 4:
			 this.ignoreWS = true;
			break;
		}
	}
	private SWITCH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 5:
			this.ignoreWS = true;
			break;
		}
	}
	private CASE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 6:
			this.ignoreWS = true;
			break;
		}
	}
	private DEFAULT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 7:
			this.ignoreWS = true;
			break;
		}
	}
	private MULTI_LINE_TEXT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 8:
			 this.ignoreWS = false; this.expectKeywords = false;
			break;
		}
	}
	private ESCAPE_CHARACTER_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 9:
			 this.ignoreWS = false; this.expectKeywords = false;
			break;
		}
	}
	private EXPRESSION_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 10:
			 this.ignoreWS = false; this.expectKeywords = false;
			break;
		}
	}
	private TEMPLATE_REF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 11:
			 this.ignoreWS = false; this.expectKeywords = false;
			break;
		}
	}
	private TEXT_SEPARATOR_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 12:
			 this.ignoreWS = false; this.expectKeywords = false;
			break;
		}
	}
	private TEXT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 13:
			 this.ignoreWS = false; this.expectKeywords = false;
			break;
		}
	}
	// @Override
	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 34:
			return this.WS_IN_BODY_IGNORED_sempred(_localctx, predIndex);

		case 37:
			return this.IF_sempred(_localctx, predIndex);

		case 38:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 39:
			return this.ELSE_sempred(_localctx, predIndex);

		case 40:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 41:
			return this.CASE_sempred(_localctx, predIndex);

		case 42:
			return this.DEFAULT_sempred(_localctx, predIndex);
		}
		return true;
	}
	private WS_IN_BODY_IGNORED_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.ignoreWS;
		}
		return true;
	}
	private IF_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return this.expectKeywords;
		}
		return true;
	}
	private ELSEIF_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return this.expectKeywords;
		}
		return true;
	}
	private ELSE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return this.expectKeywords;
		}
		return true;
	}
	private SWITCH_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return this.expectKeywords;
		}
		return true;
	}
	private CASE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.expectKeywords;
		}
		return true;
	}
	private DEFAULT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return this.expectKeywords;
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02$\u01CC\b\x01" +
		"\b\x01\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t" +
		"\x05\x04\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t" +
		"\v\x04\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11" +
		"\t\x11\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16" +
		"\t\x16\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B" +
		"\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t" +
		" \x04!\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(" +
		"\x04)\t)\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041" +
		"\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x03\x02\x03\x02\x03\x03\x03" +
		"\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03" +
		"\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03" +
		"\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x11\x03\x11\x07\x11\x91" +
		"\n\x11\f\x11\x0E\x11\x94\v\x11\x03\x11\x03\x11\x03\x11\x07\x11\x99\n\x11" +
		"\f\x11\x0E\x11\x9C\v\x11\x03\x11\x05\x11\x9F\n\x11\x03\x12\x03\x12\x06" +
		"\x12\xA3\n\x12\r\x12\x0E\x12\xA4\x03\x12\x03\x12\x03\x13\x06\x13\xAA\n" +
		"\x13\r\x13\x0E\x13\xAB\x03\x13\x03\x13\x03\x14\x05\x14\xB1\n\x14\x03\x14" +
		"\x03\x14\x03\x15\x03\x15\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16" +
		"\x03\x16\x03\x17\x03\x17\x03\x17\x03\x17\x03\x18\x03\x18\x03\x19\x03\x19" +
		"\x07\x19\xC6\n\x19\f\x19\x0E\x19\xC9\v\x19\x03\x19\x03\x19\x03\x1A\x03" +
		"\x1A\x07\x1A\xCF\n\x1A\f\x1A\x0E\x1A\xD2\v\x1A\x03\x1A\x03\x1A\x03\x1B" +
		"\x03\x1B\x03\x1C\x06\x1C\xD9\n\x1C\r\x1C\x0E\x1C\xDA\x03\x1C\x03\x1C\x03" +
		"\x1D\x05\x1D\xE0\n\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1E" +
		"\x03\x1E\x03\x1E\x05\x1E\xEA\n\x1E\x03\x1E\x03\x1E\x03\x1E\x07\x1E\xEF" +
		"\n\x1E\f\x1E\x0E\x1E\xF2\v\x1E\x03\x1F\x03\x1F\x03 \x03 \x03!\x03!\x03" +
		"\"\x03\"\x03#\x06#\xFD\n#\r#\x0E#\xFE\x03$\x06$\u0102\n$\r$\x0E$\u0103" +
		"\x03$\x03$\x03$\x03$\x03%\x06%\u010B\n%\r%\x0E%\u010C\x03%\x03%\x03&\x05" +
		"&\u0112\n&\x03&\x03&\x03&\x03&\x03&\x03&\x03\'\x03\'\x03\'\x07\'\u011D" +
		"\n\'\f\'\x0E\'\u0120\v\'\x03\'\x03\'\x03\'\x03\'\x03(\x03(\x03(\x03(\x03" +
		"(\x03(\x03(\x07(\u012D\n(\f(\x0E(\u0130\v(\x03(\x03(\x03(\x03(\x03)\x03" +
		")\x03)\x03)\x03)\x07)\u013B\n)\f)\x0E)\u013E\v)\x03)\x03)\x03)\x03)\x03" +
		"*\x03*\x03*\x03*\x03*\x03*\x03*\x07*\u014B\n*\f*\x0E*\u014E\v*\x03*\x03" +
		"*\x03*\x03*\x03+\x03+\x03+\x03+\x03+\x07+\u0159\n+\f+\x0E+\u015C\v+\x03" +
		"+\x03+\x03+\x03+\x03,\x03,\x03,\x03,\x03,\x03,\x03,\x03,\x07,\u016A\n" +
		",\f,\x0E,\u016D\v,\x03,\x03,\x03,\x03,\x03-\x03-\x03-\x03-\x03-\x07-\u0178" +
		"\n-\f-\x0E-\u017B\v-\x03-\x03-\x03-\x03-\x03-\x03-\x03.\x03.\x03.\x03" +
		".\x03.\x03.\x03.\x03.\x03.\x05.\u018C\n.\x03/\x05/\u018F\n/\x03/\x03/" +
		"\x03/\x07/\u0194\n/\f/\x0E/\u0197\v/\x03/\x03/\x03/\x030\x030\x030\x07" +
		"0\u019F\n0\f0\x0E0\u01A2\v0\x030\x030\x030\x031\x031\x031\x032\x062\u01AB" +
		"\n2\r2\x0E2\u01AC\x032\x032\x033\x033\x073\u01B3\n3\f3\x0E3\u01B6\v3\x03" +
		"3\x053\u01B9\n3\x033\x033\x033\x033\x034\x054\u01C0\n4\x034\x034\x035" +
		"\x035\x035\x035\x036\x066\u01C9\n6\r6\x0E6\u01CA\b\xC7\xD0\xFE\u0179\u0195" +
		"\u01AC\x02\x027\x06\x02\x02\b\x02\x02\n\x02\x02\f\x02\x02\x0E\x02\x02" +
		"\x10\x02\x02\x12\x02\x02\x14\x02\x02\x16\x02\x02\x18\x02\x02\x1A\x02\x02" +
		"\x1C\x02\x02\x1E\x02\x02 \x02\x02\"\x02\x02$\x02\x02&\x02\x03(\x02\x04" +
		"*\x02\x05,\x02\x06.\x02\x070\x02\b2\x02\t4\x02\n6\x02\v8\x02\f:\x02\r" +
		"<\x02\x02>\x02\x0E@\x02\x0FB\x02\x10D\x02\x11F\x02\x12H\x02\x13J\x02\x14" +
		"L\x02\x02N\x02\x02P\x02\x15R\x02\x16T\x02\x17V\x02\x18X\x02\x19Z\x02\x1A" +
		"\\\x02\x1B^\x02\x1C`\x02\x1Db\x02\x1Ed\x02\x1Ff\x02 h\x02!j\x02\"l\x02" +
		"#n\x02$\x06\x02\x03\x04\x05\x19\x04\x02C\\c|\x06\x02\v\v\"\"\xA2\xA2\uFF01" +
		"\uFF01\x04\x02CCcc\x04\x02EEee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04" +
		"\x02JJjj\x04\x02KKkk\x04\x02NNnn\x04\x02UUuu\x04\x02VVvv\x04\x02WWww\x04" +
		"\x02YYyy\x05\x02\f\f\x0F\x0F))\x05\x02\f\f\x0F\x0F$$\x04\x02&&@@\x04\x02" +
		"\f\f\x0F\x0F\x04\x02//aa\x07\x02__ppttvv\x7F\x7F\x06\x02\f\f\x0F\x0F}" +
		"}\x7F\x7F\x05\x02\f\f\x0F\x0F__\t\x02\v\f\x0F\x0F*+]]__}}\x7F\x7F\u01DF" +
		"\x02&\x03\x02\x02\x02\x02(\x03\x02\x02\x02\x02*\x03\x02\x02\x02\x02,\x03" +
		"\x02\x02\x02\x02.\x03\x02\x02\x02\x020\x03\x02\x02\x02\x022\x03\x02\x02" +
		"\x02\x024\x03\x02\x02\x02\x026\x03\x02\x02\x02\x028\x03\x02\x02\x02\x03" +
		":\x03\x02\x02\x02\x03<\x03\x02\x02\x02\x03>\x03\x02\x02\x02\x03@\x03\x02" +
		"\x02\x02\x03B\x03\x02\x02\x02\x03D\x03\x02\x02\x02\x03F\x03\x02\x02\x02" +
		"\x03H\x03\x02\x02\x02\x04J\x03\x02\x02\x02\x04L\x03\x02\x02\x02\x04N\x03" +
		"\x02\x02\x02\x04P\x03\x02\x02\x02\x04R\x03\x02\x02\x02\x04T\x03\x02\x02" +
		"\x02\x04V\x03\x02\x02\x02\x04X\x03\x02\x02\x02\x04Z\x03\x02\x02\x02\x04" +
		"\\\x03\x02\x02\x02\x04^\x03\x02\x02\x02\x04`\x03\x02\x02\x02\x04b\x03" +
		"\x02\x02\x02\x04d\x03\x02\x02\x02\x04f\x03\x02\x02\x02\x05h\x03\x02\x02" +
		"\x02\x05j\x03\x02\x02\x02\x05l\x03\x02\x02\x02\x05n\x03\x02\x02\x02\x06" +
		"p\x03\x02\x02\x02\br\x03\x02\x02\x02\nt\x03\x02\x02\x02\fv\x03\x02\x02" +
		"\x02\x0Ex\x03\x02\x02\x02\x10z\x03\x02\x02\x02\x12|\x03\x02\x02\x02\x14" +
		"~\x03\x02\x02\x02\x16\x80\x03\x02\x02\x02\x18\x82\x03\x02\x02\x02\x1A" +
		"\x84\x03\x02\x02\x02\x1C\x86\x03\x02\x02\x02\x1E\x88\x03\x02\x02\x02 " +
		"\x8A\x03\x02\x02\x02\"\x8C\x03\x02\x02\x02$\x9E\x03\x02\x02\x02&\xA0\x03" +
		"\x02\x02\x02(\xA9\x03\x02\x02\x02*\xB0\x03\x02\x02\x02,\xB4\x03\x02\x02" +
		"\x02.\xB8\x03\x02\x02\x020\xBD\x03\x02\x02\x022\xC1\x03\x02\x02\x024\xC3" +
		"\x03\x02\x02\x026\xCC\x03\x02\x02\x028\xD5\x03\x02\x02\x02:\xD8\x03\x02" +
		"\x02\x02<\xDF\x03\x02\x02\x02>\xE9\x03\x02\x02\x02@\xF3\x03\x02\x02\x02" +
		"B\xF5\x03\x02\x02\x02D\xF7\x03\x02\x02\x02F\xF9\x03\x02\x02\x02H\xFC\x03" +
		"\x02\x02\x02J\u0101\x03\x02\x02\x02L\u010A\x03\x02\x02\x02N\u0111\x03" +
		"\x02\x02\x02P\u0119\x03\x02\x02\x02R\u0125\x03\x02\x02\x02T\u0135\x03" +
		"\x02\x02\x02V\u0143\x03\x02\x02\x02X\u0153\x03\x02\x02\x02Z\u0161\x03" +
		"\x02\x02\x02\\\u0172\x03\x02\x02\x02^\u018B\x03\x02\x02\x02`\u018E\x03" +
		"\x02\x02\x02b\u019B\x03\x02\x02\x02d\u01A6\x03\x02\x02\x02f\u01AA\x03" +
		"\x02\x02\x02h\u01B0\x03\x02\x02\x02j\u01BF\x03\x02\x02\x02l\u01C3\x03" +
		"\x02\x02\x02n\u01C8\x03\x02\x02\x02pq\t\x02\x02\x02q\x07\x03\x02\x02\x02" +
		"rs\x042;\x02s\t\x03\x02\x02\x02tu\t\x03\x02\x02u\v\x03\x02\x02\x02vw\t" +
		"\x04\x02\x02w\r\x03\x02\x02\x02xy\t\x05\x02\x02y\x0F\x03\x02\x02\x02z" +
		"{\t\x06\x02\x02{\x11\x03\x02\x02\x02|}\t\x07\x02\x02}\x13\x03\x02\x02" +
		"\x02~\x7F\t\b\x02\x02\x7F\x15\x03\x02\x02\x02\x80\x81\t\t\x02\x02\x81" +
		"\x17\x03\x02\x02\x02\x82\x83\t\n\x02\x02\x83\x19\x03\x02\x02\x02\x84\x85" +
		"\t\v\x02\x02\x85\x1B\x03\x02\x02\x02\x86\x87\t\f\x02\x02\x87\x1D\x03\x02" +
		"\x02\x02\x88\x89\t\r\x02\x02\x89\x1F\x03\x02\x02\x02\x8A\x8B\t\x0E\x02" +
		"\x02\x8B!\x03\x02\x02\x02\x8C\x8D\t\x0F\x02\x02\x8D#\x03\x02\x02\x02\x8E" +
		"\x92\x07)\x02\x02\x8F\x91\n\x10\x02\x02\x90\x8F\x03\x02\x02\x02\x91\x94" +
		"\x03\x02\x02\x02\x92\x90\x03\x02\x02\x02\x92\x93\x03\x02\x02\x02\x93\x95" +
		"\x03\x02\x02\x02\x94\x92\x03\x02\x02\x02\x95\x9F\x07)\x02\x02\x96\x9A" +
		"\x07$\x02\x02\x97\x99\n\x11\x02\x02\x98\x97\x03\x02\x02\x02\x99\x9C\x03" +
		"\x02\x02\x02\x9A\x98\x03\x02\x02\x02\x9A\x9B\x03\x02\x02\x02\x9B\x9D\x03" +
		"\x02\x02\x02\x9C\x9A\x03\x02\x02\x02\x9D\x9F\x07$\x02\x02\x9E\x8E\x03" +
		"\x02\x02\x02\x9E\x96\x03\x02\x02\x02\x9F%\x03\x02\x02\x02\xA0\xA2\t\x12" +
		"\x02\x02\xA1\xA3\n\x13\x02\x02\xA2\xA1\x03\x02\x02\x02\xA3\xA4\x03\x02" +
		"\x02\x02\xA4\xA2\x03\x02\x02\x02\xA4\xA5\x03\x02\x02\x02\xA5\xA6\x03\x02" +
		"\x02\x02\xA6\xA7\b\x12\x02\x02\xA7\'\x03\x02\x02\x02\xA8\xAA\x05\n\x04" +
		"\x02\xA9\xA8\x03\x02\x02\x02\xAA\xAB\x03\x02\x02\x02\xAB\xA9\x03\x02\x02" +
		"\x02\xAB\xAC\x03\x02\x02\x02\xAC\xAD\x03\x02\x02\x02\xAD\xAE\b\x13\x02" +
		"\x02\xAE)\x03\x02\x02\x02\xAF\xB1\x07\x0F\x02\x02\xB0\xAF\x03\x02\x02" +
		"\x02\xB0\xB1\x03\x02\x02\x02\xB1\xB2\x03\x02\x02\x02\xB2\xB3\x07\f\x02" +
		"\x02\xB3+\x03\x02\x02\x02\xB4\xB5\x07%\x02\x02\xB5\xB6\x03\x02\x02\x02" +
		"\xB6\xB7\b\x15\x03\x02\xB7-\x03\x02\x02\x02\xB8\xB9\x07/\x02\x02\xB9\xBA" +
		"\b\x16\x04\x02\xBA\xBB\x03\x02\x02\x02\xBB\xBC\b\x16\x05\x02\xBC/\x03" +
		"\x02\x02\x02\xBD\xBE\x07]\x02\x02\xBE\xBF\x03\x02\x02\x02\xBF\xC0\b\x17" +
		"\x06\x02\xC01\x03\x02\x02\x02\xC1\xC2\x07_\x02\x02\xC23\x03\x02\x02\x02" +
		"\xC3\xC7\x07]\x02\x02\xC4\xC6\n\x13\x02\x02\xC5\xC4\x03\x02\x02\x02\xC6" +
		"\xC9\x03\x02\x02\x02\xC7\xC8\x03\x02\x02\x02\xC7\xC5\x03\x02\x02\x02\xC8" +
		"\xCA\x03\x02\x02\x02\xC9\xC7\x03\x02\x02\x02\xCA\xCB\x07_\x02\x02\xCB" +
		"5\x03\x02\x02\x02\xCC\xD0\x07*\x02\x02\xCD\xCF\n\x13\x02\x02\xCE\xCD\x03" +
		"\x02\x02\x02\xCF\xD2\x03\x02\x02\x02\xD0\xD1\x03\x02\x02\x02\xD0\xCE\x03" +
		"\x02\x02\x02\xD1\xD3\x03\x02\x02\x02\xD2\xD0\x03\x02\x02\x02\xD3\xD4\x07" +
		"+\x02\x02\xD47\x03\x02\x02\x02\xD5\xD6\v\x02\x02\x02\xD69\x03\x02\x02" +
		"\x02\xD7\xD9\x05\n\x04\x02\xD8\xD7\x03\x02\x02\x02\xD9\xDA\x03\x02\x02" +
		"\x02\xDA\xD8\x03\x02\x02\x02\xDA\xDB\x03\x02\x02\x02\xDB\xDC\x03\x02\x02" +
		"\x02\xDC\xDD\b\x1C\x02\x02\xDD;\x03\x02\x02\x02\xDE\xE0\x07\x0F\x02\x02" +
		"\xDF\xDE\x03\x02\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0\xE1\x03\x02\x02\x02" +
		"\xE1\xE2\x07\f\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3\xE4\b\x1D\x07\x02\xE4" +
		"\xE5\b\x1D\b\x02\xE5=\x03\x02\x02\x02\xE6\xEA\x05\x06\x02\x02\xE7\xEA" +
		"\x05\b\x03\x02\xE8\xEA\x07a\x02\x02\xE9\xE6\x03\x02\x02\x02\xE9\xE7\x03" +
		"\x02\x02\x02\xE9\xE8\x03\x02\x02\x02\xEA\xF0\x03\x02\x02\x02\xEB\xEF\x05" +
		"\x06\x02\x02\xEC\xEF\x05\b\x03\x02\xED\xEF\t\x14\x02\x02\xEE\xEB\x03\x02" +
		"\x02\x02\xEE\xEC\x03\x02\x02\x02\xEE\xED\x03\x02\x02\x02\xEF\xF2\x03\x02" +
		"\x02\x02\xF0\xEE\x03\x02\x02\x02\xF0\xF1\x03\x02\x02\x02\xF1?\x03\x02" +
		"\x02\x02\xF2\xF0\x03\x02\x02\x02\xF3\xF4\x070\x02\x02\xF4A\x03\x02\x02" +
		"\x02\xF5\xF6\x07*\x02\x02\xF6C\x03\x02\x02\x02\xF7\xF8\x07+\x02\x02\xF8" +
		"E\x03\x02\x02\x02\xF9\xFA\x07.\x02\x02\xFAG\x03\x02\x02\x02\xFB\xFD\n" +
		"\x13\x02\x02\xFC\xFB\x03\x02\x02\x02\xFD\xFE\x03\x02\x02\x02\xFE\xFF\x03" +
		"\x02\x02\x02\xFE\xFC\x03\x02\x02\x02\xFFI\x03\x02\x02\x02\u0100\u0102" +
		"\x05\n\x04\x02\u0101\u0100\x03\x02\x02\x02\u0102\u0103\x03\x02\x02\x02" +
		"\u0103\u0101\x03\x02\x02\x02\u0103\u0104\x03\x02\x02\x02\u0104\u0105\x03" +
		"\x02\x02\x02\u0105\u0106\x06$\x02\x02\u0106\u0107\x03\x02\x02\x02\u0107" +
		"\u0108\b$\x02\x02\u0108K\x03\x02\x02\x02\u0109\u010B\x05\n\x04\x02\u010A" +
		"\u0109\x03\x02\x02\x02\u010B\u010C\x03\x02\x02\x02\u010C\u010A\x03\x02" +
		"\x02\x02\u010C\u010D\x03\x02\x02\x02\u010D\u010E\x03\x02\x02\x02\u010E" +
		"\u010F\b%\t\x02\u010FM\x03\x02\x02\x02\u0110\u0112\x07\x0F\x02\x02\u0111" +
		"\u0110\x03\x02\x02\x02\u0111\u0112\x03\x02\x02\x02\u0112\u0113\x03\x02" +
		"\x02\x02\u0113\u0114\x07\f\x02\x02\u0114\u0115\b&\n\x02\u0115\u0116\x03" +
		"\x02\x02\x02\u0116\u0117\b&\x07\x02\u0117\u0118\b&\b\x02\u0118O\x03\x02" +
		"\x02\x02\u0119\u011A\x05\x18\v\x02\u011A\u011E\x05\x14\t\x02\u011B\u011D" +
		"\x05\n\x04\x02\u011C\u011B\x03\x02\x02\x02\u011D\u0120\x03\x02\x02\x02" +
		"\u011E\u011C\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F\u0121\x03" +
		"\x02\x02\x02\u0120\u011E\x03\x02\x02\x02\u0121\u0122\x07<\x02\x02\u0122" +
		"\u0123\x06\'\x03\x02\u0123\u0124\b\'\v\x02\u0124Q\x03\x02\x02\x02\u0125" +
		"\u0126\x05\x12\b\x02\u0126\u0127\x05\x1A\f\x02\u0127\u0128\x05\x1C\r\x02" +
		"\u0128\u0129\x05\x12\b\x02\u0129\u012A\x05\x18\v\x02\u012A\u012E\x05\x14" +
		"\t\x02\u012B\u012D\x05\n\x04\x02\u012C\u012B\x03\x02\x02\x02\u012D\u0130" +
		"\x03\x02\x02\x02\u012E\u012C\x03\x02\x02\x02\u012E\u012F\x03\x02\x02\x02" +
		"\u012F\u0131\x03\x02\x02\x02\u0130\u012E\x03\x02\x02\x02\u0131\u0132\x07" +
		"<\x02\x02\u0132\u0133\x06(\x04\x02\u0133\u0134\b(\f\x02\u0134S\x03\x02" +
		"\x02\x02\u0135\u0136\x05\x12\b\x02\u0136\u0137\x05\x1A\f\x02\u0137\u0138" +
		"\x05\x1C\r\x02\u0138\u013C\x05\x12\b\x02\u0139\u013B\x05\n\x04\x02\u013A" +
		"\u0139\x03\x02\x02\x02\u013B\u013E\x03\x02\x02\x02\u013C\u013A\x03\x02" +
		"\x02\x02\u013C\u013D\x03\x02\x02\x02\u013D\u013F\x03\x02\x02\x02\u013E" +
		"\u013C\x03\x02\x02\x02\u013F\u0140\x07<\x02\x02\u0140\u0141\x06)\x05\x02" +
		"\u0141\u0142\b)\r\x02\u0142U\x03\x02\x02\x02\u0143\u0144\x05\x1C\r\x02" +
		"\u0144\u0145\x05\"\x10\x02\u0145\u0146\x05\x18\v\x02\u0146\u0147\x05\x1E" +
		"\x0E\x02\u0147\u0148\x05\x0E\x06\x02\u0148\u014C\x05\x16\n\x02\u0149\u014B" +
		"\x05\n\x04\x02\u014A\u0149\x03\x02\x02\x02\u014B\u014E\x03\x02\x02\x02" +
		"\u014C\u014A\x03\x02\x02\x02\u014C\u014D\x03\x02\x02\x02\u014D\u014F\x03" +
		"\x02\x02\x02\u014E\u014C\x03\x02\x02\x02\u014F\u0150\x07<\x02\x02\u0150" +
		"\u0151\x06*\x06\x02\u0151\u0152\b*\x0E\x02\u0152W\x03\x02\x02\x02\u0153" +
		"\u0154\x05\x0E\x06\x02\u0154\u0155\x05\f\x05\x02\u0155\u0156\x05\x1C\r" +
		"\x02\u0156\u015A\x05\x12\b\x02\u0157\u0159\x05\n\x04\x02\u0158\u0157\x03" +
		"\x02\x02\x02\u0159\u015C\x03\x02\x02\x02\u015A\u0158\x03\x02\x02\x02\u015A" +
		"\u015B\x03\x02\x02\x02\u015B\u015D\x03\x02\x02\x02\u015C\u015A\x03\x02" +
		"\x02\x02\u015D\u015E\x07<\x02\x02\u015E\u015F\x06+\x07\x02\u015F\u0160" +
		"\b+\x0F\x02\u0160Y\x03\x02\x02\x02\u0161\u0162\x05\x10\x07\x02\u0162\u0163" +
		"\x05\x12\b\x02\u0163\u0164\x05\x14\t\x02\u0164\u0165\x05\f\x05\x02\u0165" +
		"\u0166\x05 \x0F\x02\u0166\u0167\x05\x1A\f\x02\u0167\u016B\x05\x1E\x0E" +
		"\x02\u0168\u016A\x05\n\x04\x02\u0169\u0168\x03\x02\x02\x02\u016A\u016D" +
		"\x03\x02\x02\x02\u016B\u0169\x03\x02\x02\x02\u016B\u016C\x03\x02\x02\x02" +
		"\u016C\u016E\x03\x02\x02\x02\u016D\u016B\x03\x02\x02\x02\u016E\u016F\x07" +
		"<\x02\x02\u016F\u0170\x06,\b\x02\u0170\u0171\b,\x10\x02\u0171[\x03\x02" +
		"\x02\x02\u0172\u0173\x07b\x02\x02\u0173\u0174\x07b\x02\x02\u0174\u0175" +
		"\x07b\x02\x02\u0175\u0179\x03\x02\x02\x02\u0176\u0178\v\x02\x02\x02\u0177" +
		"\u0176\x03\x02\x02\x02\u0178\u017B\x03\x02\x02\x02\u0179\u017A\x03\x02" +
		"\x02\x02\u0179\u0177\x03\x02\x02\x02\u017A\u017C\x03\x02\x02\x02\u017B" +
		"\u0179\x03\x02\x02\x02\u017C\u017D\x07b\x02\x02\u017D\u017E\x07b\x02\x02" +
		"\u017E\u017F\x07b\x02\x02\u017F\u0180\x03\x02\x02\x02\u0180\u0181\b-\x11" +
		"\x02\u0181]\x03\x02\x02\x02\u0182\u0183\x07^\x02\x02\u0183\u018C\x07}" +
		"\x02\x02\u0184\u0185\x07^\x02\x02\u0185\u018C\x07]\x02\x02\u0186\u0187" +
		"\x07^\x02\x02\u0187\u018C\x07^\x02\x02\u0188\u0189\x07^\x02\x02\u0189" +
		"\u018A\t\x15\x02\x02\u018A\u018C\b.\x12\x02\u018B\u0182\x03\x02\x02\x02" +
		"\u018B\u0184\x03\x02\x02\x02\u018B\u0186\x03\x02\x02\x02\u018B\u0188\x03" +
		"\x02\x02\x02\u018C_\x03\x02\x02\x02\u018D\u018F\x07B\x02\x02\u018E\u018D" +
		"\x03\x02\x02\x02\u018E\u018F\x03\x02\x02\x02\u018F\u0190\x03\x02\x02\x02" +
		"\u0190\u0195\x07}\x02\x02\u0191\u0194\n\x16\x02\x02\u0192\u0194\x05$\x11" +
		"\x02\u0193\u0191\x03\x02\x02\x02\u0193\u0192\x03\x02\x02\x02\u0194\u0197" +
		"\x03\x02\x02\x02\u0195\u0196\x03\x02\x02\x02\u0195\u0193\x03\x02\x02\x02" +
		"\u0196\u0198\x03\x02\x02\x02\u0197\u0195\x03\x02\x02\x02\u0198\u0199\x07" +
		"\x7F\x02\x02\u0199\u019A\b/\x13\x02\u019Aa\x03\x02\x02\x02\u019B\u01A0" +
		"\x07]\x02\x02\u019C\u019F\n\x17\x02\x02\u019D\u019F\x05b0\x02\u019E\u019C" +
		"\x03\x02\x02\x02\u019E\u019D\x03\x02\x02\x02\u019F\u01A2\x03\x02\x02\x02" +
		"\u01A0\u019E\x03\x02\x02\x02\u01A0\u01A1\x03\x02\x02\x02\u01A1\u01A3\x03" +
		"\x02\x02\x02\u01A2\u01A0\x03\x02\x02\x02\u01A3\u01A4\x07_\x02\x02\u01A4" +
		"\u01A5\b0\x14\x02\u01A5c\x03\x02\x02\x02\u01A6\u01A7\t\x18\x02\x02\u01A7" +
		"\u01A8\b1\x15\x02\u01A8e\x03\x02\x02\x02\u01A9\u01AB\n\x18\x02\x02\u01AA" +
		"\u01A9\x03\x02\x02\x02\u01AB\u01AC\x03\x02\x02\x02\u01AC\u01AD\x03\x02" +
		"\x02\x02\u01AC\u01AA\x03\x02\x02\x02\u01AD\u01AE\x03\x02\x02\x02\u01AE" +
		"\u01AF\b2\x16\x02\u01AFg\x03\x02\x02\x02\u01B0\u01B4\t\x12\x02\x02\u01B1" +
		"\u01B3\n\x13\x02\x02\u01B2\u01B1\x03\x02\x02\x02\u01B3\u01B6\x03\x02\x02" +
		"\x02\u01B4\u01B2\x03\x02\x02\x02\u01B4\u01B5\x03\x02\x02\x02\u01B5\u01B8" +
		"\x03\x02\x02\x02\u01B6\u01B4\x03\x02\x02\x02\u01B7\u01B9\x07\x0F\x02\x02" +
		"\u01B8\u01B7\x03\x02\x02\x02\u01B8\u01B9\x03\x02\x02\x02\u01B9\u01BA\x03" +
		"\x02\x02\x02\u01BA\u01BB\x07\f\x02\x02\u01BB\u01BC\x03\x02\x02\x02\u01BC" +
		"\u01BD\b3\x02\x02\u01BDi\x03\x02\x02\x02\u01BE\u01C0\x07\x0F\x02\x02\u01BF" +
		"\u01BE\x03\x02\x02\x02\u01BF\u01C0\x03\x02\x02\x02\u01C0\u01C1\x03\x02" +
		"\x02\x02\u01C1\u01C2\x07\f\x02\x02\u01C2k\x03\x02\x02\x02\u01C3\u01C4" +
		"\x052\x18\x02\u01C4\u01C5\x03\x02\x02\x02\u01C5\u01C6\b5\b\x02\u01C6m" +
		"\x03\x02\x02\x02\u01C7\u01C9\n\x13\x02\x02\u01C8\u01C7\x03\x02\x02\x02" +
		"\u01C9\u01CA\x03\x02\x02\x02\u01CA\u01C8\x03\x02\x02\x02\u01CA\u01CB\x03" +
		"\x02\x02\x02\u01CBo\x03\x02\x02\x02)\x02\x03\x04\x05\x92\x9A\x9E\xA4\xAB" +
		"\xB0\xC7\xD0\xDA\xDF\xE9\xEE\xF0\xFE\u0103\u010C\u0111\u011E\u012E\u013C" +
		"\u014C\u015A\u016B\u0179\u018B\u018E\u0193\u0195\u019E\u01A0\u01AC\u01B4" +
		"\u01B8\u01BF\u01CA\x17\b\x02\x02\x07\x03\x02\x03\x16\x02\x07\x04\x02\x07" +
		"\x05\x02\t\x05\x02\x06\x02\x02\t\x04\x02\x03&\x03\x03\'\x04\x03(\x05\x03" +
		")\x06\x03*\x07\x03+\b\x03,\t\x03-\n\x03.\v\x03/\f\x030\r\x031\x0E\x03" +
		"2\x0F";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

