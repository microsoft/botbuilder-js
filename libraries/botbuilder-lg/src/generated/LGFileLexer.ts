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
	public static readonly WS_IN_STRUCTURED = 31;
	public static readonly STRUCTURED_COMMENTS = 32;
	public static readonly STRUCTURED_NEWLINE = 33;
	public static readonly STRUCTURED_TEMPLATE_BODY_END = 34;
	public static readonly STRUCTURED_CONTENT = 35;
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
		"WS_IN_STRUCTURED", "STRUCTURED_COMMENTS", "STRUCTURED_NEWLINE", "STRUCTURED_TEMPLATE_BODY_END", 
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
		"TEMPLATE_REF", "TEXT_SEPARATOR", "TEXT", "WS_IN_STRUCTURED", "STRUCTURED_COMMENTS", 
		"STRUCTURED_NEWLINE", "STRUCTURED_TEMPLATE_BODY_END", "STRUCTURED_CONTENT",
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
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02%\u01DF\b\x01" +
		"\b\x01\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t" +
		"\x05\x04\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t" +
		"\v\x04\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11" +
		"\t\x11\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16" +
		"\t\x16\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B" +
		"\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t" +
		" \x04!\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(" +
		"\x04)\t)\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041" +
		"\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x047\t7\x03\x02\x03\x02\x03" +
		"\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03" +
		"\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r" +
		"\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x11\x03\x11" +
		"\x07\x11\x93\n\x11\f\x11\x0E\x11\x96\v\x11\x03\x11\x03\x11\x03\x11\x07" +
		"\x11\x9B\n\x11\f\x11\x0E\x11\x9E\v\x11\x03\x11\x05\x11\xA1\n\x11\x03\x12" +
		"\x03\x12\x06\x12\xA5\n\x12\r\x12\x0E\x12\xA6\x03\x12\x05\x12\xAA\n\x12" +
		"\x03\x12\x03\x12\x03\x13\x06\x13\xAF\n\x13\r\x13\x0E\x13\xB0\x03\x13\x03" +
		"\x13\x03\x14\x05\x14\xB6\n\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15" +
		"\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x17\x03\x17\x03\x17" +
		"\x03\x17\x03\x18\x03\x18\x03\x19\x03\x19\x07\x19\xCB\n\x19\f\x19\x0E\x19" +
		"\xCE\v\x19\x03\x19\x03\x19\x03\x1A\x03\x1A\x07\x1A\xD4\n\x1A\f\x1A\x0E" +
		"\x1A\xD7\v\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1C\x06\x1C\xDE\n\x1C" +
		"\r\x1C\x0E\x1C\xDF\x03\x1C\x03\x1C\x03\x1D\x05\x1D\xE5\n\x1D\x03\x1D\x03" +
		"\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x05\x1E\xEF\n\x1E" +
		"\x03\x1E\x03\x1E\x03\x1E\x07\x1E\xF4\n\x1E\f\x1E\x0E\x1E\xF7\v\x1E\x03" +
		"\x1F\x03\x1F\x03 \x03 \x03!\x03!\x03\"\x03\"\x03#\x06#\u0102\n#\r#\x0E" +
		"#\u0103\x03$\x06$\u0107\n$\r$\x0E$\u0108\x03$\x03$\x03$\x03$\x03%\x06" +
		"%\u0110\n%\r%\x0E%\u0111\x03%\x03%\x03&\x05&\u0117\n&\x03&\x03&\x03&\x03" +
		"&\x03&\x03&\x03\'\x03\'\x03\'\x07\'\u0122\n\'\f\'\x0E\'\u0125\v\'\x03" +
		"\'\x03\'\x03\'\x03\'\x03(\x03(\x03(\x03(\x03(\x07(\u0130\n(\f(\x0E(\u0133" +
		"\v(\x03(\x03(\x03(\x07(\u0138\n(\f(\x0E(\u013B\v(\x03(\x03(\x03(\x03(" +
		"\x03)\x03)\x03)\x03)\x03)\x07)\u0146\n)\f)\x0E)\u0149\v)\x03)\x03)\x03" +
		")\x03)\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x07*\u0156\n*\f*\x0E*\u0159" +
		"\v*\x03*\x03*\x03*\x03*\x03+\x03+\x03+\x03+\x03+\x07+\u0164\n+\f+\x0E" +
		"+\u0167\v+\x03+\x03+\x03+\x03+\x03,\x03,\x03,\x03,\x03,\x03,\x03,\x03" +
		",\x07,\u0175\n,\f,\x0E,\u0178\v,\x03,\x03,\x03,\x03,\x03-\x03-\x03-\x03" +
		"-\x03-\x07-\u0183\n-\f-\x0E-\u0186\v-\x03-\x03-\x03-\x03-\x03-\x03-\x03" +
		".\x03.\x03.\x03.\x03.\x03.\x03.\x03.\x03.\x05.\u0197\n.\x03/\x05/\u019A" +
		"\n/\x03/\x03/\x03/\x07/\u019F\n/\f/\x0E/\u01A2\v/\x03/\x03/\x03/\x030" +
		"\x030\x030\x070\u01AA\n0\f0\x0E0\u01AD\v0\x030\x030\x030\x031\x031\x03" +
		"1\x032\x062\u01B6\n2\r2\x0E2\u01B7\x032\x032\x033\x063\u01BD\n3\r3\x0E" +
		"3\u01BE\x034\x034\x074\u01C3\n4\f4\x0E4\u01C6\v4\x034\x054\u01C9\n4\x03" +
		"4\x034\x034\x034\x035\x055\u01D0\n5\x035\x035\x036\x056\u01D5\n6\x036" +
		"\x036\x036\x036\x037\x067\u01DC\n7\r7\x0E7\u01DD\b\xCC\xD5\u0103\u0184" +
		"\u01A0\u01B7\x02\x028\x06\x02\x02\b\x02\x02\n\x02\x02\f\x02\x02\x0E\x02" +
		"\x02\x10\x02\x02\x12\x02\x02\x14\x02\x02\x16\x02\x02\x18\x02\x02\x1A\x02" +
		"\x02\x1C\x02\x02\x1E\x02\x02 \x02\x02\"\x02\x02$\x02\x02&\x02\x03(\x02" +
		"\x04*\x02\x05,\x02\x06.\x02\x070\x02\b2\x02\t4\x02\n6\x02\v8\x02\f:\x02" +
		"\r<\x02\x02>\x02\x0E@\x02\x0FB\x02\x10D\x02\x11F\x02\x12H\x02\x13J\x02" +
		"\x14L\x02\x02N\x02\x02P\x02\x15R\x02\x16T\x02\x17V\x02\x18X\x02\x19Z\x02" +
		"\x1A\\\x02\x1B^\x02\x1C`\x02\x1Db\x02\x1Ed\x02\x1Ff\x02 h\x02!j\x02\"" +
		"l\x02#n\x02$p\x02%\x06\x02\x03\x04\x05\x19\x04\x02C\\c|\x06\x02\v\v\"" +
		"\"\xA2\xA2\uFF01\uFF01\x04\x02CCcc\x04\x02EEee\x04\x02FFff\x04\x02GGg" +
		"g\x04\x02HHhh\x04\x02JJjj\x04\x02KKkk\x04\x02NNnn\x04\x02UUuu\x04\x02" +
		"VVvv\x04\x02WWww\x04\x02YYyy\x05\x02\f\f\x0F\x0F))\x05\x02\f\f\x0F\x0F" +
		"$$\x04\x02&&@@\x04\x02\f\f\x0F\x0F\x04\x02//aa\x07\x02__ppttvv\x7F\x7F" +
		"\b\x02\f\f\x0F\x0F$$))}}\x7F\x7F\x06\x02\f\f\x0F\x0F]]__\t\x02\v\f\x0F" +
		"\x0F*+]]__}}\x7F\x7F\u01F6\x02&\x03\x02\x02\x02\x02(\x03\x02\x02\x02\x02" +
		"*\x03\x02\x02\x02\x02,\x03\x02\x02\x02\x02.\x03\x02\x02\x02\x020\x03\x02" +
		"\x02\x02\x022\x03\x02\x02\x02\x024\x03\x02\x02\x02\x026\x03\x02\x02\x02" +
		"\x028\x03\x02\x02\x02\x03:\x03\x02\x02\x02\x03<\x03\x02\x02\x02\x03>\x03" +
		"\x02\x02\x02\x03@\x03\x02\x02\x02\x03B\x03\x02\x02\x02\x03D\x03\x02\x02" +
		"\x02\x03F\x03\x02\x02\x02\x03H\x03\x02\x02\x02\x04J\x03\x02\x02\x02\x04" +
		"L\x03\x02\x02\x02\x04N\x03\x02\x02\x02\x04P\x03\x02\x02\x02\x04R\x03\x02" +
		"\x02\x02\x04T\x03\x02\x02\x02\x04V\x03\x02\x02\x02\x04X\x03\x02\x02\x02" +
		"\x04Z\x03\x02\x02\x02\x04\\\x03\x02\x02\x02\x04^\x03\x02\x02\x02\x04`" +
		"\x03\x02\x02\x02\x04b\x03\x02\x02\x02\x04d\x03\x02\x02\x02\x04f\x03\x02" +
		"\x02\x02\x05h\x03\x02\x02\x02\x05j\x03\x02\x02\x02\x05l\x03\x02\x02\x02" +
		"\x05n\x03\x02\x02\x02\x05p\x03\x02\x02\x02\x06r\x03\x02\x02\x02\bt\x03" +
		"\x02\x02\x02\nv\x03\x02\x02\x02\fx\x03\x02\x02\x02\x0Ez\x03\x02\x02\x02" +
		"\x10|\x03\x02\x02\x02\x12~\x03\x02\x02\x02\x14\x80\x03\x02\x02\x02\x16" +
		"\x82\x03\x02\x02\x02\x18\x84\x03\x02\x02\x02\x1A\x86\x03\x02\x02\x02\x1C" +
		"\x88\x03\x02\x02\x02\x1E\x8A\x03\x02\x02\x02 \x8C\x03\x02\x02\x02\"\x8E" +
		"\x03\x02\x02\x02$\xA0\x03\x02\x02\x02&\xA2\x03\x02\x02\x02(\xAE\x03\x02" +
		"\x02\x02*\xB5\x03\x02\x02\x02,\xB9\x03\x02\x02\x02.\xBD\x03\x02\x02\x02" +
		"0\xC2\x03\x02\x02\x022\xC6\x03\x02\x02\x024\xC8\x03\x02\x02\x026\xD1\x03" +
		"\x02\x02\x028\xDA\x03\x02\x02\x02:\xDD\x03\x02\x02\x02<\xE4\x03\x02\x02" +
		"\x02>\xEE\x03\x02\x02\x02@\xF8\x03\x02\x02\x02B\xFA\x03\x02\x02\x02D\xFC" +
		"\x03\x02\x02\x02F\xFE\x03\x02\x02\x02H\u0101\x03\x02\x02\x02J\u0106\x03" +
		"\x02\x02\x02L\u010F\x03\x02\x02\x02N\u0116\x03\x02\x02\x02P\u011E\x03" +
		"\x02\x02\x02R\u012A\x03\x02\x02\x02T\u0140\x03\x02\x02\x02V\u014E\x03" +
		"\x02\x02\x02X\u015E\x03\x02\x02\x02Z\u016C\x03\x02\x02\x02\\\u017D\x03" +
		"\x02\x02\x02^\u0196\x03\x02\x02\x02`\u0199\x03\x02\x02\x02b\u01A6\x03" +
		"\x02\x02\x02d\u01B1\x03\x02\x02\x02f\u01B5\x03\x02\x02\x02h\u01BC\x03" +
		"\x02\x02\x02j\u01C0\x03\x02\x02\x02l\u01CF\x03\x02\x02\x02n\u01D4\x03" +
		"\x02\x02\x02p\u01DB\x03\x02\x02\x02rs\t\x02\x02\x02s\x07\x03\x02\x02\x02" +
		"tu\x042;\x02u\t\x03\x02\x02\x02vw\t\x03\x02\x02w\v\x03\x02\x02\x02xy\t" +
		"\x04\x02\x02y\r\x03\x02\x02\x02z{\t\x05\x02\x02{\x0F\x03\x02\x02\x02|" +
		"}\t\x06\x02\x02}\x11\x03\x02\x02\x02~\x7F\t\x07\x02\x02\x7F\x13\x03\x02" +
		"\x02\x02\x80\x81\t\b\x02\x02\x81\x15\x03\x02\x02\x02\x82\x83\t\t\x02\x02" +
		"\x83\x17\x03\x02\x02\x02\x84\x85\t\n\x02\x02\x85\x19\x03\x02\x02\x02\x86" +
		"\x87\t\v\x02\x02\x87\x1B\x03\x02\x02\x02\x88\x89\t\f\x02\x02\x89\x1D\x03" +
		"\x02\x02\x02\x8A\x8B\t\r\x02\x02\x8B\x1F\x03\x02\x02\x02\x8C\x8D\t\x0E" +
		"\x02\x02\x8D!\x03\x02\x02\x02\x8E\x8F\t\x0F\x02\x02\x8F#\x03\x02\x02\x02" +
		"\x90\x94\x07)\x02\x02\x91\x93\n\x10\x02\x02\x92\x91\x03\x02\x02\x02\x93" +
		"\x96\x03\x02\x02\x02\x94\x92\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02\x95" +
		"\x97\x03\x02\x02\x02\x96\x94\x03\x02\x02\x02\x97\xA1\x07)\x02\x02\x98" +
		"\x9C\x07$\x02\x02\x99\x9B\n\x11\x02\x02\x9A\x99\x03\x02\x02\x02\x9B\x9E" +
		"\x03\x02\x02\x02\x9C\x9A\x03\x02\x02\x02\x9C\x9D\x03\x02\x02\x02\x9D\x9F" +
		"\x03\x02\x02\x02\x9E\x9C\x03\x02\x02\x02\x9F\xA1\x07$\x02\x02\xA0\x90" +
		"\x03\x02\x02\x02\xA0\x98\x03\x02\x02\x02\xA1%\x03\x02\x02\x02\xA2\xA4" +
		"\t\x12\x02\x02\xA3\xA5\n\x13\x02\x02\xA4\xA3\x03\x02\x02\x02\xA5\xA6\x03" +
		"\x02\x02\x02\xA6\xA4\x03\x02\x02\x02\xA6\xA7\x03\x02\x02\x02\xA7\xA9\x03" +
		"\x02\x02\x02\xA8\xAA\x05*\x14\x02\xA9\xA8\x03\x02\x02\x02\xA9\xAA\x03" +
		"\x02\x02\x02\xAA\xAB\x03\x02\x02\x02\xAB\xAC\b\x12\x02\x02\xAC\'\x03\x02" +
		"\x02\x02\xAD\xAF\x05\n\x04\x02\xAE\xAD\x03\x02\x02\x02\xAF\xB0\x03\x02" +
		"\x02\x02\xB0\xAE\x03\x02\x02\x02\xB0\xB1\x03\x02\x02\x02\xB1\xB2\x03\x02" +
		"\x02\x02\xB2\xB3\b\x13\x02\x02\xB3)\x03\x02\x02\x02\xB4\xB6\x07\x0F\x02" +
		"\x02\xB5\xB4\x03\x02\x02\x02\xB5\xB6\x03\x02\x02\x02\xB6\xB7\x03\x02\x02" +
		"\x02\xB7\xB8\x07\f\x02\x02\xB8+\x03\x02\x02\x02\xB9\xBA\x07%\x02\x02\xBA" +
		"\xBB\x03\x02\x02\x02\xBB\xBC\b\x15\x03\x02\xBC-\x03\x02\x02\x02\xBD\xBE" +
		"\x07/\x02\x02\xBE\xBF\b\x16\x04\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC1\b" +
		"\x16\x05\x02\xC1/\x03\x02\x02\x02\xC2\xC3\x07]\x02\x02\xC3\xC4\x03\x02" +
		"\x02\x02\xC4\xC5\b\x17\x06\x02\xC51\x03\x02\x02\x02\xC6\xC7\x07_\x02\x02" +
		"\xC73\x03\x02\x02\x02\xC8\xCC\x07]\x02\x02\xC9\xCB\n\x13\x02\x02\xCA\xC9" +
		"\x03\x02\x02\x02\xCB\xCE\x03\x02\x02\x02\xCC\xCD\x03\x02\x02\x02\xCC\xCA" +
		"\x03\x02\x02\x02\xCD\xCF\x03\x02\x02\x02\xCE\xCC\x03\x02\x02\x02\xCF\xD0" +
		"\x07_\x02\x02\xD05\x03\x02\x02\x02\xD1\xD5\x07*\x02\x02\xD2\xD4\n\x13" +
		"\x02\x02\xD3\xD2\x03\x02\x02\x02\xD4\xD7\x03\x02\x02\x02\xD5\xD6\x03\x02" +
		"\x02\x02\xD5\xD3\x03\x02\x02\x02\xD6\xD8\x03\x02\x02\x02\xD7\xD5\x03\x02" +
		"\x02\x02\xD8\xD9\x07+\x02\x02\xD97\x03\x02\x02\x02\xDA\xDB\v\x02\x02\x02" +
		"\xDB9\x03\x02\x02\x02\xDC\xDE\x05\n\x04\x02\xDD\xDC\x03\x02\x02\x02\xDE" +
		"\xDF\x03\x02\x02\x02\xDF\xDD\x03\x02\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0" +
		"\xE1\x03\x02\x02\x02\xE1\xE2\b\x1C\x02\x02\xE2;\x03\x02\x02\x02\xE3\xE5" +
		"\x07\x0F\x02\x02\xE4\xE3\x03\x02\x02\x02\xE4\xE5\x03\x02\x02\x02\xE5\xE6" +
		"\x03\x02\x02\x02\xE6\xE7\x07\f\x02\x02\xE7\xE8\x03\x02\x02\x02\xE8\xE9" +
		"\b\x1D\x07\x02\xE9\xEA\b\x1D\b\x02\xEA=\x03\x02\x02\x02\xEB\xEF\x05\x06" +
		"\x02\x02\xEC\xEF\x05\b\x03\x02\xED\xEF\x07a\x02\x02\xEE\xEB\x03\x02\x02" +
		"\x02\xEE\xEC\x03\x02\x02\x02\xEE\xED\x03\x02\x02\x02\xEF\xF5\x03\x02\x02" +
		"\x02\xF0\xF4\x05\x06\x02\x02\xF1\xF4\x05\b\x03\x02\xF2\xF4\t\x14\x02\x02" +
		"\xF3\xF0\x03\x02\x02\x02\xF3\xF1\x03\x02\x02\x02\xF3\xF2\x03\x02\x02\x02" +
		"\xF4\xF7\x03\x02\x02\x02\xF5\xF3\x03\x02\x02\x02\xF5\xF6\x03\x02\x02\x02" +
		"\xF6?\x03\x02\x02\x02\xF7\xF5\x03\x02\x02\x02\xF8\xF9\x070\x02\x02\xF9" +
		"A\x03\x02\x02\x02\xFA\xFB\x07*\x02\x02\xFBC\x03\x02\x02\x02\xFC\xFD\x07" +
		"+\x02\x02\xFDE\x03\x02\x02\x02\xFE\xFF\x07.\x02\x02\xFFG\x03\x02\x02\x02" +
		"\u0100\u0102\n\x13\x02\x02\u0101\u0100\x03\x02\x02\x02\u0102\u0103\x03" +
		"\x02\x02\x02\u0103\u0104\x03\x02\x02\x02\u0103\u0101\x03\x02\x02\x02\u0104" +
		"I\x03\x02\x02\x02\u0105\u0107\x05\n\x04\x02\u0106\u0105\x03\x02\x02\x02" +
		"\u0107\u0108\x03\x02\x02\x02\u0108\u0106\x03\x02\x02\x02\u0108\u0109\x03" +
		"\x02\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A\u010B\x06$\x02\x02\u010B" +
		"\u010C\x03\x02\x02\x02\u010C\u010D\b$\x02\x02\u010DK\x03\x02\x02\x02\u010E" +
		"\u0110\x05\n\x04\x02\u010F\u010E\x03\x02\x02\x02\u0110\u0111\x03\x02\x02" +
		"\x02\u0111\u010F\x03\x02\x02\x02\u0111\u0112\x03\x02\x02\x02\u0112\u0113" +
		"\x03\x02\x02\x02\u0113\u0114\b%\t\x02\u0114M\x03\x02\x02\x02\u0115\u0117" +
		"\x07\x0F\x02\x02\u0116\u0115\x03\x02\x02\x02\u0116\u0117\x03\x02\x02\x02" +
		"\u0117\u0118\x03\x02\x02\x02\u0118\u0119\x07\f\x02\x02\u0119\u011A\b&" +
		"\n\x02\u011A\u011B\x03\x02\x02\x02\u011B\u011C\b&\x07\x02\u011C\u011D" +
		"\b&\b\x02\u011DO\x03\x02\x02\x02\u011E\u011F\x05\x18\v\x02\u011F\u0123" +
		"\x05\x14\t\x02\u0120\u0122\x05\n\x04\x02\u0121\u0120\x03\x02\x02\x02\u0122" +
		"\u0125\x03\x02\x02\x02\u0123\u0121\x03\x02\x02\x02\u0123\u0124\x03\x02" +
		"\x02\x02\u0124\u0126\x03\x02\x02\x02\u0125\u0123\x03\x02\x02\x02\u0126" +
		"\u0127\x07<\x02\x02\u0127\u0128\x06\'\x03\x02\u0128\u0129\b\'\v\x02\u0129" +
		"Q\x03\x02\x02\x02\u012A\u012B\x05\x12\b\x02\u012B\u012C\x05\x1A\f\x02" +
		"\u012C\u012D\x05\x1C\r\x02\u012D\u0131\x05\x12\b\x02\u012E\u0130\x05\n" +
		"\x04\x02\u012F\u012E\x03\x02\x02\x02\u0130\u0133\x03\x02\x02\x02\u0131" +
		"\u012F\x03\x02\x02\x02\u0131\u0132\x03\x02\x02\x02\u0132\u0134\x03\x02" +
		"\x02\x02\u0133\u0131\x03\x02\x02\x02\u0134\u0135\x05\x18\v\x02\u0135\u0139" +
		"\x05\x14\t\x02\u0136\u0138\x05\n\x04\x02\u0137\u0136\x03\x02\x02\x02\u0138" +
		"\u013B\x03\x02\x02\x02\u0139\u0137\x03\x02\x02\x02\u0139\u013A\x03\x02" +
		"\x02\x02\u013A\u013C\x03\x02\x02\x02\u013B\u0139\x03\x02\x02\x02\u013C" +
		"\u013D\x07<\x02\x02\u013D\u013E\x06(\x04\x02\u013E\u013F\b(\f\x02\u013F" +
		"S\x03\x02\x02\x02\u0140\u0141\x05\x12\b\x02\u0141\u0142\x05\x1A\f\x02" +
		"\u0142\u0143\x05\x1C\r\x02\u0143\u0147\x05\x12\b\x02\u0144\u0146\x05\n" +
		"\x04\x02\u0145\u0144\x03\x02\x02\x02\u0146\u0149\x03\x02\x02\x02\u0147" +
		"\u0145\x03\x02\x02\x02\u0147\u0148\x03\x02\x02\x02\u0148\u014A\x03\x02" +
		"\x02\x02\u0149\u0147\x03\x02\x02\x02\u014A\u014B\x07<\x02\x02\u014B\u014C" +
		"\x06)\x05\x02\u014C\u014D\b)\r\x02\u014DU\x03\x02\x02\x02\u014E\u014F" +
		"\x05\x1C\r\x02\u014F\u0150\x05\"\x10\x02\u0150\u0151\x05\x18\v\x02\u0151" +
		"\u0152\x05\x1E\x0E\x02\u0152\u0153\x05\x0E\x06\x02\u0153\u0157\x05\x16" +
		"\n\x02\u0154\u0156\x05\n\x04\x02\u0155\u0154\x03\x02\x02\x02\u0156\u0159" +
		"\x03\x02\x02\x02\u0157\u0155\x03\x02\x02\x02\u0157\u0158\x03\x02\x02\x02" +
		"\u0158\u015A\x03\x02\x02\x02\u0159\u0157\x03\x02\x02\x02\u015A\u015B\x07" +
		"<\x02\x02\u015B\u015C\x06*\x06\x02\u015C\u015D\b*\x0E\x02\u015DW\x03\x02" +
		"\x02\x02\u015E\u015F\x05\x0E\x06\x02\u015F\u0160\x05\f\x05\x02\u0160\u0161" +
		"\x05\x1C\r\x02\u0161\u0165\x05\x12\b\x02\u0162\u0164\x05\n\x04\x02\u0163" +
		"\u0162\x03\x02\x02\x02\u0164\u0167\x03\x02\x02\x02\u0165\u0163\x03\x02" +
		"\x02\x02\u0165\u0166\x03\x02\x02\x02\u0166\u0168\x03\x02\x02\x02\u0167" +
		"\u0165\x03\x02\x02\x02\u0168\u0169\x07<\x02\x02\u0169\u016A\x06+\x07\x02" +
		"\u016A\u016B\b+\x0F\x02\u016BY\x03\x02\x02\x02\u016C\u016D\x05\x10\x07" +
		"\x02\u016D\u016E\x05\x12\b\x02\u016E\u016F\x05\x14\t\x02\u016F\u0170\x05" +
		"\f\x05\x02\u0170\u0171\x05 \x0F\x02\u0171\u0172\x05\x1A\f\x02\u0172\u0176" +
		"\x05\x1E\x0E\x02\u0173\u0175\x05\n\x04\x02\u0174\u0173\x03\x02\x02\x02" +
		"\u0175\u0178\x03\x02\x02\x02\u0176\u0174\x03\x02\x02\x02\u0176\u0177\x03" +
		"\x02\x02\x02\u0177\u0179\x03\x02\x02\x02\u0178\u0176\x03\x02\x02\x02\u0179" +
		"\u017A\x07<\x02\x02\u017A\u017B\x06,\b\x02\u017B\u017C\b,\x10\x02\u017C" +
		"[\x03\x02\x02\x02\u017D\u017E\x07b\x02\x02\u017E\u017F\x07b\x02\x02\u017F" +
		"\u0180\x07b\x02\x02\u0180\u0184\x03\x02\x02\x02\u0181\u0183\v\x02\x02" +
		"\x02\u0182\u0181\x03\x02\x02\x02\u0183\u0186\x03\x02\x02\x02\u0184\u0185" +
		"\x03\x02\x02\x02\u0184\u0182\x03\x02\x02\x02\u0185\u0187\x03\x02\x02\x02" +
		"\u0186\u0184\x03\x02\x02\x02\u0187\u0188\x07b\x02\x02\u0188\u0189\x07" +
		"b\x02\x02\u0189\u018A\x07b\x02\x02\u018A\u018B\x03\x02\x02\x02\u018B\u018C" +
		"\b-\x11\x02\u018C]\x03\x02\x02\x02\u018D\u018E\x07^\x02\x02\u018E\u0197" +
		"\x07}\x02\x02\u018F\u0190\x07^\x02\x02\u0190\u0197\x07]\x02\x02\u0191" +
		"\u0192\x07^\x02\x02\u0192\u0197\x07^\x02\x02\u0193\u0194\x07^\x02\x02" +
		"\u0194\u0195\t\x15\x02\x02\u0195\u0197\b.\x12\x02\u0196\u018D\x03\x02" +
		"\x02\x02\u0196\u018F\x03\x02\x02\x02\u0196\u0191\x03\x02\x02\x02\u0196" +
		"\u0193\x03\x02\x02\x02\u0197_\x03\x02\x02\x02\u0198\u019A\x07B\x02\x02" +
		"\u0199\u0198\x03\x02\x02\x02\u0199\u019A\x03\x02\x02\x02\u019A\u019B\x03" +
		"\x02\x02\x02\u019B\u01A0\x07}\x02\x02\u019C\u019F\n\x16\x02\x02\u019D" +
		"\u019F\x05$\x11\x02\u019E\u019C\x03\x02\x02\x02\u019E\u019D\x03\x02\x02" +
		"\x02\u019F\u01A2\x03\x02\x02\x02\u01A0\u01A1\x03\x02\x02\x02\u01A0\u019E" +
		"\x03\x02\x02\x02\u01A1\u01A3\x03\x02\x02\x02\u01A2\u01A0\x03\x02\x02\x02" +
		"\u01A3\u01A4\x07\x7F\x02\x02\u01A4\u01A5\b/\x13\x02\u01A5a\x03\x02\x02" +
		"\x02\u01A6\u01AB\x07]\x02\x02\u01A7\u01AA\n\x17\x02\x02\u01A8\u01AA\x05" +
		"b0\x02\u01A9\u01A7\x03\x02\x02\x02\u01A9\u01A8\x03\x02\x02\x02\u01AA\u01AD" +
		"\x03\x02\x02\x02\u01AB\u01A9\x03\x02\x02\x02\u01AB\u01AC\x03\x02\x02\x02" +
		"\u01AC\u01AE\x03\x02\x02\x02\u01AD\u01AB\x03\x02\x02\x02\u01AE\u01AF\x07" +
		"_\x02\x02\u01AF\u01B0\b0\x14\x02\u01B0c\x03\x02\x02\x02\u01B1\u01B2\t" +
		"\x18\x02\x02\u01B2\u01B3\b1\x15\x02\u01B3e\x03\x02\x02\x02\u01B4\u01B6" +
		"\n\x18\x02\x02\u01B5\u01B4\x03\x02\x02\x02\u01B6\u01B7\x03\x02\x02\x02" +
		"\u01B7\u01B8\x03\x02\x02\x02\u01B7\u01B5\x03\x02\x02\x02\u01B8\u01B9\x03" +
		"\x02\x02\x02\u01B9\u01BA\b2\x16\x02\u01BAg\x03\x02\x02\x02\u01BB\u01BD" +
		"\x05\n\x04\x02\u01BC\u01BB\x03\x02\x02\x02\u01BD\u01BE\x03\x02\x02\x02" +
		"\u01BE\u01BC\x03\x02\x02\x02\u01BE\u01BF\x03\x02\x02\x02\u01BFi\x03\x02" +
		"\x02\x02\u01C0\u01C4\t\x12\x02\x02\u01C1\u01C3\n\x13\x02\x02\u01C2\u01C1" +
		"\x03\x02\x02\x02\u01C3\u01C6\x03\x02\x02\x02\u01C4\u01C2\x03\x02\x02\x02" +
		"\u01C4\u01C5\x03\x02\x02\x02\u01C5\u01C8\x03\x02\x02\x02\u01C6\u01C4\x03" +
		"\x02\x02\x02\u01C7\u01C9\x07\x0F\x02\x02\u01C8\u01C7\x03\x02\x02\x02\u01C8" +
		"\u01C9\x03\x02\x02\x02\u01C9\u01CA\x03\x02\x02\x02\u01CA\u01CB\x07\f\x02" +
		"\x02\u01CB\u01CC\x03\x02\x02\x02\u01CC\u01CD\b4\x02\x02\u01CDk\x03\x02" +
		"\x02\x02\u01CE\u01D0\x07\x0F\x02\x02\u01CF\u01CE\x03\x02\x02\x02\u01CF" +
		"\u01D0\x03\x02\x02\x02\u01D0\u01D1\x03\x02\x02\x02\u01D1\u01D2\x07\f\x02" +
		"\x02\u01D2m\x03\x02\x02\x02\u01D3\u01D5\x05h3\x02\u01D4\u01D3\x03\x02" +
		"\x02\x02\u01D4\u01D5\x03\x02\x02\x02\u01D5\u01D6\x03\x02\x02\x02\u01D6" +
		"\u01D7\x052\x18\x02\u01D7\u01D8\x03\x02\x02\x02\u01D8\u01D9\b6\b\x02\u01D9" +
		"o\x03\x02\x02\x02\u01DA\u01DC\n\x13\x02\x02\u01DB\u01DA\x03\x02\x02\x02" +
		"\u01DC\u01DD\x03\x02\x02\x02\u01DD\u01DB\x03\x02\x02\x02\u01DD\u01DE\x03" +
		"\x02\x02\x02\u01DEq\x03\x02\x02\x02-\x02\x03\x04\x05\x94\x9C\xA0\xA6\xA9" +
		"\xB0\xB5\xCC\xD5\xDF\xE4\xEE\xF3\xF5\u0103\u0108\u0111\u0116\u0123\u0131" +
		"\u0139\u0147\u0157\u0165\u0176\u0184\u0196\u0199\u019E\u01A0\u01A9\u01AB" +
		"\u01B7\u01BE\u01C4\u01C8\u01CF\u01D4\u01DD\x17\b\x02\x02\x07\x03\x02\x03" +
		"\x16\x02\x07\x04\x02\x07\x05\x02\t\x05\x02\x06\x02\x02\t\x04\x02\x03&" +
		"\x03\x03\'\x04\x03(\x05\x03)\x06\x03*\x07\x03+\b\x03,\t\x03-\n\x03.\v" +
		"\x03/\f\x030\r\x031\x0E\x032\x0F";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

