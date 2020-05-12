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
	public static readonly NEWLINE = 1;
	public static readonly OPTION = 2;
	public static readonly COMMENT = 3;
	public static readonly IMPORT = 4;
	public static readonly TEMPLATE_NAME_LINE = 5;
	public static readonly MULTILINE_PREFIX = 6;
	public static readonly TEMPLATE_BODY = 7;
	public static readonly INVALID_LINE = 8;
	public static readonly MULTILINE_SUFFIX = 9;
	public static readonly ESCAPE_CHARACTER = 10;
	public static readonly MULTILINE_TEXT = 11;
	public static readonly MULTILINE_MODE = 1;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "MULTILINE_MODE",
	];

	public static readonly ruleNames: string[] = [
		"WHITESPACE", "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"MULTILINE_PREFIX", "TEMPLATE_BODY", "INVALID_LINE", "MULTILINE_SUFFIX", 
		"ESCAPE_CHARACTER", "MULTILINE_TEXT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, "'```'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"MULTILINE_PREFIX", "TEMPLATE_BODY", "INVALID_LINE", "MULTILINE_SUFFIX", 
		"ESCAPE_CHARACTER", "MULTILINE_TEXT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileLexer._LITERAL_NAMES, LGFileLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  startTemplate = false;
	  startLine = true;


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
		case 1:
			this.NEWLINE_action(_localctx, actionIndex);
			break;

		case 5:
			this.TEMPLATE_NAME_LINE_action(_localctx, actionIndex);
			break;

		case 7:
			this.TEMPLATE_BODY_action(_localctx, actionIndex);
			break;
		}
	}
	private NEWLINE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			this.startLine = true;
			break;
		}
	}
	private TEMPLATE_NAME_LINE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 1:
			 this.startTemplate = true; 
			break;
		}
	}
	private TEMPLATE_BODY_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 2:
			 this.startLine = false; 
			break;
		}
	}
	// @Override
	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 2:
			return this.OPTION_sempred(_localctx, predIndex);

		case 3:
			return this.COMMENT_sempred(_localctx, predIndex);

		case 4:
			return this.IMPORT_sempred(_localctx, predIndex);

		case 5:
			return this.TEMPLATE_NAME_LINE_sempred(_localctx, predIndex);

		case 6:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 7:
			return this.TEMPLATE_BODY_sempred(_localctx, predIndex);

		case 8:
			return this.INVALID_LINE_sempred(_localctx, predIndex);
		}
		return true;
	}
	private OPTION_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  !this.startTemplate;
		}
		return true;
	}
	private COMMENT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return  !this.startTemplate ;
		}
		return true;
	}
	private IMPORT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return  !this.startTemplate ;
		}
		return true;
	}
	private TEMPLATE_NAME_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return  this.startLine ;
		}
		return true;
	}
	private MULTILINE_PREFIX_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return  this.startTemplate && this.startLine ;
		}
		return true;
	}
	private TEMPLATE_BODY_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return  this.startTemplate ;
		}
		return true;
	}
	private INVALID_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return  !this.startTemplate ;
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\r\xA7\b\x01\b" +
		"\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t" +
		"\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04" +
		"\r\t\r\x03\x02\x03\x02\x03\x03\x05\x03 \n\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x04\x07\x04&\n\x04\f\x04\x0E\x04)\v\x04\x03\x04\x03\x04\x07\x04-" +
		"\n\x04\f\x04\x0E\x040\v\x04\x03\x04\x03\x04\x03\x04\x03\x04\x06\x046\n" +
		"\x04\r\x04\x0E\x047\x03\x04\x03\x04\x03\x05\x07\x05=\n\x05\f\x05\x0E\x05" +
		"@\v\x05\x03\x05\x03\x05\x07\x05D\n\x05\f\x05\x0E\x05G\v\x05\x03\x05\x03" +
		"\x05\x03\x06\x07\x06L\n\x06\f\x06\x0E\x06O\v\x06\x03\x06\x03\x06\x07\x06" +
		"S\n\x06\f\x06\x0E\x06V\v\x06\x03\x06\x03\x06\x03\x06\x07\x06[\n\x06\f" +
		"\x06\x0E\x06^\v\x06\x03\x06\x03\x06\x07\x06b\n\x06\f\x06\x0E\x06e\v\x06" +
		"\x03\x06\x03\x06\x03\x07\x07\x07j\n\x07\f\x07\x0E\x07m\v\x07\x03\x07\x03" +
		"\x07\x07\x07q\n\x07\f\x07\x0E\x07t\v\x07\x03\x07\x03\x07\x03\x07\x03\b" +
		"\x07\bz\n\b\f\b\x0E\b}\v\b\x03\b\x03\b\x07\b\x81\n\b\f\b\x0E\b\x84\v\b" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03" +
		"\t\x03\n\x06\n\x93\n\n\r\n\x0E\n\x94\x03\n\x03\n\x03\v\x03\v\x03\v\x03" +
		"\v\x03\v\x03\v\x03\f\x03\f\x05\f\xA1\n\f\x03\r\x06\r\xA4\n\r\r\r\x0E\r" +
		"\xA5\x05T\\\xA5\x02\x02\x0E\x04\x02\x02\x06\x02\x03\b\x02\x04\n\x02\x05" +
		"\f\x02\x06\x0E\x02\x07\x10\x02\b\x12\x02\t\x14\x02\n\x16\x02\v\x18\x02" +
		"\f\x1A\x02\r\x04\x02\x03\x06\x06\x02\v\v\"\"\xA2\xA2\uFF01\uFF01\x04\x02" +
		"\f\f\x0F\x0F\x06\x02\f\f\x0F\x0F]]__\x05\x02\f\f\x0F\x0F*+\xB5\x02\x06" +
		"\x03\x02\x02\x02\x02\b\x03\x02\x02\x02\x02\n\x03\x02\x02\x02\x02\f\x03" +
		"\x02\x02\x02\x02\x0E\x03\x02\x02\x02\x02\x10\x03\x02\x02\x02\x02\x12\x03" +
		"\x02\x02\x02\x02\x14\x03\x02\x02\x02\x03\x16\x03\x02\x02\x02\x03\x18\x03" +
		"\x02\x02\x02\x03\x1A\x03\x02\x02\x02\x04\x1C\x03\x02\x02\x02\x06\x1F\x03" +
		"\x02\x02\x02\b\'\x03\x02\x02\x02\n>\x03\x02\x02\x02\fM\x03\x02\x02\x02" +
		"\x0Ek\x03\x02\x02\x02\x10{\x03\x02\x02\x02\x12\x8D\x03\x02\x02\x02\x14" +
		"\x92\x03\x02\x02\x02\x16\x98\x03\x02\x02\x02\x18\x9E\x03\x02\x02\x02\x1A" +
		"\xA3\x03\x02\x02\x02\x1C\x1D\t\x02\x02\x02\x1D\x05\x03\x02\x02\x02\x1E" +
		" \x07\x0F\x02\x02\x1F\x1E\x03\x02\x02\x02\x1F \x03\x02\x02\x02 !\x03\x02" +
		"\x02\x02!\"\x07\f\x02\x02\"#\b\x03\x02\x02#\x07\x03\x02\x02\x02$&\x05" +
		"\x04\x02\x02%$\x03\x02\x02\x02&)\x03\x02\x02\x02\'%\x03\x02\x02\x02\'" +
		"(\x03\x02\x02\x02(*\x03\x02\x02\x02)\'\x03\x02\x02\x02*.\x07@\x02\x02" +
		"+-\x05\x04\x02\x02,+\x03\x02\x02\x02-0\x03\x02\x02\x02.,\x03\x02\x02\x02" +
		"./\x03\x02\x02\x02/1\x03\x02\x02\x020.\x03\x02\x02\x0212\x07#\x02\x02" +
		"23\x07%\x02\x0235\x03\x02\x02\x0246\n\x03\x02\x0254\x03\x02\x02\x0267" +
		"\x03\x02\x02\x0275\x03\x02\x02\x0278\x03\x02\x02\x0289\x03\x02\x02\x02" +
		"9:\x06\x04\x02\x02:\t\x03\x02\x02\x02;=\x05\x04\x02\x02<;\x03\x02\x02" +
		"\x02=@\x03\x02\x02\x02><\x03\x02\x02\x02>?\x03\x02\x02\x02?A\x03\x02\x02" +
		"\x02@>\x03\x02\x02\x02AE\x07@\x02\x02BD\n\x03\x02\x02CB\x03\x02\x02\x02" +
		"DG\x03\x02\x02\x02EC\x03\x02\x02\x02EF\x03\x02\x02\x02FH\x03\x02\x02\x02" +
		"GE\x03\x02\x02\x02HI\x06\x05\x03\x02I\v\x03\x02\x02\x02JL\x05\x04\x02" +
		"\x02KJ\x03\x02\x02\x02LO\x03\x02\x02\x02MK\x03\x02\x02\x02MN\x03\x02\x02" +
		"\x02NP\x03\x02\x02\x02OM\x03\x02\x02\x02PT\x07]\x02\x02QS\n\x04\x02\x02" +
		"RQ\x03\x02\x02\x02SV\x03\x02\x02\x02TU\x03\x02\x02\x02TR\x03\x02\x02\x02" +
		"UW\x03\x02\x02\x02VT\x03\x02\x02\x02WX\x07_\x02\x02X\\\x07*\x02\x02Y[" +
		"\n\x05\x02\x02ZY\x03\x02\x02\x02[^\x03\x02\x02\x02\\]\x03\x02\x02\x02" +
		"\\Z\x03\x02\x02\x02]_\x03\x02\x02\x02^\\\x03\x02\x02\x02_c\x07+\x02\x02" +
		"`b\x05\x04\x02\x02a`\x03\x02\x02\x02be\x03\x02\x02\x02ca\x03\x02\x02\x02" +
		"cd\x03\x02\x02\x02df\x03\x02\x02\x02ec\x03\x02\x02\x02fg\x06\x06\x04\x02" +
		"g\r\x03\x02\x02\x02hj\x05\x04\x02\x02ih\x03\x02\x02\x02jm\x03\x02\x02" +
		"\x02ki\x03\x02\x02\x02kl\x03\x02\x02\x02ln\x03\x02\x02\x02mk\x03\x02\x02" +
		"\x02nr\x07%\x02\x02oq\n\x03\x02\x02po\x03\x02\x02\x02qt\x03\x02\x02\x02" +
		"rp\x03\x02\x02\x02rs\x03\x02\x02\x02su\x03\x02\x02\x02tr\x03\x02\x02\x02" +
		"uv\x06\x07\x05\x02vw\b\x07\x03\x02w\x0F\x03\x02\x02\x02xz\x05\x04\x02" +
		"\x02yx\x03\x02\x02\x02z}\x03\x02\x02\x02{y\x03\x02\x02\x02{|\x03\x02\x02" +
		"\x02|~\x03\x02\x02\x02}{\x03\x02\x02\x02~\x82\x07/\x02\x02\x7F\x81\x05" +
		"\x04\x02\x02\x80\x7F\x03\x02\x02\x02\x81\x84\x03\x02\x02\x02\x82\x80\x03" +
		"\x02\x02\x02\x82\x83\x03\x02\x02\x02\x83\x85\x03\x02\x02\x02\x84\x82\x03" +
		"\x02\x02\x02\x85\x86\x07b\x02\x02\x86\x87\x07b\x02\x02\x87\x88\x07b\x02" +
		"\x02\x88\x89\x03\x02\x02\x02\x89\x8A\x06\b\x06\x02\x8A\x8B\x03\x02\x02" +
		"\x02\x8B\x8C\b\b\x04\x02\x8C\x11\x03\x02\x02\x02\x8D\x8E\n\x03\x02\x02" +
		"\x8E\x8F\x06\t\x07\x02\x8F\x90\b\t\x05\x02\x90\x13\x03\x02\x02\x02\x91" +
		"\x93\n\x03\x02\x02\x92\x91\x03\x02\x02\x02\x93\x94\x03\x02\x02\x02\x94" +
		"\x92\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02\x95\x96\x03\x02\x02\x02\x96" +
		"\x97\x06\n\b\x02\x97\x15\x03\x02\x02\x02\x98\x99\x07b\x02\x02\x99\x9A" +
		"\x07b\x02\x02\x9A\x9B\x07b\x02\x02\x9B\x9C\x03\x02\x02\x02\x9C\x9D\b\v" +
		"\x06\x02\x9D\x17\x03\x02\x02\x02\x9E\xA0\x07^\x02\x02\x9F\xA1\n\x03\x02" +
		"\x02\xA0\x9F\x03\x02\x02\x02\xA0\xA1\x03\x02\x02\x02\xA1\x19\x03\x02\x02" +
		"\x02\xA2\xA4\v\x02\x02\x02\xA3\xA2\x03\x02\x02\x02\xA4\xA5\x03\x02\x02" +
		"\x02\xA5\xA6\x03\x02\x02\x02\xA5\xA3\x03\x02\x02\x02\xA6\x1B\x03\x02\x02" +
		"\x02\x15\x02\x03\x1F\'.7>EMT\\ckr{\x82\x94\xA0\xA5\x07\x03\x03\x02\x03" +
		"\x07\x03\x07\x03\x02\x03\t\x04\x06\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

