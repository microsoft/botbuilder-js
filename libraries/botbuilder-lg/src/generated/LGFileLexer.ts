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
	public static readonly INVALID_TOKEN_DEFAULT_MODE = 6;
	public static readonly WS_IN_NAME = 7;
	public static readonly IDENTIFIER = 8;
	public static readonly DOT = 9;
	public static readonly OPEN_PARENTHESIS = 10;
	public static readonly CLOSE_PARENTHESIS = 11;
	public static readonly COMMA = 12;
	public static readonly INVALID_SEPERATE_CHAR = 13;
	public static readonly WS_IN_BODY_IGNORED = 14;
	public static readonly IF = 15;
	public static readonly ELSEIF = 16;
	public static readonly ELSE = 17;
	public static readonly SWITCH = 18;
	public static readonly CASE = 19;
	public static readonly DEFAULT = 20;
	public static readonly MULTI_LINE_TEXT = 21;
	public static readonly ESCAPE_CHARACTER = 22;
	public static readonly INVALID_ESCAPE = 23;
	public static readonly EXPRESSION = 24;
	public static readonly TEMPLATE_REF = 25;
	public static readonly TEXT_SEPARATOR = 26;
	public static readonly TEXT = 27;
	public static readonly TEMPLATE_NAME_MODE = 1;
	public static readonly TEMPLATE_BODY_MODE = 2;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "TEMPLATE_NAME_MODE", "TEMPLATE_BODY_MODE",
	];

	public static readonly ruleNames: string[] = [
		"LETTER", "NUMBER", "WHITESPACE", "A", "C", "D", "E", "F", "H", "I", "L", 
		"S", "T", "U", "W", "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "INVALID_TOKEN_DEFAULT_MODE", 
		"WS_IN_NAME", "NEWLINE_IN_NAME", "IDENTIFIER", "DOT", "OPEN_PARENTHESIS", 
		"CLOSE_PARENTHESIS", "COMMA", "INVALID_SEPERATE_CHAR", "WS_IN_BODY_IGNORED", 
		"WS_IN_BODY", "NEWLINE_IN_BODY", "IF", "ELSEIF", "ELSE", "SWITCH", "CASE", 
		"DEFAULT", "MULTI_LINE_TEXT", "ESCAPE_CHARACTER", "INVALID_ESCAPE", "EXPRESSION", 
		"TEMPLATE_REF", "TEXT_SEPARATOR", "TEXT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, "'#'", undefined, undefined, 
		undefined, undefined, "'.'", "'('", "')'", "','",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "INVALID_TOKEN_DEFAULT_MODE", 
		"WS_IN_NAME", "IDENTIFIER", "DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", 
		"COMMA", "INVALID_SEPERATE_CHAR", "WS_IN_BODY_IGNORED", "IF", "ELSEIF", 
		"ELSE", "SWITCH", "CASE", "DEFAULT", "MULTI_LINE_TEXT", "ESCAPE_CHARACTER", 
		"INVALID_ESCAPE", "EXPRESSION", "TEMPLATE_REF", "TEXT_SEPARATOR", "TEXT",
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
		case 19:
			this.DASH_action(_localctx, actionIndex);
			break;

		case 31:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 32:
			this.IF_action(_localctx, actionIndex);
			break;

		case 33:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 34:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 35:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 36:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 37:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 38:
			this.MULTI_LINE_TEXT_action(_localctx, actionIndex);
			break;

		case 39:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 41:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 42:
			this.TEMPLATE_REF_action(_localctx, actionIndex);
			break;

		case 43:
			this.TEXT_SEPARATOR_action(_localctx, actionIndex);
			break;

		case 44:
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
		case 29:
			return this.WS_IN_BODY_IGNORED_sempred(_localctx, predIndex);

		case 32:
			return this.IF_sempred(_localctx, predIndex);

		case 33:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 34:
			return this.ELSE_sempred(_localctx, predIndex);

		case 35:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 36:
			return this.CASE_sempred(_localctx, predIndex);

		case 37:
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
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\x1D\u0177\b\x01" +
		"\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04" +
		"\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f" +
		"\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11" +
		"\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16" +
		"\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B" +
		"\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!" +
		"\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t" +
		")\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x03\x02\x03\x02\x03\x03\x03" +
		"\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03" +
		"\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03" +
		"\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x11\x03\x11\x06\x11\x80" +
		"\n\x11\r\x11\x0E\x11\x81\x03\x11\x03\x11\x03\x12\x06\x12\x87\n\x12\r\x12" +
		"\x0E\x12\x88\x03\x12\x03\x12\x03\x13\x05\x13\x8E\n\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15" +
		"\x03\x15\x03\x15\x03\x16\x03\x16\x03\x17\x06\x17\xA0\n\x17\r\x17\x0E\x17" +
		"\xA1\x03\x17\x03\x17\x03\x18\x05\x18\xA7\n\x18\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x05\x19\xB1\n\x19\x03\x19\x03" +
		"\x19\x03\x19\x07\x19\xB6\n\x19\f\x19\x0E\x19\xB9\v\x19\x03\x1A\x03\x1A" +
		"\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1F" +
		"\x06\x1F\xC6\n\x1F\r\x1F\x0E\x1F\xC7\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03" +
		" \x06 \xCF\n \r \x0E \xD0\x03 \x03 \x03!\x05!\xD6\n!\x03!\x03!\x03!\x03" +
		"!\x03!\x03!\x03\"\x03\"\x03\"\x07\"\xE1\n\"\f\"\x0E\"\xE4\v\"\x03\"\x03" +
		"\"\x03\"\x03\"\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x07#\xF1\n#\f#\x0E#" +
		"\xF4\v#\x03#\x03#\x03#\x03#\x03$\x03$\x03$\x03$\x03$\x07$\xFF\n$\f$\x0E" +
		"$\u0102\v$\x03$\x03$\x03$\x03$\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x07" +
		"%\u010F\n%\f%\x0E%\u0112\v%\x03%\x03%\x03%\x03%\x03&\x03&\x03&\x03&\x03" +
		"&\x07&\u011D\n&\f&\x0E&\u0120\v&\x03&\x03&\x03&\x03&\x03\'\x03\'\x03\'" +
		"\x03\'\x03\'\x03\'\x03\'\x03\'\x07\'\u012E\n\'\f\'\x0E\'\u0131\v\'\x03" +
		"\'\x03\'\x03\'\x03\'\x03(\x03(\x03(\x03(\x03(\x07(\u013C\n(\f(\x0E(\u013F" +
		"\v(\x03(\x03(\x03(\x03(\x03(\x03(\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x03" +
		")\x03)\x05)\u0150\n)\x03*\x03*\x05*\u0154\n*\x03+\x05+\u0157\n+\x03+\x03" +
		"+\x07+\u015B\n+\f+\x0E+\u015E\v+\x03+\x03+\x03+\x03,\x03,\x03,\x07,\u0166" +
		"\n,\f,\x0E,\u0169\v,\x03,\x03,\x03,\x03-\x03-\x03-\x03.\x06.\u0172\n." +
		"\r.\x0E.\u0173\x03.\x03.\x03\u013D\x02\x02/\x05\x02\x02\x07\x02\x02\t" +
		"\x02\x02\v\x02\x02\r\x02\x02\x0F\x02\x02\x11\x02\x02\x13\x02\x02\x15\x02" +
		"\x02\x17\x02\x02\x19\x02\x02\x1B\x02\x02\x1D\x02\x02\x1F\x02\x02!\x02" +
		"\x02#\x02\x03%\x02\x04\'\x02\x05)\x02\x06+\x02\x07-\x02\b/\x02\t1\x02" +
		"\x023\x02\n5\x02\v7\x02\f9\x02\r;\x02\x0E=\x02\x0F?\x02\x10A\x02\x02C" +
		"\x02\x02E\x02\x11G\x02\x12I\x02\x13K\x02\x14M\x02\x15O\x02\x16Q\x02\x17" +
		"S\x02\x18U\x02\x19W\x02\x1AY\x02\x1B[\x02\x1C]\x02\x1D\x05\x02\x03\x04" +
		"\x19\x04\x02C\\c|\x06\x02\v\v\"\"\xA2\xA2\uFF01\uFF01\x04\x02CCcc\x04" +
		"\x02EEee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04\x02JJjj\x04\x02KKkk\x04" +
		"\x02NNnn\x04\x02UUuu\x04\x02VVvv\x04\x02WWww\x04\x02YYyy\x04\x02&&@@\x04" +
		"\x02\f\f\x0F\x0F\x04\x02//aa\x03\x02==\x07\x02__ppttvv\x7F\x7F\x06\x02" +
		"\f\f\x0F\x0F}}\x7F\x7F\x05\x02\f\f\x0F\x0F__\n\x02\v\f\x0F\x0F\"\"*+]" +
		"]__}}\x7F\x7F\t\x02\v\f\x0F\x0F\"\"*+]_}}\x7F\x7F\u0182\x02#\x03\x02\x02" +
		"\x02\x02%\x03\x02\x02\x02\x02\'\x03\x02\x02\x02\x02)\x03\x02\x02\x02\x02" +
		"+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x03/\x03\x02\x02\x02\x031\x03\x02" +
		"\x02\x02\x033\x03\x02\x02\x02\x035\x03\x02\x02\x02\x037\x03\x02\x02\x02" +
		"\x039\x03\x02\x02\x02\x03;\x03\x02\x02\x02\x03=\x03\x02\x02\x02\x04?\x03" +
		"\x02\x02\x02\x04A\x03\x02\x02\x02\x04C\x03\x02\x02\x02\x04E\x03\x02\x02" +
		"\x02\x04G\x03\x02\x02\x02\x04I\x03\x02\x02\x02\x04K\x03\x02\x02\x02\x04" +
		"M\x03\x02\x02\x02\x04O\x03\x02\x02\x02\x04Q\x03\x02\x02\x02\x04S\x03\x02" +
		"\x02\x02\x04U\x03\x02\x02\x02\x04W\x03\x02\x02\x02\x04Y\x03\x02\x02\x02" +
		"\x04[\x03\x02\x02\x02\x04]\x03\x02\x02\x02\x05_\x03\x02\x02\x02\x07a\x03" +
		"\x02\x02\x02\tc\x03\x02\x02\x02\ve\x03\x02\x02\x02\rg\x03\x02\x02\x02" +
		"\x0Fi\x03\x02\x02\x02\x11k\x03\x02\x02\x02\x13m\x03\x02\x02\x02\x15o\x03" +
		"\x02\x02\x02\x17q\x03\x02\x02\x02\x19s\x03\x02\x02\x02\x1Bu\x03\x02\x02" +
		"\x02\x1Dw\x03\x02\x02\x02\x1Fy\x03\x02\x02\x02!{\x03\x02\x02\x02#}\x03" +
		"\x02\x02\x02%\x86\x03\x02\x02\x02\'\x8D\x03\x02\x02\x02)\x93\x03\x02\x02" +
		"\x02+\x97\x03\x02\x02\x02-\x9C\x03\x02\x02\x02/\x9F\x03\x02\x02\x021\xA6" +
		"\x03\x02\x02\x023\xB0\x03\x02\x02\x025\xBA\x03\x02\x02\x027\xBC\x03\x02" +
		"\x02\x029\xBE\x03\x02\x02\x02;\xC0\x03\x02\x02\x02=\xC2\x03\x02\x02\x02" +
		"?\xC5\x03\x02\x02\x02A\xCE\x03\x02\x02\x02C\xD5\x03\x02\x02\x02E\xDD\x03" +
		"\x02\x02\x02G\xE9\x03\x02\x02\x02I\xF9\x03\x02\x02\x02K\u0107\x03\x02" +
		"\x02\x02M\u0117\x03\x02\x02\x02O\u0125\x03\x02\x02\x02Q\u0136\x03\x02" +
		"\x02\x02S\u014F\x03\x02\x02\x02U\u0151\x03\x02\x02\x02W\u0156\x03\x02" +
		"\x02\x02Y\u0162\x03\x02\x02\x02[\u016D\x03\x02\x02\x02]\u0171\x03\x02" +
		"\x02\x02_`\t\x02\x02\x02`\x06\x03\x02\x02\x02ab\x042;\x02b\b\x03\x02\x02" +
		"\x02cd\t\x03\x02\x02d\n\x03\x02\x02\x02ef\t\x04\x02\x02f\f\x03\x02\x02" +
		"\x02gh\t\x05\x02\x02h\x0E\x03\x02\x02\x02ij\t\x06\x02\x02j\x10\x03\x02" +
		"\x02\x02kl\t\x07\x02\x02l\x12\x03\x02\x02\x02mn\t\b\x02\x02n\x14\x03\x02" +
		"\x02\x02op\t\t\x02\x02p\x16\x03\x02\x02\x02qr\t\n\x02\x02r\x18\x03\x02" +
		"\x02\x02st\t\v\x02\x02t\x1A\x03\x02\x02\x02uv\t\f\x02\x02v\x1C\x03\x02" +
		"\x02\x02wx\t\r\x02\x02x\x1E\x03\x02\x02\x02yz\t\x0E\x02\x02z \x03\x02" +
		"\x02\x02{|\t\x0F\x02\x02|\"\x03\x02\x02\x02}\x7F\t\x10\x02\x02~\x80\n" +
		"\x11\x02\x02\x7F~\x03\x02\x02\x02\x80\x81\x03\x02\x02\x02\x81\x7F\x03" +
		"\x02\x02\x02\x81\x82\x03\x02\x02\x02\x82\x83\x03\x02\x02\x02\x83\x84\b" +
		"\x11\x02\x02\x84$\x03\x02\x02\x02\x85\x87\x05\t\x04\x02\x86\x85\x03\x02" +
		"\x02\x02\x87\x88\x03\x02\x02\x02\x88\x86\x03\x02\x02\x02\x88\x89\x03\x02" +
		"\x02\x02\x89\x8A\x03\x02\x02\x02\x8A\x8B\b\x12\x02\x02\x8B&\x03\x02\x02" +
		"\x02\x8C\x8E\x07\x0F\x02\x02\x8D\x8C\x03\x02\x02\x02\x8D\x8E\x03\x02\x02" +
		"\x02\x8E\x8F\x03\x02\x02\x02\x8F\x90\x07\f\x02\x02\x90\x91\x03\x02\x02" +
		"\x02\x91\x92\b\x13\x02\x02\x92(\x03\x02\x02\x02\x93\x94\x07%\x02\x02\x94" +
		"\x95\x03\x02\x02\x02\x95\x96\b\x14\x03\x02\x96*\x03\x02\x02\x02\x97\x98" +
		"\x07/\x02\x02\x98\x99\b\x15\x04\x02\x99\x9A\x03\x02\x02\x02\x9A\x9B\b" +
		"\x15\x05\x02\x9B,\x03\x02\x02\x02\x9C\x9D\v\x02\x02\x02\x9D.\x03\x02\x02" +
		"\x02\x9E\xA0\x05\t\x04\x02\x9F\x9E\x03\x02\x02\x02\xA0\xA1\x03\x02\x02" +
		"\x02\xA1\x9F\x03\x02\x02\x02\xA1\xA2\x03\x02\x02\x02\xA2\xA3\x03\x02\x02" +
		"\x02\xA3\xA4\b\x17\x02\x02\xA40\x03\x02\x02\x02\xA5\xA7\x07\x0F\x02\x02" +
		"\xA6\xA5\x03\x02\x02\x02\xA6\xA7\x03\x02\x02\x02\xA7\xA8\x03\x02\x02\x02" +
		"\xA8\xA9\x07\f\x02\x02\xA9\xAA\x03\x02\x02\x02\xAA\xAB\b\x18\x06\x02\xAB" +
		"\xAC\b\x18\x07\x02\xAC2\x03\x02\x02\x02\xAD\xB1\x05\x05\x02\x02\xAE\xB1" +
		"\x05\x07\x03\x02\xAF\xB1\x07a\x02\x02\xB0\xAD\x03\x02\x02\x02\xB0\xAE" +
		"\x03\x02\x02\x02\xB0\xAF\x03\x02\x02\x02\xB1\xB7\x03\x02\x02\x02\xB2\xB6" +
		"\x05\x05\x02\x02\xB3\xB6\x05\x07\x03\x02\xB4\xB6\t\x12\x02\x02\xB5\xB2" +
		"\x03\x02\x02\x02\xB5\xB3\x03\x02\x02\x02\xB5\xB4\x03\x02\x02\x02\xB6\xB9" +
		"\x03\x02\x02\x02\xB7\xB5\x03\x02\x02\x02\xB7\xB8\x03\x02\x02\x02\xB84" +
		"\x03\x02\x02\x02\xB9\xB7\x03\x02\x02\x02\xBA\xBB\x070\x02\x02\xBB6\x03" +
		"\x02\x02\x02\xBC\xBD\x07*\x02\x02\xBD8\x03\x02\x02\x02\xBE\xBF\x07+\x02" +
		"\x02\xBF:\x03\x02\x02\x02\xC0\xC1\x07.\x02\x02\xC1<\x03\x02\x02\x02\xC2" +
		"\xC3\t\x13\x02\x02\xC3>\x03\x02\x02\x02\xC4\xC6\x05\t\x04\x02\xC5\xC4" +
		"\x03\x02\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7\xC5\x03\x02\x02\x02\xC7\xC8" +
		"\x03\x02\x02\x02\xC8\xC9\x03\x02\x02\x02\xC9\xCA\x06\x1F\x02\x02\xCA\xCB" +
		"\x03\x02\x02\x02\xCB\xCC\b\x1F\x02\x02\xCC@\x03\x02\x02\x02\xCD\xCF\x05" +
		"\t\x04\x02\xCE\xCD\x03\x02\x02\x02\xCF\xD0\x03\x02\x02\x02\xD0\xCE\x03" +
		"\x02\x02\x02\xD0\xD1\x03\x02\x02\x02\xD1\xD2\x03\x02\x02\x02\xD2\xD3\b" +
		" \b\x02\xD3B\x03\x02\x02\x02\xD4\xD6\x07\x0F\x02\x02\xD5\xD4\x03\x02\x02" +
		"\x02\xD5\xD6\x03\x02\x02\x02\xD6\xD7\x03\x02\x02\x02\xD7\xD8\x07\f\x02" +
		"\x02\xD8\xD9\b!\t\x02\xD9\xDA\x03\x02\x02\x02\xDA\xDB\b!\x06\x02\xDB\xDC" +
		"\b!\x07\x02\xDCD\x03\x02\x02\x02\xDD\xDE\x05\x17\v\x02\xDE\xE2\x05\x13" +
		"\t\x02\xDF\xE1\x05\t\x04\x02\xE0\xDF\x03\x02\x02\x02\xE1\xE4\x03\x02\x02" +
		"\x02\xE2\xE0\x03\x02\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3\xE5\x03\x02\x02" +
		"\x02\xE4\xE2\x03\x02\x02\x02\xE5\xE6\x07<\x02\x02\xE6\xE7\x06\"\x03\x02" +
		"\xE7\xE8\b\"\n\x02\xE8F\x03\x02\x02\x02\xE9\xEA\x05\x11\b\x02\xEA\xEB" +
		"\x05\x19\f\x02\xEB\xEC\x05\x1B\r\x02\xEC\xED\x05\x11\b\x02\xED\xEE\x05" +
		"\x17\v\x02\xEE\xF2\x05\x13\t\x02\xEF\xF1\x05\t\x04\x02\xF0\xEF\x03\x02" +
		"\x02\x02\xF1\xF4\x03\x02\x02\x02\xF2\xF0\x03\x02\x02\x02\xF2\xF3\x03\x02" +
		"\x02\x02\xF3\xF5\x03\x02\x02\x02\xF4\xF2\x03\x02\x02\x02\xF5\xF6\x07<" +
		"\x02\x02\xF6\xF7\x06#\x04\x02\xF7\xF8\b#\v\x02\xF8H\x03\x02\x02\x02\xF9" +
		"\xFA\x05\x11\b\x02\xFA\xFB\x05\x19\f\x02\xFB\xFC\x05\x1B\r\x02\xFC\u0100" +
		"\x05\x11\b\x02\xFD\xFF\x05\t\x04\x02\xFE\xFD\x03\x02\x02\x02\xFF\u0102" +
		"\x03\x02\x02\x02\u0100\xFE\x03\x02\x02\x02\u0100\u0101\x03\x02\x02\x02" +
		"\u0101\u0103\x03\x02\x02\x02\u0102\u0100\x03\x02\x02\x02\u0103\u0104\x07" +
		"<\x02\x02\u0104\u0105\x06$\x05\x02\u0105\u0106\b$\f\x02\u0106J\x03\x02" +
		"\x02\x02\u0107\u0108\x05\x1B\r\x02\u0108\u0109\x05!\x10\x02\u0109\u010A" +
		"\x05\x17\v\x02\u010A\u010B\x05\x1D\x0E\x02\u010B\u010C\x05\r\x06\x02\u010C" +
		"\u0110\x05\x15\n\x02\u010D\u010F\x05\t\x04\x02\u010E\u010D\x03\x02\x02" +
		"\x02\u010F\u0112\x03\x02\x02\x02\u0110\u010E\x03\x02\x02\x02\u0110\u0111" +
		"\x03\x02\x02\x02\u0111\u0113\x03\x02\x02\x02\u0112\u0110\x03\x02\x02\x02" +
		"\u0113\u0114\x07<\x02\x02\u0114\u0115\x06%\x06\x02\u0115\u0116\b%\r\x02" +
		"\u0116L\x03\x02\x02\x02\u0117\u0118\x05\r\x06\x02\u0118\u0119\x05\v\x05" +
		"\x02\u0119\u011A\x05\x1B\r\x02\u011A\u011E\x05\x11\b\x02\u011B\u011D\x05" +
		"\t\x04\x02\u011C\u011B\x03\x02\x02\x02\u011D\u0120\x03\x02\x02\x02\u011E" +
		"\u011C\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F\u0121\x03\x02" +
		"\x02\x02\u0120\u011E\x03\x02\x02\x02\u0121\u0122\x07<\x02\x02\u0122\u0123" +
		"\x06&\x07\x02\u0123\u0124\b&\x0E\x02\u0124N\x03\x02\x02\x02\u0125\u0126" +
		"\x05\x0F\x07\x02\u0126\u0127\x05\x11\b\x02\u0127\u0128\x05\x13\t\x02\u0128" +
		"\u0129\x05\v\x05\x02\u0129\u012A\x05\x1F\x0F\x02\u012A\u012B\x05\x19\f" +
		"\x02\u012B\u012F\x05\x1D\x0E\x02\u012C\u012E\x05\t\x04\x02\u012D\u012C" +
		"\x03\x02\x02\x02\u012E\u0131\x03\x02\x02\x02\u012F\u012D\x03\x02\x02\x02" +
		"\u012F\u0130\x03\x02\x02\x02\u0130\u0132\x03\x02\x02\x02\u0131\u012F\x03" +
		"\x02\x02\x02\u0132\u0133\x07<\x02\x02\u0133\u0134\x06\'\b\x02\u0134\u0135" +
		"\b\'\x0F\x02\u0135P\x03\x02\x02\x02\u0136\u0137\x07b\x02\x02\u0137\u0138" +
		"\x07b\x02\x02\u0138\u0139\x07b\x02\x02\u0139\u013D\x03\x02\x02\x02\u013A" +
		"\u013C\v\x02\x02\x02\u013B\u013A\x03\x02\x02\x02\u013C\u013F\x03\x02\x02" +
		"\x02\u013D\u013E\x03\x02\x02\x02\u013D\u013B\x03\x02\x02\x02\u013E\u0140" +
		"\x03\x02\x02\x02\u013F\u013D\x03\x02\x02\x02\u0140\u0141\x07b\x02\x02" +
		"\u0141\u0142\x07b\x02\x02\u0142\u0143\x07b\x02\x02\u0143\u0144\x03\x02" +
		"\x02\x02\u0144\u0145\b(\x10\x02\u0145R\x03\x02\x02\x02\u0146\u0147\x07" +
		"^\x02\x02\u0147\u0150\x07}\x02\x02\u0148\u0149\x07^\x02\x02\u0149\u0150" +
		"\x07]\x02\x02\u014A\u014B\x07^\x02\x02\u014B\u0150\x07^\x02\x02\u014C" +
		"\u014D\x07^\x02\x02\u014D\u014E\t\x14\x02\x02\u014E\u0150\b)\x11\x02\u014F" +
		"\u0146\x03\x02\x02\x02\u014F\u0148\x03\x02\x02\x02\u014F\u014A\x03\x02" +
		"\x02\x02\u014F\u014C\x03\x02\x02\x02\u0150T\x03\x02\x02\x02\u0151\u0153" +
		"\x07^\x02\x02\u0152\u0154\n\x11\x02\x02\u0153\u0152\x03\x02\x02\x02\u0153" +
		"\u0154\x03\x02\x02\x02\u0154V\x03\x02\x02\x02\u0155\u0157\x07B\x02\x02" +
		"\u0156\u0155\x03\x02\x02\x02\u0156\u0157\x03\x02\x02\x02\u0157\u0158\x03" +
		"\x02\x02\x02\u0158\u015C\x07}\x02\x02\u0159\u015B\n\x15\x02\x02\u015A" +
		"\u0159\x03\x02\x02\x02\u015B\u015E\x03\x02\x02\x02\u015C\u015A\x03\x02" +
		"\x02\x02\u015C\u015D\x03\x02\x02\x02\u015D\u015F\x03\x02\x02\x02\u015E" +
		"\u015C\x03\x02\x02\x02\u015F\u0160\x07\x7F\x02\x02\u0160\u0161\b+\x12" +
		"\x02\u0161X\x03\x02\x02\x02\u0162\u0167\x07]\x02\x02\u0163\u0166\n\x16" +
		"\x02\x02\u0164\u0166\x05Y,\x02\u0165\u0163\x03\x02\x02\x02\u0165\u0164" +
		"\x03\x02\x02\x02\u0166\u0169\x03\x02\x02\x02\u0167\u0165\x03\x02\x02\x02" +
		"\u0167\u0168\x03\x02\x02\x02\u0168\u016A\x03\x02\x02\x02\u0169\u0167\x03" +
		"\x02\x02\x02\u016A\u016B\x07_\x02\x02\u016B\u016C\b,\x13\x02\u016CZ\x03" +
		"\x02\x02\x02\u016D\u016E\t\x17\x02\x02\u016E\u016F\b-\x14\x02\u016F\\" +
		"\x03\x02\x02\x02\u0170\u0172\n\x18\x02\x02\u0171\u0170\x03\x02\x02\x02" +
		"\u0172\u0173\x03\x02\x02\x02\u0173\u0171\x03\x02\x02\x02\u0173\u0174\x03" +
		"\x02\x02\x02\u0174\u0175\x03\x02\x02\x02\u0175\u0176\b.\x15\x02\u0176" +
		"^\x03\x02\x02\x02\x1E\x02\x03\x04\x81\x88\x8D\xA1\xA6\xB0\xB5\xB7\xC7" +
		"\xD0\xD5\xE2\xF2\u0100\u0110\u011E\u012F\u013D\u014F\u0153\u0156\u015C" +
		"\u0165\u0167\u0173\x16\b\x02\x02\x07\x03\x02\x03\x15\x02\x07\x04\x02\t" +
		"\x05\x02\x06\x02\x02\t\x04\x02\x03!\x03\x03\"\x04\x03#\x05\x03$\x06\x03" +
		"%\x07\x03&\b\x03\'\t\x03(\n\x03)\v\x03+\f\x03,\r\x03-\x0E\x03.\x0F";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

