// Generated from src/LGTemplateLexer.g4 by ANTLR 4.7.3-SNAPSHOT

/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "NORMAL_TEMPLATE_BODY_MODE", "MULTILINE_MODE", "STRUCTURE_NAME_MODE", 
		"STRUCTURE_BODY_MODE",
	];

	public static readonly ruleNames: string[] = [
		"A", "C", "D", "E", "F", "H", "I", "L", "S", "T", "U", "W", "LETTER", 
		"NUMBER", "WHITESPACE", "STRING_LITERAL", "STRING_INTERPOLATION", "ESCAPE_CHARACTER_FRAGMENT", 
		"IDENTIFIER", "WS", "NEWLINE", "COMMENTS", "DASH", "OBJECT_DEFINITION", 
		"EXPRESSION_FRAGMENT", "LEFT_SQUARE_BRACKET", "INVALID_TOKEN", "WS_IN_BODY", 
		"MULTILINE_PREFIX", "NEWLINE_IN_BODY", "IF", "ELSEIF", "ELSE", "SWITCH", 
		"CASE", "DEFAULT", "ESCAPE_CHARACTER", "EXPRESSION", "TEXT", "MULTILINE_SUFFIX", 
		"MULTILINE_ESCAPE_CHARACTER", "MULTILINE_EXPRESSION", "MULTILINE_TEXT", 
		"WS_IN_STRUCTURE_NAME", "NEWLINE_IN_STRUCTURE_NAME", "STRUCTURE_NAME", 
		"TEXT_IN_STRUCTURE_NAME", "STRUCTURED_COMMENTS", "WS_IN_STRUCTURE_BODY", 
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
	public get channelNames(): string[] { return LGTemplateLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return LGTemplateLexer.modeNames; }

	// @Override
	public action(_localctx: RuleContext, ruleIndex: number, actionIndex: number): void {
		switch (ruleIndex) {
		case 22:
			this.DASH_action(_localctx, actionIndex);
			break;

		case 25:
			this.LEFT_SQUARE_BRACKET_action(_localctx, actionIndex);
			break;

		case 26:
			this.INVALID_TOKEN_action(_localctx, actionIndex);
			break;

		case 28:
			this.MULTILINE_PREFIX_action(_localctx, actionIndex);
			break;

		case 29:
			this.NEWLINE_IN_BODY_action(_localctx, actionIndex);
			break;

		case 30:
			this.IF_action(_localctx, actionIndex);
			break;

		case 31:
			this.ELSEIF_action(_localctx, actionIndex);
			break;

		case 32:
			this.ELSE_action(_localctx, actionIndex);
			break;

		case 33:
			this.SWITCH_action(_localctx, actionIndex);
			break;

		case 34:
			this.CASE_action(_localctx, actionIndex);
			break;

		case 35:
			this.DEFAULT_action(_localctx, actionIndex);
			break;

		case 36:
			this.ESCAPE_CHARACTER_action(_localctx, actionIndex);
			break;

		case 37:
			this.EXPRESSION_action(_localctx, actionIndex);
			break;

		case 38:
			this.TEXT_action(_localctx, actionIndex);
			break;

		case 39:
			this.MULTILINE_SUFFIX_action(_localctx, actionIndex);
			break;

		case 44:
			this.NEWLINE_IN_STRUCTURE_NAME_action(_localctx, actionIndex);
			break;

		case 49:
			this.STRUCTURED_NEWLINE_action(_localctx, actionIndex);
			break;

		case 51:
			this.STRUCTURE_IDENTIFIER_action(_localctx, actionIndex);
			break;

		case 52:
			this.STRUCTURE_EQUALS_action(_localctx, actionIndex);
			break;

		case 53:
			this.STRUCTURE_OR_MARK_action(_localctx, actionIndex);
			break;

		case 54:
			this.ESCAPE_CHARACTER_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 55:
			this.EXPRESSION_IN_STRUCTURE_BODY_action(_localctx, actionIndex);
			break;

		case 56:
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
		case 25:
			return this.LEFT_SQUARE_BRACKET_sempred(_localctx, predIndex);

		case 27:
			return this.WS_IN_BODY_sempred(_localctx, predIndex);

		case 28:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 30:
			return this.IF_sempred(_localctx, predIndex);

		case 31:
			return this.ELSEIF_sempred(_localctx, predIndex);

		case 32:
			return this.ELSE_sempred(_localctx, predIndex);

		case 33:
			return this.SWITCH_sempred(_localctx, predIndex);

		case 34:
			return this.CASE_sempred(_localctx, predIndex);

		case 35:
			return this.DEFAULT_sempred(_localctx, predIndex);

		case 47:
			return this.STRUCTURED_COMMENTS_sempred(_localctx, predIndex);

		case 48:
			return this.WS_IN_STRUCTURE_BODY_sempred(_localctx, predIndex);

		case 50:
			return this.STRUCTURED_BODY_END_sempred(_localctx, predIndex);

		case 51:
			return this.STRUCTURE_IDENTIFIER_sempred(_localctx, predIndex);

		case 52:
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02%\u021D\b\x01" +
		"\b\x01\b\x01\b\x01\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04" +
		"\x05\t\x05\x04\x06\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04" +
		"\v\t\v\x04\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04" +
		"\x11\t\x11\x04\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04" +
		"\x16\t\x16\x04\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04" +
		"\x1B\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04" +
		" \t \x04!\t!\x04\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(" +
		"\t(\x04)\t)\x04*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x04" +
		"1\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x047\t7\x048\t8\x049\t9\x04" +
		":\t:\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03" +
		"\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v" +
		"\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10" +
		"\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x07\x11\x9C\n\x11\f\x11\x0E\x11" +
		"\x9F\v\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x07\x11\xA6\n\x11\f" +
		"\x11\x0E\x11\xA9\v\x11\x03\x11\x05\x11\xAC\n\x11\x03\x12\x03\x12\x03\x12" +
		"\x03\x12\x07\x12\xB2\n\x12\f\x12\x0E\x12\xB5\v\x12\x03\x12\x03\x12\x03" +
		"\x13\x03\x13\x05\x13\xBB\n\x13\x03\x14\x03\x14\x03\x14\x05\x14\xC0\n\x14" +
		"\x03\x14\x03\x14\x03\x14\x07\x14\xC5\n\x14\f\x14\x0E\x14\xC8\v\x14\x03" +
		"\x15\x06\x15\xCB\n\x15\r\x15\x0E\x15\xCC\x03\x15\x03\x15\x03\x16\x05\x16" +
		"\xD2\n\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x17\x03\x17\x07\x17\xDA" +
		"\n\x17\f\x17\x0E\x17\xDD\v\x17\x03\x17\x03\x17\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x03\x19\x05\x19\xEA\n\x19\x03" +
		"\x19\x03\x19\x03\x19\x03\x19\x06\x19\xF0\n\x19\r\x19\x0E\x19\xF1\x07\x19" +
		"\xF4\n\x19\f\x19\x0E\x19\xF7\v\x19\x03\x19\x03\x19\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x06\x1A\u0101\n\x1A\r\x1A\x0E\x1A\u0102\x03" +
		"\x1A\x05\x1A\u0106\n\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B" +
		"\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x06\x1D\u0112\n\x1D\r\x1D\x0E\x1D\u0113" +
		"\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E" +
		"\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x05\x1F\u0124\n\x1F\x03\x1F\x03" +
		"\x1F\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03 \x03 \x03 \x07 \u012F\n \f \x0E" +
		" \u0132\v \x03 \x03 \x03 \x03 \x03!\x03!\x03!\x03!\x03!\x07!\u013D\n!" +
		"\f!\x0E!\u0140\v!\x03!\x03!\x03!\x07!\u0145\n!\f!\x0E!\u0148\v!\x03!\x03" +
		"!\x03!\x03!\x03\"\x03\"\x03\"\x03\"\x03\"\x07\"\u0153\n\"\f\"\x0E\"\u0156" +
		"\v\"\x03\"\x03\"\x03\"\x03\"\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x07#\u0163" +
		"\n#\f#\x0E#\u0166\v#\x03#\x03#\x03#\x03#\x03$\x03$\x03$\x03$\x03$\x07" +
		"$\u0171\n$\f$\x0E$\u0174\v$\x03$\x03$\x03$\x03$\x03%\x03%\x03%\x03%\x03" +
		"%\x03%\x03%\x03%\x07%\u0182\n%\f%\x0E%\u0185\v%\x03%\x03%\x03%\x03%\x03" +
		"&\x03&\x03&\x03\'\x03\'\x03\'\x03(\x06(\u0192\n(\r(\x0E(\u0193\x03(\x03" +
		"(\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x03*\x03*\x03*\x03*\x03+\x03" +
		"+\x03+\x03+\x03,\x05,\u01A9\n,\x03,\x03,\x06,\u01AD\n,\r,\x0E,\u01AE\x03" +
		",\x03,\x03-\x06-\u01B4\n-\r-\x0E-\u01B5\x03-\x03-\x03.\x05.\u01BB\n.\x03" +
		".\x03.\x03.\x03.\x03.\x03.\x03.\x03/\x03/\x03/\x05/\u01C7\n/\x03/\x03" +
		"/\x03/\x07/\u01CC\n/\f/\x0E/\u01CF\v/\x030\x060\u01D2\n0\r0\x0E0\u01D3" +
		"\x031\x031\x071\u01D8\n1\f1\x0E1\u01DB\v1\x031\x051\u01DE\n1\x031\x03" +
		"1\x031\x031\x031\x032\x062\u01E6\n2\r2\x0E2\u01E7\x032\x032\x032\x032" +
		"\x033\x053\u01EF\n3\x033\x033\x033\x034\x034\x034\x034\x034\x034\x035" +
		"\x035\x035\x055\u01FD\n5\x035\x035\x035\x075\u0202\n5\f5\x0E5\u0205\v" +
		"5\x035\x035\x035\x036\x036\x036\x036\x037\x037\x037\x038\x038\x038\x03" +
		"9\x039\x039\x03:\x06:\u0218\n:\r:\x0E:\u0219\x03:\x03:\t\x9D\xA7\xB3\u0193" +
		"\u01AE\u01D3\u0219\x02\x02;\x07\x02\x02\t\x02\x02\v\x02\x02\r\x02\x02" +
		"\x0F\x02\x02\x11\x02\x02\x13\x02\x02\x15\x02\x02\x17\x02\x02\x19\x02\x02" +
		"\x1B\x02\x02\x1D\x02\x02\x1F\x02\x02!\x02\x02#\x02\x02%\x02\x02\'\x02" +
		"\x02)\x02\x02+\x02\x02-\x02\x03/\x02\x041\x02\x053\x02\x065\x02\x077\x02" +
		"\b9\x02\t;\x02\n=\x02\v?\x02\fA\x02\rC\x02\x0EE\x02\x0FG\x02\x10I\x02" +
		"\x11K\x02\x12M\x02\x13O\x02\x14Q\x02\x15S\x02\x16U\x02\x17W\x02\x02Y\x02" +
		"\x02[\x02\x02]\x02\x18_\x02\x19a\x02\x1Ac\x02\x1Be\x02\x1Cg\x02\x1Di\x02" +
		"\x1Ek\x02\x1Fm\x02 o\x02!q\x02\"s\x02#u\x02$w\x02%\x07\x02\x03\x04\x05" +
		"\x06\x1A\x04\x02CCcc\x04\x02EEee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04" +
		"\x02JJjj\x04\x02KKkk\x04\x02NNnn\x04\x02UUuu\x04\x02VVvv\x04\x02WWww\x04" +
		"\x02YYyy\x04\x02C\\c|\x06\x02\v\v\"\"\xA2\xA2\uFF01\uFF01\x04\x02))^^" +
		"\x03\x02))\x04\x02$$^^\x03\x02$$\x04\x02^^bb\x03\x02bb\x04\x02\f\f\x0F" +
		"\x0F\t\x02\f\f\x0F\x0F$$))bb}}\x7F\x7F\x06\x02$$))bb\x7F\x7F\x04\x02/" +
		"0aa\x02\u023F\x02-\x03\x02\x02\x02\x02/\x03\x02\x02\x02\x021\x03\x02\x02" +
		"\x02\x023\x03\x02\x02\x02\x025\x03\x02\x02\x02\x027\x03\x02\x02\x02\x02" +
		"9\x03\x02\x02\x02\x02;\x03\x02\x02\x02\x03=\x03\x02\x02\x02\x03?\x03\x02" +
		"\x02\x02\x03A\x03\x02\x02\x02\x03C\x03\x02\x02\x02\x03E\x03\x02\x02\x02" +
		"\x03G\x03\x02\x02\x02\x03I\x03\x02\x02\x02\x03K\x03\x02\x02\x02\x03M\x03" +
		"\x02\x02\x02\x03O\x03\x02\x02\x02\x03Q\x03\x02\x02\x02\x03S\x03\x02\x02" +
		"\x02\x04U\x03\x02\x02\x02\x04W\x03\x02\x02\x02\x04Y\x03\x02\x02\x02\x04" +
		"[\x03\x02\x02\x02\x05]\x03\x02\x02\x02\x05_\x03\x02\x02\x02\x05a\x03\x02" +
		"\x02\x02\x05c\x03\x02\x02\x02\x06e\x03\x02\x02\x02\x06g\x03\x02\x02\x02" +
		"\x06i\x03\x02\x02\x02\x06k\x03\x02\x02\x02\x06m\x03\x02\x02\x02\x06o\x03" +
		"\x02\x02\x02\x06q\x03\x02\x02\x02\x06s\x03\x02\x02\x02\x06u\x03\x02\x02" +
		"\x02\x06w\x03\x02\x02\x02\x07y\x03\x02\x02\x02\t{\x03\x02\x02\x02\v}\x03" +
		"\x02\x02\x02\r\x7F\x03\x02\x02\x02\x0F\x81\x03\x02\x02\x02\x11\x83\x03" +
		"\x02\x02\x02\x13\x85\x03\x02\x02\x02\x15\x87\x03\x02\x02\x02\x17\x89\x03" +
		"\x02\x02\x02\x19\x8B\x03\x02\x02\x02\x1B\x8D\x03\x02\x02\x02\x1D\x8F\x03" +
		"\x02\x02\x02\x1F\x91\x03\x02\x02\x02!\x93\x03\x02\x02\x02#\x95\x03\x02" +
		"\x02\x02%\xAB\x03\x02\x02\x02\'\xAD\x03\x02\x02\x02)\xB8\x03\x02\x02\x02" +
		"+\xBF\x03\x02\x02\x02-\xCA\x03\x02\x02\x02/\xD1\x03\x02\x02\x021\xD7\x03" +
		"\x02\x02\x023\xE0\x03\x02\x02\x025\xE5\x03\x02\x02\x027\xFA\x03\x02\x02" +
		"\x029\u0107\x03\x02\x02\x02;\u010D\x03\x02\x02\x02=\u0111\x03\x02\x02" +
		"\x02?\u0119\x03\x02\x02\x02A\u0123\x03\x02\x02\x02C\u012B\x03\x02\x02" +
		"\x02E\u0137\x03\x02\x02\x02G\u014D\x03\x02\x02\x02I\u015B\x03\x02\x02" +
		"\x02K\u016B\x03\x02\x02\x02M\u0179\x03\x02\x02\x02O\u018A\x03\x02\x02" +
		"\x02Q\u018D\x03\x02\x02\x02S\u0191\x03\x02\x02\x02U\u0197\x03\x02\x02" +
		"\x02W\u019F\x03\x02\x02\x02Y\u01A3\x03\x02\x02\x02[\u01AC\x03\x02\x02" +
		"\x02]\u01B3\x03\x02\x02\x02_\u01BA\x03\x02\x02\x02a\u01C6\x03\x02\x02" +
		"\x02c\u01D1\x03\x02\x02\x02e\u01D5\x03\x02\x02\x02g\u01E5\x03\x02\x02" +
		"\x02i\u01EE\x03\x02\x02\x02k\u01F3\x03\x02\x02\x02m\u01FC\x03\x02\x02" +
		"\x02o\u0209\x03\x02\x02\x02q\u020D\x03\x02\x02\x02s\u0210\x03\x02\x02" +
		"\x02u\u0213\x03\x02\x02\x02w\u0217\x03\x02\x02\x02yz\t\x02\x02\x02z\b" +
		"\x03\x02\x02\x02{|\t\x03\x02\x02|\n\x03\x02\x02\x02}~\t\x04\x02\x02~\f" +
		"\x03\x02\x02\x02\x7F\x80\t\x05\x02\x02\x80\x0E\x03\x02\x02\x02\x81\x82" +
		"\t\x06\x02\x02\x82\x10\x03\x02\x02\x02\x83\x84\t\x07\x02\x02\x84\x12\x03" +
		"\x02\x02\x02\x85\x86\t\b\x02\x02\x86\x14\x03\x02\x02\x02\x87\x88\t\t\x02" +
		"\x02\x88\x16\x03\x02\x02\x02\x89\x8A\t\n\x02\x02\x8A\x18\x03\x02\x02\x02" +
		"\x8B\x8C\t\v\x02\x02\x8C\x1A\x03\x02\x02\x02\x8D\x8E\t\f\x02\x02\x8E\x1C" +
		"\x03\x02\x02\x02\x8F\x90\t\r\x02\x02\x90\x1E\x03\x02\x02\x02\x91\x92\t" +
		"\x0E\x02\x02\x92 \x03\x02\x02\x02\x93\x94\x042;\x02\x94\"\x03\x02\x02" +
		"\x02\x95\x96\t\x0F\x02\x02\x96$\x03\x02\x02\x02\x97\x9D\x07)\x02\x02\x98" +
		"\x99\x07^\x02\x02\x99\x9C\t\x10\x02\x02\x9A\x9C\n\x11\x02\x02\x9B\x98" +
		"\x03\x02\x02\x02\x9B\x9A\x03\x02\x02\x02\x9C\x9F\x03\x02\x02\x02\x9D\x9E" +
		"\x03\x02\x02\x02\x9D\x9B\x03\x02\x02\x02\x9E\xA0\x03\x02\x02\x02\x9F\x9D" +
		"\x03\x02\x02\x02\xA0\xAC\x07)\x02\x02\xA1\xA7\x07$\x02\x02\xA2\xA3\x07" +
		"^\x02\x02\xA3\xA6\t\x12\x02\x02\xA4\xA6\n\x13\x02\x02\xA5\xA2\x03\x02" +
		"\x02\x02\xA5\xA4\x03\x02\x02\x02\xA6\xA9\x03\x02\x02\x02\xA7\xA8\x03\x02" +
		"\x02\x02\xA7\xA5\x03\x02\x02\x02\xA8\xAA\x03\x02\x02\x02\xA9\xA7\x03\x02" +
		"\x02\x02\xAA\xAC\x07$\x02\x02\xAB\x97\x03\x02\x02\x02\xAB\xA1\x03\x02" +
		"\x02\x02\xAC&\x03\x02\x02\x02\xAD\xB3\x07b\x02\x02\xAE\xAF\x07^\x02\x02" +
		"\xAF\xB2\t\x14\x02\x02\xB0\xB2\n\x15\x02\x02\xB1\xAE\x03\x02\x02\x02\xB1" +
		"\xB0\x03\x02\x02\x02\xB2\xB5\x03\x02\x02\x02\xB3\xB4\x03\x02\x02\x02\xB3" +
		"\xB1\x03\x02\x02\x02\xB4\xB6\x03\x02\x02\x02\xB5\xB3\x03\x02\x02\x02\xB6" +
		"\xB7\x07b\x02\x02\xB7(\x03\x02\x02\x02\xB8\xBA\x07^\x02\x02\xB9\xBB\n" +
		"\x16\x02\x02\xBA\xB9\x03\x02\x02\x02\xBA\xBB\x03\x02\x02\x02\xBB*\x03" +
		"\x02\x02\x02\xBC\xC0\x05\x1F\x0E\x02\xBD\xC0\x05!\x0F\x02\xBE\xC0\x07" +
		"a\x02\x02\xBF\xBC\x03\x02\x02\x02\xBF\xBD\x03\x02\x02\x02\xBF\xBE\x03" +
		"\x02\x02\x02\xC0\xC6\x03\x02\x02\x02\xC1\xC5\x05\x1F\x0E\x02\xC2\xC5\x05" +
		"!\x0F\x02\xC3\xC5\x07a\x02\x02\xC4\xC1\x03\x02\x02\x02\xC4\xC2\x03\x02" +
		"\x02\x02\xC4\xC3\x03\x02\x02\x02\xC5\xC8\x03\x02\x02\x02\xC6\xC4\x03\x02" +
		"\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7,\x03\x02\x02\x02\xC8\xC6\x03\x02" +
		"\x02\x02\xC9\xCB\x05#\x10\x02\xCA\xC9\x03\x02\x02\x02\xCB\xCC\x03\x02" +
		"\x02\x02\xCC\xCA\x03\x02\x02\x02\xCC\xCD\x03\x02\x02\x02\xCD\xCE\x03\x02" +
		"\x02\x02\xCE\xCF\b\x15\x02\x02\xCF.\x03\x02\x02\x02\xD0\xD2\x07\x0F\x02" +
		"\x02\xD1\xD0\x03\x02\x02\x02\xD1\xD2\x03\x02\x02\x02\xD2\xD3\x03\x02\x02" +
		"\x02\xD3\xD4\x07\f\x02\x02\xD4\xD5\x03\x02\x02\x02\xD5\xD6\b\x16\x02\x02" +
		"\xD60\x03\x02\x02\x02\xD7\xDB\x07@\x02\x02\xD8\xDA\n\x16\x02\x02\xD9\xD8" +
		"\x03\x02\x02\x02\xDA\xDD\x03\x02\x02\x02\xDB\xD9\x03\x02\x02\x02\xDB\xDC" +
		"\x03\x02\x02\x02\xDC\xDE\x03\x02\x02\x02\xDD\xDB\x03\x02\x02\x02\xDE\xDF" +
		"\b\x17\x02\x02\xDF2\x03\x02\x02\x02\xE0\xE1\x07/\x02\x02\xE1\xE2\b\x18" +
		"\x03\x02\xE2\xE3\x03\x02\x02\x02\xE3\xE4\b\x18\x04\x02\xE44\x03\x02\x02" +
		"\x02\xE5\xF5\x07}\x02\x02\xE6\xF4\x05#\x10\x02\xE7\xEA\x05+\x14\x02\xE8" +
		"\xEA\x05%\x11\x02\xE9\xE7\x03\x02\x02\x02\xE9\xE8\x03\x02\x02\x02\xEA" +
		"\xEB\x03\x02\x02\x02\xEB\xEF\x07<\x02\x02\xEC\xF0\x05%\x11\x02\xED\xF0" +
		"\n\x17\x02\x02\xEE\xF0\x055\x19\x02\xEF\xEC\x03\x02\x02\x02\xEF\xED\x03" +
		"\x02\x02\x02\xEF\xEE\x03\x02\x02\x02\xF0\xF1\x03\x02\x02\x02\xF1\xEF\x03" +
		"\x02\x02\x02\xF1\xF2\x03\x02\x02\x02\xF2\xF4\x03\x02\x02\x02\xF3\xE6\x03" +
		"\x02\x02\x02\xF3\xE9\x03\x02\x02\x02\xF4\xF7\x03\x02\x02\x02\xF5\xF3\x03" +
		"\x02\x02\x02\xF5\xF6\x03\x02\x02\x02\xF6\xF8\x03\x02\x02\x02\xF7\xF5\x03" +
		"\x02\x02\x02\xF8\xF9\x07\x7F\x02\x02\xF96\x03\x02\x02\x02\xFA\xFB\x07" +
		"&\x02\x02\xFB\u0100\x07}\x02\x02\xFC\u0101\x05%\x11\x02\xFD\u0101\x05" +
		"\'\x12\x02\xFE\u0101\x055\x19\x02\xFF\u0101\n\x18\x02\x02\u0100\xFC\x03" +
		"\x02\x02\x02\u0100\xFD\x03\x02\x02\x02\u0100\xFE\x03\x02\x02\x02\u0100" +
		"\xFF\x03\x02\x02\x02\u0101\u0102\x03\x02\x02\x02\u0102\u0100\x03\x02\x02" +
		"\x02\u0102\u0103\x03\x02\x02\x02\u0103\u0105\x03\x02\x02\x02\u0104\u0106" +
		"\x07\x7F\x02\x02\u0105\u0104\x03\x02\x02\x02\u0105\u0106\x03\x02\x02\x02" +
		"\u01068\x03\x02\x02\x02\u0107\u0108\x07]\x02\x02\u0108\u0109\x06\x1B\x02" +
		"\x02\u0109\u010A\b\x1B\x05\x02\u010A\u010B\x03\x02\x02\x02\u010B\u010C" +
		"\b\x1B\x06\x02\u010C:\x03\x02\x02\x02\u010D\u010E\v\x02\x02\x02\u010E" +
		"\u010F\b\x1C\x07\x02\u010F<\x03\x02\x02\x02\u0110\u0112\x05#\x10\x02\u0111" +
		"\u0110\x03\x02\x02\x02\u0112\u0113\x03\x02\x02\x02\u0113\u0111\x03\x02" +
		"\x02\x02\u0113\u0114\x03\x02\x02\x02\u0114\u0115\x03\x02\x02\x02\u0115" +
		"\u0116\x06\x1D\x03\x02\u0116\u0117\x03\x02\x02\x02\u0117\u0118\b\x1D\x02" +
		"\x02\u0118>\x03\x02\x02\x02\u0119\u011A\x07b\x02\x02\u011A\u011B\x07b" +
		"\x02\x02\u011B\u011C\x07b\x02\x02\u011C\u011D\x03\x02\x02\x02\u011D\u011E" +
		"\x06\x1E\x04\x02\u011E\u011F\b\x1E\b\x02\u011F\u0120\x03\x02\x02\x02\u0120" +
		"\u0121\b\x1E\t\x02\u0121@\x03\x02\x02\x02\u0122\u0124\x07\x0F\x02\x02" +
		"\u0123\u0122\x03\x02\x02\x02\u0123\u0124\x03\x02\x02\x02\u0124\u0125\x03" +
		"\x02\x02\x02\u0125\u0126\x07\f\x02\x02\u0126\u0127\b\x1F\n\x02\u0127\u0128" +
		"\x03\x02\x02\x02\u0128\u0129\b\x1F\x02\x02\u0129\u012A\b\x1F\v\x02\u012A" +
		"B\x03\x02\x02\x02\u012B\u012C\x05\x13\b\x02\u012C\u0130\x05\x0F\x06\x02" +
		"\u012D\u012F\x05#\x10\x02\u012E\u012D\x03\x02\x02\x02\u012F\u0132\x03" +
		"\x02\x02\x02\u0130\u012E\x03\x02\x02\x02\u0130\u0131\x03\x02\x02\x02\u0131" +
		"\u0133\x03\x02\x02\x02\u0132\u0130\x03\x02\x02\x02\u0133\u0134\x07<\x02" +
		"\x02\u0134\u0135\x06 \x05\x02\u0135\u0136\b \f\x02\u0136D\x03\x02\x02" +
		"\x02\u0137\u0138\x05\r\x05\x02\u0138\u0139\x05\x15\t\x02\u0139\u013A\x05" +
		"\x17\n\x02\u013A\u013E\x05\r\x05\x02\u013B\u013D\x05#\x10\x02\u013C\u013B" +
		"\x03\x02\x02\x02\u013D\u0140\x03\x02\x02\x02\u013E\u013C\x03\x02\x02\x02" +
		"\u013E\u013F\x03\x02\x02\x02\u013F\u0141\x03\x02\x02\x02\u0140\u013E\x03" +
		"\x02\x02\x02\u0141\u0142\x05\x13\b\x02\u0142\u0146\x05\x0F\x06\x02\u0143" +
		"\u0145\x05#\x10\x02\u0144\u0143\x03\x02\x02\x02\u0145\u0148\x03\x02\x02" +
		"\x02\u0146\u0144\x03\x02\x02\x02\u0146\u0147\x03\x02\x02\x02\u0147\u0149" +
		"\x03\x02\x02\x02\u0148\u0146\x03\x02\x02\x02\u0149\u014A\x07<\x02\x02" +
		"\u014A\u014B\x06!\x06\x02\u014B\u014C\b!\r\x02\u014CF\x03\x02\x02\x02" +
		"\u014D\u014E\x05\r\x05\x02\u014E\u014F\x05\x15\t\x02\u014F\u0150\x05\x17" +
		"\n\x02\u0150\u0154\x05\r\x05\x02\u0151\u0153\x05#\x10\x02\u0152\u0151" +
		"\x03\x02\x02\x02\u0153\u0156\x03\x02\x02\x02\u0154\u0152\x03\x02\x02\x02" +
		"\u0154\u0155\x03\x02\x02\x02\u0155\u0157\x03\x02\x02\x02\u0156\u0154\x03" +
		"\x02\x02\x02\u0157\u0158\x07<\x02\x02\u0158\u0159\x06\"\x07\x02\u0159" +
		"\u015A\b\"\x0E\x02\u015AH\x03\x02\x02\x02\u015B\u015C\x05\x17\n\x02\u015C" +
		"\u015D\x05\x1D\r\x02\u015D\u015E\x05\x13\b\x02\u015E\u015F\x05\x19\v\x02" +
		"\u015F\u0160\x05\t\x03\x02\u0160\u0164\x05\x11\x07\x02\u0161\u0163\x05" +
		"#\x10\x02\u0162\u0161\x03\x02\x02\x02\u0163\u0166\x03\x02\x02\x02\u0164" +
		"\u0162\x03\x02\x02\x02\u0164\u0165\x03\x02\x02\x02\u0165\u0167\x03\x02" +
		"\x02\x02\u0166\u0164\x03\x02\x02\x02\u0167\u0168\x07<\x02\x02\u0168\u0169" +
		"\x06#\b\x02\u0169\u016A\b#\x0F\x02\u016AJ\x03\x02\x02\x02\u016B\u016C" +
		"\x05\t\x03\x02\u016C\u016D\x05\x07\x02\x02\u016D\u016E\x05\x17\n\x02\u016E" +
		"\u0172\x05\r\x05\x02\u016F\u0171\x05#\x10\x02\u0170\u016F\x03\x02\x02" +
		"\x02\u0171\u0174\x03\x02\x02\x02\u0172\u0170\x03\x02\x02\x02\u0172\u0173" +
		"\x03\x02\x02\x02\u0173\u0175\x03\x02\x02\x02\u0174\u0172\x03\x02\x02\x02" +
		"\u0175\u0176\x07<\x02\x02\u0176\u0177\x06$\t\x02\u0177\u0178\b$\x10\x02" +
		"\u0178L\x03\x02\x02\x02\u0179\u017A\x05\v\x04\x02\u017A\u017B\x05\r\x05" +
		"\x02\u017B\u017C\x05\x0F\x06\x02\u017C\u017D\x05\x07\x02\x02\u017D\u017E" +
		"\x05\x1B\f\x02\u017E\u017F\x05\x15\t\x02\u017F\u0183\x05\x19\v\x02\u0180" +
		"\u0182\x05#\x10\x02\u0181\u0180\x03\x02\x02\x02\u0182\u0185\x03\x02\x02" +
		"\x02\u0183\u0181\x03\x02\x02\x02\u0183\u0184\x03\x02\x02\x02\u0184\u0186" +
		"\x03\x02\x02\x02\u0185\u0183\x03\x02\x02\x02\u0186\u0187\x07<\x02\x02" +
		"\u0187\u0188\x06%\n\x02\u0188\u0189\b%\x11\x02\u0189N\x03\x02\x02\x02" +
		"\u018A\u018B\x05)\x13\x02\u018B\u018C\b&\x12\x02\u018CP\x03\x02\x02\x02" +
		"\u018D\u018E\x057\x1A\x02\u018E\u018F\b\'\x13\x02\u018FR\x03\x02\x02\x02" +
		"\u0190\u0192\n\x16\x02\x02\u0191\u0190\x03\x02\x02\x02\u0192\u0193\x03" +
		"\x02\x02\x02\u0193\u0194\x03\x02\x02\x02\u0193\u0191\x03\x02\x02\x02\u0194" +
		"\u0195\x03\x02\x02\x02\u0195\u0196\b(\x14\x02\u0196T\x03\x02\x02\x02\u0197" +
		"\u0198\x07b\x02\x02\u0198\u0199\x07b\x02\x02\u0199\u019A\x07b\x02\x02" +
		"\u019A\u019B\x03\x02\x02\x02\u019B\u019C\b)\x15\x02\u019C\u019D\x03\x02" +
		"\x02\x02\u019D\u019E\b)\v\x02\u019EV\x03\x02\x02\x02\u019F\u01A0\x05)" +
		"\x13\x02\u01A0\u01A1\x03\x02\x02\x02\u01A1\u01A2\b*\x16\x02\u01A2X\x03" +
		"\x02\x02\x02\u01A3\u01A4\x057\x1A\x02\u01A4\u01A5\x03\x02\x02\x02\u01A5" +
		"\u01A6\b+\x17\x02\u01A6Z\x03\x02\x02\x02\u01A7\u01A9\x07\x0F\x02\x02\u01A8" +
		"\u01A7\x03\x02\x02\x02\u01A8\u01A9\x03\x02\x02\x02\u01A9\u01AA\x03\x02" +
		"\x02\x02\u01AA\u01AD\x07\f\x02\x02\u01AB\u01AD\n\x16\x02\x02\u01AC\u01A8" +
		"\x03\x02\x02\x02\u01AC\u01AB\x03\x02\x02\x02\u01AD\u01AE\x03\x02\x02\x02" +
		"\u01AE\u01AF\x03\x02\x02\x02\u01AE\u01AC\x03\x02\x02\x02\u01AF\u01B0\x03" +
		"\x02\x02\x02\u01B0\u01B1\b,\x18\x02\u01B1\\\x03\x02\x02\x02\u01B2\u01B4" +
		"\x05#\x10\x02\u01B3\u01B2\x03\x02\x02\x02\u01B4\u01B5\x03\x02\x02\x02" +
		"\u01B5\u01B3\x03\x02\x02\x02\u01B5\u01B6\x03\x02\x02\x02\u01B6\u01B7\x03" +
		"\x02\x02\x02\u01B7\u01B8\b-\x02\x02\u01B8^\x03\x02\x02\x02\u01B9\u01BB" +
		"\x07\x0F\x02\x02\u01BA\u01B9\x03\x02\x02\x02\u01BA\u01BB\x03\x02\x02\x02" +
		"\u01BB\u01BC\x03\x02\x02\x02\u01BC\u01BD\x07\f\x02\x02\u01BD\u01BE\b." +
		"\x19\x02\u01BE\u01BF\b.\x1A\x02\u01BF\u01C0\x03\x02\x02\x02\u01C0\u01C1" +
		"\b.\x02\x02\u01C1\u01C2\b.\x1B\x02\u01C2`\x03\x02\x02\x02\u01C3\u01C7" +
		"\x05\x1F\x0E\x02\u01C4\u01C7\x05!\x0F\x02\u01C5\u01C7\x07a\x02\x02\u01C6" +
		"\u01C3\x03\x02\x02\x02\u01C6\u01C4\x03\x02\x02\x02\u01C6\u01C5\x03\x02" +
		"\x02\x02\u01C7\u01CD\x03\x02\x02\x02\u01C8\u01CC\x05\x1F\x0E\x02\u01C9" +
		"\u01CC\x05!\x0F\x02\u01CA\u01CC\t\x19\x02\x02\u01CB\u01C8\x03\x02\x02" +
		"\x02\u01CB\u01C9\x03\x02\x02\x02\u01CB\u01CA\x03\x02\x02\x02\u01CC\u01CF" +
		"\x03\x02\x02\x02\u01CD\u01CB\x03\x02\x02\x02\u01CD\u01CE\x03\x02\x02\x02" +
		"\u01CEb\x03\x02\x02\x02\u01CF\u01CD\x03\x02\x02\x02\u01D0\u01D2\n\x16" +
		"\x02\x02\u01D1\u01D0\x03\x02\x02\x02\u01D2\u01D3\x03\x02\x02\x02\u01D3" +
		"\u01D4\x03\x02\x02\x02\u01D3\u01D1\x03\x02\x02\x02\u01D4d\x03\x02\x02" +
		"\x02\u01D5\u01D9\x07@\x02\x02\u01D6\u01D8\n\x16\x02\x02\u01D7\u01D6\x03" +
		"\x02\x02\x02\u01D8\u01DB\x03\x02\x02\x02\u01D9\u01D7\x03\x02\x02\x02\u01D9" +
		"\u01DA\x03\x02\x02\x02\u01DA\u01DD\x03\x02\x02\x02\u01DB\u01D9\x03\x02" +
		"\x02\x02\u01DC\u01DE\x07\x0F\x02\x02\u01DD\u01DC\x03\x02\x02\x02\u01DD" +
		"\u01DE\x03\x02\x02\x02\u01DE\u01DF\x03\x02\x02\x02\u01DF\u01E0\x07\f\x02" +
		"\x02\u01E0\u01E1\x061\v\x02\u01E1\u01E2\x03\x02\x02\x02\u01E2\u01E3\b" +
		"1\x02\x02\u01E3f\x03\x02\x02\x02\u01E4\u01E6\x05#\x10\x02\u01E5\u01E4" +
		"\x03\x02\x02\x02\u01E6\u01E7\x03\x02\x02\x02\u01E7\u01E5\x03\x02\x02\x02" +
		"\u01E7\u01E8\x03\x02\x02\x02\u01E8\u01E9\x03\x02\x02\x02\u01E9\u01EA\x06" +
		"2\f\x02\u01EA\u01EB\x03\x02\x02\x02\u01EB\u01EC\b2\x02\x02\u01ECh\x03" +
		"\x02\x02\x02\u01ED\u01EF\x07\x0F\x02\x02\u01EE\u01ED\x03\x02\x02\x02\u01EE" +
		"\u01EF\x03\x02\x02\x02\u01EF\u01F0\x03\x02\x02\x02\u01F0\u01F1\x07\f\x02" +
		"\x02\u01F1\u01F2\b3\x1C\x02\u01F2j\x03\x02\x02\x02\u01F3\u01F4\x07_\x02" +
		"\x02\u01F4\u01F5\x064\r\x02\u01F5\u01F6\x03\x02\x02\x02\u01F6\u01F7\b" +
		"4\v\x02\u01F7\u01F8\b4\v\x02\u01F8l\x03\x02\x02\x02\u01F9\u01FD\x05\x1F" +
		"\x0E\x02\u01FA\u01FD\x05!\x0F\x02\u01FB\u01FD\x07a\x02\x02\u01FC\u01F9" +
		"\x03\x02\x02\x02\u01FC\u01FA\x03\x02\x02\x02\u01FC\u01FB\x03\x02\x02\x02" +
		"\u01FD\u0203\x03\x02\x02\x02\u01FE\u0202\x05\x1F\x0E\x02\u01FF\u0202\x05" +
		"!\x0F\x02\u0200\u0202\t\x19\x02\x02\u0201\u01FE\x03\x02\x02\x02\u0201" +
		"\u01FF\x03\x02\x02\x02\u0201\u0200\x03\x02\x02\x02\u0202\u0205\x03\x02" +
		"\x02\x02\u0203\u0201\x03\x02\x02\x02\u0203\u0204\x03\x02\x02\x02\u0204" +
		"\u0206\x03\x02\x02\x02\u0205\u0203\x03\x02\x02\x02\u0206\u0207\x065\x0E" +
		"\x02\u0207\u0208\b5\x1D\x02\u0208n\x03\x02\x02\x02\u0209\u020A\x07?\x02" +
		"\x02\u020A\u020B\x066\x0F\x02\u020B\u020C\b6\x1E\x02\u020Cp\x03\x02\x02" +
		"\x02\u020D\u020E\x07~\x02\x02\u020E\u020F\b7\x1F\x02\u020Fr\x03\x02\x02" +
		"\x02\u0210\u0211\x05)\x13\x02\u0211\u0212\b8 \x02\u0212t\x03\x02\x02\x02" +
		"\u0213\u0214\x057\x1A\x02\u0214\u0215\b9!\x02\u0215v\x03\x02\x02\x02\u0216" +
		"\u0218\n\x16\x02\x02\u0217\u0216\x03\x02\x02\x02\u0218\u0219\x03\x02\x02" +
		"\x02\u0219\u021A\x03\x02\x02\x02\u0219\u0217\x03\x02\x02\x02\u021A\u021B" +
		"\x03\x02\x02\x02\u021B\u021C\b:\"\x02\u021Cx\x03\x02\x02\x028\x02\x03" +
		"\x04\x05\x06\x9B\x9D\xA5\xA7\xAB\xB1\xB3\xBA\xBF\xC4\xC6\xCC\xD1\xDB\xE9" +
		"\xEF\xF1\xF3\xF5\u0100\u0102\u0105\u0113\u0123\u0130\u013E\u0146\u0154" +
		"\u0164\u0172\u0183\u0193\u01A8\u01AC\u01AE\u01B5\u01BA\u01C6\u01CB\u01CD" +
		"\u01D3\u01D9\u01DD\u01E7\u01EE\u01FC\u0201\u0203\u0219#\b\x02\x02\x03";
	private static readonly _serializedATNSegment1: string =
		"\x18\x02\x07\x03\x02\x03\x1B\x03\x07\x05\x02\x03\x1C\x04\x03\x1E\x05\x07" +
		"\x04\x02\x03\x1F\x06\x06\x02\x02\x03 \x07\x03!\b\x03\"\t\x03#\n\x03$\v" +
		"\x03%\f\x03&\r\x03\'\x0E\x03(\x0F\x03)\x10\t\x14\x02\t\x15\x02\t\x16\x02" +
		"\x03.\x11\x03.\x12\x07\x06\x02\x033\x13\x035\x14\x036\x15\x037\x16\x03" +
		"8\x17\x039\x18\x03:\x19";
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

