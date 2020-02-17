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
	public static readonly IMPORT = 7;
	public static readonly INVALID_TOKEN = 8;
	public static readonly WS_IN_NAME = 9;
	public static readonly NEWLINE_IN_NAME = 10;
	public static readonly IDENTIFIER = 11;
	public static readonly DOT = 12;
	public static readonly OPEN_PARENTHESIS = 13;
	public static readonly CLOSE_PARENTHESIS = 14;
	public static readonly COMMA = 15;
	public static readonly TEXT_IN_NAME = 16;
	public static readonly WS_IN_BODY = 17;
	public static readonly MULTILINE_PREFIX = 18;
	public static readonly NEWLINE_IN_BODY = 19;
	public static readonly IF = 20;
	public static readonly ELSEIF = 21;
	public static readonly ELSE = 22;
	public static readonly SWITCH = 23;
	public static readonly CASE = 24;
	public static readonly DEFAULT = 25;
	public static readonly ESCAPE_CHARACTER = 26;
	public static readonly EXPRESSION = 27;
	public static readonly TEXT = 28;
	public static readonly MULTILINE_SUFFIX = 29;
	public static readonly WS_IN_STRUCTURE_NAME = 30;
	public static readonly NEWLINE_IN_STRUCTURE_NAME = 31;
	public static readonly STRUCTURE_NAME = 32;
	public static readonly TEXT_IN_STRUCTURE_NAME = 33;
	public static readonly STRUCTURED_COMMENTS = 34;
	public static readonly WS_IN_STRUCTURE_BODY = 35;
	public static readonly STRUCTURED_NEWLINE = 36;
	public static readonly STRUCTURED_BODY_END = 37;
	public static readonly STRUCTURE_IDENTIFIER = 38;
	public static readonly STRUCTURE_EQUALS = 39;
	public static readonly STRUCTURE_OR_MARK = 40;
	public static readonly ESCAPE_CHARACTER_IN_STRUCTURE_BODY = 41;
	public static readonly EXPRESSION_IN_STRUCTURE_BODY = 42;
	public static readonly TEXT_IN_STRUCTURE_BODY = 43;
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
		"NUMBER", "WHITESPACE", "EMPTY_OBJECT", "STRING_LITERAL", "EXPRESSION_FRAGMENT", 
		"ESCAPE_CHARACTER_FRAGMENT", "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", 
		"LEFT_SQUARE_BRACKET", "IMPORT", "INVALID_TOKEN", "WS_IN_NAME", "NEWLINE_IN_NAME", 
		"IDENTIFIER", "DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", "COMMA", 
		"TEXT_IN_NAME", "WS_IN_BODY", "MULTILINE_PREFIX", "NEWLINE_IN_BODY", "IF", 
		"ELSEIF", "ELSE", "SWITCH", "CASE", "DEFAULT", "ESCAPE_CHARACTER", "EXPRESSION", 
		"TEXT", "MULTILINE_SUFFIX", "MULTILINE_ESCAPE_CHARACTER", "MULTILINE_EXPRESSION", 
		"MULTILINE_TEXT", "WS_IN_STRUCTURE_NAME", "NEWLINE_IN_STRUCTURE_NAME", 
		"STRUCTURE_NAME", "TEXT_IN_STRUCTURE_NAME", "STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", 
		"STRUCTURED_NEWLINE", "STRUCTURED_BODY_END", "STRUCTURE_IDENTIFIER", "STRUCTURE_EQUALS", 
		"STRUCTURE_OR_MARK", "ESCAPE_CHARACTER_IN_STRUCTURE_BODY", "EXPRESSION_IN_STRUCTURE_BODY", 
		"TEXT_IN_STRUCTURE_BODY",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "'.'", "'('", "')'", 
		"','", undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, "'|'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMENTS", "WS", "NEWLINE", "HASH", "DASH", "LEFT_SQUARE_BRACKET", 
		"IMPORT", "INVALID_TOKEN", "WS_IN_NAME", "NEWLINE_IN_NAME", "IDENTIFIER", 
		"DOT", "OPEN_PARENTHESIS", "CLOSE_PARENTHESIS", "COMMA", "TEXT_IN_NAME", 
		"WS_IN_BODY", "MULTILINE_PREFIX", "NEWLINE_IN_BODY", "IF", "ELSEIF", "ELSE", 
		"SWITCH", "CASE", "DEFAULT", "ESCAPE_CHARACTER", "EXPRESSION", "TEXT", 
		"MULTILINE_SUFFIX", "WS_IN_STRUCTURE_NAME", "NEWLINE_IN_STRUCTURE_NAME", 
		"STRUCTURE_NAME", "TEXT_IN_STRUCTURE_NAME", "STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", 
		"STRUCTURED_NEWLINE", "STRUCTURED_BODY_END", "STRUCTURE_IDENTIFIER", "STRUCTURE_EQUALS", 
		"STRUCTURE_OR_MARK", "ESCAPE_CHARACTER_IN_STRUCTURE_BODY", "EXPRESSION_IN_STRUCTURE_BODY", 
		"TEXT_IN_STRUCTURE_BODY",
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

		case 25:
			this.IMPORT_action(_localctx, actionIndex);
			break;

		case 26:
			this.INVALID_TOKEN_action(_localctx, actionIndex);
			break;

		case 28:
			this.NEWLINE_IN_NAME_action(_localctx, actionIndex);
			break;

		case 36:
			this.MULTILINE_PREFIX_action(_localctx, actionIndex);
			break;

		case 37:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 38:
			this.IF_action(_localctx, actionIndex);
			break;

		case 39:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 40:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 41:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 42:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 43:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 44:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 45:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 46:
			this.TEXT_action(_localctx, actionIndex);
			break;

		case 47:
			this.MULTILINE_SUFFIX_action(_localctx, actionIndex);
			break;

		case 52:
			this.NEWLINE_IN_STRUCTURE_NAME_action(_localctx, actionIndex);
			break;

		case 57:
			this.STRUCTURED_NEWLINE_action(_localctx, actionIndex);
			break;

		case 58:
			this.STRUCTURED_BODY_END_action(_localctx, actionIndex);
			break;

		case 59:
			this.STRUCTURE_IDENTIFIER_action(_localctx, actionIndex);
			break;

		case 60:
			this.STRUCTURE_EQUALS_action(_localctx, actionIndex);
			break;

		case 61:
			this.STRUCTURE_OR_MARK_action(_localctx, actionIndex);
			break;

		case 62:
			this.ESCAPE_CHARACTER_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 63:
			this.EXPRESSION_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 64:
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

		case 24:
			return this.LEFT_SQUARE_BRACKET_sempred(_localctx, predIndex);

		case 35:
			return this.WS_IN_BODY_sempred(_localctx, predIndex);

		case 36:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 38:
			return this.IF_sempred(_localctx, predIndex);

		case 39:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 40:
			return this.ELSE_sempred(_localctx, predIndex);

		case 41:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 42:
			return this.CASE_sempred(_localctx, predIndex);

		case 43:
			return this.DEFAULT_sempred(_localctx, predIndex);

		case 55:
			return this.STRUCTURED_COMMENTS_sempred(_localctx, predIndex);

		case 56:
			return this.WS_IN_STRUCTURE_BODY_sempred(_localctx, predIndex);

		case 58:
			return this.STRUCTURED_BODY_END_sempred(_localctx, predIndex);

		case 59:
			return this.STRUCTURE_IDENTIFIER_sempred(_localctx, predIndex);

		case 60:
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
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02-\u0246\b\x01" +
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
		"B\tB\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03" +
		"\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v" +
		"\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10" +
		"\x03\x10\x03\x11\x03\x11\x07\x11\xAB\n\x11\f\x11\x0E\x11\xAE\v\x11\x03" +
		"\x11\x03\x11\x03\x12\x03\x12\x07\x12\xB4\n\x12\f\x12\x0E\x12\xB7\v\x12" +
		"\x03\x12\x03\x12\x03\x12\x07\x12\xBC\n\x12\f\x12\x0E\x12\xBF\v\x12\x03" +
		"\x12\x05\x12\xC2\n\x12\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07\x13" +
		"\xC9\n\x13\f\x13\x0E\x13\xCC\v\x13\x03\x13\x03\x13\x03\x14\x03\x14\x05" +
		"\x14\xD2\n\x14\x03\x15\x03\x15\x06\x15\xD6\n\x15\r\x15\x0E\x15\xD7\x03" +
		"\x15\x03\x15\x03\x16\x06\x16\xDD\n\x16\r\x16\x0E\x16\xDE\x03\x16\x03\x16" +
		"\x03\x17\x05\x17\xE4\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03" +
		"\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x07\x1B\xFC" +
		"\n\x1B\f\x1B\x0E\x1B\xFF\v\x1B\x03\x1B\x03\x1B\x03\x1B\x07\x1B\u0104\n" +
		"\x1B\f\x1B\x0E\x1B\u0107\v\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1C\x03\x1C" +
		"\x03\x1C\x03\x1D\x06\x1D\u0110\n\x1D\r\x1D\x0E\x1D\u0111\x03\x1D\x03\x1D" +
		"\x03\x1E\x05\x1E\u0117\n\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03" +
		"\x1E\x03\x1F\x03\x1F\x03\x1F\x05\x1F\u0122\n\x1F\x03\x1F\x03\x1F\x03\x1F" +
		"\x07\x1F\u0127\n\x1F\f\x1F\x0E\x1F\u012A\v\x1F\x03 \x03 \x03!\x03!\x03" +
		"\"\x03\"\x03#\x03#\x03$\x06$\u0135\n$\r$\x0E$\u0136\x03%\x06%\u013A\n" +
		"%\r%\x0E%\u013B\x03%\x03%\x03%\x03%\x03&\x03&\x03&\x03&\x03&\x03&\x03" +
		"&\x03&\x03&\x03\'\x05\'\u014C\n\'\x03\'\x03\'\x03\'\x03\'\x03\'\x03\'" +
		"\x03(\x03(\x03(\x07(\u0157\n(\f(\x0E(\u015A\v(\x03(\x03(\x03(\x03(\x03" +
		")\x03)\x03)\x03)\x03)\x07)\u0165\n)\f)\x0E)\u0168\v)\x03)\x03)\x03)\x07" +
		")\u016D\n)\f)\x0E)\u0170\v)\x03)\x03)\x03)\x03)\x03*\x03*\x03*\x03*\x03" +
		"*\x07*\u017B\n*\f*\x0E*\u017E\v*\x03*\x03*\x03*\x03*\x03+\x03+\x03+\x03" +
		"+\x03+\x03+\x03+\x07+\u018B\n+\f+\x0E+\u018E\v+\x03+\x03+\x03+\x03+\x03" +
		",\x03,\x03,\x03,\x03,\x07,\u0199\n,\f,\x0E,\u019C\v,\x03,\x03,\x03,\x03" +
		",\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x07-\u01AA\n-\f-\x0E-\u01AD" +
		"\v-\x03-\x03-\x03-\x03-\x03.\x03.\x03.\x03/\x03/\x03/\x030\x060\u01BA" +
		"\n0\r0\x0E0\u01BB\x030\x030\x031\x031\x031\x031\x031\x031\x031\x031\x03" +
		"2\x032\x032\x032\x033\x033\x033\x033\x034\x054\u01D1\n4\x034\x034\x06" +
		"4\u01D5\n4\r4\x0E4\u01D6\x034\x034\x035\x065\u01DC\n5\r5\x0E5\u01DD\x03" +
		"5\x035\x036\x056\u01E3\n6\x036\x036\x036\x036\x036\x036\x036\x037\x03" +
		"7\x037\x057\u01EF\n7\x037\x037\x037\x077\u01F4\n7\f7\x0E7\u01F7\v7\x03" +
		"8\x068\u01FA\n8\r8\x0E8\u01FB\x039\x039\x079\u0200\n9\f9\x0E9\u0203\v" +
		"9\x039\x059\u0206\n9\x039\x039\x039\x039\x039\x03:\x06:\u020E\n:\r:\x0E" +
		":\u020F\x03:\x03:\x03:\x03:\x03;\x05;\u0217\n;\x03;\x03;\x03;\x03<\x03" +
		"<\x03<\x03<\x03<\x03<\x03<\x03=\x03=\x03=\x05=\u0226\n=\x03=\x03=\x03" +
		"=\x07=\u022B\n=\f=\x0E=\u022E\v=\x03=\x03=\x03=\x03>\x03>\x03>\x03>\x03" +
		"?\x03?\x03?\x03@\x03@\x03@\x03A\x03A\x03A\x03B\x06B\u0241\nB\rB\x0EB\u0242" +
		"\x03B\x03B\n\xCA\xFD\u0105\u0136\u01BB\u01D6\u01FB\u0242\x02\x02C\b\x02" +
		"\x02\n\x02\x02\f\x02\x02\x0E\x02\x02\x10\x02\x02\x12\x02\x02\x14\x02\x02" +
		"\x16\x02\x02\x18\x02\x02\x1A\x02\x02\x1C\x02\x02\x1E\x02\x02 \x02\x02" +
		"\"\x02\x02$\x02\x02&\x02\x02(\x02\x02*\x02\x02,\x02\x02.\x02\x030\x02" +
		"\x042\x02\x054\x02\x066\x02\x078\x02\b:\x02\t<\x02\n>\x02\v@\x02\fB\x02" +
		"\rD\x02\x0EF\x02\x0FH\x02\x10J\x02\x11L\x02\x12N\x02\x13P\x02\x14R\x02" +
		"\x15T\x02\x16V\x02\x17X\x02\x18Z\x02\x19\\\x02\x1A^\x02\x1B`\x02\x1Cb" +
		"\x02\x1Dd\x02\x1Ef\x02\x1Fh\x02\x02j\x02\x02l\x02\x02n\x02 p\x02!r\x02" +
		"\"t\x02#v\x02$x\x02%z\x02&|\x02\'~\x02(\x80\x02)\x82\x02*\x84\x02+\x86" +
		"\x02,\x88\x02-\b\x02\x03\x04\x05\x06\x07\x18\x04\x02CCcc\x04\x02EEee\x04" +
		"\x02FFff\x04\x02GGgg\x04\x02HHhh\x04\x02JJjj\x04\x02KKkk\x04\x02NNnn\x04" +
		"\x02UUuu\x04\x02VVvv\x04\x02WWww\x04\x02YYyy\x04\x02C\\c|\x06\x02\v\v" +
		"\"\"\xA2\xA2\uFF01\uFF01\x05\x02\f\f\x0F\x0F))\x05\x02\f\f\x0F\x0F$$\b" +
		"\x02\f\f\x0F\x0F$$))}}\x7F\x7F\x04\x02\f\f\x0F\x0F\x06\x02\f\f\x0F\x0F" +
		"]]__\x05\x02\f\f\x0F\x0F*+\x04\x02//aa\x04\x02/0aa\u0261\x02.\x03\x02" +
		"\x02\x02\x020\x03\x02\x02\x02\x022\x03\x02\x02\x02\x024\x03\x02\x02\x02" +
		"\x026\x03\x02\x02\x02\x028\x03\x02\x02\x02\x02:\x03\x02\x02\x02\x02<\x03" +
		"\x02\x02\x02\x03>\x03\x02\x02\x02\x03@\x03\x02\x02\x02\x03B\x03\x02\x02" +
		"\x02\x03D\x03\x02\x02\x02\x03F\x03\x02\x02\x02\x03H\x03\x02\x02\x02\x03" +
		"J\x03\x02\x02\x02\x03L\x03\x02\x02\x02\x04N\x03\x02\x02\x02\x04P\x03\x02" +
		"\x02\x02\x04R\x03\x02\x02\x02\x04T\x03\x02\x02\x02\x04V\x03\x02\x02\x02" +
		"\x04X\x03\x02\x02\x02\x04Z\x03\x02\x02\x02\x04\\\x03\x02\x02\x02\x04^" +
		"\x03\x02\x02\x02\x04`\x03\x02\x02\x02\x04b\x03\x02\x02\x02\x04d\x03\x02" +
		"\x02\x02\x05f\x03\x02\x02\x02\x05h\x03\x02\x02\x02\x05j\x03\x02\x02\x02" +
		"\x05l\x03\x02\x02\x02\x06n\x03\x02\x02\x02\x06p\x03\x02\x02\x02\x06r\x03" +
		"\x02\x02\x02\x06t\x03\x02\x02\x02\x07v\x03\x02\x02\x02\x07x\x03\x02\x02" +
		"\x02\x07z\x03\x02\x02\x02\x07|\x03\x02\x02\x02\x07~\x03\x02\x02\x02\x07" +
		"\x80\x03\x02\x02\x02\x07\x82\x03\x02\x02\x02\x07\x84\x03\x02\x02\x02\x07" +
		"\x86\x03\x02\x02\x02\x07\x88\x03\x02\x02\x02\b\x8A\x03\x02\x02\x02\n\x8C" +
		"\x03\x02\x02\x02\f\x8E\x03\x02\x02\x02\x0E\x90\x03\x02\x02\x02\x10\x92" +
		"\x03\x02\x02\x02\x12\x94\x03\x02\x02\x02\x14\x96\x03\x02\x02\x02\x16\x98" +
		"\x03\x02\x02\x02\x18\x9A\x03\x02\x02\x02\x1A\x9C\x03\x02\x02\x02\x1C\x9E" +
		"\x03\x02\x02\x02\x1E\xA0\x03\x02\x02\x02 \xA2\x03\x02\x02\x02\"\xA4\x03" +
		"\x02\x02\x02$\xA6\x03\x02\x02\x02&\xA8\x03\x02\x02\x02(\xC1\x03\x02\x02" +
		"\x02*\xC3\x03\x02\x02\x02,\xCF\x03\x02\x02\x02.\xD3\x03\x02\x02\x020\xDC" +
		"\x03\x02\x02\x022\xE3\x03\x02\x02\x024\xE9\x03\x02\x02\x026\xEE\x03\x02" +
		"\x02\x028\xF4\x03\x02\x02\x02:\xF9\x03\x02\x02\x02<\u010B\x03\x02\x02" +
		"\x02>\u010F\x03\x02\x02\x02@\u0116\x03\x02\x02\x02B\u0121\x03\x02\x02" +
		"\x02D\u012B\x03\x02\x02\x02F\u012D\x03\x02\x02\x02H\u012F\x03\x02\x02" +
		"\x02J\u0131\x03\x02\x02\x02L\u0134\x03\x02\x02\x02N\u0139\x03\x02\x02" +
		"\x02P\u0141\x03\x02\x02\x02R\u014B\x03\x02\x02\x02T\u0153\x03\x02\x02" +
		"\x02V\u015F\x03\x02\x02\x02X\u0175\x03\x02\x02\x02Z\u0183\x03\x02\x02" +
		"\x02\\\u0193\x03\x02\x02\x02^\u01A1\x03\x02\x02\x02`\u01B2\x03\x02\x02" +
		"\x02b\u01B5\x03\x02\x02\x02d\u01B9\x03\x02\x02\x02f\u01BF\x03\x02\x02" +
		"\x02h\u01C7\x03\x02\x02\x02j\u01CB\x03\x02\x02\x02l\u01D4\x03\x02\x02" +
		"\x02n\u01DB\x03\x02\x02\x02p\u01E2\x03\x02\x02\x02r\u01EE\x03\x02\x02" +
		"\x02t\u01F9\x03\x02\x02\x02v\u01FD\x03\x02\x02\x02x\u020D\x03\x02\x02" +
		"\x02z\u0216\x03\x02\x02\x02|\u021B\x03\x02\x02\x02~\u0225\x03\x02\x02" +
		"\x02\x80\u0232\x03\x02\x02\x02\x82\u0236\x03\x02\x02\x02\x84\u0239\x03" +
		"\x02\x02\x02\x86\u023C\x03\x02\x02\x02\x88\u0240\x03\x02\x02\x02\x8A\x8B" +
		"\t\x02\x02\x02\x8B\t\x03\x02\x02\x02\x8C\x8D\t\x03\x02\x02\x8D\v\x03\x02" +
		"\x02\x02\x8E\x8F\t\x04\x02\x02\x8F\r\x03\x02\x02\x02\x90\x91\t\x05\x02" +
		"\x02\x91\x0F\x03\x02\x02\x02\x92\x93\t\x06\x02\x02\x93\x11\x03\x02\x02" +
		"\x02\x94\x95\t\x07\x02\x02\x95\x13\x03\x02\x02\x02\x96\x97\t\b\x02\x02" +
		"\x97\x15\x03\x02\x02\x02\x98\x99\t\t\x02\x02\x99\x17\x03\x02\x02\x02\x9A" +
		"\x9B\t\n\x02\x02\x9B\x19\x03\x02\x02\x02\x9C\x9D\t\v\x02\x02\x9D\x1B\x03" +
		"\x02\x02\x02\x9E\x9F\t\f\x02\x02\x9F\x1D\x03\x02\x02\x02\xA0\xA1\t\r\x02" +
		"\x02\xA1\x1F\x03\x02\x02\x02\xA2\xA3\t\x0E\x02\x02\xA3!\x03\x02\x02\x02" +
		"\xA4\xA5\x042;\x02\xA5#\x03\x02\x02\x02\xA6\xA7\t\x0F\x02\x02\xA7%\x03" +
		"\x02\x02\x02\xA8\xAC\x07}\x02\x02\xA9\xAB\x05$\x10\x02\xAA\xA9\x03\x02" +
		"\x02\x02\xAB\xAE\x03\x02\x02\x02\xAC\xAA\x03\x02\x02\x02\xAC\xAD\x03\x02" +
		"\x02\x02\xAD\xAF\x03\x02\x02\x02\xAE\xAC\x03\x02\x02\x02\xAF\xB0\x07\x7F" +
		"\x02\x02\xB0\'\x03\x02\x02\x02\xB1\xB5\x07)\x02\x02\xB2\xB4\n\x10\x02" +
		"\x02\xB3\xB2\x03\x02\x02\x02\xB4\xB7\x03\x02\x02\x02\xB5\xB3\x03\x02\x02" +
		"\x02\xB5\xB6\x03\x02\x02\x02\xB6\xB8\x03\x02\x02\x02\xB7\xB5\x03\x02\x02" +
		"\x02\xB8\xC2\x07)\x02\x02\xB9\xBD\x07$\x02\x02\xBA\xBC\n\x11\x02\x02\xBB" +
		"\xBA\x03\x02\x02\x02\xBC\xBF\x03\x02\x02\x02\xBD\xBB\x03\x02\x02\x02\xBD" +
		"\xBE\x03\x02\x02\x02\xBE\xC0\x03\x02\x02\x02\xBF\xBD\x03\x02\x02\x02\xC0" +
		"\xC2\x07$\x02\x02\xC1\xB1\x03\x02\x02\x02\xC1\xB9\x03\x02\x02\x02\xC2" +
		")\x03\x02\x02\x02\xC3\xC4\x07&\x02\x02\xC4\xCA\x07}\x02\x02\xC5\xC9\x05" +
		"(\x12\x02\xC6\xC9\n\x12\x02\x02\xC7\xC9\x05&\x11\x02\xC8\xC5\x03\x02\x02" +
		"\x02\xC8\xC6\x03\x02\x02\x02\xC8\xC7\x03\x02\x02\x02\xC9\xCC\x03\x02\x02" +
		"\x02\xCA\xCB\x03\x02\x02\x02\xCA\xC8\x03\x02\x02\x02\xCB\xCD\x03\x02\x02" +
		"\x02\xCC\xCA\x03\x02\x02\x02\xCD\xCE\x07\x7F\x02\x02\xCE+\x03\x02\x02" +
		"\x02\xCF\xD1\x07^\x02\x02\xD0\xD2\n\x13\x02\x02\xD1\xD0\x03\x02\x02\x02" +
		"\xD1\xD2\x03\x02\x02\x02\xD2-\x03\x02\x02\x02\xD3\xD5\x07@\x02\x02\xD4" +
		"\xD6\n\x13\x02\x02\xD5\xD4\x03\x02\x02\x02\xD6\xD7\x03\x02\x02\x02\xD7" +
		"\xD5\x03\x02\x02\x02\xD7\xD8\x03\x02\x02\x02\xD8\xD9\x03\x02\x02\x02\xD9" +
		"\xDA\b\x15\x02\x02\xDA/\x03\x02\x02\x02\xDB\xDD\x05$\x10\x02\xDC\xDB\x03" +
		"\x02\x02\x02\xDD\xDE\x03\x02\x02\x02\xDE\xDC\x03\x02\x02\x02\xDE\xDF\x03" +
		"\x02\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0\xE1\b\x16\x02\x02\xE11\x03\x02" +
		"\x02\x02\xE2\xE4\x07\x0F\x02\x02\xE3\xE2\x03\x02\x02\x02\xE3\xE4\x03\x02" +
		"\x02\x02\xE4\xE5\x03\x02\x02\x02\xE5\xE6\x07\f\x02\x02\xE6\xE7\x03\x02" +
		"\x02\x02\xE7\xE8\b\x17\x02\x02\xE83\x03\x02\x02\x02\xE9\xEA\x07%\x02\x02" +
		"\xEA\xEB\b\x18\x03\x02\xEB\xEC\x03\x02\x02\x02\xEC\xED\b\x18\x04\x02\xED" +
		"5\x03\x02\x02\x02\xEE\xEF\x07/\x02\x02\xEF\xF0\x06\x19\x02\x02\xF0\xF1" +
		"\b\x19\x05\x02\xF1\xF2\x03\x02\x02\x02\xF2\xF3\b\x19\x06\x02\xF37\x03" +
		"\x02\x02\x02\xF4\xF5\x07]\x02\x02\xF5\xF6\x06\x1A\x03\x02\xF6\xF7\x03" +
		"\x02\x02\x02\xF7\xF8\b\x1A\x07\x02\xF89\x03\x02\x02\x02\xF9\xFD\x07]\x02" +
		"\x02\xFA\xFC\n\x14\x02\x02\xFB\xFA\x03\x02\x02\x02\xFC\xFF\x03\x02\x02" +
		"\x02\xFD\xFE\x03\x02\x02\x02\xFD\xFB\x03\x02\x02\x02\xFE\u0100\x03\x02" +
		"\x02\x02\xFF\xFD\x03\x02\x02\x02\u0100\u0101\x07_\x02\x02\u0101\u0105" +
		"\x07*\x02\x02\u0102\u0104\n\x15\x02\x02\u0103\u0102\x03\x02\x02\x02\u0104" +
		"\u0107\x03\x02\x02\x02\u0105\u0106\x03\x02\x02\x02\u0105\u0103\x03\x02" +
		"\x02\x02\u0106\u0108\x03\x02\x02\x02\u0107\u0105\x03\x02\x02\x02\u0108" +
		"\u0109\x07+\x02\x02\u0109\u010A\b\x1B\b\x02\u010A;\x03\x02\x02\x02\u010B" +
		"\u010C\v\x02\x02\x02\u010C\u010D\b\x1C\t\x02\u010D=\x03\x02\x02\x02\u010E" +
		"\u0110\x05$\x10\x02\u010F\u010E\x03\x02\x02\x02\u0110\u0111\x03\x02\x02" +
		"\x02\u0111\u010F\x03\x02\x02\x02\u0111\u0112\x03\x02\x02\x02\u0112\u0113" +
		"\x03\x02\x02\x02\u0113\u0114\b\x1D\x02\x02\u0114?\x03\x02\x02\x02\u0115" +
		"\u0117\x07\x0F\x02\x02\u0116\u0115\x03\x02\x02\x02\u0116\u0117\x03\x02" +
		"\x02\x02\u0117\u0118\x03\x02\x02\x02\u0118\u0119\x07\f\x02\x02\u0119\u011A" +
		"\b\x1E\n\x02\u011A\u011B\x03\x02\x02\x02\u011B\u011C\b\x1E\x02\x02\u011C" +
		"\u011D\b\x1E\v\x02\u011DA\x03\x02\x02\x02\u011E\u0122\x05 \x0E\x02\u011F" +
		"\u0122\x05\"\x0F\x02\u0120\u0122\x07a\x02\x02\u0121\u011E\x03\x02\x02" +
		"\x02\u0121\u011F\x03\x02\x02\x02\u0121\u0120\x03\x02\x02\x02\u0122\u0128" +
		"\x03\x02\x02\x02\u0123\u0127\x05 \x0E\x02\u0124\u0127\x05\"\x0F\x02\u0125" +
		"\u0127\t\x16\x02\x02\u0126\u0123\x03\x02\x02\x02\u0126\u0124\x03\x02\x02" +
		"\x02\u0126\u0125\x03\x02\x02\x02\u0127\u012A\x03\x02\x02\x02\u0128\u0126" +
		"\x03\x02\x02\x02\u0128\u0129\x03\x02\x02\x02\u0129C\x03\x02\x02\x02\u012A" +
		"\u0128\x03\x02\x02\x02\u012B\u012C\x070\x02\x02\u012CE\x03\x02\x02\x02" +
		"\u012D\u012E\x07*\x02\x02\u012EG\x03\x02\x02\x02\u012F\u0130\x07+\x02" +
		"\x02\u0130I\x03\x02\x02\x02\u0131\u0132\x07.\x02\x02\u0132K\x03\x02\x02" +
		"\x02\u0133\u0135\n\x13\x02\x02\u0134\u0133\x03\x02\x02\x02\u0135\u0136" +
		"\x03\x02\x02\x02\u0136\u0137\x03\x02\x02\x02\u0136\u0134\x03\x02\x02\x02" +
		"\u0137M\x03\x02\x02\x02\u0138\u013A\x05$\x10\x02\u0139\u0138\x03\x02\x02" +
		"\x02\u013A\u013B\x03\x02\x02\x02\u013B\u0139\x03\x02\x02\x02\u013B\u013C" +
		"\x03\x02\x02\x02\u013C\u013D\x03\x02\x02\x02\u013D\u013E\x06%\x04\x02" +
		"\u013E\u013F\x03\x02\x02\x02\u013F\u0140\b%\x02\x02\u0140O\x03\x02\x02" +
		"\x02\u0141\u0142\x07b\x02\x02\u0142\u0143\x07b\x02\x02\u0143\u0144\x07" +
		"b\x02\x02\u0144\u0145\x03\x02\x02\x02\u0145\u0146\x06&\x05\x02\u0146\u0147" +
		"\b&\f\x02\u0147\u0148\x03\x02\x02\x02\u0148\u0149\b&\r\x02\u0149Q\x03" +
		"\x02\x02\x02\u014A\u014C\x07\x0F\x02\x02\u014B\u014A\x03\x02\x02\x02\u014B" +
		"\u014C\x03\x02\x02\x02\u014C\u014D\x03\x02\x02\x02\u014D\u014E\x07\f\x02" +
		"\x02\u014E\u014F\b\'\x0E\x02\u014F\u0150\x03\x02\x02\x02\u0150\u0151\b" +
		"\'\x02\x02\u0151\u0152\b\'\v\x02\u0152S\x03\x02\x02\x02\u0153\u0154\x05" +
		"\x14\b\x02\u0154\u0158\x05\x10\x06\x02\u0155\u0157\x05$\x10\x02\u0156" +
		"\u0155\x03\x02\x02\x02\u0157\u015A\x03\x02\x02\x02\u0158\u0156\x03\x02" +
		"\x02\x02\u0158\u0159\x03\x02\x02\x02\u0159\u015B\x03\x02\x02\x02\u015A" +
		"\u0158\x03\x02\x02\x02\u015B\u015C\x07<\x02\x02\u015C\u015D\x06(\x06\x02" +
		"\u015D\u015E\b(\x0F\x02\u015EU\x03\x02\x02\x02\u015F\u0160\x05\x0E\x05" +
		"\x02\u0160\u0161\x05\x16\t\x02\u0161\u0162\x05\x18\n\x02\u0162\u0166\x05" +
		"\x0E\x05\x02\u0163\u0165\x05$\x10\x02\u0164\u0163\x03\x02\x02\x02\u0165" +
		"\u0168\x03\x02\x02\x02\u0166\u0164\x03\x02\x02\x02\u0166\u0167\x03\x02" +
		"\x02\x02\u0167\u0169\x03\x02\x02\x02\u0168\u0166\x03\x02\x02\x02\u0169" +
		"\u016A\x05\x14\b\x02\u016A\u016E\x05\x10\x06\x02\u016B\u016D\x05$\x10" +
		"\x02\u016C\u016B\x03\x02\x02\x02\u016D\u0170\x03\x02\x02\x02\u016E\u016C" +
		"\x03\x02\x02\x02\u016E\u016F\x03\x02\x02\x02\u016F\u0171\x03\x02\x02\x02" +
		"\u0170\u016E\x03\x02\x02\x02\u0171\u0172\x07<\x02\x02\u0172\u0173\x06" +
		")\x07\x02\u0173\u0174\b)\x10\x02\u0174W\x03\x02\x02\x02\u0175\u0176\x05" +
		"\x0E\x05\x02\u0176\u0177\x05\x16\t\x02\u0177\u0178\x05\x18\n\x02\u0178" +
		"\u017C\x05\x0E\x05\x02\u0179\u017B\x05$\x10\x02\u017A\u0179\x03\x02\x02" +
		"\x02\u017B\u017E\x03\x02\x02\x02\u017C\u017A\x03\x02\x02\x02\u017C\u017D" +
		"\x03\x02\x02\x02\u017D\u017F\x03\x02\x02\x02\u017E\u017C\x03\x02\x02\x02" +
		"\u017F\u0180\x07<\x02\x02\u0180\u0181\x06*\b\x02\u0181\u0182\b*\x11\x02" +
		"\u0182Y\x03\x02\x02\x02\u0183\u0184\x05\x18\n\x02\u0184\u0185\x05\x1E" +
		"\r\x02\u0185\u0186\x05\x14\b\x02\u0186\u0187\x05\x1A\v\x02\u0187\u0188" +
		"\x05\n\x03\x02\u0188\u018C\x05\x12\x07\x02\u0189\u018B\x05$\x10\x02\u018A" +
		"\u0189\x03\x02\x02\x02\u018B\u018E\x03\x02\x02\x02\u018C\u018A\x03\x02" +
		"\x02\x02\u018C\u018D\x03\x02\x02\x02\u018D\u018F\x03\x02\x02\x02\u018E" +
		"\u018C\x03\x02\x02\x02\u018F\u0190\x07<\x02\x02\u0190\u0191\x06+\t\x02" +
		"\u0191\u0192\b+\x12\x02\u0192[\x03\x02\x02\x02\u0193\u0194\x05\n\x03\x02" +
		"\u0194\u0195\x05\b\x02\x02\u0195\u0196\x05\x18\n\x02\u0196\u019A\x05\x0E" +
		"\x05\x02\u0197\u0199\x05$\x10\x02\u0198\u0197\x03\x02\x02\x02\u0199\u019C" +
		"\x03\x02\x02\x02\u019A\u0198\x03\x02\x02\x02\u019A\u019B\x03\x02\x02\x02" +
		"\u019B\u019D\x03\x02\x02\x02\u019C\u019A\x03\x02\x02\x02\u019D\u019E\x07" +
		"<\x02\x02\u019E\u019F\x06,\n\x02\u019F\u01A0\b,\x13\x02\u01A0]\x03\x02" +
		"\x02\x02\u01A1\u01A2\x05\f\x04\x02\u01A2\u01A3\x05\x0E\x05\x02\u01A3\u01A4" +
		"\x05\x10\x06\x02\u01A4\u01A5\x05\b\x02\x02\u01A5\u01A6\x05\x1C\f\x02\u01A6" +
		"\u01A7\x05\x16\t\x02\u01A7\u01AB\x05\x1A\v\x02\u01A8\u01AA\x05$\x10\x02" +
		"\u01A9\u01A8\x03\x02\x02\x02\u01AA\u01AD\x03\x02\x02\x02\u01AB\u01A9\x03" +
		"\x02\x02\x02\u01AB\u01AC\x03\x02\x02\x02\u01AC\u01AE\x03\x02\x02\x02\u01AD" +
		"\u01AB\x03\x02\x02\x02\u01AE\u01AF\x07<\x02\x02\u01AF\u01B0\x06-\v\x02" +
		"\u01B0\u01B1\b-\x14\x02\u01B1_\x03\x02\x02\x02\u01B2\u01B3\x05,\x14\x02" +
		"\u01B3\u01B4\b.\x15\x02\u01B4a\x03\x02\x02\x02\u01B5\u01B6\x05*\x13\x02" +
		"\u01B6\u01B7\b/\x16\x02\u01B7c\x03\x02\x02\x02\u01B8\u01BA\n\x13\x02\x02" +
		"\u01B9\u01B8\x03\x02\x02\x02\u01BA\u01BB\x03\x02\x02\x02\u01BB\u01BC\x03" +
		"\x02\x02\x02\u01BB\u01B9\x03\x02\x02\x02\u01BC\u01BD\x03\x02\x02\x02\u01BD" +
		"\u01BE\b0\x17\x02\u01BEe\x03\x02\x02\x02\u01BF\u01C0\x07b\x02\x02\u01C0" +
		"\u01C1\x07b\x02\x02\u01C1\u01C2\x07b\x02\x02\u01C2\u01C3\x03\x02\x02\x02" +
		"\u01C3\u01C4\b1\x18\x02\u01C4\u01C5\x03\x02\x02\x02\u01C5\u01C6\b1\v\x02" +
		"\u01C6g\x03\x02\x02\x02\u01C7\u01C8\x05,\x14\x02\u01C8\u01C9\x03\x02\x02" +
		"\x02\u01C9\u01CA\b2\x19\x02\u01CAi\x03\x02\x02\x02\u01CB\u01CC\x05*\x13" +
		"\x02\u01CC\u01CD\x03\x02\x02\x02\u01CD\u01CE\b3\x1A\x02\u01CEk\x03\x02" +
		"\x02\x02\u01CF\u01D1\x07\x0F\x02\x02\u01D0\u01CF\x03\x02\x02\x02\u01D0" +
		"\u01D1\x03\x02\x02\x02\u01D1\u01D2\x03\x02\x02\x02\u01D2\u01D5\x07\f\x02" +
		"\x02\u01D3\u01D5\n\x13\x02\x02\u01D4\u01D0\x03\x02\x02\x02\u01D4\u01D3" +
		"\x03\x02\x02\x02\u01D5\u01D6\x03\x02\x02\x02\u01D6\u01D7\x03\x02\x02\x02" +
		"\u01D6\u01D4\x03\x02\x02\x02\u01D7\u01D8\x03\x02\x02\x02\u01D8\u01D9\b" +
		"4\x1B\x02\u01D9m\x03\x02\x02\x02\u01DA\u01DC\x05$\x10\x02\u01DB\u01DA" +
		"\x03\x02\x02\x02\u01DC\u01DD\x03\x02\x02\x02\u01DD\u01DB\x03\x02\x02\x02" +
		"\u01DD\u01DE\x03\x02\x02\x02\u01DE\u01DF\x03\x02\x02\x02\u01DF\u01E0\b" +
		"5\x02\x02\u01E0o\x03\x02\x02\x02\u01E1\u01E3\x07\x0F\x02\x02\u01E2\u01E1" +
		"\x03\x02\x02\x02\u01E2\u01E3\x03\x02\x02\x02\u01E3\u01E4\x03\x02\x02\x02" +
		"\u01E4\u01E5\x07\f\x02\x02\u01E5\u01E6\b6\x1C\x02\u01E6\u01E7\b6\x1D\x02" +
		"\u01E7\u01E8\x03\x02\x02\x02\u01E8\u01E9\b6\x02\x02\u01E9\u01EA\b6\x1E" +
		"\x02\u01EAq\x03\x02\x02\x02\u01EB\u01EF\x05 \x0E\x02\u01EC\u01EF\x05\"" +
		"\x0F\x02\u01ED\u01EF\x07a\x02\x02\u01EE\u01EB\x03\x02\x02\x02\u01EE\u01EC" +
		"\x03\x02\x02\x02\u01EE\u01ED\x03\x02\x02\x02\u01EF\u01F5\x03\x02\x02\x02" +
		"\u01F0\u01F4\x05 \x0E\x02\u01F1\u01F4\x05\"\x0F\x02\u01F2\u01F4\t\x17" +
		"\x02\x02\u01F3\u01F0\x03\x02\x02\x02\u01F3\u01F1\x03\x02\x02\x02\u01F3" +
		"\u01F2\x03\x02\x02\x02\u01F4\u01F7\x03\x02\x02\x02\u01F5\u01F3\x03\x02" +
		"\x02\x02\u01F5\u01F6\x03\x02\x02\x02\u01F6s\x03\x02\x02\x02\u01F7\u01F5" +
		"\x03\x02\x02\x02\u01F8\u01FA\n\x13\x02\x02\u01F9\u01F8\x03\x02\x02\x02" +
		"\u01FA\u01FB\x03\x02\x02\x02\u01FB\u01FC\x03\x02\x02\x02\u01FB\u01F9\x03" +
		"\x02\x02\x02\u01FCu\x03\x02\x02\x02\u01FD\u0201\x07@\x02\x02\u01FE\u0200" +
		"\n\x13\x02\x02\u01FF\u01FE\x03\x02\x02\x02\u0200\u0203\x03\x02\x02\x02" +
		"\u0201\u01FF\x03\x02\x02\x02\u0201\u0202\x03\x02\x02\x02\u0202\u0205\x03" +
		"\x02\x02\x02\u0203\u0201\x03\x02\x02\x02\u0204\u0206\x07\x0F\x02\x02\u0205" +
		"\u0204\x03\x02\x02\x02\u0205\u0206\x03\x02\x02\x02\u0206\u0207\x03\x02" +
		"\x02\x02\u0207\u0208\x07\f\x02\x02\u0208\u0209\x069\f\x02\u0209\u020A" +
		"\x03\x02\x02\x02\u020A\u020B\b9\x02\x02\u020Bw\x03\x02\x02\x02\u020C\u020E" +
		"\x05$\x10\x02\u020D\u020C\x03\x02\x02\x02\u020E\u020F\x03\x02\x02\x02" +
		"\u020F\u020D\x03\x02\x02\x02\u020F\u0210\x03\x02\x02\x02\u0210\u0211\x03" +
		"\x02\x02\x02\u0211\u0212\x06:\r\x02\u0212\u0213\x03\x02\x02\x02\u0213" +
		"\u0214\b:\x02\x02\u0214y\x03\x02\x02\x02\u0215\u0217\x07\x0F\x02\x02\u0216" +
		"\u0215\x03\x02\x02\x02\u0216\u0217\x03\x02\x02\x02\u0217\u0218\x03\x02" +
		"\x02\x02\u0218\u0219\x07\f\x02\x02\u0219\u021A\b;\x1F\x02\u021A{\x03\x02" +
		"\x02\x02\u021B\u021C\x07_\x02\x02\u021C\u021D\x06<\x0E\x02\u021D\u021E" +
		"\b< \x02\u021E\u021F\x03\x02\x02\x02\u021F\u0220\b<\v\x02\u0220\u0221" +
		"\b<\v\x02\u0221}\x03\x02\x02\x02";
	private static readonly _serializedATNSegment1: string =
		"\u0222\u0226\x05 \x0E\x02\u0223\u0226\x05\"\x0F\x02\u0224\u0226\x07a\x02" +
		"\x02\u0225\u0222\x03\x02\x02\x02\u0225\u0223\x03\x02\x02\x02\u0225\u0224" +
		"\x03\x02\x02\x02\u0226\u022C\x03\x02\x02\x02\u0227\u022B\x05 \x0E\x02" +
		"\u0228\u022B\x05\"\x0F\x02\u0229\u022B\t\x17\x02\x02\u022A\u0227\x03\x02" +
		"\x02\x02\u022A\u0228\x03\x02\x02\x02\u022A\u0229\x03\x02\x02\x02\u022B" +
		"\u022E\x03\x02\x02\x02\u022C\u022A\x03\x02\x02\x02\u022C\u022D\x03\x02" +
		"\x02\x02\u022D\u022F\x03\x02\x02\x02\u022E\u022C\x03\x02\x02\x02\u022F" +
		"\u0230\x06=\x0F\x02\u0230\u0231\b=!\x02\u0231\x7F\x03\x02\x02\x02\u0232" +
		"\u0233\x07?\x02\x02\u0233\u0234\x06>\x10\x02\u0234\u0235\b>\"\x02\u0235" +
		"\x81\x03\x02\x02\x02\u0236\u0237\x07~\x02\x02\u0237\u0238\b?#\x02\u0238" +
		"\x83\x03\x02\x02\x02\u0239\u023A\x05,\x14\x02\u023A\u023B\b@$\x02\u023B" +
		"\x85\x03\x02\x02\x02\u023C\u023D\x05*\x13\x02\u023D\u023E\bA%\x02\u023E" +
		"\x87\x03\x02\x02\x02\u023F\u0241\n\x13\x02\x02\u0240\u023F\x03\x02\x02" +
		"\x02\u0241\u0242\x03\x02\x02\x02\u0242\u0243\x03\x02\x02\x02\u0242\u0240" +
		"\x03\x02\x02\x02\u0243\u0244\x03\x02\x02\x02\u0244\u0245\bB&\x02\u0245" +
		"\x89\x03\x02\x02\x025\x02\x03\x04\x05\x06\x07\xAC\xB5\xBD\xC1\xC8\xCA" +
		"\xD1\xD7\xDE\xE3\xFD\u0105\u0111\u0116\u0121\u0126\u0128\u0136\u013B\u014B" +
		"\u0158\u0166\u016E\u017C\u018C\u019A\u01AB\u01BB\u01D0\u01D4\u01D6\u01DD" +
		"\u01E2\u01EE\u01F3\u01F5\u01FB\u0201\u0205\u020F\u0216\u0225\u022A\u022C" +
		"\u0242\'\b\x02\x02\x03\x18\x02\x07\x03\x02\x03\x19\x03\x07\x04\x02\x07" +
		"\x06\x02\x03\x1B\x04\x03\x1C\x05\x03\x1E\x06\x06\x02\x02\x03&\x07\x07" +
		"\x05\x02\x03\'\b\x03(\t\x03)\n\x03*\v\x03+\f\x03,\r\x03-\x0E\x03.\x0F" +
		"\x03/\x10\x030\x11\x031\x12\t\x1C\x02\t\x1D\x02\t\x1E\x02\x036\x13\x03" +
		"6\x14\x07\x07\x02\x03;\x15\x03<\x16\x03=\x17\x03>\x18\x03?\x19\x03@\x1A" +
		"\x03A\x1B\x03B\x1C";
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

