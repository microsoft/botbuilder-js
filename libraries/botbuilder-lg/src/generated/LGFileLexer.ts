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
	public static readonly TEMPLATE_BODY_LINE = 7;
	public static readonly INVALID_LINE = 8;
	public static readonly MULTILINE_SUFFIX = 9;
	public static readonly MULTILINE_TEXT = 10;
	public static readonly MULTILINE_MODE = 1;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "MULTILINE_MODE",
	];

	public static readonly ruleNames: string[] = [
		"WHITESPACE", "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"MULTILINE_PREFIX", "TEMPLATE_BODY_LINE", "INVALID_LINE", "MULTILINE_SUFFIX", 
		"MULTILINE_TEXT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"MULTILINE_PREFIX", "TEMPLATE_BODY_LINE", "INVALID_LINE", "MULTILINE_SUFFIX", 
		"MULTILINE_TEXT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileLexer._LITERAL_NAMES, LGFileLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  startTemplate = false;
	  inMultiline = false;


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
		case 5:
			this.TEMPLATE_NAME_LINE_action(_localctx, actionIndex);
			break;

		case 6:
			this.MULTILINE_PREFIX_action(_localctx, actionIndex);
			break;

		case 9:
			this.MULTILINE_SUFFIX_action(_localctx, actionIndex);
			break;
		}
	}
	private TEMPLATE_NAME_LINE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			 this.startTemplate = true; 
			break;
		}
	}
	private MULTILINE_PREFIX_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 1:
			this.inMultiline = true;
			break;
		}
	}
	private MULTILINE_SUFFIX_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 2:
			 this.inMultiline = false; 
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

		case 6:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 7:
			return this.TEMPLATE_BODY_LINE_sempred(_localctx, predIndex);

		case 8:
			return this.INVALID_LINE_sempred(_localctx, predIndex);
		}
		return true;
	}
	private OPTION_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  !this.startTemplate ;
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
	private MULTILINE_PREFIX_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return  this.startTemplate && !this.inMultiline;
		}
		return true;
	}
	private TEMPLATE_BODY_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return  this.startTemplate ;
		}
		return true;
	}
	private INVALID_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return  !this.startTemplate ;
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\f\xAB\b\x01\b" +
		"\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t" +
		"\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x03" +
		"\x02\x03\x02\x03\x03\x05\x03\x1E\n\x03\x03\x03\x03\x03\x03\x04\x07\x04" +
		"#\n\x04\f\x04\x0E\x04&\v\x04\x03\x04\x03\x04\x07\x04*\n\x04\f\x04\x0E" +
		"\x04-\v\x04\x03\x04\x03\x04\x03\x04\x03\x04\x06\x043\n\x04\r\x04\x0E\x04" +
		"4\x03\x04\x03\x04\x03\x05\x07\x05:\n\x05\f\x05\x0E\x05=\v\x05\x03\x05" +
		"\x03\x05\x07\x05A\n\x05\f\x05\x0E\x05D\v\x05\x03\x05\x03\x05\x03\x06\x07" +
		"\x06I\n\x06\f\x06\x0E\x06L\v\x06\x03\x06\x03\x06\x07\x06P\n\x06\f\x06" +
		"\x0E\x06S\v\x06\x03\x06\x03\x06\x03\x06\x07\x06X\n\x06\f\x06\x0E\x06[" +
		"\v\x06\x03\x06\x03\x06\x07\x06_\n\x06\f\x06\x0E\x06b\v\x06\x03\x06\x03" +
		"\x06\x03\x07\x07\x07g\n\x07\f\x07\x0E\x07j\v\x07\x03\x07\x03\x07\x07\x07" +
		"n\n\x07\f\x07\x0E\x07q\v\x07\x03\x07\x03\x07\x03\b\x07\bv\n\b\f\b\x0E" +
		"\by\v\b\x03\b\x03\b\x07\b}\n\b\f\b\x0E\b\x80\v\b\x03\b\x03\b\x03\b\x03" +
		"\b\x03\b\x07\b\x87\n\b\f\b\x0E\b\x8A\v\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x03\t\x06\t\x92\n\t\r\t\x0E\t\x93\x03\t\x03\t\x03\n\x06\n\x99\n\n\r\n" +
		"\x0E\n\x9A\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v" +
		"\x03\f\x06\f\xA8\n\f\r\f\x0E\f\xA9\x05QY\xA9\x02\x02\r\x04\x02\x02\x06" +
		"\x02\x03\b\x02\x04\n\x02\x05\f\x02\x06\x0E\x02\x07\x10\x02\b\x12\x02\t" +
		"\x14\x02\n\x16\x02\v\x18\x02\f\x04\x02\x03\x06\x06\x02\v\v\"\"\xA2\xA2" +
		"\uFF01\uFF01\x04\x02\f\f\x0F\x0F\x06\x02\f\f\x0F\x0F]]__\x05\x02\f\f\x0F" +
		"\x0F*+\xBA\x02\x06\x03\x02\x02\x02\x02\b\x03\x02\x02\x02\x02\n\x03\x02" +
		"\x02\x02\x02\f\x03\x02\x02\x02\x02\x0E\x03\x02\x02\x02\x02\x10\x03\x02" +
		"\x02\x02\x02\x12\x03\x02\x02\x02\x02\x14\x03\x02\x02\x02\x03\x16\x03\x02" +
		"\x02\x02\x03\x18\x03\x02\x02\x02\x04\x1A\x03\x02\x02\x02\x06\x1D\x03\x02" +
		"\x02\x02\b$\x03\x02\x02\x02\n;\x03\x02\x02\x02\fJ\x03\x02\x02\x02\x0E" +
		"h\x03\x02\x02\x02\x10w\x03\x02\x02\x02\x12\x91\x03\x02\x02\x02\x14\x98" +
		"\x03\x02\x02\x02\x16\x9E\x03\x02\x02\x02\x18\xA7\x03\x02\x02\x02\x1A\x1B" +
		"\t\x02\x02\x02\x1B\x05\x03\x02\x02\x02\x1C\x1E\x07\x0F\x02\x02\x1D\x1C" +
		"\x03\x02\x02\x02\x1D\x1E\x03\x02\x02\x02\x1E\x1F\x03\x02\x02\x02\x1F " +
		"\x07\f\x02\x02 \x07\x03\x02\x02\x02!#\x05\x04\x02\x02\"!\x03\x02\x02\x02" +
		"#&\x03\x02\x02\x02$\"\x03\x02\x02\x02$%\x03\x02\x02\x02%\'\x03\x02\x02" +
		"\x02&$\x03\x02\x02\x02\'+\x07@\x02\x02(*\x05\x04\x02\x02)(\x03\x02\x02" +
		"\x02*-\x03\x02\x02\x02+)\x03\x02\x02\x02+,\x03\x02\x02\x02,.\x03\x02\x02" +
		"\x02-+\x03\x02\x02\x02./\x07#\x02\x02/0\x07%\x02\x0202\x03\x02\x02\x02" +
		"13\n\x03\x02\x0221\x03\x02\x02\x0234\x03\x02\x02\x0242\x03\x02\x02\x02" +
		"45\x03\x02\x02\x0256\x03\x02\x02\x0267\x06\x04\x02\x027\t\x03\x02\x02" +
		"\x028:\x05\x04\x02\x0298\x03\x02\x02\x02:=\x03\x02\x02\x02;9\x03\x02\x02" +
		"\x02;<\x03\x02\x02\x02<>\x03\x02\x02\x02=;\x03\x02\x02\x02>B\x07@\x02" +
		"\x02?A\n\x03\x02\x02@?\x03\x02\x02\x02AD\x03\x02\x02\x02B@\x03\x02\x02" +
		"\x02BC\x03\x02\x02\x02CE\x03\x02\x02\x02DB\x03\x02\x02\x02EF\x06\x05\x03" +
		"\x02F\v\x03\x02\x02\x02GI\x05\x04\x02\x02HG\x03\x02\x02\x02IL\x03\x02" +
		"\x02\x02JH\x03\x02\x02\x02JK\x03\x02\x02\x02KM\x03\x02\x02\x02LJ\x03\x02" +
		"\x02\x02MQ\x07]\x02\x02NP\n\x04\x02\x02ON\x03\x02\x02\x02PS\x03\x02\x02" +
		"\x02QR\x03\x02\x02\x02QO\x03\x02\x02\x02RT\x03\x02\x02\x02SQ\x03\x02\x02" +
		"\x02TU\x07_\x02\x02UY\x07*\x02\x02VX\n\x05\x02\x02WV\x03\x02\x02\x02X" +
		"[\x03\x02\x02\x02YZ\x03\x02\x02\x02YW\x03\x02\x02\x02Z\\\x03\x02\x02\x02" +
		"[Y\x03\x02\x02\x02\\`\x07+\x02\x02]_\x05\x04\x02\x02^]\x03\x02\x02\x02" +
		"_b\x03\x02\x02\x02`^\x03\x02\x02\x02`a\x03\x02\x02\x02ac\x03\x02\x02\x02" +
		"b`\x03\x02\x02\x02cd\x06\x06\x04\x02d\r\x03\x02\x02\x02eg\x05\x04\x02" +
		"\x02fe\x03\x02\x02\x02gj\x03\x02\x02\x02hf\x03\x02\x02\x02hi\x03\x02\x02" +
		"\x02ik\x03\x02\x02\x02jh\x03\x02\x02\x02ko\x07%\x02\x02ln\n\x03\x02\x02" +
		"ml\x03\x02\x02\x02nq\x03\x02\x02\x02om\x03\x02\x02\x02op\x03\x02\x02\x02" +
		"pr\x03\x02\x02\x02qo\x03\x02\x02\x02rs\b\x07\x02\x02s\x0F\x03\x02\x02" +
		"\x02tv\x05\x04\x02\x02ut\x03\x02\x02\x02vy\x03\x02\x02\x02wu\x03\x02\x02" +
		"\x02wx\x03\x02\x02\x02xz\x03\x02\x02\x02yw\x03\x02\x02\x02z~\x07/\x02" +
		"\x02{}\x05\x04\x02\x02|{\x03\x02\x02\x02}\x80\x03\x02\x02\x02~|\x03\x02" +
		"\x02\x02~\x7F\x03\x02\x02\x02\x7F\x81\x03\x02\x02\x02\x80~\x03\x02\x02" +
		"\x02\x81\x82\x07b\x02\x02\x82\x83\x07b\x02\x02\x83\x84\x07b\x02\x02\x84" +
		"\x88\x03\x02\x02\x02\x85\x87\n\x03\x02\x02\x86\x85\x03\x02\x02\x02\x87" +
		"\x8A\x03\x02\x02\x02\x88\x86\x03\x02\x02\x02\x88\x89\x03\x02\x02\x02\x89" +
		"\x8B\x03\x02\x02\x02\x8A\x88\x03\x02\x02\x02\x8B\x8C\x06\b\x05\x02\x8C" +
		"\x8D\b\b\x03\x02\x8D\x8E\x03\x02\x02\x02\x8E\x8F\b\b\x04\x02\x8F\x11\x03" +
		"\x02\x02\x02\x90\x92\n\x03\x02\x02\x91\x90\x03\x02\x02\x02\x92\x93\x03" +
		"\x02\x02\x02\x93\x91\x03\x02\x02\x02\x93\x94\x03\x02\x02\x02\x94\x95\x03" +
		"\x02\x02\x02\x95\x96\x06\t\x06\x02\x96\x13\x03\x02\x02\x02\x97\x99\n\x03" +
		"\x02\x02\x98\x97\x03\x02\x02\x02\x99\x9A\x03\x02\x02\x02\x9A\x98\x03\x02" +
		"\x02\x02\x9A\x9B\x03\x02\x02\x02\x9B\x9C\x03\x02\x02\x02\x9C\x9D\x06\n" +
		"\x07\x02\x9D\x15\x03\x02\x02\x02\x9E\x9F\x07b\x02\x02\x9F\xA0\x07b\x02" +
		"\x02\xA0\xA1\x07b\x02\x02\xA1\xA2\x03\x02\x02\x02\xA2\xA3\b\v\x05\x02" +
		"\xA3\xA4\x03\x02\x02\x02\xA4\xA5\b\v\x06\x02\xA5\x17\x03\x02\x02\x02\xA6" +
		"\xA8\v\x02\x02\x02\xA7\xA6\x03\x02\x02\x02\xA8\xA9\x03\x02\x02\x02\xA9" +
		"\xAA\x03\x02\x02\x02\xA9\xA7\x03\x02\x02\x02\xAA\x19\x03\x02\x02\x02\x16" +
		"\x02\x03\x1D$+4;BJQY`how~\x88\x93\x9A\xA9\x07\x03\x07\x02\x03\b\x03\x07" +
		"\x03\x02\x03\v\x04\x06\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

