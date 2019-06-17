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
	public static readonly IMPORT_DESC = 6;
	public static readonly IMPORT_PATH = 7;
	public static readonly INVALID_TOKEN_DEFAULT_MODE = 8;
	public static readonly WS_IN_NAME = 9;
	public static readonly IDENTIFIER = 10;
	public static readonly DOT = 11;
	public static readonly OPEN_PARENTHESIS = 12;
	public static readonly CLOSE_PARENTHESIS = 13;
	public static readonly COMMA = 14;
	public static readonly INVALID_SEPERATE_CHAR = 15;
	public static readonly WS_IN_BODY_IGNORED = 16;
	public static readonly IF = 17;
	public static readonly ELSEIF = 18;
	public static readonly ELSE = 19;
	public static readonly SWITCH = 20;
	public static readonly CASE = 21;
	public static readonly DEFAULT = 22;
	public static readonly MULTI_LINE_TEXT = 23;
	public static readonly ESCAPE_CHARACTER = 24;
	public static readonly INVALID_ESCAPE = 25;
	public static readonly EXPRESSION = 26;
	public static readonly TEMPLATE_REF = 27;
	public static readonly TEXT_SEPARATOR = 28;
	public static readonly TEXT = 29;
	public static readonly TEMPLATE_NAME_MODE = 1;
	public static readonly TEMPLATE_BODY_MODE = 2;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "TEMPLATE_NAME_MODE", "TEMPLATE_BODY_MODE",
	];

	public static readonly ruleNames: string[] = [
		"LETTER", "NUMBER", "WHITESPACE", "A", "C", "D", "E", "F", "H", "I", "L", 
		"S", "T", "U", "W", "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "IMPORT_DESC", 
		"IMPORT_PATH", "INVALID_TOKEN_DEFAULT_MODE", "WS_IN_NAME", "NEWLINE_IN_NAME", 
		"IDENTIFIER", "DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", "COMMA", 
		"INVALID_SEPERATE_CHAR", "WS_IN_BODY_IGNORED", "WS_IN_BODY", "NEWLINE_IN_BODY", 
		"IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", "MULTI_LINE_TEXT", 
		"ESCAPE_CHARACTER", "INVALID_ESCAPE", "EXPRESSION", "TEMPLATE_REF", "TEXT_SEPARATOR", 
		"TEXT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, "'#'", undefined, undefined, 
		undefined, undefined, undefined, undefined, "'.'", "'('", "')'", "','",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "IMPORT_DESC", 
		"IMPORT_PATH", "INVALID_TOKEN_DEFAULT_MODE", "WS_IN_NAME", "IDENTIFIER", 
		"DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", "COMMA", "INVALID_SEPERATE_CHAR", 
		"WS_IN_BODY_IGNORED", "IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", 
		"MULTI_LINE_TEXT", "ESCAPE_CHARACTER", "INVALID_ESCAPE", "EXPRESSION", 
		"TEMPLATE_REF", "TEXT_SEPARATOR", "TEXT",
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

		case 33:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 34:
			this.IF_action(_localctx, actionIndex);
			break;

		case 35:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 36:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 37:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 38:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 39:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 40:
			this.MULTI_LINE_TEXT_action(_localctx, actionIndex);
			break;

		case 41:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 43:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 44:
			this.TEMPLATE_REF_action(_localctx, actionIndex);
			break;

		case 45:
			this.TEXT_SEPARATOR_action(_localctx, actionIndex);
			break;

		case 46:
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
		case 31:
			return this.WS_IN_BODY_IGNORED_sempred(_localctx, predIndex);

		case 34:
			return this.IF_sempred(_localctx, predIndex);

		case 35:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 36:
			return this.ELSE_sempred(_localctx, predIndex);

		case 37:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 38:
			return this.CASE_sempred(_localctx, predIndex);

		case 39:
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
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\x1F\u018D\b\x01" +
		"\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04" +
		"\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f" +
		"\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11" +
		"\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16" +
		"\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B" +
		"\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!" +
		"\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t" +
		")\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x03\x02\x03" +
		"\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03" +
		"\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03" +
		"\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x11" +
		"\x03\x11\x06\x11\x84\n\x11\r\x11\x0E\x11\x85\x03\x11\x03\x11\x03\x12\x06" +
		"\x12\x8B\n\x12\r\x12\x0E\x12\x8C\x03\x12\x03\x12\x03\x13\x05\x13\x92\n" +
		"\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03" +
		"\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x16\x03\x16\x07\x16\xA3\n\x16" +
		"\f\x16\x0E\x16\xA6\v\x16\x03\x16\x03\x16\x03\x17\x03\x17\x07\x17\xAC\n" +
		"\x17\f\x17\x0E\x17\xAF\v\x17\x03\x17\x03\x17\x03\x18\x03\x18\x03\x19\x06" +
		"\x19\xB6\n\x19\r\x19\x0E\x19\xB7\x03\x19\x03\x19\x03\x1A\x05\x1A\xBD\n" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x05" +
		"\x1B\xC7\n\x1B\x03\x1B\x03\x1B\x03\x1B\x07\x1B\xCC\n\x1B\f\x1B\x0E\x1B" +
		"\xCF\v\x1B\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1F\x03" +
		"\x1F\x03 \x03 \x03!\x06!\xDC\n!\r!\x0E!\xDD\x03!\x03!\x03!\x03!\x03\"" +
		"\x06\"\xE5\n\"\r\"\x0E\"\xE6\x03\"\x03\"\x03#\x05#\xEC\n#\x03#\x03#\x03" +
		"#\x03#\x03#\x03#\x03$\x03$\x03$\x07$\xF7\n$\f$\x0E$\xFA\v$\x03$\x03$\x03" +
		"$\x03$\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x07%\u0107\n%\f%\x0E%\u010A" +
		"\v%\x03%\x03%\x03%\x03%\x03&\x03&\x03&\x03&\x03&\x07&\u0115\n&\f&\x0E" +
		"&\u0118\v&\x03&\x03&\x03&\x03&\x03\'\x03\'\x03\'\x03\'\x03\'\x03\'\x03" +
		"\'\x07\'\u0125\n\'\f\'\x0E\'\u0128\v\'\x03\'\x03\'\x03\'\x03\'\x03(\x03" +
		"(\x03(\x03(\x03(\x07(\u0133\n(\f(\x0E(\u0136\v(\x03(\x03(\x03(\x03(\x03" +
		")\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x07)\u0144\n)\f)\x0E)\u0147\v)\x03" +
		")\x03)\x03)\x03)\x03*\x03*\x03*\x03*\x03*\x07*\u0152\n*\f*\x0E*\u0155" +
		"\v*\x03*\x03*\x03*\x03*\x03*\x03*\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03" +
		"+\x03+\x05+\u0166\n+\x03,\x03,\x05,\u016A\n,\x03-\x05-\u016D\n-\x03-\x03" +
		"-\x07-\u0171\n-\f-\x0E-\u0174\v-\x03-\x03-\x03-\x03.\x03.\x03.\x07.\u017C" +
		"\n.\f.\x0E.\u017F\v.\x03.\x03.\x03.\x03/\x03/\x03/\x030\x060\u0188\n0" +
		"\r0\x0E0\u0189\x030\x030\x05\xA4\xAD\u0153\x02\x021\x05\x02\x02\x07\x02" +
		"\x02\t\x02\x02\v\x02\x02\r\x02\x02\x0F\x02\x02\x11\x02\x02\x13\x02\x02" +
		"\x15\x02\x02\x17\x02\x02\x19\x02\x02\x1B\x02\x02\x1D\x02\x02\x1F\x02\x02" +
		"!\x02\x02#\x02\x03%\x02\x04\'\x02\x05)\x02\x06+\x02\x07-\x02\b/\x02\t" +
		"1\x02\n3\x02\v5\x02\x027\x02\f9\x02\r;\x02\x0E=\x02\x0F?\x02\x10A\x02" +
		"\x11C\x02\x12E\x02\x02G\x02\x02I\x02\x13K\x02\x14M\x02\x15O\x02\x16Q\x02" +
		"\x17S\x02\x18U\x02\x19W\x02\x1AY\x02\x1B[\x02\x1C]\x02\x1D_\x02\x1Ea\x02" +
		"\x1F\x05\x02\x03\x04\x19\x04\x02C\\c|\x06\x02\v\v\"\"\xA2\xA2\uFF01\uFF01" +
		"\x04\x02CCcc\x04\x02EEee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04\x02J" +
		"Jjj\x04\x02KKkk\x04\x02NNnn\x04\x02UUuu\x04\x02VVvv\x04\x02WWww\x04\x02" +
		"YYyy\x04\x02&&@@\x04\x02\f\f\x0F\x0F\x04\x02//aa\x03\x02==\x07\x02__p" +
		"pttvv\x7F\x7F\x06\x02\f\f\x0F\x0F}}\x7F\x7F\x05\x02\f\f\x0F\x0F__\n\x02" +
		"\v\f\x0F\x0F\"\"*+]]__}}\x7F\x7F\t\x02\v\f\x0F\x0F\"\"*+]_}}\x7F\x7F\u019A" +
		"\x02#\x03\x02\x02\x02\x02%\x03\x02\x02\x02\x02\'\x03\x02\x02\x02\x02)" +
		"\x03\x02\x02\x02\x02+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x02/\x03\x02" +
		"\x02\x02\x021\x03\x02\x02\x02\x033\x03\x02\x02\x02\x035\x03\x02\x02\x02" +
		"\x037\x03\x02\x02\x02\x039\x03\x02\x02\x02\x03;\x03\x02\x02\x02\x03=\x03" +
		"\x02\x02\x02\x03?\x03\x02\x02\x02\x03A\x03\x02\x02\x02\x04C\x03\x02\x02" +
		"\x02\x04E\x03\x02\x02\x02\x04G\x03\x02\x02\x02\x04I\x03\x02\x02\x02\x04" +
		"K\x03\x02\x02\x02\x04M\x03\x02\x02\x02\x04O\x03\x02\x02\x02\x04Q\x03\x02" +
		"\x02\x02\x04S\x03\x02\x02\x02\x04U\x03\x02\x02\x02\x04W\x03\x02\x02\x02" +
		"\x04Y\x03\x02\x02\x02\x04[\x03\x02\x02\x02\x04]\x03\x02\x02\x02\x04_\x03" +
		"\x02\x02\x02\x04a\x03\x02\x02\x02\x05c\x03\x02\x02\x02\x07e\x03\x02\x02" +
		"\x02\tg\x03\x02\x02\x02\vi\x03\x02\x02\x02\rk\x03\x02\x02\x02\x0Fm\x03" +
		"\x02\x02\x02\x11o\x03\x02\x02\x02\x13q\x03\x02\x02\x02\x15s\x03\x02\x02" +
		"\x02\x17u\x03\x02\x02\x02\x19w\x03\x02\x02\x02\x1By\x03\x02\x02\x02\x1D" +
		"{\x03\x02\x02\x02\x1F}\x03\x02\x02\x02!\x7F\x03\x02\x02\x02#\x81\x03\x02" +
		"\x02\x02%\x8A\x03\x02\x02\x02\'\x91\x03\x02\x02\x02)\x97\x03\x02\x02\x02" +
		"+\x9B\x03\x02\x02\x02-\xA0\x03\x02\x02\x02/\xA9\x03\x02\x02\x021\xB2\x03" +
		"\x02\x02\x023\xB5\x03\x02\x02\x025\xBC\x03\x02\x02\x027\xC6\x03\x02\x02" +
		"\x029\xD0\x03\x02\x02\x02;\xD2\x03\x02\x02\x02=\xD4\x03\x02\x02\x02?\xD6" +
		"\x03\x02\x02\x02A\xD8\x03\x02\x02\x02C\xDB\x03\x02\x02\x02E\xE4\x03\x02" +
		"\x02\x02G\xEB\x03\x02\x02\x02I\xF3\x03\x02\x02\x02K\xFF\x03\x02\x02\x02" +
		"M\u010F\x03\x02\x02\x02O\u011D\x03\x02\x02\x02Q\u012D\x03\x02\x02\x02" +
		"S\u013B\x03\x02\x02\x02U\u014C\x03\x02\x02\x02W\u0165\x03\x02\x02\x02" +
		"Y\u0167\x03\x02\x02\x02[\u016C\x03\x02\x02\x02]\u0178\x03\x02\x02\x02" +
		"_\u0183\x03\x02\x02\x02a\u0187\x03\x02\x02\x02cd\t\x02\x02\x02d\x06\x03" +
		"\x02\x02\x02ef\x042;\x02f\b\x03\x02\x02\x02gh\t\x03\x02\x02h\n\x03\x02" +
		"\x02\x02ij\t\x04\x02\x02j\f\x03\x02\x02\x02kl\t\x05\x02\x02l\x0E\x03\x02" +
		"\x02\x02mn\t\x06\x02\x02n\x10\x03\x02\x02\x02op\t\x07\x02\x02p\x12\x03" +
		"\x02\x02\x02qr\t\b\x02\x02r\x14\x03\x02\x02\x02st\t\t\x02\x02t\x16\x03" +
		"\x02\x02\x02uv\t\n\x02\x02v\x18\x03\x02\x02\x02wx\t\v\x02\x02x\x1A\x03" +
		"\x02\x02\x02yz\t\f\x02\x02z\x1C\x03\x02\x02\x02{|\t\r\x02\x02|\x1E\x03" +
		"\x02\x02\x02}~\t\x0E\x02\x02~ \x03\x02\x02\x02\x7F\x80\t\x0F\x02\x02\x80" +
		"\"\x03\x02\x02\x02\x81\x83\t\x10\x02\x02\x82\x84\n\x11\x02\x02\x83\x82" +
		"\x03\x02\x02\x02\x84\x85\x03\x02\x02\x02\x85\x83\x03\x02\x02\x02\x85\x86" +
		"\x03\x02\x02\x02\x86\x87\x03\x02\x02\x02\x87\x88\b\x11\x02\x02\x88$\x03" +
		"\x02\x02\x02\x89\x8B\x05\t\x04\x02\x8A\x89\x03\x02\x02\x02\x8B\x8C\x03" +
		"\x02\x02\x02\x8C\x8A\x03\x02\x02\x02\x8C\x8D\x03\x02\x02\x02\x8D\x8E\x03" +
		"\x02\x02\x02\x8E\x8F\b\x12\x02\x02\x8F&\x03\x02\x02\x02\x90\x92\x07\x0F" +
		"\x02\x02\x91\x90\x03\x02\x02\x02\x91\x92\x03\x02\x02\x02\x92\x93\x03\x02" +
		"\x02\x02\x93\x94\x07\f\x02\x02\x94\x95\x03\x02\x02\x02\x95\x96\b\x13\x02" +
		"\x02\x96(\x03\x02\x02\x02\x97\x98\x07%\x02\x02\x98\x99\x03\x02\x02\x02" +
		"\x99\x9A\b\x14\x03\x02\x9A*\x03\x02\x02\x02\x9B\x9C\x07/\x02\x02\x9C\x9D" +
		"\b\x15\x04\x02\x9D\x9E\x03\x02\x02\x02\x9E\x9F\b\x15\x05\x02\x9F,\x03" +
		"\x02\x02\x02\xA0\xA4\x07]\x02\x02\xA1\xA3\v\x02\x02\x02\xA2\xA1\x03\x02" +
		"\x02\x02\xA3\xA6\x03\x02\x02\x02\xA4\xA5\x03\x02\x02\x02\xA4\xA2\x03\x02" +
		"\x02\x02\xA5\xA7\x03\x02\x02\x02\xA6\xA4\x03\x02\x02\x02\xA7\xA8\x07_" +
		"\x02\x02\xA8.\x03\x02\x02\x02\xA9\xAD\x07*\x02\x02\xAA\xAC\v\x02\x02\x02" +
		"\xAB\xAA\x03\x02\x02\x02\xAC\xAF\x03\x02\x02\x02\xAD\xAE\x03\x02\x02\x02" +
		"\xAD\xAB\x03\x02\x02\x02\xAE\xB0\x03\x02\x02\x02\xAF\xAD\x03\x02\x02\x02" +
		"\xB0\xB1\x07+\x02\x02\xB10\x03\x02\x02\x02\xB2\xB3\v\x02\x02\x02\xB32" +
		"\x03\x02\x02\x02\xB4\xB6\x05\t\x04\x02\xB5\xB4\x03\x02\x02\x02\xB6\xB7" +
		"\x03\x02\x02\x02\xB7\xB5\x03\x02\x02\x02\xB7\xB8\x03\x02\x02\x02\xB8\xB9" +
		"\x03\x02\x02\x02\xB9\xBA\b\x19\x02\x02\xBA4\x03\x02\x02\x02\xBB\xBD\x07" +
		"\x0F\x02\x02\xBC\xBB\x03\x02\x02\x02\xBC\xBD\x03\x02\x02\x02\xBD\xBE\x03" +
		"\x02\x02\x02\xBE\xBF\x07\f\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC1\b\x1A" +
		"\x06\x02\xC1\xC2\b\x1A\x07\x02\xC26\x03\x02\x02\x02\xC3\xC7\x05\x05\x02" +
		"\x02\xC4\xC7\x05\x07\x03\x02\xC5\xC7\x07a\x02\x02\xC6\xC3\x03\x02\x02" +
		"\x02\xC6\xC4\x03\x02\x02\x02\xC6\xC5\x03\x02\x02\x02\xC7\xCD\x03\x02\x02" +
		"\x02\xC8\xCC\x05\x05\x02\x02\xC9\xCC\x05\x07\x03\x02\xCA\xCC\t\x12\x02" +
		"\x02\xCB\xC8\x03\x02\x02\x02\xCB\xC9\x03\x02\x02\x02\xCB\xCA\x03\x02\x02" +
		"\x02\xCC\xCF\x03\x02\x02\x02\xCD\xCB\x03\x02\x02\x02\xCD\xCE\x03\x02\x02" +
		"\x02\xCE8\x03\x02\x02\x02\xCF\xCD\x03\x02\x02\x02\xD0\xD1\x070\x02\x02" +
		"\xD1:\x03\x02\x02\x02\xD2\xD3\x07*\x02\x02\xD3<\x03\x02\x02\x02\xD4\xD5" +
		"\x07+\x02\x02\xD5>\x03\x02\x02\x02\xD6\xD7\x07.\x02\x02\xD7@\x03\x02\x02" +
		"\x02\xD8\xD9\t\x13\x02\x02\xD9B\x03\x02\x02\x02\xDA\xDC\x05\t\x04\x02" +
		"\xDB\xDA\x03\x02\x02\x02\xDC\xDD\x03\x02\x02\x02\xDD\xDB\x03\x02\x02\x02" +
		"\xDD\xDE\x03\x02\x02\x02\xDE\xDF\x03\x02\x02\x02\xDF\xE0\x06!\x02\x02" +
		"\xE0\xE1\x03\x02\x02\x02\xE1\xE2\b!\x02\x02\xE2D\x03\x02\x02\x02\xE3\xE5" +
		"\x05\t\x04\x02\xE4\xE3\x03\x02\x02\x02\xE5\xE6\x03\x02\x02\x02\xE6\xE4" +
		"\x03\x02\x02\x02\xE6\xE7\x03\x02\x02\x02\xE7\xE8\x03\x02\x02\x02\xE8\xE9" +
		"\b\"\b\x02\xE9F\x03\x02\x02\x02\xEA\xEC\x07\x0F\x02\x02\xEB\xEA\x03\x02" +
		"\x02\x02\xEB\xEC\x03\x02\x02\x02\xEC\xED\x03\x02\x02\x02\xED\xEE\x07\f" +
		"\x02\x02\xEE\xEF\b#\t\x02\xEF\xF0\x03\x02\x02\x02\xF0\xF1\b#\x06\x02\xF1" +
		"\xF2\b#\x07\x02\xF2H\x03\x02\x02\x02\xF3\xF4\x05\x17\v\x02\xF4\xF8\x05" +
		"\x13\t\x02\xF5\xF7\x05\t\x04\x02\xF6\xF5\x03\x02\x02\x02\xF7\xFA\x03\x02" +
		"\x02\x02\xF8\xF6\x03\x02\x02\x02\xF8\xF9\x03\x02\x02\x02\xF9\xFB\x03\x02" +
		"\x02\x02\xFA\xF8\x03\x02\x02\x02\xFB\xFC\x07<\x02\x02\xFC\xFD\x06$\x03" +
		"\x02\xFD\xFE\b$\n\x02\xFEJ\x03\x02\x02\x02\xFF\u0100\x05\x11\b\x02\u0100" +
		"\u0101\x05\x19\f\x02\u0101\u0102\x05\x1B\r\x02\u0102\u0103\x05\x11\b\x02" +
		"\u0103\u0104\x05\x17\v\x02\u0104\u0108\x05\x13\t\x02\u0105\u0107\x05\t" +
		"\x04\x02\u0106\u0105\x03\x02\x02\x02\u0107\u010A\x03\x02\x02\x02\u0108" +
		"\u0106\x03\x02\x02\x02\u0108\u0109\x03\x02\x02\x02\u0109\u010B\x03\x02" +
		"\x02\x02\u010A\u0108\x03\x02\x02\x02\u010B\u010C\x07<\x02\x02\u010C\u010D" +
		"\x06%\x04\x02\u010D\u010E\b%\v\x02\u010EL\x03\x02\x02\x02\u010F\u0110" +
		"\x05\x11\b\x02\u0110\u0111\x05\x19\f\x02\u0111\u0112\x05\x1B\r\x02\u0112" +
		"\u0116\x05\x11\b\x02\u0113\u0115\x05\t\x04\x02\u0114\u0113\x03\x02\x02" +
		"\x02\u0115\u0118\x03\x02\x02\x02\u0116\u0114\x03\x02\x02\x02\u0116\u0117" +
		"\x03\x02\x02\x02\u0117\u0119\x03\x02\x02\x02\u0118\u0116\x03\x02\x02\x02" +
		"\u0119\u011A\x07<\x02\x02\u011A\u011B\x06&\x05\x02\u011B\u011C\b&\f\x02" +
		"\u011CN\x03\x02\x02\x02\u011D\u011E\x05\x1B\r\x02\u011E\u011F\x05!\x10" +
		"\x02\u011F\u0120\x05\x17\v\x02\u0120\u0121\x05\x1D\x0E\x02\u0121\u0122" +
		"\x05\r\x06\x02\u0122\u0126\x05\x15\n\x02\u0123\u0125\x05\t\x04\x02\u0124" +
		"\u0123\x03\x02\x02\x02\u0125\u0128\x03\x02\x02\x02\u0126\u0124\x03\x02" +
		"\x02\x02\u0126\u0127\x03\x02\x02\x02\u0127\u0129\x03\x02\x02\x02\u0128" +
		"\u0126\x03\x02\x02\x02\u0129\u012A\x07<\x02\x02\u012A\u012B\x06\'\x06" +
		"\x02\u012B\u012C\b\'\r\x02\u012CP\x03\x02\x02\x02\u012D\u012E\x05\r\x06" +
		"\x02\u012E\u012F\x05\v\x05\x02\u012F\u0130\x05\x1B\r\x02\u0130\u0134\x05" +
		"\x11\b\x02\u0131\u0133\x05\t\x04\x02\u0132\u0131\x03\x02\x02\x02\u0133" +
		"\u0136\x03\x02\x02\x02\u0134\u0132\x03\x02\x02\x02\u0134\u0135\x03\x02" +
		"\x02\x02\u0135\u0137\x03\x02\x02\x02\u0136\u0134\x03\x02\x02\x02\u0137" +
		"\u0138\x07<\x02\x02\u0138\u0139\x06(\x07\x02\u0139\u013A\b(\x0E\x02\u013A" +
		"R\x03\x02\x02\x02\u013B\u013C\x05\x0F\x07\x02\u013C\u013D\x05\x11\b\x02" +
		"\u013D\u013E\x05\x13\t\x02\u013E\u013F\x05\v\x05\x02\u013F\u0140\x05\x1F" +
		"\x0F\x02\u0140\u0141\x05\x19\f\x02\u0141\u0145\x05\x1D\x0E\x02\u0142\u0144" +
		"\x05\t\x04\x02\u0143\u0142\x03\x02\x02\x02\u0144\u0147\x03\x02\x02\x02" +
		"\u0145\u0143\x03\x02\x02\x02\u0145\u0146\x03\x02\x02\x02\u0146\u0148\x03" +
		"\x02\x02\x02\u0147\u0145\x03\x02\x02\x02\u0148\u0149\x07<\x02\x02\u0149" +
		"\u014A\x06)\b\x02\u014A\u014B\b)\x0F\x02\u014BT\x03\x02\x02\x02\u014C" +
		"\u014D\x07b\x02\x02\u014D\u014E\x07b\x02\x02\u014E\u014F\x07b\x02\x02" +
		"\u014F\u0153\x03\x02\x02\x02\u0150\u0152\v\x02\x02\x02\u0151\u0150\x03" +
		"\x02\x02\x02\u0152\u0155\x03\x02\x02\x02\u0153\u0154\x03\x02\x02\x02\u0153" +
		"\u0151\x03\x02\x02\x02\u0154\u0156\x03\x02\x02\x02\u0155\u0153\x03\x02" +
		"\x02\x02\u0156\u0157\x07b\x02\x02\u0157\u0158\x07b\x02\x02\u0158\u0159" +
		"\x07b\x02\x02\u0159\u015A\x03\x02\x02\x02\u015A\u015B\b*\x10\x02\u015B" +
		"V\x03\x02\x02\x02\u015C\u015D\x07^\x02\x02\u015D\u0166\x07}\x02\x02\u015E" +
		"\u015F\x07^\x02\x02\u015F\u0166\x07]\x02\x02\u0160\u0161\x07^\x02\x02" +
		"\u0161\u0166\x07^\x02\x02\u0162\u0163\x07^\x02\x02\u0163\u0164\t\x14\x02" +
		"\x02\u0164\u0166\b+\x11\x02\u0165\u015C\x03\x02\x02\x02\u0165\u015E\x03" +
		"\x02\x02\x02\u0165\u0160\x03\x02\x02\x02\u0165\u0162\x03\x02\x02\x02\u0166" +
		"X\x03\x02\x02\x02\u0167\u0169\x07^\x02\x02\u0168\u016A\n\x11\x02\x02\u0169" +
		"\u0168\x03\x02\x02\x02\u0169\u016A\x03\x02\x02\x02\u016AZ\x03\x02\x02" +
		"\x02\u016B\u016D\x07B\x02\x02\u016C\u016B\x03\x02\x02\x02\u016C\u016D" +
		"\x03\x02\x02\x02\u016D\u016E\x03\x02\x02\x02\u016E\u0172\x07}\x02\x02" +
		"\u016F\u0171\n\x15\x02\x02\u0170\u016F\x03\x02\x02\x02\u0171\u0174\x03" +
		"\x02\x02\x02\u0172\u0170\x03\x02\x02\x02\u0172\u0173\x03\x02\x02\x02\u0173" +
		"\u0175\x03\x02\x02\x02\u0174\u0172\x03\x02\x02\x02\u0175\u0176\x07\x7F" +
		"\x02\x02\u0176\u0177\b-\x12\x02\u0177\\\x03\x02\x02\x02\u0178\u017D\x07" +
		"]\x02\x02\u0179\u017C\n\x16\x02\x02\u017A\u017C\x05].\x02\u017B\u0179" +
		"\x03\x02\x02\x02\u017B\u017A\x03\x02\x02\x02\u017C\u017F\x03\x02\x02\x02" +
		"\u017D\u017B\x03\x02\x02\x02\u017D\u017E\x03\x02\x02\x02\u017E\u0180\x03" +
		"\x02\x02\x02\u017F\u017D\x03\x02\x02\x02\u0180\u0181\x07_\x02\x02\u0181" +
		"\u0182\b.\x13\x02\u0182^\x03\x02\x02\x02\u0183\u0184\t\x17\x02\x02\u0184" +
		"\u0185\b/\x14\x02\u0185`\x03\x02\x02\x02\u0186\u0188\n\x18\x02\x02\u0187" +
		"\u0186\x03\x02\x02\x02\u0188\u0189\x03\x02\x02\x02\u0189\u0187\x03\x02" +
		"\x02\x02\u0189\u018A\x03\x02\x02\x02\u018A\u018B\x03\x02\x02\x02\u018B" +
		"\u018C\b0\x15\x02\u018Cb\x03\x02\x02\x02 \x02\x03\x04\x85\x8C\x91\xA4" +
		"\xAD\xB7\xBC\xC6\xCB\xCD\xDD\xE6\xEB\xF8\u0108\u0116\u0126\u0134\u0145" +
		"\u0153\u0165\u0169\u016C\u0172\u017B\u017D\u0189\x16\b\x02\x02\x07\x03" +
		"\x02\x03\x15\x02\x07\x04\x02\t\x05\x02\x06\x02\x02\t\x04\x02\x03#\x03" +
		"\x03$\x04\x03%\x05\x03&\x06\x03\'\x07\x03(\b\x03)\t\x03*\n\x03+\v\x03" +
		"-\f\x03.\r\x03/\x0E\x030\x0F";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

