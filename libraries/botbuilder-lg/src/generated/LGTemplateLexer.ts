// Generated from ../LGTemplateLexer.g4 by ANTLR 4.6-SNAPSHOT


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


export class LGTemplateLexer extends Lexer {
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
	public static readonly NORMAL_TEMPLATE_BODY_MODE = 1;
	public static readonly MULTILINE_MODE = 2;
	public static readonly STRUCTURE_NAME_MODE = 3;
	public static readonly STRUCTURE_BODY_MODE = 4;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "NORMAL_TEMPLATE_BODY_MODE", "MULTILINE_MODE", "STRUCTURE_NAME_MODE", 
		"STRUCTURE_BODY_MODE",
	];

	public static readonly ruleNames: string[] = [
		"A", "C", "D", "E", "F", "H", "I", "L", "S", "T", "U", "W", "LETTER", 
		"NUMBER", "WHITESPACE", "EMPTY_OBJECT", "STRING_LITERAL", "STRING_INTERPOLATION", 
		"ESCAPE_CHARACTER_FRAGMENT", "IDENTIFIER", "WS", "NEWLINE", "COMMENTS", 
		"DASH", "OBJECT_DEFINITION", "EXPRESSION_FRAGMENT", "LEFT_SQUARE_BRACKET", 
		"INVALID_TOKEN", "WS_IN_BODY", "MULTILINE_PREFIX", "NEWLINE_IN_BODY", 
		"IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", "ESCAPE_CHARACTER", 
		"EXPRESSION", "TEXT", "MULTILINE_SUFFIX", "MULTILINE_ESCAPE_CHARACTER", 
		"MULTILINE_EXPRESSION", "MULTILINE_TEXT", "WS_IN_STRUCTURE_NAME", "NEWLINE_IN_STRUCTURE_NAME", 
		"STRUCTURE_NAME", "TEXT_IN_STRUCTURE_NAME", "STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", 
		"STRUCTURED_NEWLINE", "STRUCTURED_BODY_END", "STRUCTURE_IDENTIFIER", "STRUCTURE_EQUALS", 
		"STRUCTURE_OR_MARK", "ESCAPE_CHARACTER_IN_STRUCTURE_BODY", "EXPRESSION_IN_STRUCTURE_BODY", 
		"TEXT_IN_STRUCTURE_BODY",
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
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGTemplateLexer._LITERAL_NAMES, LGTemplateLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGTemplateLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  ignoreWS = true; // usually we ignore whitespace, but inside template, whitespace is significant
	  beginOfTemplateBody = true; // whether we are at the begining of template body
	  inMultiline = false; // whether we are in multiline
	  beginOfTemplateLine = false;// weather we are at the begining of template string
	  inStructuredValue = false; // weather we are in the structure value
	  beginOfStructureProperty = false; // weather we are at the begining of structure property


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(LGTemplateLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "LGTemplateLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return LGTemplateLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return LGTemplateLexer._serializedATN; }

	// @Override
	public get modeNames(): string[] { return LGTemplateLexer.modeNames; }

	// @Override
	public action(_localctx: RuleContext, ruleIndex: number, actionIndex: number): void {
		switch (ruleIndex) {
		case 23:
			this.DASH_action(_localctx, actionIndex);
			break;

		case 26:
			this.LEFT_SQUARE_BRACKET_action(_localctx, actionIndex);
			break;

		case 27:
			this.INVALID_TOKEN_action(_localctx, actionIndex);
			break;

		case 29:
			this.MULTILINE_PREFIX_action(_localctx, actionIndex);
			break;

		case 30:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 31:
			this.IF_action(_localctx, actionIndex);
			break;

		case 32:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 33:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 34:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 35:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 36:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 37:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 38:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 39:
			this.TEXT_action(_localctx, actionIndex);
			break;

		case 40:
			this.MULTILINE_SUFFIX_action(_localctx, actionIndex);
			break;

		case 45:
			this.NEWLINE_IN_STRUCTURE_NAME_action(_localctx, actionIndex);
			break;

		case 50:
			this.STRUCTURED_NEWLINE_action(_localctx, actionIndex);
			break;

		case 52:
			this.STRUCTURE_IDENTIFIER_action(_localctx, actionIndex);
			break;

		case 53:
			this.STRUCTURE_EQUALS_action(_localctx, actionIndex);
			break;

		case 54:
			this.STRUCTURE_OR_MARK_action(_localctx, actionIndex);
			break;

		case 55:
			this.ESCAPE_CHARACTER_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 56:
			this.EXPRESSION_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 57:
			this.TEXT_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;
		}
	}
	private DASH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			 this.beginOfTemplateLine = true; this.beginOfTemplateBody = false; 
			break;
		}
	}
	private LEFT_SQUARE_BRACKET_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 1:
			this.beginOfTemplateBody = false;
			break;
		}
	}
	private INVALID_TOKEN_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 2:
			 this.beginOfTemplateBody = false; 
			break;
		}
	}
	private MULTILINE_PREFIX_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 3:
			 this.inMultiline = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private NEWLINE_IN_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 4:
			 this.ignoreWS = true;
			break;
		}
	}
	private IF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 5:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private ELSEIF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 6:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private ELSE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 7:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private SWITCH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 8:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private CASE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 9:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private DEFAULT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 10:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private ESCAPE_CHARACTER_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 11:
			 this.ignoreWS = false; this.beginOfTemplateLine = false;
			break;
		}
	}
	private EXPRESSION_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 12:
			 this.ignoreWS = false; this.beginOfTemplateLine = false;
			break;
		}
	}
	private TEXT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 13:
			 this.ignoreWS = false; this.beginOfTemplateLine = false;
			break;
		}
	}
	private MULTILINE_SUFFIX_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 14:
			 this.inMultiline = false; 
			break;
		}
	}
	private NEWLINE_IN_STRUCTURE_NAME_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 15:
			 this.ignoreWS = true;
			break;

		case 16:
			this.beginOfStructureProperty = true;
			break;
		}
	}
	private STRUCTURED_NEWLINE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 17:
			 this.ignoreWS = true; this.inStructuredValue = false; this.beginOfStructureProperty = true;
			break;
		}
	}
	private STRUCTURE_IDENTIFIER_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 18:
			this.beginOfStructureProperty = false;
			break;
		}
	}
	private STRUCTURE_EQUALS_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 19:
			this.inStructuredValue = true;
			break;
		}
	}
	private STRUCTURE_OR_MARK_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 20:
			 this.ignoreWS = true; 
			break;
		}
	}
	private ESCAPE_CHARACTER_IN_STRUCTURE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 21:
			 this.ignoreWS = false; 
			break;
		}
	}
	private EXPRESSION_IN_STRUCTURE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 22:
			 this.ignoreWS = false; 
			break;
		}
	}
	private TEXT_IN_STRUCTURE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 23:
			 this.ignoreWS = false; this.beginOfStructureProperty = false;
			break;
		}
	}
	// @Override
	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 26:
			return this.LEFT_SQUARE_BRACKET_sempred(_localctx, predIndex);

		case 28:
			return this.WS_IN_BODY_sempred(_localctx, predIndex);

		case 29:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 31:
			return this.IF_sempred(_localctx, predIndex);

		case 32:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 33:
			return this.ELSE_sempred(_localctx, predIndex);

		case 34:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 35:
			return this.CASE_sempred(_localctx, predIndex);

		case 36:
			return this.DEFAULT_sempred(_localctx, predIndex);

		case 48:
			return this.STRUCTURED_COMMENTS_sempred(_localctx, predIndex);

		case 49:
			return this.WS_IN_STRUCTURE_BODY_sempred(_localctx, predIndex);

		case 51:
			return this.STRUCTURED_BODY_END_sempred(_localctx, predIndex);

		case 52:
			return this.STRUCTURE_IDENTIFIER_sempred(_localctx, predIndex);

		case 53:
			return this.STRUCTURE_EQUALS_sempred(_localctx, predIndex);
		}
		return true;
	}
	private LEFT_SQUARE_BRACKET_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  this.beginOfTemplateBody ;
		}
		return true;
	}
	private WS_IN_BODY_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return this.ignoreWS;
		}
		return true;
	}
	private MULTILINE_PREFIX_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return  !this.inMultiline  && this.beginOfTemplateLine ;
		}
		return true;
	}
	private IF_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private ELSEIF_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private ELSE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private SWITCH_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private CASE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 7:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private DEFAULT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 8:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private STRUCTURED_COMMENTS_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 9:
			return  !this.inStructuredValue && this.beginOfStructureProperty;
		}
		return true;
	}
	private WS_IN_STRUCTURE_BODY_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 10:
			return this.ignoreWS;
		}
		return true;
	}
	private STRUCTURED_BODY_END_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 11:
			return !this.inStructuredValue;
		}
		return true;
	}
	private STRUCTURE_IDENTIFIER_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 12:
			return  !this.inStructuredValue && this.beginOfStructureProperty;
		}
		return true;
	}
	private STRUCTURE_EQUALS_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 13:
			return !this.inStructuredValue;
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02%\u0228\b\x01" +
		"\b\x01\b\x01\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04" +
		"\x05\t\x05\x04\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04" +
		"\v\t\v\x04\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04" +
		"\x11\t\x11\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04" +
		"\x16\t\x16\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04" +
		"\x1B\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04" +
		" \t \x04!\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(" +
		"\t(\x04)\t)\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x04" +
		"1\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x047\t7\x048\t8\x049\t9\x04" +
		":\t:\x04;\t;\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03" +
		"\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03" +
		"\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F" +
		"\x03\x10\x03\x10\x03\x11\x03\x11\x07\x11\x9C\n\x11\f\x11\x0E\x11\x9F\v" +
		"\x11\x03\x11\x03\x11\x03\x12\x03\x12\x03\x12\x03\x12\x07\x12\xA7\n\x12" +
		"\f\x12\x0E\x12\xAA\v\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x07\x12" +
		"\xB1\n\x12\f\x12\x0E\x12\xB4\v\x12\x03\x12\x05\x12\xB7\n\x12\x03\x13\x03" +
		"\x13\x03\x13\x03\x13\x07\x13\xBD\n\x13\f\x13\x0E\x13\xC0\v\x13\x03\x13" +
		"\x03\x13\x03\x14\x03\x14\x05\x14\xC6\n\x14\x03\x15\x03\x15\x03\x15\x05" +
		"\x15\xCB\n\x15\x03\x15\x03\x15\x03\x15\x07\x15\xD0\n\x15\f\x15\x0E\x15" +
		"\xD3\v\x15\x03\x16\x06\x16\xD6\n\x16\r\x16\x0E\x16\xD7\x03\x16\x03\x16" +
		"\x03\x17\x05\x17\xDD\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x18\x03" +
		"\x18\x07\x18\xE5\n\x18\f\x18\x0E\x18\xE8\v\x18\x03\x18\x03\x18\x03\x19" +
		"\x03\x19\x03\x19\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A" +
		"\xF5\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x06\x1A\xFB\n\x1A\r\x1A\x0E" +
		"\x1A\xFC\x07\x1A\xFF\n\x1A\f\x1A\x0E\x1A\u0102\v\x1A\x03\x1A\x03\x1A\x03" +
		"\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x06\x1B\u010C\n\x1B\r\x1B" +
		"\x0E\x1B\u010D\x03\x1B\x05\x1B\u0111\n\x1B\x03\x1C\x03\x1C\x03\x1C\x03" +
		"\x1C\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1D\x03\x1E\x06\x1E\u011D\n\x1E" +
		"\r\x1E\x0E\x1E\u011E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x03" +
		"\x1F\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03 \x05 \u012F\n" +
		" \x03 \x03 \x03 \x03 \x03 \x03 \x03!\x03!\x03!\x07!\u013A\n!\f!\x0E!\u013D" +
		"\v!\x03!\x03!\x03!\x03!\x03\"\x03\"\x03\"\x03\"\x03\"\x07\"\u0148\n\"" +
		"\f\"\x0E\"\u014B\v\"\x03\"\x03\"\x03\"\x07\"\u0150\n\"\f\"\x0E\"\u0153" +
		"\v\"\x03\"\x03\"\x03\"\x03\"\x03#\x03#\x03#\x03#\x03#\x07#\u015E\n#\f" +
		"#\x0E#\u0161\v#\x03#\x03#\x03#\x03#\x03$\x03$\x03$\x03$\x03$\x03$\x03" +
		"$\x07$\u016E\n$\f$\x0E$\u0171\v$\x03$\x03$\x03$\x03$\x03%\x03%\x03%\x03" +
		"%\x03%\x07%\u017C\n%\f%\x0E%\u017F\v%\x03%\x03%\x03%\x03%\x03&\x03&\x03" +
		"&\x03&\x03&\x03&\x03&\x03&\x07&\u018D\n&\f&\x0E&\u0190\v&\x03&\x03&\x03" +
		"&\x03&\x03\'\x03\'\x03\'\x03(\x03(\x03(\x03)\x06)\u019D\n)\r)\x0E)\u019E" +
		"\x03)\x03)\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03+\x03+\x03+\x03" +
		"+\x03,\x03,\x03,\x03,\x03-\x05-\u01B4\n-\x03-\x03-\x06-\u01B8\n-\r-\x0E" +
		"-\u01B9\x03-\x03-\x03.\x06.\u01BF\n.\r.\x0E.\u01C0\x03.\x03.\x03/\x05" +
		"/\u01C6\n/\x03/\x03/\x03/\x03/\x03/\x03/\x03/\x030\x030\x030\x050\u01D2" +
		"\n0\x030\x030\x030\x070\u01D7\n0\f0\x0E0\u01DA\v0\x031\x061\u01DD\n1\r" +
		"1\x0E1\u01DE\x032\x032\x072\u01E3\n2\f2\x0E2\u01E6\v2\x032\x052\u01E9" +
		"\n2\x032\x032\x032\x032\x032\x033\x063\u01F1\n3\r3\x0E3\u01F2\x033\x03" +
		"3\x033\x033\x034\x054\u01FA\n4\x034\x034\x034\x035\x035\x035\x035\x03" +
		"5\x035\x036\x036\x036\x056\u0208\n6\x036\x036\x036\x076\u020D\n6\f6\x0E" +
		"6\u0210\v6\x036\x036\x036\x037\x037\x037\x037\x038\x038\x038\x039\x03" +
		"9\x039\x03:\x03:\x03:\x03;\x06;\u0223\n;\r;\x0E;\u0224\x03;\x03;\t\xA8" +
		"\xB2\xBE\u019E\u01B9\u01DE\u0224\x02\x02<\x07\x02\x02\t\x02\x02\v\x02" +
		"\x02\r\x02\x02\x0F\x02\x02\x11\x02\x02\x13\x02\x02\x15\x02\x02\x17\x02" +
		"\x02\x19\x02\x02\x1B\x02\x02\x1D\x02\x02\x1F\x02\x02!\x02\x02#\x02\x02" +
		"%\x02\x02\'\x02\x02)\x02\x02+\x02\x02-\x02\x02/\x02\x031\x02\x043\x02" +
		"\x055\x02\x067\x02\x079\x02\b;\x02\t=\x02\n?\x02\vA\x02\fC\x02\rE\x02" +
		"\x0EG\x02\x0FI\x02\x10K\x02\x11M\x02\x12O\x02\x13Q\x02\x14S\x02\x15U\x02" +
		"\x16W\x02\x17Y\x02\x02[\x02\x02]\x02\x02_\x02\x18a\x02\x19c\x02\x1Ae\x02" +
		"\x1Bg\x02\x1Ci\x02\x1Dk\x02\x1Em\x02\x1Fo\x02 q\x02!s\x02\"u\x02#w\x02" +
		"$y\x02%\x07\x02\x03\x04\x05\x06\x1A\x04\x02CCcc\x04\x02EEee\x04\x02FF" +
		"ff\x04\x02GGgg\x04\x02HHhh\x04\x02JJjj\x04\x02KKkk\x04\x02NNnn\x04\x02" +
		"UUuu\x04\x02VVvv\x04\x02WWww\x04\x02YYyy\x04\x02C\\c|\x06\x02\v\v\"\"" +
		"\xA2\xA2\uFF01\uFF01\x04\x02))^^\x03\x02))\x04\x02$$^^\x03\x02$$\x04\x02" +
		"^^bb\x03\x02bb\x04\x02\f\f\x0F\x0F\t\x02\f\f\x0F\x0F$$))bb}}\x7F\x7F\x06" +
		"\x02$$))bb\x7F\x7F\x04\x02/0aa\u024A\x02/\x03\x02\x02\x02\x021\x03\x02" +
		"\x02\x02\x023\x03\x02\x02\x02\x025\x03\x02\x02\x02\x027\x03\x02\x02\x02" +
		"\x029\x03\x02\x02\x02\x02;\x03\x02\x02\x02\x02=\x03\x02\x02\x02\x03?\x03" +
		"\x02\x02\x02\x03A\x03\x02\x02\x02\x03C\x03\x02\x02\x02\x03E\x03\x02\x02" +
		"\x02\x03G\x03\x02\x02\x02\x03I\x03\x02\x02\x02\x03K\x03\x02\x02\x02\x03" +
		"M\x03\x02\x02\x02\x03O\x03\x02\x02\x02\x03Q\x03\x02\x02\x02\x03S\x03\x02" +
		"\x02\x02\x03U\x03\x02\x02\x02\x04W\x03\x02\x02\x02\x04Y\x03\x02\x02\x02" +
		"\x04[\x03\x02\x02\x02\x04]\x03\x02\x02\x02\x05_\x03\x02\x02\x02\x05a\x03" +
		"\x02\x02\x02\x05c\x03\x02\x02\x02\x05e\x03\x02\x02\x02\x06g\x03\x02\x02" +
		"\x02\x06i\x03\x02\x02\x02\x06k\x03\x02\x02\x02\x06m\x03\x02\x02\x02\x06" +
		"o\x03\x02\x02\x02\x06q\x03\x02\x02\x02\x06s\x03\x02\x02\x02\x06u\x03\x02" +
		"\x02\x02\x06w\x03\x02\x02\x02\x06y\x03\x02\x02\x02\x07{\x03\x02\x02\x02" +
		"\t}\x03\x02\x02\x02\v\x7F\x03\x02\x02\x02\r\x81\x03\x02\x02\x02\x0F\x83" +
		"\x03\x02\x02\x02\x11\x85\x03\x02\x02\x02\x13\x87\x03\x02\x02\x02\x15\x89" +
		"\x03\x02\x02\x02\x17\x8B\x03\x02\x02\x02\x19\x8D\x03\x02\x02\x02\x1B\x8F" +
		"\x03\x02\x02\x02\x1D\x91\x03\x02\x02\x02\x1F\x93\x03\x02\x02\x02!\x95" +
		"\x03\x02\x02\x02#\x97\x03\x02\x02\x02%\x99\x03\x02\x02\x02\'\xB6\x03\x02" +
		"\x02\x02)\xB8\x03\x02\x02\x02+\xC3\x03\x02\x02\x02-\xCA\x03\x02\x02\x02" +
		"/\xD5\x03\x02\x02\x021\xDC\x03\x02\x02\x023\xE2\x03\x02\x02\x025\xEB\x03" +
		"\x02\x02\x027\xF0\x03\x02\x02\x029\u0105\x03\x02\x02\x02;\u0112\x03\x02" +
		"\x02\x02=\u0118\x03\x02\x02\x02?\u011C\x03\x02\x02\x02A\u0124\x03\x02" +
		"\x02\x02C\u012E\x03\x02\x02\x02E\u0136\x03\x02\x02\x02G\u0142\x03\x02" +
		"\x02\x02I\u0158\x03\x02\x02\x02K\u0166\x03\x02\x02\x02M\u0176\x03\x02" +
		"\x02\x02O\u0184\x03\x02\x02\x02Q\u0195\x03\x02\x02\x02S\u0198\x03\x02" +
		"\x02\x02U\u019C\x03\x02\x02\x02W\u01A2\x03\x02\x02\x02Y\u01AA\x03\x02" +
		"\x02\x02[\u01AE\x03\x02\x02\x02]\u01B7\x03\x02\x02\x02_\u01BE\x03\x02" +
		"\x02\x02a\u01C5\x03\x02\x02\x02c\u01D1\x03\x02\x02\x02e\u01DC\x03\x02" +
		"\x02\x02g\u01E0\x03\x02\x02\x02i\u01F0\x03\x02\x02\x02k\u01F9\x03\x02" +
		"\x02\x02m\u01FE\x03\x02\x02\x02o\u0207\x03\x02\x02\x02q\u0214\x03\x02" +
		"\x02\x02s\u0218\x03\x02\x02\x02u\u021B\x03\x02\x02\x02w\u021E\x03\x02" +
		"\x02\x02y\u0222\x03\x02\x02\x02{|\t\x02\x02\x02|\b\x03\x02\x02\x02}~\t" +
		"\x03\x02\x02~\n\x03\x02\x02\x02\x7F\x80\t\x04\x02\x02\x80\f\x03\x02\x02" +
		"\x02\x81\x82\t\x05\x02\x02\x82\x0E\x03\x02\x02\x02\x83\x84\t\x06\x02\x02" +
		"\x84\x10\x03\x02\x02\x02\x85\x86\t\x07\x02\x02\x86\x12\x03\x02\x02\x02" +
		"\x87\x88\t\b\x02\x02\x88\x14\x03\x02\x02\x02\x89\x8A\t\t\x02\x02\x8A\x16" +
		"\x03\x02\x02\x02\x8B\x8C\t\n\x02\x02\x8C\x18\x03\x02\x02\x02\x8D\x8E\t" +
		"\v\x02\x02\x8E\x1A\x03\x02\x02\x02\x8F\x90\t\f\x02\x02\x90\x1C\x03\x02" +
		"\x02\x02\x91\x92\t\r\x02\x02\x92\x1E\x03\x02\x02\x02\x93\x94\t\x0E\x02" +
		"\x02\x94 \x03\x02\x02\x02\x95\x96\x042;\x02\x96\"\x03\x02\x02\x02\x97" +
		"\x98\t\x0F\x02\x02\x98$\x03\x02\x02\x02\x99\x9D\x07}\x02\x02\x9A\x9C\x05" +
		"#\x10\x02\x9B\x9A\x03\x02\x02\x02\x9C\x9F\x03\x02\x02\x02\x9D\x9B\x03" +
		"\x02\x02\x02\x9D\x9E\x03\x02\x02\x02\x9E\xA0\x03\x02\x02\x02\x9F\x9D\x03" +
		"\x02\x02\x02\xA0\xA1\x07\x7F\x02\x02\xA1&\x03\x02\x02\x02\xA2\xA8\x07" +
		")\x02\x02\xA3\xA4\x07^\x02\x02\xA4\xA7\t\x10\x02\x02\xA5\xA7\n\x11\x02" +
		"\x02\xA6\xA3\x03\x02\x02\x02\xA6\xA5\x03\x02\x02\x02\xA7\xAA\x03\x02\x02" +
		"\x02\xA8\xA9\x03\x02\x02\x02\xA8\xA6\x03\x02\x02\x02\xA9\xAB\x03\x02\x02" +
		"\x02\xAA\xA8\x03\x02\x02\x02\xAB\xB7\x07)\x02\x02\xAC\xB2\x07$\x02\x02" +
		"\xAD\xAE\x07^\x02\x02\xAE\xB1\t\x12\x02\x02\xAF\xB1\n\x13\x02\x02\xB0" +
		"\xAD\x03\x02\x02\x02\xB0\xAF\x03\x02\x02\x02\xB1\xB4\x03\x02\x02\x02\xB2" +
		"\xB3\x03\x02\x02\x02\xB2\xB0\x03\x02\x02\x02\xB3\xB5\x03\x02\x02\x02\xB4" +
		"\xB2\x03\x02\x02\x02\xB5\xB7\x07$\x02\x02\xB6\xA2\x03\x02\x02\x02\xB6" +
		"\xAC\x03\x02\x02\x02\xB7(\x03\x02\x02\x02\xB8\xBE\x07b\x02\x02\xB9\xBA" +
		"\x07^\x02\x02\xBA\xBD\t\x14\x02\x02\xBB\xBD\n\x15\x02\x02\xBC\xB9\x03" +
		"\x02\x02\x02\xBC\xBB\x03\x02\x02\x02\xBD\xC0\x03\x02\x02\x02\xBE\xBF\x03" +
		"\x02\x02\x02\xBE\xBC\x03\x02\x02\x02\xBF\xC1\x03\x02\x02\x02\xC0\xBE\x03" +
		"\x02\x02\x02\xC1\xC2\x07b\x02\x02\xC2*\x03\x02\x02\x02\xC3\xC5\x07^\x02" +
		"\x02\xC4\xC6\n\x16\x02\x02\xC5\xC4\x03\x02\x02\x02\xC5\xC6\x03\x02\x02" +
		"\x02\xC6,\x03\x02\x02\x02\xC7\xCB\x05\x1F\x0E\x02\xC8\xCB\x05!\x0F\x02" +
		"\xC9\xCB\x07a\x02\x02\xCA\xC7\x03\x02\x02\x02\xCA\xC8\x03\x02\x02\x02" +
		"\xCA\xC9\x03\x02\x02\x02\xCB\xD1\x03\x02\x02\x02\xCC\xD0\x05\x1F\x0E\x02" +
		"\xCD\xD0\x05!\x0F\x02\xCE\xD0\x07a\x02\x02\xCF\xCC\x03\x02\x02\x02\xCF" +
		"\xCD\x03\x02\x02\x02\xCF\xCE\x03\x02\x02\x02\xD0\xD3\x03\x02\x02\x02\xD1" +
		"\xCF\x03\x02\x02\x02\xD1\xD2\x03\x02\x02\x02\xD2.\x03\x02\x02\x02\xD3" +
		"\xD1\x03\x02\x02\x02\xD4\xD6\x05#\x10\x02\xD5\xD4\x03\x02\x02\x02\xD6" +
		"\xD7\x03\x02\x02\x02\xD7\xD5\x03\x02\x02\x02\xD7\xD8\x03\x02\x02\x02\xD8" +
		"\xD9\x03\x02\x02\x02\xD9\xDA\b\x16\x02\x02\xDA0\x03\x02\x02\x02\xDB\xDD" +
		"\x07\x0F\x02\x02\xDC\xDB\x03\x02\x02\x02\xDC\xDD\x03\x02\x02\x02\xDD\xDE" +
		"\x03\x02\x02\x02\xDE\xDF\x07\f\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0\xE1" +
		"\b\x17\x02\x02\xE12\x03\x02\x02\x02\xE2\xE6\x07@\x02\x02\xE3\xE5\n\x16" +
		"\x02\x02\xE4\xE3\x03\x02\x02\x02\xE5\xE8\x03\x02\x02\x02\xE6\xE4\x03\x02" +
		"\x02\x02\xE6\xE7\x03\x02\x02\x02\xE7\xE9\x03\x02\x02\x02\xE8\xE6\x03\x02" +
		"\x02\x02\xE9\xEA\b\x18\x02\x02\xEA4\x03\x02\x02\x02\xEB\xEC\x07/\x02\x02" +
		"\xEC\xED\b\x19\x03\x02\xED\xEE\x03\x02\x02\x02\xEE\xEF\b\x19\x04\x02\xEF" +
		"6\x03\x02\x02\x02\xF0\u0100\x07}\x02\x02\xF1\xFF\x05#\x10\x02\xF2\xF5" +
		"\x05-\x15\x02\xF3\xF5\x05\'\x12\x02\xF4\xF2\x03\x02\x02\x02\xF4\xF3\x03" +
		"\x02\x02\x02\xF5\xF6\x03\x02\x02\x02\xF6\xFA\x07<\x02\x02\xF7\xFB\x05" +
		"\'\x12\x02\xF8\xFB\n\x17\x02\x02\xF9\xFB\x057\x1A\x02\xFA\xF7\x03\x02" +
		"\x02\x02\xFA\xF8\x03\x02\x02\x02\xFA\xF9\x03\x02\x02\x02\xFB\xFC\x03\x02" +
		"\x02\x02\xFC\xFA\x03\x02\x02\x02\xFC\xFD\x03\x02\x02\x02\xFD\xFF\x03\x02" +
		"\x02\x02\xFE\xF1\x03\x02\x02\x02\xFE\xF4\x03\x02\x02\x02\xFF\u0102\x03" +
		"\x02\x02\x02\u0100\xFE\x03\x02\x02\x02\u0100\u0101\x03\x02\x02\x02\u0101" +
		"\u0103\x03\x02\x02\x02\u0102\u0100\x03\x02\x02\x02\u0103\u0104\x07\x7F" +
		"\x02\x02\u01048\x03\x02\x02\x02\u0105\u0106\x07&\x02\x02\u0106\u010B\x07" +
		"}\x02\x02\u0107\u010C\x05\'\x12\x02\u0108\u010C\x05)\x13\x02\u0109\u010C" +
		"\x057\x1A\x02\u010A\u010C\n\x18\x02\x02\u010B\u0107\x03\x02\x02\x02\u010B" +
		"\u0108\x03\x02\x02\x02\u010B\u0109\x03\x02\x02\x02\u010B\u010A\x03\x02" +
		"\x02\x02\u010C\u010D\x03\x02\x02\x02\u010D\u010B\x03\x02\x02\x02\u010D" +
		"\u010E\x03\x02\x02\x02\u010E\u0110\x03\x02\x02\x02\u010F\u0111\x07\x7F" +
		"\x02\x02\u0110\u010F\x03\x02\x02\x02\u0110\u0111\x03\x02\x02\x02\u0111" +
		":\x03\x02\x02\x02\u0112\u0113\x07]\x02\x02\u0113\u0114\x06\x1C\x02\x02" +
		"\u0114\u0115\b\x1C\x05\x02\u0115\u0116\x03\x02\x02\x02\u0116\u0117\b\x1C" +
		"\x06\x02\u0117<\x03\x02\x02\x02\u0118\u0119\v\x02\x02\x02\u0119\u011A" +
		"\b\x1D\x07\x02\u011A>\x03\x02\x02\x02\u011B\u011D\x05#\x10\x02\u011C\u011B" +
		"\x03\x02\x02\x02\u011D\u011E\x03\x02\x02\x02\u011E\u011C\x03\x02\x02\x02" +
		"\u011E\u011F\x03\x02\x02\x02\u011F\u0120\x03\x02\x02\x02\u0120\u0121\x06" +
		"\x1E\x03\x02\u0121\u0122\x03\x02\x02\x02\u0122\u0123\b\x1E\x02\x02\u0123" +
		"@\x03\x02\x02\x02\u0124\u0125\x07b\x02\x02\u0125\u0126\x07b\x02\x02\u0126" +
		"\u0127\x07b\x02\x02\u0127\u0128\x03\x02\x02\x02\u0128\u0129\x06\x1F\x04" +
		"\x02\u0129\u012A\b\x1F\b\x02\u012A\u012B\x03\x02\x02\x02\u012B\u012C\b" +
		"\x1F\t\x02\u012CB\x03\x02\x02\x02\u012D\u012F\x07\x0F\x02\x02\u012E\u012D" +
		"\x03\x02\x02\x02\u012E\u012F\x03\x02\x02\x02\u012F\u0130\x03\x02\x02\x02" +
		"\u0130\u0131\x07\f\x02\x02\u0131\u0132\b \n\x02\u0132\u0133\x03\x02\x02" +
		"\x02\u0133\u0134\b \x02\x02\u0134\u0135\b \v\x02\u0135D\x03\x02\x02\x02" +
		"\u0136\u0137\x05\x13\b\x02\u0137\u013B\x05\x0F\x06\x02\u0138\u013A\x05" +
		"#\x10\x02\u0139\u0138\x03\x02\x02\x02\u013A\u013D\x03\x02\x02\x02\u013B" +
		"\u0139\x03\x02\x02\x02\u013B\u013C\x03\x02\x02\x02\u013C\u013E\x03\x02" +
		"\x02\x02\u013D\u013B\x03\x02\x02\x02\u013E\u013F\x07<\x02\x02\u013F\u0140" +
		"\x06!\x05\x02\u0140\u0141\b!\f\x02\u0141F\x03\x02\x02\x02\u0142\u0143" +
		"\x05\r\x05\x02\u0143\u0144\x05\x15\t\x02\u0144\u0145\x05\x17\n\x02\u0145" +
		"\u0149\x05\r\x05\x02\u0146\u0148\x05#\x10\x02\u0147\u0146\x03\x02\x02" +
		"\x02\u0148\u014B\x03\x02\x02\x02\u0149\u0147\x03\x02\x02\x02\u0149\u014A" +
		"\x03\x02\x02\x02\u014A\u014C\x03\x02\x02\x02\u014B\u0149\x03\x02\x02\x02" +
		"\u014C\u014D\x05\x13\b\x02\u014D\u0151\x05\x0F\x06\x02\u014E\u0150\x05" +
		"#\x10\x02\u014F\u014E\x03\x02\x02\x02\u0150\u0153\x03\x02\x02\x02\u0151" +
		"\u014F\x03\x02\x02\x02\u0151\u0152\x03\x02\x02\x02\u0152\u0154\x03\x02" +
		"\x02\x02\u0153\u0151\x03\x02\x02\x02\u0154\u0155\x07<\x02\x02\u0155\u0156" +
		"\x06\"\x06\x02\u0156\u0157\b\"\r\x02\u0157H\x03\x02\x02\x02\u0158\u0159" +
		"\x05\r\x05\x02\u0159\u015A\x05\x15\t\x02\u015A\u015B\x05\x17\n\x02\u015B" +
		"\u015F\x05\r\x05\x02\u015C\u015E\x05#\x10\x02\u015D\u015C\x03\x02\x02" +
		"\x02\u015E\u0161\x03\x02\x02\x02\u015F\u015D\x03\x02\x02\x02\u015F\u0160" +
		"\x03\x02\x02\x02\u0160\u0162\x03\x02\x02\x02\u0161\u015F\x03\x02\x02\x02" +
		"\u0162\u0163\x07<\x02\x02\u0163\u0164\x06#\x07\x02\u0164\u0165\b#\x0E" +
		"\x02\u0165J\x03\x02\x02\x02\u0166\u0167\x05\x17\n\x02\u0167\u0168\x05" +
		"\x1D\r\x02\u0168\u0169\x05\x13\b\x02\u0169\u016A\x05\x19\v\x02\u016A\u016B" +
		"\x05\t\x03\x02\u016B\u016F\x05\x11\x07\x02\u016C\u016E\x05#\x10\x02\u016D" +
		"\u016C\x03\x02\x02\x02\u016E\u0171\x03\x02\x02\x02\u016F\u016D\x03\x02" +
		"\x02\x02\u016F\u0170\x03\x02\x02\x02\u0170\u0172\x03\x02\x02\x02\u0171" +
		"\u016F\x03\x02\x02\x02\u0172\u0173\x07<\x02\x02\u0173\u0174\x06$\b\x02" +
		"\u0174\u0175\b$\x0F\x02\u0175L\x03\x02\x02\x02\u0176\u0177\x05\t\x03\x02" +
		"\u0177\u0178\x05\x07\x02\x02\u0178\u0179\x05\x17\n\x02\u0179\u017D\x05" +
		"\r\x05\x02\u017A\u017C\x05#\x10\x02\u017B\u017A\x03\x02\x02\x02\u017C" +
		"\u017F\x03\x02\x02\x02\u017D\u017B\x03\x02\x02\x02\u017D\u017E\x03\x02" +
		"\x02\x02\u017E\u0180\x03\x02\x02\x02\u017F\u017D\x03\x02\x02\x02\u0180" +
		"\u0181\x07<\x02\x02\u0181\u0182\x06%\t\x02\u0182\u0183\b%\x10\x02\u0183" +
		"N\x03\x02\x02\x02\u0184\u0185\x05\v\x04\x02\u0185\u0186\x05\r\x05\x02" +
		"\u0186\u0187\x05\x0F\x06\x02\u0187\u0188\x05\x07\x02\x02\u0188\u0189\x05" +
		"\x1B\f\x02\u0189\u018A\x05\x15\t\x02\u018A\u018E\x05\x19\v\x02\u018B\u018D" +
		"\x05#\x10\x02\u018C\u018B\x03\x02\x02\x02\u018D\u0190\x03\x02\x02\x02" +
		"\u018E\u018C\x03\x02\x02\x02\u018E\u018F\x03\x02\x02\x02\u018F\u0191\x03" +
		"\x02\x02\x02\u0190\u018E\x03\x02\x02\x02\u0191\u0192\x07<\x02\x02\u0192" +
		"\u0193\x06&\n\x02\u0193\u0194\b&\x11\x02\u0194P\x03\x02\x02\x02\u0195" +
		"\u0196\x05+\x14\x02\u0196\u0197\b\'\x12\x02\u0197R\x03\x02\x02\x02\u0198" +
		"\u0199\x059\x1B\x02\u0199\u019A\b(\x13\x02\u019AT\x03\x02\x02\x02\u019B" +
		"\u019D\n\x16\x02\x02\u019C\u019B\x03\x02\x02\x02\u019D\u019E\x03\x02\x02" +
		"\x02\u019E\u019F\x03\x02\x02\x02\u019E\u019C\x03\x02\x02\x02\u019F\u01A0" +
		"\x03\x02\x02\x02\u01A0\u01A1\b)\x14\x02\u01A1V\x03\x02\x02\x02\u01A2\u01A3" +
		"\x07b\x02\x02\u01A3\u01A4\x07b\x02\x02\u01A4\u01A5\x07b\x02\x02\u01A5" +
		"\u01A6\x03\x02\x02\x02\u01A6\u01A7\b*\x15\x02\u01A7\u01A8\x03\x02\x02" +
		"\x02\u01A8\u01A9\b*\v\x02\u01A9X\x03\x02\x02\x02\u01AA\u01AB\x05+\x14" +
		"\x02\u01AB\u01AC\x03\x02\x02\x02\u01AC\u01AD\b+\x16\x02\u01ADZ\x03\x02" +
		"\x02\x02\u01AE\u01AF\x059\x1B\x02\u01AF\u01B0\x03\x02\x02\x02\u01B0\u01B1" +
		"\b,\x17\x02\u01B1\\\x03\x02\x02\x02\u01B2\u01B4\x07\x0F\x02\x02\u01B3" +
		"\u01B2\x03\x02\x02\x02\u01B3\u01B4\x03\x02\x02\x02\u01B4\u01B5\x03\x02" +
		"\x02\x02\u01B5\u01B8\x07\f\x02\x02\u01B6\u01B8\n\x16\x02\x02\u01B7\u01B3" +
		"\x03\x02\x02\x02\u01B7\u01B6\x03\x02\x02\x02\u01B8\u01B9\x03\x02\x02\x02" +
		"\u01B9\u01BA\x03\x02\x02\x02\u01B9\u01B7\x03\x02\x02\x02\u01BA\u01BB\x03" +
		"\x02\x02\x02\u01BB\u01BC\b-\x18\x02\u01BC^\x03\x02\x02\x02\u01BD\u01BF" +
		"\x05#\x10\x02\u01BE\u01BD\x03\x02\x02\x02\u01BF\u01C0\x03\x02\x02\x02" +
		"\u01C0\u01BE\x03\x02\x02\x02\u01C0\u01C1\x03\x02\x02\x02\u01C1\u01C2\x03" +
		"\x02\x02\x02\u01C2\u01C3\b.\x02\x02\u01C3`\x03\x02\x02\x02\u01C4\u01C6" +
		"\x07\x0F\x02\x02\u01C5\u01C4\x03\x02\x02\x02\u01C5\u01C6\x03\x02\x02\x02" +
		"\u01C6\u01C7\x03\x02\x02\x02\u01C7\u01C8\x07\f\x02\x02\u01C8\u01C9\b/" +
		"\x19\x02\u01C9\u01CA\b/\x1A\x02\u01CA\u01CB\x03\x02\x02\x02\u01CB\u01CC" +
		"\b/\x02\x02\u01CC\u01CD\b/\x1B\x02\u01CDb\x03\x02\x02\x02\u01CE\u01D2" +
		"\x05\x1F\x0E\x02\u01CF\u01D2\x05!\x0F\x02\u01D0\u01D2\x07a\x02\x02\u01D1" +
		"\u01CE\x03\x02\x02\x02\u01D1\u01CF\x03\x02\x02\x02\u01D1\u01D0\x03\x02" +
		"\x02\x02\u01D2\u01D8\x03\x02\x02\x02\u01D3\u01D7\x05\x1F\x0E\x02\u01D4" +
		"\u01D7\x05!\x0F\x02\u01D5\u01D7\t\x19\x02\x02\u01D6\u01D3\x03\x02\x02" +
		"\x02\u01D6\u01D4\x03\x02\x02\x02\u01D6\u01D5\x03\x02\x02\x02\u01D7\u01DA" +
		"\x03\x02\x02\x02\u01D8\u01D6\x03\x02\x02\x02\u01D8\u01D9\x03\x02\x02\x02" +
		"\u01D9d\x03\x02\x02\x02\u01DA\u01D8\x03\x02\x02\x02\u01DB\u01DD\n\x16" +
		"\x02\x02\u01DC\u01DB\x03\x02\x02\x02\u01DD\u01DE\x03\x02\x02\x02\u01DE" +
		"\u01DF\x03\x02\x02\x02\u01DE\u01DC\x03\x02\x02\x02\u01DFf\x03\x02\x02" +
		"\x02\u01E0\u01E4\x07@\x02\x02\u01E1\u01E3\n\x16\x02\x02\u01E2\u01E1\x03" +
		"\x02\x02\x02\u01E3\u01E6\x03\x02\x02\x02\u01E4\u01E2\x03\x02\x02\x02\u01E4" +
		"\u01E5\x03\x02\x02\x02\u01E5\u01E8\x03\x02\x02\x02\u01E6\u01E4\x03\x02" +
		"\x02\x02\u01E7\u01E9\x07\x0F\x02\x02\u01E8\u01E7\x03\x02\x02\x02\u01E8" +
		"\u01E9\x03\x02\x02\x02\u01E9\u01EA\x03\x02\x02\x02\u01EA\u01EB\x07\f\x02" +
		"\x02\u01EB\u01EC\x062\v\x02\u01EC\u01ED\x03\x02\x02\x02\u01ED\u01EE\b" +
		"2\x02\x02\u01EEh\x03\x02\x02\x02\u01EF\u01F1\x05#\x10\x02\u01F0\u01EF" +
		"\x03\x02\x02\x02\u01F1\u01F2\x03\x02\x02\x02\u01F2\u01F0\x03\x02\x02\x02" +
		"\u01F2\u01F3\x03\x02\x02\x02\u01F3\u01F4\x03\x02\x02\x02\u01F4\u01F5\x06" +
		"3\f\x02\u01F5\u01F6\x03\x02\x02\x02\u01F6\u01F7\b3\x02\x02\u01F7j\x03" +
		"\x02\x02\x02\u01F8\u01FA\x07\x0F\x02\x02\u01F9\u01F8\x03\x02\x02\x02\u01F9" +
		"\u01FA\x03\x02\x02\x02\u01FA\u01FB\x03\x02\x02\x02\u01FB\u01FC\x07\f\x02" +
		"\x02\u01FC\u01FD\b4\x1C\x02\u01FDl\x03\x02\x02\x02\u01FE\u01FF\x07_\x02" +
		"\x02\u01FF\u0200\x065\r\x02\u0200\u0201\x03\x02\x02\x02\u0201\u0202\b" +
		"5\v\x02\u0202\u0203\b5\v\x02\u0203n\x03\x02\x02\x02\u0204\u0208\x05\x1F" +
		"\x0E\x02\u0205\u0208\x05!\x0F\x02\u0206\u0208\x07a\x02\x02\u0207\u0204" +
		"\x03\x02\x02\x02\u0207\u0205\x03\x02\x02\x02\u0207\u0206\x03\x02\x02\x02" +
		"\u0208\u020E\x03\x02\x02\x02\u0209\u020D\x05\x1F\x0E\x02\u020A\u020D\x05" +
		"!\x0F\x02\u020B\u020D\t\x19\x02\x02\u020C\u0209\x03\x02\x02\x02\u020C" +
		"\u020A\x03\x02\x02\x02\u020C\u020B\x03\x02\x02\x02\u020D\u0210\x03\x02" +
		"\x02\x02\u020E\u020C\x03\x02\x02\x02\u020E\u020F\x03\x02\x02\x02\u020F" +
		"\u0211\x03\x02\x02\x02\u0210\u020E\x03\x02\x02\x02\u0211\u0212\x066\x0E" +
		"\x02\u0212\u0213\b6\x1D\x02\u0213p\x03\x02\x02\x02\u0214\u0215\x07?\x02" +
		"\x02\u0215\u0216\x067\x0F\x02\u0216\u0217\b7\x1E\x02\u0217r\x03\x02\x02" +
		"\x02\u0218\u0219\x07~\x02\x02\u0219\u021A\b8\x1F\x02\u021At\x03\x02\x02" +
		"\x02\u021B\u021C\x05+\x14\x02\u021C\u021D\b9 \x02\u021Dv\x03\x02\x02\x02" +
		"\u021E\u021F\x059\x1B\x02\u021F\u0220\b:!\x02\u0220x\x03\x02\x02\x02\u0221" +
		"\u0223\n\x16\x02\x02\u0222\u0221\x03\x02\x02\x02\u0223\u0224\x03\x02";
	private static readonly _serializedATNSegment1: string =
		"\x02\x02\u0224\u0225\x03\x02\x02\x02\u0224\u0222\x03\x02\x02\x02\u0225" +
		"\u0226\x03\x02\x02\x02\u0226\u0227\b;\"\x02\u0227z\x03\x02\x02\x029\x02" +
		"\x03\x04\x05\x06\x9D\xA6\xA8\xB0\xB2\xB6\xBC\xBE\xC5\xCA\xCF\xD1\xD7\xDC" +
		"\xE6\xF4\xFA\xFC\xFE\u0100\u010B\u010D\u0110\u011E\u012E\u013B\u0149\u0151" +
		"\u015F\u016F\u017D\u018E\u019E\u01B3\u01B7\u01B9\u01C0\u01C5\u01D1\u01D6" +
		"\u01D8\u01DE\u01E4\u01E8\u01F2\u01F9\u0207\u020C\u020E\u0224#\b\x02\x02" +
		"\x03\x19\x02\x07\x03\x02\x03\x1C\x03\x07\x05\x02\x03\x1D\x04\x03\x1F\x05" +
		"\x07\x04\x02\x03 \x06\x06\x02\x02\x03!\x07\x03\"\b\x03#\t\x03$\n\x03%" +
		"\v\x03&\f\x03\'\r\x03(\x0E\x03)\x0F\x03*\x10\t\x14\x02\t\x15\x02\t\x16" +
		"\x02\x03/\x11\x03/\x12\x07\x06\x02\x034\x13\x036\x14\x037\x15\x038\x16" +
		"\x039\x17\x03:\x18\x03;\x19";
	public static readonly _serializedATN: string = Utils.join(
		[
			LGTemplateLexer._serializedATNSegment0,
			LGTemplateLexer._serializedATNSegment1,
		],
		"",
	);
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGTemplateLexer.__ATN) {
			LGTemplateLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGTemplateLexer._serializedATN));
		}

		return LGTemplateLexer.__ATN;
	}

}

