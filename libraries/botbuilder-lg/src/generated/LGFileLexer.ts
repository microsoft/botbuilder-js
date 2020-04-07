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
	public static readonly OPTIONS = 1;
	public static readonly COMMENTS = 2;
	public static readonly WS = 3;
	public static readonly NEWLINE = 4;
	public static readonly HASH = 5;
	public static readonly DASH = 6;
	public static readonly OBJECT_DEFINITION = 7;
	public static readonly EXPRESSION_FRAGMENT = 8;
	public static readonly LEFT_SQUARE_BRACKET = 9;
	public static readonly IMPORT = 10;
	public static readonly INVALID_TOKEN = 11;
	public static readonly WS_IN_NAME = 12;
	public static readonly NEWLINE_IN_NAME = 13;
	public static readonly IDENTIFIER = 14;
	public static readonly DOT = 15;
	public static readonly OPEN_PARENTHESIS = 16;
	public static readonly CLOSE_PARENTHESIS = 17;
	public static readonly COMMA = 18;
	public static readonly TEXT_IN_NAME = 19;
	public static readonly WS_IN_BODY = 20;
	public static readonly MULTILINE_PREFIX = 21;
	public static readonly NEWLINE_IN_BODY = 22;
	public static readonly IF = 23;
	public static readonly ELSEIF = 24;
	public static readonly ELSE = 25;
	public static readonly SWITCH = 26;
	public static readonly CASE = 27;
	public static readonly DEFAULT = 28;
	public static readonly ESCAPE_CHARACTER = 29;
	public static readonly EXPRESSION = 30;
	public static readonly TEXT = 31;
	public static readonly MULTILINE_SUFFIX = 32;
	public static readonly WS_IN_STRUCTURE_NAME = 33;
	public static readonly NEWLINE_IN_STRUCTURE_NAME = 34;
	public static readonly STRUCTURE_NAME = 35;
	public static readonly TEXT_IN_STRUCTURE_NAME = 36;
	public static readonly STRUCTURED_COMMENTS = 37;
	public static readonly WS_IN_STRUCTURE_BODY = 38;
	public static readonly STRUCTURED_NEWLINE = 39;
	public static readonly STRUCTURED_BODY_END = 40;
	public static readonly STRUCTURE_IDENTIFIER = 41;
	public static readonly STRUCTURE_EQUALS = 42;
	public static readonly STRUCTURE_OR_MARK = 43;
	public static readonly ESCAPE_CHARACTER_IN_STRUCTURE_BODY = 44;
	public static readonly EXPRESSION_IN_STRUCTURE_BODY = 45;
	public static readonly TEXT_IN_STRUCTURE_BODY = 46;
	public static readonly TEMPLATE_NAME_MODE = 1;
	public static readonly TEMPLATE_BODY_MODE = 2;
	public static readonly MULTILINE_MODE = 3;
	public static readonly STRUCTURE_NAME_MODE = 4;
	public static readonly STRUCTURE_BODY_MODE = 5;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "TEMPLATE_NAME_MODE", "TEMPLATE_BODY_MODE", "MULTILINE_MODE", 
		"STRUCTURE_NAME_MODE", "STRUCTURE_BODY_MODE",
	];

	public static readonly ruleNames: string[] = [
		"A", "C", "D", "E", "F", "H", "I", "L", "S", "T", "U", "W", "LETTER", 
		"NUMBER", "WHITESPACE", "STRING_LITERAL", "STRING_INTERPOLATION", "ESCAPE_CHARACTER_FRAGMENT", 
		"OPTIONS", "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "OBJECT_DEFINITION", 
		"EXPRESSION_FRAGMENT", "LEFT_SQUARE_BRACKET", "IMPORT", "INVALID_TOKEN", 
		"WS_IN_NAME", "NEWLINE_IN_NAME", "IDENTIFIER", "DOT", "OPEN_PARENTHESIS", 
		"CLOSE_PARENTHESIS", "COMMA", "TEXT_IN_NAME", "WS_IN_BODY", "MULTILINE_PREFIX", 
		"NEWLINE_IN_BODY", "IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", 
		"ESCAPE_CHARACTER", "EXPRESSION", "TEXT", "MULTILINE_SUFFIX", "MULTILINE_ESCAPE_CHARACTER", 
		"MULTILINE_EXPRESSION", "MULTILINE_TEXT", "WS_IN_STRUCTURE_NAME", "NEWLINE_IN_STRUCTURE_NAME", 
		"STRUCTURE_NAME", "TEXT_IN_STRUCTURE_NAME", "STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", 
		"STRUCTURED_NEWLINE", "STRUCTURED_BODY_END", "STRUCTURE_IDENTIFIER", "STRUCTURE_EQUALS", 
		"STRUCTURE_OR_MARK", "ESCAPE_CHARACTER_IN_STRUCTURE_BODY", "EXPRESSION_IN_STRUCTURE_BODY", 
		"TEXT_IN_STRUCTURE_BODY",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, "'.'", "'('", "')'", "','", undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"'|'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "OPTIONS", "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "OBJECT_DEFINITION", 
		"EXPRESSION_FRAGMENT", "LEFT_SQUARE_BRACKET", "IMPORT", "INVALID_TOKEN", 
		"WS_IN_NAME", "NEWLINE_IN_NAME", "IDENTIFIER", "DOT", "OPEN_PARENTHESIS", 
		"CLOSE_PARENTHESIS", "COMMA", "TEXT_IN_NAME", "WS_IN_BODY", "MULTILINE_PREFIX", 
		"NEWLINE_IN_BODY", "IF", "ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", 
		"ESCAPE_CHARACTER", "EXPRESSION", "TEXT", "MULTILINE_SUFFIX", "WS_IN_STRUCTURE_NAME", 
		"NEWLINE_IN_STRUCTURE_NAME", "STRUCTURE_NAME", "TEXT_IN_STRUCTURE_NAME", 
		"STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", "STRUCTURED_NEWLINE", "STRUCTURED_BODY_END", 
		"STRUCTURE_IDENTIFIER", "STRUCTURE_EQUALS", "STRUCTURE_OR_MARK", "ESCAPE_CHARACTER_IN_STRUCTURE_BODY", 
		"EXPRESSION_IN_STRUCTURE_BODY", "TEXT_IN_STRUCTURE_BODY",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileLexer._LITERAL_NAMES, LGFileLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  ignoreWS = true; // usually we ignore whitespace, but inside template, whitespace is significant
	  inTemplate = false; // whether we are in the template
	  beginOfTemplateBody = false; // whether we are at the begining of template body
	  inMultiline = false; // whether we are in multiline
	  beginOfTemplateLine = false;// weather we are at the begining of template string
	  inStructuredValue = false; // weather we are in the structure value
	  beginOfStructureProperty = false; // weather we are at the begining of structure property


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
		case 22:
			this.HASH_action(_localctx, actionIndex);
			break;

		case 23:
			this.DASH_action(_localctx, actionIndex);
			break;

		case 27:
			this.IMPORT_action(_localctx, actionIndex);
			break;

		case 28:
			this.INVALID_TOKEN_action(_localctx, actionIndex);
			break;

		case 30:
			this.NEWLINE_IN_NAME_action(_localctx, actionIndex);
			break;

		case 38:
			this.MULTILINE_PREFIX_action(_localctx, actionIndex);
			break;

		case 39:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 40:
			this.IF_action(_localctx, actionIndex);
			break;

		case 41:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 42:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 43:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 44:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 45:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 46:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 47:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 48:
			this.TEXT_action(_localctx, actionIndex);
			break;

		case 49:
			this.MULTILINE_SUFFIX_action(_localctx, actionIndex);
			break;

		case 54:
			this.NEWLINE_IN_STRUCTURE_NAME_action(_localctx, actionIndex);
			break;

		case 59:
			this.STRUCTURED_NEWLINE_action(_localctx, actionIndex);
			break;

		case 60:
			this.STRUCTURED_BODY_END_action(_localctx, actionIndex);
			break;

		case 61:
			this.STRUCTURE_IDENTIFIER_action(_localctx, actionIndex);
			break;

		case 62:
			this.STRUCTURE_EQUALS_action(_localctx, actionIndex);
			break;

		case 63:
			this.STRUCTURE_OR_MARK_action(_localctx, actionIndex);
			break;

		case 64:
			this.ESCAPE_CHARACTER_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 65:
			this.EXPRESSION_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 66:
			this.TEXT_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;
		}
	}
	private HASH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			 this.inTemplate = true; this.beginOfTemplateBody = false; 
			break;
		}
	}
	private DASH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 1:
			 this.beginOfTemplateLine = true; this.beginOfTemplateBody = false; 
			break;
		}
	}
	private IMPORT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 2:
			 this.inTemplate = false;
			break;
		}
	}
	private INVALID_TOKEN_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 3:
			 this.inTemplate = false; this.beginOfTemplateBody = false; 
			break;
		}
	}
	private NEWLINE_IN_NAME_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 4:
			 this.beginOfTemplateBody = true;
			break;
		}
	}
	private MULTILINE_PREFIX_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 5:
			 this.inMultiline = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private NEWLINE_IN_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 6:
			 this.ignoreWS = true;
			break;
		}
	}
	private IF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 7:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private ELSEIF_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 8:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private ELSE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 9:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private SWITCH_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 10:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private CASE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 11:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private DEFAULT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 12:
			 this.ignoreWS = true; this.beginOfTemplateLine = false;
			break;
		}
	}
	private ESCAPE_CHARACTER_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 13:
			 this.ignoreWS = false; this.beginOfTemplateLine = false;
			break;
		}
	}
	private EXPRESSION_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 14:
			 this.ignoreWS = false; this.beginOfTemplateLine = false;
			break;
		}
	}
	private TEXT_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 15:
			 this.ignoreWS = false; this.beginOfTemplateLine = false;
			break;
		}
	}
	private MULTILINE_SUFFIX_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 16:
			 this.inMultiline = false; 
			break;
		}
	}
	private NEWLINE_IN_STRUCTURE_NAME_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 17:
			 this.ignoreWS = true;
			break;

		case 18:
			this.beginOfStructureProperty = true;
			break;
		}
	}
	private STRUCTURED_NEWLINE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 19:
			 this.ignoreWS = true; this.inStructuredValue = false; this.beginOfStructureProperty = true;
			break;
		}
	}
	private STRUCTURED_BODY_END_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 20:
			 this.inTemplate = false; this.beginOfTemplateBody = false;
			break;
		}
	}
	private STRUCTURE_IDENTIFIER_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 21:
			this.beginOfStructureProperty = false;
			break;
		}
	}
	private STRUCTURE_EQUALS_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 22:
			this.inStructuredValue = true;
			break;
		}
	}
	private STRUCTURE_OR_MARK_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 23:
			 this.ignoreWS = true; 
			break;
		}
	}
	private ESCAPE_CHARACTER_IN_STRUCTURE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 24:
			 this.ignoreWS = false; 
			break;
		}
	}
	private EXPRESSION_IN_STRUCTURE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 25:
			 this.ignoreWS = false; 
			break;
		}
	}
	private TEXT_IN_STRUCTURE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 26:
			 this.ignoreWS = false; this.beginOfStructureProperty = false;
			break;
		}
	}
	// @Override
	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 23:
			return this.DASH_sempred(_localctx, predIndex);

		case 26:
			return this.LEFT_SQUARE_BRACKET_sempred(_localctx, predIndex);

		case 37:
			return this.WS_IN_BODY_sempred(_localctx, predIndex);

		case 38:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 40:
			return this.IF_sempred(_localctx, predIndex);

		case 41:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 42:
			return this.ELSE_sempred(_localctx, predIndex);

		case 43:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 44:
			return this.CASE_sempred(_localctx, predIndex);

		case 45:
			return this.DEFAULT_sempred(_localctx, predIndex);

		case 57:
			return this.STRUCTURED_COMMENTS_sempred(_localctx, predIndex);

		case 58:
			return this.WS_IN_STRUCTURE_BODY_sempred(_localctx, predIndex);

		case 60:
			return this.STRUCTURED_BODY_END_sempred(_localctx, predIndex);

		case 61:
			return this.STRUCTURE_IDENTIFIER_sempred(_localctx, predIndex);

		case 62:
			return this.STRUCTURE_EQUALS_sempred(_localctx, predIndex);
		}
		return true;
	}
	private DASH_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  this.inTemplate ;
		}
		return true;
	}
	private LEFT_SQUARE_BRACKET_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return  this.inTemplate && this.beginOfTemplateBody ;
		}
		return true;
	}
	private WS_IN_BODY_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return this.ignoreWS;
		}
		return true;
	}
	private MULTILINE_PREFIX_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return  !this.inMultiline  && this.beginOfTemplateLine ;
		}
		return true;
	}
	private IF_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return  this.beginOfTemplateLine;
		}
		return true;
	}
	private ELSEIF_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private ELSE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return  this.beginOfTemplateLine ;
		}
		return true;
	}
	private SWITCH_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 7:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private CASE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 8:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private DEFAULT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 9:
			return this.beginOfTemplateLine;
		}
		return true;
	}
	private STRUCTURED_COMMENTS_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 10:
			return  !this.inStructuredValue && this.beginOfStructureProperty;
		}
		return true;
	}
	private WS_IN_STRUCTURE_BODY_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 11:
			return this.ignoreWS;
		}
		return true;
	}
	private STRUCTURED_BODY_END_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 12:
			return !this.inStructuredValue;
		}
		return true;
	}
	private STRUCTURE_IDENTIFIER_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 13:
			return  !this.inStructuredValue && this.beginOfStructureProperty;
		}
		return true;
	}
	private STRUCTURE_EQUALS_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 14:
			return !this.inStructuredValue;
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x020\u0276\b\x01" +
		"\b\x01\b\x01\b\x01\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04" +
		"\x04\x05\t\x05\x04\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t" +
		"\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t" +
		"\x10\x04\x11\t\x11\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t" +
		"\x15\x04\x16\t\x16\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t" +
		"\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t" +
		"\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t" +
		"\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x04" +
		"0\t0\x041\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x047\t7\x048\t8\x04" +
		"9\t9\x04:\t:\x04;\t;\x04<\t<\x04=\t=\x04>\t>\x04?\t?\x04@\t@\x04A\tA\x04" +
		"B\tB\x04C\tC\x04D\tD\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03" +
		"\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03" +
		"\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03" +
		"\x0F\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x07\x11\xB1\n\x11" +
		"\f\x11\x0E\x11\xB4\v\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x07\x11" +
		"\xBB\n\x11\f\x11\x0E\x11\xBE\v\x11\x03\x11\x05\x11\xC1\n\x11\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x07\x12\xC7\n\x12\f\x12\x0E\x12\xCA\v\x12\x03\x12" +
		"\x03\x12\x03\x13\x03\x13\x05\x13\xD0\n\x13\x03\x14\x03\x14\x07\x14\xD4" +
		"\n\x14\f\x14\x0E\x14\xD7\v\x14\x03\x14\x03\x14\x03\x14\x03\x14\x06\x14" +
		"\xDD\n\x14\r\x14\x0E\x14\xDE\x03\x15\x03\x15\x07\x15\xE3\n\x15\f\x15\x0E" +
		"\x15\xE6\v\x15\x03\x15\x03\x15\x03\x16\x06\x16\xEB\n\x16\r\x16\x0E\x16" +
		"\xEC\x03\x16\x03\x16\x03\x17\x05\x17\xF2\n\x17\x03\x17\x03\x17\x03\x17" +
		"\x03\x17\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19" +
		"\x03\x19\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u0107" +
		"\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x06\x1A\u010D\n\x1A\r\x1A\x0E\x1A" +
		"\u010E\x07\x1A\u0111\n\x1A\f\x1A\x0E\x1A\u0114\v\x1A\x03\x1A\x03\x1A\x03" +
		"\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x06\x1B\u011E\n\x1B\r\x1B" +
		"\x0E\x1B\u011F\x03\x1B\x05\x1B\u0123\n\x1B\x03\x1C\x03\x1C\x03\x1C\x03" +
		"\x1C\x03\x1C\x03\x1D\x03\x1D\x07\x1D\u012C\n\x1D\f\x1D\x0E\x1D\u012F\v" +
		"\x1D\x03\x1D\x03\x1D\x03\x1D\x07\x1D\u0134\n\x1D\f\x1D\x0E\x1D\u0137\v" +
		"\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x06\x1F\u0140" +
		"\n\x1F\r\x1F\x0E\x1F\u0141\x03\x1F\x03\x1F\x03 \x05 \u0147\n \x03 \x03" +
		" \x03 \x03 \x03 \x03 \x03!\x03!\x03!\x05!\u0152\n!\x03!\x03!\x03!\x07" +
		"!\u0157\n!\f!\x0E!\u015A\v!\x03\"\x03\"\x03#\x03#\x03$\x03$\x03%\x03%" +
		"\x03&\x06&\u0165\n&\r&\x0E&\u0166\x03\'\x06\'\u016A\n\'\r\'\x0E\'\u016B" +
		"\x03\'\x03\'\x03\'\x03\'\x03(\x03(\x03(\x03(\x03(\x03(\x03(\x03(\x03(" +
		"\x03)\x05)\u017C\n)\x03)\x03)\x03)\x03)\x03)\x03)\x03*\x03*\x03*\x07*" +
		"\u0187\n*\f*\x0E*\u018A\v*\x03*\x03*\x03*\x03*\x03+\x03+\x03+\x03+\x03" +
		"+\x07+\u0195\n+\f+\x0E+\u0198\v+\x03+\x03+\x03+\x07+\u019D\n+\f+\x0E+" +
		"\u01A0\v+\x03+\x03+\x03+\x03+\x03,\x03,\x03,\x03,\x03,\x07,\u01AB\n,\f" +
		",\x0E,\u01AE\v,\x03,\x03,\x03,\x03,\x03-\x03-\x03-\x03-\x03-\x03-\x03" +
		"-\x07-\u01BB\n-\f-\x0E-\u01BE\v-\x03-\x03-\x03-\x03-\x03.\x03.\x03.\x03" +
		".\x03.\x07.\u01C9\n.\f.\x0E.\u01CC\v.\x03.\x03.\x03.\x03.\x03/\x03/\x03" +
		"/\x03/\x03/\x03/\x03/\x03/\x07/\u01DA\n/\f/\x0E/\u01DD\v/\x03/\x03/\x03" +
		"/\x03/\x030\x030\x030\x031\x031\x031\x032\x062\u01EA\n2\r2\x0E2\u01EB" +
		"\x032\x032\x033\x033\x033\x033\x033\x033\x033\x033\x034\x034\x034\x03" +
		"4\x035\x035\x035\x035\x036\x056\u0201\n6\x036\x036\x066\u0205\n6\r6\x0E" +
		"6\u0206\x036\x036\x037\x067\u020C\n7\r7\x0E7\u020D\x037\x037\x038\x05" +
		"8\u0213\n8\x038\x038\x038\x038\x038\x038\x038\x039\x039\x039\x059\u021F" +
		"\n9\x039\x039\x039\x079\u0224\n9\f9\x0E9\u0227\v9\x03:\x06:\u022A\n:\r" +
		":\x0E:\u022B\x03;\x03;\x07;\u0230\n;\f;\x0E;\u0233\v;\x03;\x05;\u0236" +
		"\n;\x03;\x03;\x03;\x03;\x03;\x03<\x06<\u023E\n<\r<\x0E<\u023F\x03<\x03" +
		"<\x03<\x03<\x03=\x05=\u0247\n=\x03=\x03=\x03=\x03>\x03>\x03>\x03>\x03" +
		">\x03>\x03>\x03?\x03?\x03?\x05?\u0256\n?\x03?\x03?\x03?\x07?\u025B\n?" +
		"\f?\x0E?\u025E\v?\x03?\x03?\x03?\x03@\x03@\x03@\x03@\x03A\x03A\x03A\x03" +
		"B\x03B\x03B\x03C\x03C\x03C\x03D\x06D\u0271\nD\rD\x0ED\u0272\x03D\x03D" +
		"\f\xB2\xBC\xC8\u012D\u0135\u0166\u01EB\u0206\u022B\u0272\x02\x02E\b\x02" +
		"\x02\n\x02\x02\f\x02\x02\x0E\x02\x02\x10\x02\x02\x12\x02\x02\x14\x02\x02" +
		"\x16\x02\x02\x18\x02\x02\x1A\x02\x02\x1C\x02\x02\x1E\x02\x02 \x02\x02" +
		"\"\x02\x02$\x02\x02&\x02\x02(\x02\x02*\x02\x02,\x02\x03.\x02\x040\x02" +
		"\x052\x02\x064\x02\x076\x02\b8\x02\t:\x02\n<\x02\v>\x02\f@\x02\rB\x02" +
		"\x0ED\x02\x0FF\x02\x10H\x02\x11J\x02\x12L\x02\x13N\x02\x14P\x02\x15R\x02" +
		"\x16T\x02\x17V\x02\x18X\x02\x19Z\x02\x1A\\\x02\x1B^\x02\x1C`\x02\x1Db" +
		"\x02\x1Ed\x02\x1Ff\x02 h\x02!j\x02\"l\x02\x02n\x02\x02p\x02\x02r\x02#" +
		"t\x02$v\x02%x\x02&z\x02\'|\x02(~\x02)\x80\x02*\x82\x02+\x84\x02,\x86\x02" +
		"-\x88\x02.\x8A\x02/\x8C\x020\b\x02\x03\x04\x05\x06\x07\x1D\x04\x02CCc" +
		"c\x04\x02EEee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04\x02JJjj\x04\x02" +
		"KKkk\x04\x02NNnn\x04\x02UUuu\x04\x02VVvv\x04\x02WWww\x04\x02YYyy\x04\x02" +
		"C\\c|\x06\x02\v\v\"\"\xA2\xA2\uFF01\uFF01\x04\x02))^^\x03\x02))\x04\x02" +
		"$$^^\x03\x02$$\x04\x02^^bb\x03\x02bb\x04\x02\f\f\x0F\x0F\t\x02\f\f\x0F" +
		"\x0F$$))bb}}\x7F\x7F\x06\x02$$))bb\x7F\x7F\x06\x02\f\f\x0F\x0F]]__\x05" +
		"\x02\f\f\x0F\x0F*+\x04\x02//aa\x04\x02/0aa\u029F\x02,\x03\x02\x02\x02" +
		"\x02.\x03\x02\x02\x02\x020\x03\x02\x02\x02\x022\x03\x02\x02\x02\x024\x03" +
		"\x02\x02\x02\x026\x03\x02\x02\x02\x028\x03\x02\x02\x02\x02:\x03\x02\x02" +
		"\x02\x02<\x03\x02\x02\x02\x02>\x03\x02\x02\x02\x02@\x03\x02\x02\x02\x03" +
		"B\x03\x02\x02\x02\x03D\x03\x02\x02\x02\x03F\x03\x02\x02\x02\x03H\x03\x02" +
		"\x02\x02\x03J\x03\x02\x02\x02\x03L\x03\x02\x02\x02\x03N\x03\x02\x02\x02" +
		"\x03P\x03\x02\x02\x02\x04R\x03\x02\x02\x02\x04T\x03\x02\x02\x02\x04V\x03" +
		"\x02\x02\x02\x04X\x03\x02\x02\x02\x04Z\x03\x02\x02\x02\x04\\\x03\x02\x02" +
		"\x02\x04^\x03\x02\x02\x02\x04`\x03\x02\x02\x02\x04b\x03\x02\x02\x02\x04" +
		"d\x03\x02\x02\x02\x04f\x03\x02\x02\x02\x04h\x03\x02\x02\x02\x05j\x03\x02" +
		"\x02\x02\x05l\x03\x02\x02\x02\x05n\x03\x02\x02\x02\x05p\x03\x02\x02\x02" +
		"\x06r\x03\x02\x02\x02\x06t\x03\x02\x02\x02\x06v\x03\x02\x02\x02\x06x\x03" +
		"\x02\x02\x02\x07z\x03\x02\x02\x02\x07|\x03\x02\x02\x02\x07~\x03\x02\x02" +
		"\x02\x07\x80\x03\x02\x02\x02\x07\x82\x03\x02\x02\x02\x07\x84\x03\x02\x02" +
		"\x02\x07\x86\x03\x02\x02\x02\x07\x88\x03\x02\x02\x02\x07\x8A\x03\x02\x02" +
		"\x02\x07\x8C\x03\x02\x02\x02\b\x8E\x03\x02\x02\x02\n\x90\x03\x02\x02\x02" +
		"\f\x92\x03\x02\x02\x02\x0E\x94\x03\x02\x02\x02\x10\x96\x03\x02\x02\x02" +
		"\x12\x98\x03\x02\x02\x02\x14\x9A\x03\x02\x02\x02\x16\x9C\x03\x02\x02\x02" +
		"\x18\x9E\x03\x02\x02\x02\x1A\xA0\x03\x02\x02\x02\x1C\xA2\x03\x02\x02\x02" +
		"\x1E\xA4\x03\x02\x02\x02 \xA6\x03\x02\x02\x02\"\xA8\x03\x02\x02\x02$\xAA" +
		"\x03\x02\x02\x02&\xC0\x03\x02\x02\x02(\xC2\x03\x02\x02\x02*\xCD\x03\x02" +
		"\x02\x02,\xD1\x03\x02\x02\x02.\xE0\x03\x02\x02\x020\xEA\x03\x02\x02\x02" +
		"2\xF1\x03\x02\x02\x024\xF7\x03\x02\x02\x026\xFC\x03\x02\x02\x028\u0102" +
		"\x03\x02\x02\x02:\u0117\x03\x02\x02\x02<\u0124\x03\x02\x02\x02>\u0129" +
		"\x03\x02\x02\x02@\u013B\x03\x02\x02\x02B\u013F\x03\x02\x02\x02D\u0146" +
		"\x03\x02\x02\x02F\u0151\x03\x02\x02\x02H\u015B\x03\x02\x02\x02J\u015D" +
		"\x03\x02\x02\x02L\u015F\x03\x02\x02\x02N\u0161\x03\x02\x02\x02P\u0164" +
		"\x03\x02\x02\x02R\u0169\x03\x02\x02\x02T\u0171\x03\x02\x02\x02V\u017B" +
		"\x03\x02\x02\x02X\u0183\x03\x02\x02\x02Z\u018F\x03\x02\x02\x02\\\u01A5" +
		"\x03\x02\x02\x02^\u01B3\x03\x02\x02\x02`\u01C3\x03\x02\x02\x02b\u01D1" +
		"\x03\x02\x02\x02d\u01E2\x03\x02\x02\x02f\u01E5\x03\x02\x02\x02h\u01E9" +
		"\x03\x02\x02\x02j\u01EF\x03\x02\x02\x02l\u01F7\x03\x02\x02\x02n\u01FB" +
		"\x03\x02\x02\x02p\u0204\x03\x02\x02\x02r\u020B\x03\x02\x02\x02t\u0212" +
		"\x03\x02\x02\x02v\u021E\x03\x02\x02\x02x\u0229\x03\x02\x02\x02z\u022D" +
		"\x03\x02\x02\x02|\u023D\x03\x02\x02\x02~\u0246\x03\x02\x02\x02\x80\u024B" +
		"\x03\x02\x02\x02\x82\u0255\x03\x02\x02\x02\x84\u0262\x03\x02\x02\x02\x86" +
		"\u0266\x03\x02\x02\x02\x88\u0269\x03\x02\x02\x02\x8A\u026C\x03\x02\x02" +
		"\x02\x8C\u0270\x03\x02\x02\x02\x8E\x8F\t\x02\x02\x02\x8F\t\x03\x02\x02" +
		"\x02\x90\x91\t\x03\x02\x02\x91\v\x03\x02\x02\x02\x92\x93\t\x04\x02\x02" +
		"\x93\r\x03\x02\x02\x02\x94\x95\t\x05\x02\x02\x95\x0F\x03\x02\x02\x02\x96" +
		"\x97\t\x06\x02\x02\x97\x11\x03\x02\x02\x02\x98\x99\t\x07\x02\x02\x99\x13" +
		"\x03\x02\x02\x02\x9A\x9B\t\b\x02\x02\x9B\x15\x03\x02\x02\x02\x9C\x9D\t" +
		"\t\x02\x02\x9D\x17\x03\x02\x02\x02\x9E\x9F\t\n\x02\x02\x9F\x19\x03\x02" +
		"\x02\x02\xA0\xA1\t\v\x02\x02\xA1\x1B\x03\x02\x02\x02\xA2\xA3\t\f\x02\x02" +
		"\xA3\x1D\x03\x02\x02\x02\xA4\xA5\t\r\x02\x02\xA5\x1F\x03\x02\x02\x02\xA6" +
		"\xA7\t\x0E\x02\x02\xA7!\x03\x02\x02\x02\xA8\xA9\x042;\x02\xA9#\x03\x02" +
		"\x02\x02\xAA\xAB\t\x0F\x02\x02\xAB%\x03\x02\x02\x02\xAC\xB2\x07)\x02\x02" +
		"\xAD\xAE\x07^\x02\x02\xAE\xB1\t\x10\x02\x02\xAF\xB1\n\x11\x02\x02\xB0" +
		"\xAD\x03\x02\x02\x02\xB0\xAF\x03\x02\x02\x02\xB1\xB4\x03\x02\x02\x02\xB2" +
		"\xB3\x03\x02\x02\x02\xB2\xB0\x03\x02\x02\x02\xB3\xB5\x03\x02\x02\x02\xB4" +
		"\xB2\x03\x02\x02\x02\xB5\xC1\x07)\x02\x02\xB6\xBC\x07$\x02\x02\xB7\xB8" +
		"\x07^\x02\x02\xB8\xBB\t\x12\x02\x02\xB9\xBB\n\x13\x02\x02\xBA\xB7\x03" +
		"\x02\x02\x02\xBA\xB9\x03\x02\x02\x02\xBB\xBE\x03\x02\x02\x02\xBC\xBD\x03" +
		"\x02\x02\x02\xBC\xBA\x03\x02\x02\x02\xBD\xBF\x03\x02\x02\x02\xBE\xBC\x03" +
		"\x02\x02\x02\xBF\xC1\x07$\x02\x02\xC0\xAC\x03\x02\x02\x02\xC0\xB6\x03" +
		"\x02\x02\x02\xC1\'\x03\x02\x02\x02\xC2\xC8\x07b\x02\x02\xC3\xC4\x07^\x02" +
		"\x02\xC4\xC7\t\x14\x02\x02\xC5\xC7\n\x15\x02\x02\xC6\xC3\x03\x02\x02\x02" +
		"\xC6\xC5\x03\x02\x02\x02\xC7\xCA\x03\x02\x02\x02\xC8\xC9\x03\x02\x02\x02" +
		"\xC8\xC6\x03\x02\x02\x02\xC9\xCB\x03\x02\x02\x02\xCA\xC8\x03\x02\x02\x02" +
		"\xCB\xCC\x07b\x02\x02\xCC)\x03\x02\x02\x02\xCD\xCF\x07^\x02\x02\xCE\xD0" +
		"\n\x16\x02\x02\xCF\xCE\x03\x02\x02\x02\xCF\xD0\x03\x02\x02\x02\xD0+\x03" +
		"\x02\x02\x02\xD1\xD5\x07@\x02\x02\xD2\xD4\x05$\x10\x02\xD3\xD2\x03\x02" +
		"\x02\x02\xD4\xD7\x03\x02\x02\x02\xD5\xD3\x03\x02\x02\x02\xD5\xD6\x03\x02" +
		"\x02\x02\xD6\xD8\x03\x02\x02\x02\xD7\xD5\x03\x02\x02\x02\xD8\xD9\x07#" +
		"\x02\x02\xD9\xDA\x07%\x02\x02\xDA\xDC\x03\x02\x02\x02\xDB\xDD\n\x16\x02" +
		"\x02\xDC\xDB\x03\x02\x02\x02\xDD\xDE\x03\x02\x02\x02\xDE\xDC\x03\x02\x02" +
		"\x02\xDE\xDF\x03\x02\x02\x02\xDF-\x03\x02\x02\x02\xE0\xE4\x07@\x02\x02" +
		"\xE1\xE3\n\x16\x02\x02\xE2\xE1\x03\x02\x02\x02\xE3\xE6\x03\x02\x02\x02" +
		"\xE4\xE2\x03\x02\x02\x02\xE4\xE5\x03\x02\x02\x02\xE5\xE7\x03\x02\x02\x02" +
		"\xE6\xE4\x03\x02\x02\x02\xE7\xE8\b\x15\x02\x02\xE8/\x03\x02\x02\x02\xE9" +
		"\xEB\x05$\x10\x02\xEA\xE9\x03\x02\x02\x02\xEB\xEC\x03\x02\x02\x02\xEC" +
		"\xEA\x03\x02\x02\x02\xEC\xED\x03\x02\x02\x02\xED\xEE\x03\x02\x02\x02\xEE" +
		"\xEF\b\x16\x02\x02\xEF1\x03\x02\x02\x02\xF0\xF2\x07\x0F\x02\x02\xF1\xF0" +
		"\x03\x02\x02\x02\xF1\xF2\x03\x02\x02\x02\xF2\xF3\x03\x02\x02\x02\xF3\xF4" +
		"\x07\f\x02\x02\xF4\xF5\x03\x02\x02\x02\xF5\xF6\b\x17\x02\x02\xF63\x03" +
		"\x02\x02\x02\xF7\xF8\x07%\x02\x02\xF8\xF9\b\x18\x03\x02\xF9\xFA\x03\x02" +
		"\x02\x02\xFA\xFB\b\x18\x04\x02\xFB5\x03\x02\x02\x02\xFC\xFD\x07/\x02\x02" +
		"\xFD\xFE\x06\x19\x02\x02\xFE\xFF\b\x19\x05\x02\xFF\u0100\x03\x02\x02\x02" +
		"\u0100\u0101\b\x19\x06\x02\u01017\x03\x02\x02\x02\u0102\u0112\x07}\x02" +
		"\x02\u0103\u0111\x05$\x10\x02\u0104\u0107\x05F!\x02\u0105\u0107\x05&\x11" +
		"\x02\u0106\u0104\x03\x02\x02\x02\u0106\u0105\x03\x02\x02\x02\u0107\u0108" +
		"\x03\x02\x02\x02\u0108\u010C\x07<\x02\x02\u0109\u010D\x05&\x11\x02\u010A" +
		"\u010D\n\x17\x02\x02\u010B\u010D\x058\x1A\x02\u010C\u0109\x03\x02\x02" +
		"\x02\u010C\u010A\x03\x02\x02\x02\u010C\u010B\x03\x02\x02\x02\u010D\u010E" +
		"\x03\x02\x02\x02\u010E\u010C\x03\x02\x02\x02\u010E\u010F\x03\x02\x02\x02" +
		"\u010F\u0111\x03\x02\x02\x02\u0110\u0103\x03\x02\x02\x02\u0110\u0106\x03" +
		"\x02\x02\x02\u0111\u0114\x03\x02\x02\x02\u0112\u0110\x03\x02\x02\x02\u0112" +
		"\u0113\x03\x02\x02\x02\u0113\u0115\x03\x02\x02\x02\u0114\u0112\x03\x02" +
		"\x02\x02\u0115\u0116\x07\x7F\x02\x02\u01169\x03\x02\x02\x02\u0117\u0118" +
		"\x07&\x02\x02\u0118\u011D\x07}\x02\x02\u0119\u011E\x05&\x11\x02\u011A" +
		"\u011E\x05(\x12\x02\u011B\u011E\x058\x1A\x02\u011C\u011E\n\x18\x02\x02" +
		"\u011D\u0119\x03\x02\x02\x02\u011D\u011A\x03\x02\x02\x02\u011D\u011B\x03" +
		"\x02\x02\x02\u011D\u011C\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F" +
		"\u011D\x03\x02\x02\x02\u011F\u0120\x03\x02\x02\x02\u0120\u0122\x03\x02" +
		"\x02\x02\u0121\u0123\x07\x7F\x02\x02\u0122\u0121\x03\x02\x02\x02\u0122" +
		"\u0123\x03\x02\x02\x02\u0123;\x03\x02\x02\x02\u0124\u0125\x07]\x02\x02" +
		"\u0125\u0126\x06\x1C\x03\x02\u0126\u0127\x03\x02\x02\x02\u0127\u0128\b" +
		"\x1C\x07\x02\u0128=\x03\x02\x02\x02\u0129\u012D\x07]\x02\x02\u012A\u012C" +
		"\n\x19\x02\x02\u012B\u012A\x03\x02\x02\x02\u012C\u012F\x03\x02\x02\x02" +
		"\u012D\u012E\x03\x02\x02\x02\u012D\u012B\x03\x02\x02\x02\u012E\u0130\x03" +
		"\x02\x02\x02\u012F\u012D\x03\x02\x02\x02\u0130\u0131\x07_\x02\x02\u0131" +
		"\u0135\x07*\x02\x02\u0132\u0134\n\x1A\x02\x02\u0133\u0132\x03\x02\x02" +
		"\x02\u0134\u0137\x03\x02\x02\x02\u0135\u0136\x03\x02\x02\x02\u0135\u0133" +
		"\x03\x02\x02\x02\u0136\u0138\x03\x02\x02\x02\u0137\u0135\x03\x02\x02\x02" +
		"\u0138\u0139\x07+\x02\x02\u0139\u013A\b\x1D\b\x02\u013A?\x03\x02\x02\x02" +
		"\u013B\u013C\v\x02\x02\x02\u013C\u013D\b\x1E\t\x02\u013DA\x03\x02\x02" +
		"\x02\u013E\u0140\x05$\x10\x02\u013F\u013E\x03\x02\x02\x02\u0140\u0141" +
		"\x03\x02\x02\x02\u0141\u013F\x03\x02\x02\x02\u0141\u0142\x03\x02\x02\x02" +
		"\u0142\u0143\x03\x02\x02\x02\u0143\u0144\b\x1F\x02\x02\u0144C\x03\x02" +
		"\x02\x02\u0145\u0147\x07\x0F\x02\x02\u0146\u0145\x03\x02\x02\x02\u0146" +
		"\u0147\x03\x02\x02\x02\u0147\u0148\x03\x02\x02\x02\u0148\u0149\x07\f\x02" +
		"\x02\u0149\u014A\b \n\x02\u014A\u014B\x03\x02\x02\x02\u014B\u014C\b \x02" +
		"\x02\u014C\u014D\b \v\x02\u014DE\x03\x02\x02\x02\u014E\u0152\x05 \x0E" +
		"\x02\u014F\u0152\x05\"\x0F\x02\u0150\u0152\x07a\x02\x02\u0151\u014E\x03" +
		"\x02\x02\x02\u0151\u014F\x03\x02\x02\x02\u0151\u0150\x03\x02\x02\x02\u0152" +
		"\u0158\x03\x02\x02\x02\u0153\u0157\x05 \x0E\x02\u0154\u0157\x05\"\x0F" +
		"\x02\u0155\u0157\t\x1B\x02\x02\u0156\u0153\x03\x02\x02\x02\u0156\u0154" +
		"\x03\x02\x02\x02\u0156\u0155\x03\x02\x02\x02\u0157\u015A\x03\x02\x02\x02" +
		"\u0158\u0156\x03\x02\x02\x02\u0158\u0159\x03\x02\x02\x02\u0159G\x03\x02" +
		"\x02\x02\u015A\u0158\x03\x02\x02\x02\u015B\u015C\x070\x02\x02\u015CI\x03" +
		"\x02\x02\x02\u015D\u015E\x07*\x02\x02\u015EK\x03\x02\x02\x02\u015F\u0160" +
		"\x07+\x02\x02\u0160M\x03\x02\x02\x02\u0161\u0162\x07.\x02\x02\u0162O\x03" +
		"\x02\x02\x02\u0163\u0165\n\x16\x02\x02\u0164\u0163\x03\x02\x02\x02\u0165" +
		"\u0166\x03\x02\x02\x02\u0166\u0167\x03\x02\x02\x02\u0166\u0164\x03\x02" +
		"\x02\x02\u0167Q\x03\x02\x02\x02\u0168\u016A\x05$\x10\x02\u0169\u0168\x03" +
		"\x02\x02\x02\u016A\u016B\x03\x02\x02\x02\u016B\u0169\x03\x02\x02\x02\u016B" +
		"\u016C\x03\x02\x02\x02\u016C\u016D\x03\x02\x02\x02\u016D\u016E\x06\'\x04" +
		"\x02\u016E\u016F\x03\x02\x02\x02\u016F\u0170\b\'\x02\x02\u0170S\x03\x02" +
		"\x02\x02\u0171\u0172\x07b\x02\x02\u0172\u0173\x07b\x02\x02\u0173\u0174" +
		"\x07b\x02\x02\u0174\u0175\x03\x02\x02\x02\u0175\u0176\x06(\x05\x02\u0176" +
		"\u0177\b(\f\x02\u0177\u0178\x03\x02\x02\x02\u0178\u0179\b(\r\x02\u0179" +
		"U\x03\x02\x02\x02\u017A\u017C\x07\x0F\x02\x02\u017B\u017A\x03\x02\x02" +
		"\x02\u017B\u017C\x03\x02\x02\x02\u017C\u017D\x03\x02\x02\x02\u017D\u017E" +
		"\x07\f\x02\x02\u017E\u017F\b)\x0E\x02\u017F\u0180\x03\x02\x02\x02\u0180" +
		"\u0181\b)\x02\x02\u0181\u0182\b)\v\x02\u0182W\x03\x02\x02\x02\u0183\u0184" +
		"\x05\x14\b\x02\u0184\u0188\x05\x10\x06\x02\u0185\u0187\x05$\x10\x02\u0186" +
		"\u0185\x03\x02\x02\x02\u0187\u018A\x03\x02\x02\x02\u0188\u0186\x03\x02" +
		"\x02\x02\u0188\u0189\x03\x02\x02\x02\u0189\u018B\x03\x02\x02\x02\u018A" +
		"\u0188\x03\x02\x02\x02\u018B\u018C\x07<\x02\x02\u018C\u018D\x06*\x06\x02" +
		"\u018D\u018E\b*\x0F\x02\u018EY\x03\x02\x02\x02\u018F\u0190\x05\x0E\x05" +
		"\x02\u0190\u0191\x05\x16\t\x02\u0191\u0192\x05\x18\n\x02\u0192\u0196\x05" +
		"\x0E\x05\x02\u0193\u0195\x05$\x10\x02\u0194\u0193\x03\x02\x02\x02\u0195" +
		"\u0198\x03\x02\x02\x02\u0196\u0194\x03\x02\x02\x02\u0196\u0197\x03\x02" +
		"\x02\x02\u0197\u0199\x03\x02\x02\x02\u0198\u0196\x03\x02\x02\x02\u0199" +
		"\u019A\x05\x14\b\x02\u019A\u019E\x05\x10\x06\x02\u019B\u019D\x05$\x10" +
		"\x02\u019C\u019B\x03\x02\x02\x02\u019D\u01A0\x03\x02\x02\x02\u019E\u019C" +
		"\x03\x02\x02\x02\u019E\u019F\x03\x02\x02\x02\u019F\u01A1\x03\x02\x02\x02" +
		"\u01A0\u019E\x03\x02\x02\x02\u01A1\u01A2\x07<\x02\x02\u01A2\u01A3\x06" +
		"+\x07\x02\u01A3\u01A4\b+\x10\x02\u01A4[\x03\x02\x02\x02\u01A5\u01A6\x05" +
		"\x0E\x05\x02\u01A6\u01A7\x05\x16\t\x02\u01A7\u01A8\x05\x18\n\x02\u01A8" +
		"\u01AC\x05\x0E\x05\x02\u01A9\u01AB\x05$\x10\x02\u01AA\u01A9\x03\x02\x02" +
		"\x02\u01AB\u01AE\x03\x02\x02\x02\u01AC\u01AA\x03\x02\x02\x02\u01AC\u01AD" +
		"\x03\x02\x02\x02\u01AD\u01AF\x03\x02\x02\x02\u01AE\u01AC\x03\x02\x02\x02" +
		"\u01AF\u01B0\x07<\x02\x02\u01B0\u01B1\x06,\b\x02\u01B1\u01B2\b,\x11\x02" +
		"\u01B2]\x03\x02\x02\x02\u01B3\u01B4\x05\x18\n\x02\u01B4\u01B5\x05\x1E" +
		"\r\x02\u01B5\u01B6\x05\x14\b\x02\u01B6\u01B7\x05\x1A\v\x02\u01B7\u01B8" +
		"\x05\n\x03\x02\u01B8\u01BC\x05\x12\x07\x02\u01B9\u01BB\x05$\x10\x02\u01BA" +
		"\u01B9\x03\x02\x02\x02\u01BB\u01BE\x03\x02\x02\x02\u01BC\u01BA\x03\x02" +
		"\x02\x02\u01BC\u01BD\x03\x02\x02\x02\u01BD\u01BF\x03\x02\x02\x02\u01BE" +
		"\u01BC\x03\x02\x02\x02\u01BF\u01C0\x07<\x02\x02\u01C0\u01C1\x06-\t\x02" +
		"\u01C1\u01C2\b-\x12\x02\u01C2_\x03\x02\x02\x02\u01C3\u01C4\x05\n\x03\x02" +
		"\u01C4\u01C5\x05\b\x02\x02\u01C5\u01C6\x05\x18\n\x02\u01C6\u01CA\x05\x0E" +
		"\x05\x02\u01C7\u01C9\x05$\x10\x02\u01C8\u01C7\x03\x02\x02\x02\u01C9\u01CC" +
		"\x03\x02\x02\x02\u01CA\u01C8\x03\x02\x02\x02\u01CA\u01CB\x03\x02\x02\x02" +
		"\u01CB\u01CD\x03\x02\x02\x02\u01CC\u01CA\x03\x02\x02\x02\u01CD\u01CE\x07" +
		"<\x02\x02\u01CE\u01CF\x06.\n\x02\u01CF\u01D0\b.\x13\x02\u01D0a\x03\x02" +
		"\x02\x02\u01D1\u01D2\x05\f\x04\x02\u01D2\u01D3\x05\x0E\x05\x02\u01D3\u01D4" +
		"\x05\x10\x06\x02\u01D4\u01D5\x05\b\x02\x02\u01D5\u01D6\x05\x1C\f\x02\u01D6" +
		"\u01D7\x05\x16\t\x02\u01D7\u01DB\x05\x1A\v\x02\u01D8\u01DA\x05$\x10\x02" +
		"\u01D9\u01D8\x03\x02\x02\x02\u01DA\u01DD\x03\x02\x02\x02\u01DB\u01D9\x03" +
		"\x02\x02\x02\u01DB\u01DC\x03\x02\x02\x02\u01DC\u01DE\x03\x02\x02\x02\u01DD" +
		"\u01DB\x03\x02\x02\x02\u01DE\u01DF\x07<\x02\x02\u01DF\u01E0\x06/\v\x02" +
		"\u01E0\u01E1\b/\x14\x02\u01E1c\x03\x02\x02\x02\u01E2\u01E3\x05*\x13\x02" +
		"\u01E3\u01E4\b0\x15\x02\u01E4e\x03\x02\x02\x02\u01E5\u01E6\x05:\x1B\x02" +
		"\u01E6\u01E7\b1\x16\x02\u01E7g\x03\x02\x02\x02\u01E8\u01EA\n\x16\x02\x02" +
		"\u01E9\u01E8\x03\x02\x02\x02\u01EA\u01EB\x03\x02\x02\x02\u01EB\u01EC\x03" +
		"\x02\x02\x02\u01EB\u01E9\x03\x02\x02\x02\u01EC\u01ED\x03\x02\x02\x02\u01ED" +
		"\u01EE\b2\x17\x02\u01EEi\x03\x02\x02\x02\u01EF\u01F0\x07b\x02\x02\u01F0" +
		"\u01F1\x07b\x02\x02\u01F1\u01F2\x07b\x02\x02\u01F2\u01F3\x03\x02\x02\x02" +
		"\u01F3\u01F4\b3\x18\x02\u01F4\u01F5\x03\x02\x02\x02\u01F5\u01F6\b3\v\x02" +
		"\u01F6k\x03\x02\x02\x02\u01F7\u01F8\x05*\x13\x02\u01F8\u01F9\x03\x02\x02" +
		"\x02\u01F9\u01FA\b4\x19\x02\u01FAm\x03\x02\x02\x02\u01FB\u01FC\x05:\x1B" +
		"\x02\u01FC\u01FD\x03\x02\x02\x02\u01FD\u01FE\b5\x1A\x02\u01FEo\x03\x02" +
		"\x02\x02\u01FF\u0201\x07\x0F\x02\x02\u0200\u01FF\x03\x02\x02\x02\u0200" +
		"\u0201\x03\x02\x02\x02\u0201\u0202\x03\x02\x02\x02\u0202\u0205\x07\f\x02" +
		"\x02\u0203\u0205\n\x16\x02\x02\u0204\u0200\x03\x02\x02\x02\u0204\u0203" +
		"\x03\x02\x02\x02\u0205\u0206\x03\x02\x02\x02\u0206\u0207\x03\x02\x02\x02" +
		"\u0206\u0204\x03\x02\x02\x02\u0207\u0208\x03\x02\x02\x02\u0208\u0209\b" +
		"6";
	private static readonly _serializedATNSegment1: string =
		"\x1B\x02\u0209q\x03\x02\x02\x02\u020A\u020C\x05$\x10\x02\u020B\u020A\x03" +
		"\x02\x02\x02\u020C\u020D\x03\x02\x02\x02\u020D\u020B\x03\x02\x02\x02\u020D" +
		"\u020E\x03\x02\x02\x02\u020E\u020F\x03\x02\x02\x02\u020F\u0210\b7\x02" +
		"\x02\u0210s\x03\x02\x02\x02\u0211\u0213\x07\x0F\x02\x02\u0212\u0211\x03" +
		"\x02\x02\x02\u0212\u0213\x03\x02\x02\x02\u0213\u0214\x03\x02\x02\x02\u0214" +
		"\u0215\x07\f\x02\x02\u0215\u0216\b8\x1C\x02\u0216\u0217\b8\x1D\x02\u0217" +
		"\u0218\x03\x02\x02\x02\u0218\u0219\b8\x02\x02\u0219\u021A\b8\x1E\x02\u021A" +
		"u\x03\x02\x02\x02\u021B\u021F\x05 \x0E\x02\u021C\u021F\x05\"\x0F\x02\u021D" +
		"\u021F\x07a\x02\x02\u021E\u021B\x03\x02\x02\x02\u021E\u021C\x03\x02\x02" +
		"\x02\u021E\u021D\x03\x02\x02\x02\u021F\u0225\x03\x02\x02\x02\u0220\u0224" +
		"\x05 \x0E\x02\u0221\u0224\x05\"\x0F\x02\u0222\u0224\t\x1C\x02\x02\u0223" +
		"\u0220\x03\x02\x02\x02\u0223\u0221\x03\x02\x02\x02\u0223\u0222\x03\x02" +
		"\x02\x02\u0224\u0227\x03\x02\x02\x02\u0225\u0223\x03\x02\x02\x02\u0225" +
		"\u0226\x03\x02\x02\x02\u0226w\x03\x02\x02\x02\u0227\u0225\x03\x02\x02" +
		"\x02\u0228\u022A\n\x16\x02\x02\u0229\u0228\x03\x02\x02\x02\u022A\u022B" +
		"\x03\x02\x02\x02\u022B\u022C\x03\x02\x02\x02\u022B\u0229\x03\x02\x02\x02" +
		"\u022Cy\x03\x02\x02\x02\u022D\u0231\x07@\x02\x02\u022E\u0230\n\x16\x02" +
		"\x02\u022F\u022E\x03\x02\x02\x02\u0230\u0233\x03\x02\x02\x02\u0231\u022F" +
		"\x03\x02\x02\x02\u0231\u0232\x03\x02\x02\x02\u0232\u0235\x03\x02\x02\x02" +
		"\u0233\u0231\x03\x02\x02\x02\u0234\u0236\x07\x0F\x02\x02\u0235\u0234\x03" +
		"\x02\x02\x02\u0235\u0236\x03\x02\x02\x02\u0236\u0237\x03\x02\x02\x02\u0237" +
		"\u0238\x07\f\x02\x02\u0238\u0239\x06;\f\x02\u0239\u023A\x03\x02\x02\x02" +
		"\u023A\u023B\b;\x02\x02\u023B{\x03\x02\x02\x02\u023C\u023E\x05$\x10\x02" +
		"\u023D\u023C\x03\x02\x02\x02\u023E\u023F\x03\x02\x02\x02\u023F\u023D\x03" +
		"\x02\x02\x02\u023F\u0240\x03\x02\x02\x02\u0240\u0241\x03\x02\x02\x02\u0241" +
		"\u0242\x06<\r\x02\u0242\u0243\x03\x02\x02\x02\u0243\u0244\b<\x02\x02\u0244" +
		"}\x03\x02\x02\x02\u0245\u0247\x07\x0F\x02\x02\u0246\u0245\x03\x02\x02" +
		"\x02\u0246\u0247\x03\x02\x02\x02\u0247\u0248\x03\x02\x02\x02\u0248\u0249" +
		"\x07\f\x02\x02\u0249\u024A\b=\x1F\x02\u024A\x7F\x03\x02\x02\x02\u024B" +
		"\u024C\x07_\x02\x02\u024C\u024D\x06>\x0E\x02\u024D\u024E\b> \x02\u024E" +
		"\u024F\x03\x02\x02\x02\u024F\u0250\b>\v\x02\u0250\u0251\b>\v\x02\u0251" +
		"\x81\x03\x02\x02\x02\u0252\u0256\x05 \x0E\x02\u0253\u0256\x05\"\x0F\x02" +
		"\u0254\u0256\x07a\x02\x02\u0255\u0252\x03\x02\x02\x02\u0255\u0253\x03" +
		"\x02\x02\x02\u0255\u0254\x03\x02\x02\x02\u0256\u025C\x03\x02\x02\x02\u0257" +
		"\u025B\x05 \x0E\x02\u0258\u025B\x05\"\x0F\x02\u0259\u025B\t\x1C\x02\x02" +
		"\u025A\u0257\x03\x02\x02\x02\u025A\u0258\x03\x02\x02\x02\u025A\u0259\x03" +
		"\x02\x02\x02\u025B\u025E\x03\x02\x02\x02\u025C\u025A\x03\x02\x02\x02\u025C" +
		"\u025D\x03\x02\x02\x02\u025D\u025F\x03\x02\x02\x02\u025E\u025C\x03\x02" +
		"\x02\x02\u025F\u0260\x06?\x0F\x02\u0260\u0261\b?!\x02\u0261\x83\x03\x02" +
		"\x02\x02\u0262\u0263\x07?\x02\x02\u0263\u0264\x06@\x10\x02\u0264\u0265" +
		"\b@\"\x02\u0265\x85\x03\x02\x02\x02\u0266\u0267\x07~\x02\x02\u0267\u0268" +
		"\bA#\x02\u0268\x87\x03\x02\x02\x02\u0269\u026A\x05*\x13\x02\u026A\u026B" +
		"\bB$\x02\u026B\x89\x03\x02\x02\x02\u026C\u026D\x05:\x1B\x02\u026D\u026E" +
		"\bC%\x02\u026E\x8B\x03\x02\x02\x02\u026F\u0271\n\x16\x02\x02\u0270\u026F" +
		"\x03\x02\x02\x02\u0271\u0272\x03\x02\x02\x02\u0272\u0273\x03\x02\x02\x02" +
		"\u0272\u0270\x03\x02\x02\x02\u0273\u0274\x03\x02\x02\x02\u0274\u0275\b" +
		"D&\x02\u0275\x8D\x03\x02\x02\x02@\x02\x03\x04\x05\x06\x07\xB0\xB2\xBA" +
		"\xBC\xC0\xC6\xC8\xCF\xD5\xDE\xE4\xEC\xF1\u0106\u010C\u010E\u0110\u0112" +
		"\u011D\u011F\u0122\u012D\u0135\u0141\u0146\u0151\u0156\u0158\u0166\u016B" +
		"\u017B\u0188\u0196\u019E\u01AC\u01BC\u01CA\u01DB\u01EB\u0200\u0204\u0206" +
		"\u020D\u0212\u021E\u0223\u0225\u022B\u0231\u0235\u023F\u0246\u0255\u025A" +
		"\u025C\u0272\'\b\x02\x02\x03\x18\x02\x07\x03\x02\x03\x19\x03\x07\x04\x02" +
		"\x07\x06\x02\x03\x1D\x04\x03\x1E\x05\x03 \x06\x06\x02\x02\x03(\x07\x07" +
		"\x05\x02\x03)\b\x03*\t\x03+\n\x03,\v\x03-\f\x03.\r\x03/\x0E\x030\x0F\x03" +
		"1\x10\x032\x11\x033\x12\t\x1F\x02\t \x02\t!\x02\x038\x13\x038\x14\x07" +
		"\x07\x02\x03=\x15\x03>\x16\x03?\x17\x03@\x18\x03A\x19\x03B\x1A\x03C\x1B" +
		"\x03D\x1C";
	public static readonly _serializedATN: string = Utils.join(
		[
			LGFileLexer._serializedATNSegment0,
			LGFileLexer._serializedATNSegment1,
		],
		"",
	);
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

