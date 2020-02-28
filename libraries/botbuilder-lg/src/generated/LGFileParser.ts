// Generated from ../LGFileParser.g4 by ANTLR 4.6-SNAPSHOT

import { ATN } from 'antlr4ts/atn/ATN';
import { ATNDeserializer } from 'antlr4ts/atn/ATNDeserializer';
import { NoViableAltException } from 'antlr4ts/NoViableAltException';
import { Parser } from 'antlr4ts/Parser';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ParserATNSimulator } from 'antlr4ts/atn/ParserATNSimulator';
import { RecognitionException } from 'antlr4ts/RecognitionException';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Token } from 'antlr4ts/Token';
import { TokenStream } from 'antlr4ts/TokenStream';
import { Vocabulary } from 'antlr4ts/Vocabulary';
import { VocabularyImpl } from 'antlr4ts/VocabularyImpl';

import * as Utils from 'antlr4ts/misc/Utils';

import { LGFileParserListener } from './LGFileParserListener';
import { LGFileParserVisitor } from './LGFileParserVisitor';


export class LGFileParser extends Parser {
    public static readonly OPTIONS = 1;
    public static readonly COMMENTS = 2;
    public static readonly WS = 3;
    public static readonly NEWLINE = 4;
    public static readonly HASH = 5;
    public static readonly DASH = 6;
    public static readonly LEFT_SQUARE_BRACKET = 7;
    public static readonly IMPORT = 8;
    public static readonly INVALID_TOKEN = 9;
    public static readonly WS_IN_NAME = 10;
    public static readonly NEWLINE_IN_NAME = 11;
    public static readonly IDENTIFIER = 12;
    public static readonly DOT = 13;
    public static readonly OPEN_PARENTHESIS = 14;
    public static readonly CLOSE_PARENTHESIS = 15;
    public static readonly COMMA = 16;
    public static readonly TEXT_IN_NAME = 17;
    public static readonly WS_IN_BODY = 18;
    public static readonly MULTILINE_PREFIX = 19;
    public static readonly NEWLINE_IN_BODY = 20;
    public static readonly IF = 21;
    public static readonly ELSEIF = 22;
    public static readonly ELSE = 23;
    public static readonly SWITCH = 24;
    public static readonly CASE = 25;
    public static readonly DEFAULT = 26;
    public static readonly ESCAPE_CHARACTER = 27;
    public static readonly EXPRESSION = 28;
    public static readonly TEXT = 29;
    public static readonly MULTILINE_SUFFIX = 30;
    public static readonly WS_IN_STRUCTURE_NAME = 31;
    public static readonly NEWLINE_IN_STRUCTURE_NAME = 32;
    public static readonly STRUCTURE_NAME = 33;
    public static readonly TEXT_IN_STRUCTURE_NAME = 34;
    public static readonly STRUCTURED_COMMENTS = 35;
    public static readonly WS_IN_STRUCTURE_BODY = 36;
    public static readonly STRUCTURED_NEWLINE = 37;
    public static readonly STRUCTURED_BODY_END = 38;
    public static readonly STRUCTURE_IDENTIFIER = 39;
    public static readonly STRUCTURE_EQUALS = 40;
    public static readonly STRUCTURE_OR_MARK = 41;
    public static readonly ESCAPE_CHARACTER_IN_STRUCTURE_BODY = 42;
    public static readonly EXPRESSION_IN_STRUCTURE_BODY = 43;
    public static readonly TEXT_IN_STRUCTURE_BODY = 44;
    public static readonly RULE_file = 0;
    public static readonly RULE_paragraph = 1;
    public static readonly RULE_errorTemplate = 2;
    public static readonly RULE_templateDefinition = 3;
    public static readonly RULE_templateNameLine = 4;
    public static readonly RULE_errorTemplateName = 5;
    public static readonly RULE_templateName = 6;
    public static readonly RULE_parameters = 7;
    public static readonly RULE_templateBody = 8;
    public static readonly RULE_structuredTemplateBody = 9;
    public static readonly RULE_structuredBodyNameLine = 10;
    public static readonly RULE_errorStructuredName = 11;
    public static readonly RULE_structuredBodyContentLine = 12;
    public static readonly RULE_errorStructureLine = 13;
    public static readonly RULE_keyValueStructureLine = 14;
    public static readonly RULE_keyValueStructureValue = 15;
    public static readonly RULE_objectStructureLine = 16;
    public static readonly RULE_structuredBodyEndLine = 17;
    public static readonly RULE_normalTemplateBody = 18;
    public static readonly RULE_templateString = 19;
    public static readonly RULE_normalTemplateString = 20;
    public static readonly RULE_errorTemplateString = 21;
    public static readonly RULE_ifElseTemplateBody = 22;
    public static readonly RULE_ifConditionRule = 23;
    public static readonly RULE_ifCondition = 24;
    public static readonly RULE_switchCaseTemplateBody = 25;
    public static readonly RULE_switchCaseRule = 26;
    public static readonly RULE_switchCaseStat = 27;
    public static readonly RULE_importDefinition = 28;
    public static readonly RULE_optionsDefinition = 29;
    // tslint:disable:no-trailing-whitespace
    public static readonly ruleNames: string[] = [
        'file', 'paragraph', 'errorTemplate', 'templateDefinition', 'templateNameLine', 
        'errorTemplateName', 'templateName', 'parameters', 'templateBody', 'structuredTemplateBody', 
        'structuredBodyNameLine', 'errorStructuredName', 'structuredBodyContentLine', 
        'errorStructureLine', 'keyValueStructureLine', 'keyValueStructureValue', 
        'objectStructureLine', 'structuredBodyEndLine', 'normalTemplateBody', 
        'templateString', 'normalTemplateString', 'errorTemplateString', 'ifElseTemplateBody', 
        'ifConditionRule', 'ifCondition', 'switchCaseTemplateBody', 'switchCaseRule', 
        'switchCaseStat', 'importDefinition', 'optionsDefinition',
    ];

    private static readonly _LITERAL_NAMES: Array<string | undefined> = [
        undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
        undefined, undefined, undefined, undefined, undefined, undefined, '\'.\'', 
        '\'(\'', '\')\'', '\',\'', undefined, undefined, undefined, undefined, undefined, 
        undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
        undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
        undefined, undefined, undefined, undefined, undefined, '\'|\'',
    ];
    private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
        undefined, 'OPTIONS', 'COMMENTS', 'WS', 'NEWLINE', 'HASH', 'DASH', 'LEFT_SQUARE_BRACKET', 
        'IMPORT', 'INVALID_TOKEN', 'WS_IN_NAME', 'NEWLINE_IN_NAME', 'IDENTIFIER', 
        'DOT', 'OPEN_PARENTHESIS', 'CLOSE_PARENTHESIS', 'COMMA', 'TEXT_IN_NAME', 
        'WS_IN_BODY', 'MULTILINE_PREFIX', 'NEWLINE_IN_BODY', 'IF', 'ELSEIF', 'ELSE', 
        'SWITCH', 'CASE', 'DEFAULT', 'ESCAPE_CHARACTER', 'EXPRESSION', 'TEXT', 
        'MULTILINE_SUFFIX', 'WS_IN_STRUCTURE_NAME', 'NEWLINE_IN_STRUCTURE_NAME', 
        'STRUCTURE_NAME', 'TEXT_IN_STRUCTURE_NAME', 'STRUCTURED_COMMENTS', 'WS_IN_STRUCTURE_BODY', 
        'STRUCTURED_NEWLINE', 'STRUCTURED_BODY_END', 'STRUCTURE_IDENTIFIER', 'STRUCTURE_EQUALS', 
        'STRUCTURE_OR_MARK', 'ESCAPE_CHARACTER_IN_STRUCTURE_BODY', 'EXPRESSION_IN_STRUCTURE_BODY', 
        'TEXT_IN_STRUCTURE_BODY',
    ];
    public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileParser._LITERAL_NAMES, LGFileParser._SYMBOLIC_NAMES, []);

    // @Override
    // @NotNull
    public get vocabulary(): Vocabulary {
        return LGFileParser.VOCABULARY;
    }
    // tslint:enable:no-trailing-whitespace

    // @Override
    public get grammarFileName(): string { return 'LGFileParser.g4'; }

    // @Override
    public get ruleNames(): string[] { return LGFileParser.ruleNames; }

    // @Override
    public get serializedATN(): string { return LGFileParser._serializedATN; }

    constructor(input: TokenStream) {
        super(input);
        this._interp = new ParserATNSimulator(LGFileParser._ATN, this);
    }
    // @RuleVersion(0)
    public file(): FileContext {
        let _localctx: FileContext = new FileContext(this._ctx, this.state);
        this.enterRule(_localctx, 0, LGFileParser.RULE_file);
        try {
            let _alt: number;
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 61;
                this._errHandler.sync(this);
                _alt = 1 + 1;
                do {
                    switch (_alt) {
                        case 1 + 1:
                            {
                                {
                                    this.state = 60;
                                    this.paragraph();
                                }
                            }
                            break;
                        default:
                            throw new NoViableAltException(this);
                    }
                    this.state = 63;
                    this._errHandler.sync(this);
                    _alt = this.interpreter.adaptivePredict(this._input, 0, this._ctx);
                } while (_alt !== 1 && _alt !== ATN.INVALID_ALT_NUMBER);
                this.state = 65;
                this.match(LGFileParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public paragraph(): ParagraphContext {
        let _localctx: ParagraphContext = new ParagraphContext(this._ctx, this.state);
        this.enterRule(_localctx, 2, LGFileParser.RULE_paragraph);
        try {
            this.state = 72;
            this._errHandler.sync(this);
            switch (this._input.LA(1)) {
                case LGFileParser.HASH:
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 67;
                        this.templateDefinition();
                    }
                    break;
                case LGFileParser.IMPORT:
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 68;
                        this.importDefinition();
                    }
                    break;
                case LGFileParser.OPTIONS:
                    this.enterOuterAlt(_localctx, 3);
                    {
                        this.state = 69;
                        this.optionsDefinition();
                    }
                    break;
                case LGFileParser.EOF:
                    this.enterOuterAlt(_localctx, 4);
                    {
                        this.state = 70;
                        this.match(LGFileParser.EOF);
                    }
                    break;
                case LGFileParser.INVALID_TOKEN:
                    this.enterOuterAlt(_localctx, 5);
                    {
                        this.state = 71;
                        this.errorTemplate();
                    }
                    break;
                default:
                    throw new NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public errorTemplate(): ErrorTemplateContext {
        let _localctx: ErrorTemplateContext = new ErrorTemplateContext(this._ctx, this.state);
        this.enterRule(_localctx, 4, LGFileParser.RULE_errorTemplate);
        try {
            let _alt: number;
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 75;
                this._errHandler.sync(this);
                _alt = 1;
                do {
                    switch (_alt) {
                        case 1:
                            {
                                {
                                    this.state = 74;
                                    this.match(LGFileParser.INVALID_TOKEN);
                                }
                            }
                            break;
                        default:
                            throw new NoViableAltException(this);
                    }
                    this.state = 77;
                    this._errHandler.sync(this);
                    _alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx);
                } while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public templateDefinition(): TemplateDefinitionContext {
        let _localctx: TemplateDefinitionContext = new TemplateDefinitionContext(this._ctx, this.state);
        this.enterRule(_localctx, 6, LGFileParser.RULE_templateDefinition);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 79;
                this.templateNameLine();
                this.state = 81;
                this._errHandler.sync(this);
                switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
                    case 1:
                        {
                            this.state = 80;
                            this.templateBody();
                        }
                        break;
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public templateNameLine(): TemplateNameLineContext {
        let _localctx: TemplateNameLineContext = new TemplateNameLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 8, LGFileParser.RULE_templateNameLine);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 83;
                this.match(LGFileParser.HASH);
                this.state = 89;
                this._errHandler.sync(this);
                switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
                    case 1:
                        {
                            {
                                this.state = 84;
                                this.templateName();
                                this.state = 86;
                                this._errHandler.sync(this);
                                _la = this._input.LA(1);
                                if (_la === LGFileParser.OPEN_PARENTHESIS) {
                                    {
                                        this.state = 85;
                                        this.parameters();
                                    }
                                }

                            }
                        }
                        break;

                    case 2:
                        {
                            this.state = 88;
                            this.errorTemplateName();
                        }
                        break;
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public errorTemplateName(): ErrorTemplateNameContext {
        let _localctx: ErrorTemplateNameContext = new ErrorTemplateNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 10, LGFileParser.RULE_errorTemplateName);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 94;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.IDENTIFIER) | (1 << LGFileParser.DOT) | (1 << LGFileParser.OPEN_PARENTHESIS) | (1 << LGFileParser.CLOSE_PARENTHESIS) | (1 << LGFileParser.COMMA) | (1 << LGFileParser.TEXT_IN_NAME))) !== 0)) {
                    {
                        {
                            this.state = 91;
                            _la = this._input.LA(1);
                            if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.IDENTIFIER) | (1 << LGFileParser.DOT) | (1 << LGFileParser.OPEN_PARENTHESIS) | (1 << LGFileParser.CLOSE_PARENTHESIS) | (1 << LGFileParser.COMMA) | (1 << LGFileParser.TEXT_IN_NAME))) !== 0))) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 96;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public templateName(): TemplateNameContext {
        let _localctx: TemplateNameContext = new TemplateNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 12, LGFileParser.RULE_templateName);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 97;
                this.match(LGFileParser.IDENTIFIER);
                this.state = 102;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while (_la === LGFileParser.DOT) {
                    {
                        {
                            this.state = 98;
                            this.match(LGFileParser.DOT);
                            this.state = 99;
                            this.match(LGFileParser.IDENTIFIER);
                        }
                    }
                    this.state = 104;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public parameters(): ParametersContext {
        let _localctx: ParametersContext = new ParametersContext(this._ctx, this.state);
        this.enterRule(_localctx, 14, LGFileParser.RULE_parameters);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 105;
                this.match(LGFileParser.OPEN_PARENTHESIS);
                this.state = 114;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (_la === LGFileParser.IDENTIFIER) {
                    {
                        this.state = 106;
                        this.match(LGFileParser.IDENTIFIER);
                        this.state = 111;
                        this._errHandler.sync(this);
                        _la = this._input.LA(1);
                        while (_la === LGFileParser.COMMA) {
                            {
                                {
                                    this.state = 107;
                                    this.match(LGFileParser.COMMA);
                                    this.state = 108;
                                    this.match(LGFileParser.IDENTIFIER);
                                }
                            }
                            this.state = 113;
                            this._errHandler.sync(this);
                            _la = this._input.LA(1);
                        }
                    }
                }

                this.state = 116;
                this.match(LGFileParser.CLOSE_PARENTHESIS);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public templateBody(): TemplateBodyContext {
        let _localctx: TemplateBodyContext = new TemplateBodyContext(this._ctx, this.state);
        this.enterRule(_localctx, 16, LGFileParser.RULE_templateBody);
        try {
            this.state = 122;
            this._errHandler.sync(this);
            switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
                case 1:
                    _localctx = new NormalBodyContext(_localctx);
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 118;
                        this.normalTemplateBody();
                    }
                    break;

                case 2:
                    _localctx = new IfElseBodyContext(_localctx);
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 119;
                        this.ifElseTemplateBody();
                    }
                    break;

                case 3:
                    _localctx = new SwitchCaseBodyContext(_localctx);
                    this.enterOuterAlt(_localctx, 3);
                    {
                        this.state = 120;
                        this.switchCaseTemplateBody();
                    }
                    break;

                case 4:
                    _localctx = new StructuredBodyContext(_localctx);
                    this.enterOuterAlt(_localctx, 4);
                    {
                        this.state = 121;
                        this.structuredTemplateBody();
                    }
                    break;
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public structuredTemplateBody(): StructuredTemplateBodyContext {
        let _localctx: StructuredTemplateBodyContext = new StructuredTemplateBodyContext(this._ctx, this.state);
        this.enterRule(_localctx, 18, LGFileParser.RULE_structuredTemplateBody);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 124;
                this.structuredBodyNameLine();
                this.state = 132;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (LGFileParser.STRUCTURE_IDENTIFIER - 39)) | (1 << (LGFileParser.STRUCTURE_EQUALS - 39)) | (1 << (LGFileParser.STRUCTURE_OR_MARK - 39)) | (1 << (LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.EXPRESSION_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.TEXT_IN_STRUCTURE_BODY - 39)))) !== 0)) {
                    {
                        this.state = 128;
                        this._errHandler.sync(this);
                        _la = this._input.LA(1);
                        do {
                            {
                                {
                                    this.state = 125;
                                    this.structuredBodyContentLine();
                                    this.state = 126;
                                    this.match(LGFileParser.STRUCTURED_NEWLINE);
                                }
                            }
                            this.state = 130;
                            this._errHandler.sync(this);
                            _la = this._input.LA(1);
                        } while (((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (LGFileParser.STRUCTURE_IDENTIFIER - 39)) | (1 << (LGFileParser.STRUCTURE_EQUALS - 39)) | (1 << (LGFileParser.STRUCTURE_OR_MARK - 39)) | (1 << (LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.EXPRESSION_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.TEXT_IN_STRUCTURE_BODY - 39)))) !== 0));
                    }
                }

                this.state = 135;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (_la === LGFileParser.STRUCTURED_BODY_END) {
                    {
                        this.state = 134;
                        this.structuredBodyEndLine();
                    }
                }

            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public structuredBodyNameLine(): StructuredBodyNameLineContext {
        let _localctx: StructuredBodyNameLineContext = new StructuredBodyNameLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 20, LGFileParser.RULE_structuredBodyNameLine);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 137;
                this.match(LGFileParser.LEFT_SQUARE_BRACKET);
                this.state = 140;
                this._errHandler.sync(this);
                switch ( this.interpreter.adaptivePredict(this._input, 14, this._ctx) ) {
                    case 1:
                        {
                            this.state = 138;
                            this.match(LGFileParser.STRUCTURE_NAME);
                        }
                        break;

                    case 2:
                        {
                            this.state = 139;
                            this.errorStructuredName();
                        }
                        break;
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public errorStructuredName(): ErrorStructuredNameContext {
        let _localctx: ErrorStructuredNameContext = new ErrorStructuredNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 22, LGFileParser.RULE_errorStructuredName);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 145;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while (_la === LGFileParser.STRUCTURE_NAME || _la === LGFileParser.TEXT_IN_STRUCTURE_NAME) {
                    {
                        {
                            this.state = 142;
                            _la = this._input.LA(1);
                            if (!(_la === LGFileParser.STRUCTURE_NAME || _la === LGFileParser.TEXT_IN_STRUCTURE_NAME)) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 147;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public structuredBodyContentLine(): StructuredBodyContentLineContext {
        let _localctx: StructuredBodyContentLineContext = new StructuredBodyContentLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 24, LGFileParser.RULE_structuredBodyContentLine);
        try {
            this.state = 151;
            this._errHandler.sync(this);
            switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
                case 1:
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 148;
                        this.keyValueStructureLine();
                    }
                    break;

                case 2:
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 149;
                        this.objectStructureLine();
                    }
                    break;

                case 3:
                    this.enterOuterAlt(_localctx, 3);
                    {
                        this.state = 150;
                        this.errorStructureLine();
                    }
                    break;
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public errorStructureLine(): ErrorStructureLineContext {
        let _localctx: ErrorStructureLineContext = new ErrorStructureLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 26, LGFileParser.RULE_errorStructureLine);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 154;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                do {
                    {
                        {
                            this.state = 153;
                            _la = this._input.LA(1);
                            if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (LGFileParser.STRUCTURE_IDENTIFIER - 39)) | (1 << (LGFileParser.STRUCTURE_EQUALS - 39)) | (1 << (LGFileParser.STRUCTURE_OR_MARK - 39)) | (1 << (LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.EXPRESSION_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.TEXT_IN_STRUCTURE_BODY - 39)))) !== 0))) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 156;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                } while (((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (LGFileParser.STRUCTURE_IDENTIFIER - 39)) | (1 << (LGFileParser.STRUCTURE_EQUALS - 39)) | (1 << (LGFileParser.STRUCTURE_OR_MARK - 39)) | (1 << (LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.EXPRESSION_IN_STRUCTURE_BODY - 39)) | (1 << (LGFileParser.TEXT_IN_STRUCTURE_BODY - 39)))) !== 0));
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public keyValueStructureLine(): KeyValueStructureLineContext {
        let _localctx: KeyValueStructureLineContext = new KeyValueStructureLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 28, LGFileParser.RULE_keyValueStructureLine);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 158;
                this.match(LGFileParser.STRUCTURE_IDENTIFIER);
                this.state = 159;
                this.match(LGFileParser.STRUCTURE_EQUALS);
                this.state = 160;
                this.keyValueStructureValue();
                this.state = 165;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while (_la === LGFileParser.STRUCTURE_OR_MARK) {
                    {
                        {
                            this.state = 161;
                            this.match(LGFileParser.STRUCTURE_OR_MARK);
                            this.state = 162;
                            this.keyValueStructureValue();
                        }
                    }
                    this.state = 167;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public keyValueStructureValue(): KeyValueStructureValueContext {
        let _localctx: KeyValueStructureValueContext = new KeyValueStructureValueContext(this._ctx, this.state);
        this.enterRule(_localctx, 30, LGFileParser.RULE_keyValueStructureValue);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 169;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                do {
                    {
                        {
                            this.state = 168;
                            _la = this._input.LA(1);
                            if (!(((((_la - 42)) & ~0x1F) === 0 && ((1 << (_la - 42)) & ((1 << (LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 42)) | (1 << (LGFileParser.EXPRESSION_IN_STRUCTURE_BODY - 42)) | (1 << (LGFileParser.TEXT_IN_STRUCTURE_BODY - 42)))) !== 0))) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 171;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                } while (((((_la - 42)) & ~0x1F) === 0 && ((1 << (_la - 42)) & ((1 << (LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY - 42)) | (1 << (LGFileParser.EXPRESSION_IN_STRUCTURE_BODY - 42)) | (1 << (LGFileParser.TEXT_IN_STRUCTURE_BODY - 42)))) !== 0));
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public objectStructureLine(): ObjectStructureLineContext {
        let _localctx: ObjectStructureLineContext = new ObjectStructureLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 32, LGFileParser.RULE_objectStructureLine);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 173;
                this.match(LGFileParser.EXPRESSION_IN_STRUCTURE_BODY);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public structuredBodyEndLine(): StructuredBodyEndLineContext {
        let _localctx: StructuredBodyEndLineContext = new StructuredBodyEndLineContext(this._ctx, this.state);
        this.enterRule(_localctx, 34, LGFileParser.RULE_structuredBodyEndLine);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 175;
                this.match(LGFileParser.STRUCTURED_BODY_END);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public normalTemplateBody(): NormalTemplateBodyContext {
        let _localctx: NormalTemplateBodyContext = new NormalTemplateBodyContext(this._ctx, this.state);
        this.enterRule(_localctx, 36, LGFileParser.RULE_normalTemplateBody);
        try {
            let _alt: number;
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 178;
                this._errHandler.sync(this);
                _alt = 1;
                do {
                    switch (_alt) {
                        case 1:
                            {
                                {
                                    this.state = 177;
                                    this.templateString();
                                }
                            }
                            break;
                        default:
                            throw new NoViableAltException(this);
                    }
                    this.state = 180;
                    this._errHandler.sync(this);
                    _alt = this.interpreter.adaptivePredict(this._input, 20, this._ctx);
                } while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public templateString(): TemplateStringContext {
        let _localctx: TemplateStringContext = new TemplateStringContext(this._ctx, this.state);
        this.enterRule(_localctx, 38, LGFileParser.RULE_templateString);
        try {
            this.state = 184;
            this._errHandler.sync(this);
            switch (this._input.LA(1)) {
                case LGFileParser.DASH:
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 182;
                        this.normalTemplateString();
                    }
                    break;
                case LGFileParser.INVALID_TOKEN:
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 183;
                        this.errorTemplateString();
                    }
                    break;
                default:
                    throw new NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public normalTemplateString(): NormalTemplateStringContext {
        let _localctx: NormalTemplateStringContext = new NormalTemplateStringContext(this._ctx, this.state);
        this.enterRule(_localctx, 40, LGFileParser.RULE_normalTemplateString);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 186;
                this.match(LGFileParser.DASH);
                this.state = 188;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (_la === LGFileParser.MULTILINE_PREFIX) {
                    {
                        this.state = 187;
                        this.match(LGFileParser.MULTILINE_PREFIX);
                    }
                }

                this.state = 193;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.ESCAPE_CHARACTER) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0)) {
                    {
                        {
                            this.state = 190;
                            _la = this._input.LA(1);
                            if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.ESCAPE_CHARACTER) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0))) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 195;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
                this.state = 197;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (_la === LGFileParser.MULTILINE_SUFFIX) {
                    {
                        this.state = 196;
                        this.match(LGFileParser.MULTILINE_SUFFIX);
                    }
                }

            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public errorTemplateString(): ErrorTemplateStringContext {
        let _localctx: ErrorTemplateStringContext = new ErrorTemplateStringContext(this._ctx, this.state);
        this.enterRule(_localctx, 42, LGFileParser.RULE_errorTemplateString);
        try {
            let _alt: number;
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 200;
                this._errHandler.sync(this);
                _alt = 1;
                do {
                    switch (_alt) {
                        case 1:
                            {
                                {
                                    this.state = 199;
                                    this.match(LGFileParser.INVALID_TOKEN);
                                }
                            }
                            break;
                        default:
                            throw new NoViableAltException(this);
                    }
                    this.state = 202;
                    this._errHandler.sync(this);
                    _alt = this.interpreter.adaptivePredict(this._input, 25, this._ctx);
                } while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public ifElseTemplateBody(): IfElseTemplateBodyContext {
        let _localctx: IfElseTemplateBodyContext = new IfElseTemplateBodyContext(this._ctx, this.state);
        this.enterRule(_localctx, 44, LGFileParser.RULE_ifElseTemplateBody);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 205;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                do {
                    {
                        {
                            this.state = 204;
                            this.ifConditionRule();
                        }
                    }
                    this.state = 207;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                } while (_la === LGFileParser.DASH);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public ifConditionRule(): IfConditionRuleContext {
        let _localctx: IfConditionRuleContext = new IfConditionRuleContext(this._ctx, this.state);
        this.enterRule(_localctx, 46, LGFileParser.RULE_ifConditionRule);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 209;
                this.ifCondition();
                this.state = 211;
                this._errHandler.sync(this);
                switch ( this.interpreter.adaptivePredict(this._input, 27, this._ctx) ) {
                    case 1:
                        {
                            this.state = 210;
                            this.normalTemplateBody();
                        }
                        break;
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public ifCondition(): IfConditionContext {
        let _localctx: IfConditionContext = new IfConditionContext(this._ctx, this.state);
        this.enterRule(_localctx, 48, LGFileParser.RULE_ifCondition);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 213;
                this.match(LGFileParser.DASH);
                this.state = 214;
                _la = this._input.LA(1);
                if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.IF) | (1 << LGFileParser.ELSEIF) | (1 << LGFileParser.ELSE))) !== 0))) {
                    this._errHandler.recoverInline(this);
                } else {
                    if (this._input.LA(1) === Token.EOF) {
                        this.matchedEOF = true;
                    }

                    this._errHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 218;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0)) {
                    {
                        {
                            this.state = 215;
                            _la = this._input.LA(1);
                            if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0))) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 220;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public switchCaseTemplateBody(): SwitchCaseTemplateBodyContext {
        let _localctx: SwitchCaseTemplateBodyContext = new SwitchCaseTemplateBodyContext(this._ctx, this.state);
        this.enterRule(_localctx, 50, LGFileParser.RULE_switchCaseTemplateBody);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 222;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                do {
                    {
                        {
                            this.state = 221;
                            this.switchCaseRule();
                        }
                    }
                    this.state = 224;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                } while (_la === LGFileParser.DASH);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public switchCaseRule(): SwitchCaseRuleContext {
        let _localctx: SwitchCaseRuleContext = new SwitchCaseRuleContext(this._ctx, this.state);
        this.enterRule(_localctx, 52, LGFileParser.RULE_switchCaseRule);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 226;
                this.switchCaseStat();
                this.state = 228;
                this._errHandler.sync(this);
                switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
                    case 1:
                        {
                            this.state = 227;
                            this.normalTemplateBody();
                        }
                        break;
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public switchCaseStat(): SwitchCaseStatContext {
        let _localctx: SwitchCaseStatContext = new SwitchCaseStatContext(this._ctx, this.state);
        this.enterRule(_localctx, 54, LGFileParser.RULE_switchCaseStat);
        let _la: number;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 230;
                this.match(LGFileParser.DASH);
                this.state = 231;
                _la = this._input.LA(1);
                if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.SWITCH) | (1 << LGFileParser.CASE) | (1 << LGFileParser.DEFAULT))) !== 0))) {
                    this._errHandler.recoverInline(this);
                } else {
                    if (this._input.LA(1) === Token.EOF) {
                        this.matchedEOF = true;
                    }

                    this._errHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 235;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0)) {
                    {
                        {
                            this.state = 232;
                            _la = this._input.LA(1);
                            if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << LGFileParser.WS) | (1 << LGFileParser.EXPRESSION) | (1 << LGFileParser.TEXT))) !== 0))) {
                                this._errHandler.recoverInline(this);
                            } else {
                                if (this._input.LA(1) === Token.EOF) {
                                    this.matchedEOF = true;
                                }

                                this._errHandler.reportMatch(this);
                                this.consume();
                            }
                        }
                    }
                    this.state = 237;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public importDefinition(): ImportDefinitionContext {
        let _localctx: ImportDefinitionContext = new ImportDefinitionContext(this._ctx, this.state);
        this.enterRule(_localctx, 56, LGFileParser.RULE_importDefinition);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 238;
                this.match(LGFileParser.IMPORT);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    // @RuleVersion(0)
    public optionsDefinition(): OptionsDefinitionContext {
        let _localctx: OptionsDefinitionContext = new OptionsDefinitionContext(this._ctx, this.state);
        this.enterRule(_localctx, 58, LGFileParser.RULE_optionsDefinition);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 240;
                this.match(LGFileParser.OPTIONS);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }

    public static readonly _serializedATN: string =
    '\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03.\xF5\x04\x02' +
		'\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07' +
		'\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04' +
		'\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04' +
		'\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04' +
		'\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04' +
		'\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x03\x02\x06\x02@\n\x02\r\x02\x0E' +
		'\x02A\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03' +
		'K\n\x03\x03\x04\x06\x04N\n\x04\r\x04\x0E\x04O\x03\x05\x03\x05\x05\x05' +
		'T\n\x05\x03\x06\x03\x06\x03\x06\x05\x06Y\n\x06\x03\x06\x05\x06\\\n\x06' +
		'\x03\x07\x07\x07_\n\x07\f\x07\x0E\x07b\v\x07\x03\b\x03\b\x03\b\x07\bg' +
		'\n\b\f\b\x0E\bj\v\b\x03\t\x03\t\x03\t\x03\t\x07\tp\n\t\f\t\x0E\ts\v\t' +
		'\x05\tu\n\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x05\n}\n\n\x03\v\x03\v' +
		'\x03\v\x03\v\x06\v\x83\n\v\r\v\x0E\v\x84\x05\v\x87\n\v\x03\v\x05\v\x8A' +
		'\n\v\x03\f\x03\f\x03\f\x05\f\x8F\n\f\x03\r\x07\r\x92\n\r\f\r\x0E\r\x95' +
		'\v\r\x03\x0E\x03\x0E\x03\x0E\x05\x0E\x9A\n\x0E\x03\x0F\x06\x0F\x9D\n\x0F' +
		'\r\x0F\x0E\x0F\x9E\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x07\x10\xA6' +
		'\n\x10\f\x10\x0E\x10\xA9\v\x10\x03\x11\x06\x11\xAC\n\x11\r\x11\x0E\x11' +
		'\xAD\x03\x12\x03\x12\x03\x13\x03\x13\x03\x14\x06\x14\xB5\n\x14\r\x14\x0E' +
		'\x14\xB6\x03\x15\x03\x15\x05\x15\xBB\n\x15\x03\x16\x03\x16\x05\x16\xBF' +
		'\n\x16\x03\x16\x07\x16\xC2\n\x16\f\x16\x0E\x16\xC5\v\x16\x03\x16\x05\x16' +
		'\xC8\n\x16\x03\x17\x06\x17\xCB\n\x17\r\x17\x0E\x17\xCC\x03\x18\x06\x18' +
		'\xD0\n\x18\r\x18\x0E\x18\xD1\x03\x19\x03\x19\x05\x19\xD6\n\x19\x03\x1A' +
		'\x03\x1A\x03\x1A\x07\x1A\xDB\n\x1A\f\x1A\x0E\x1A\xDE\v\x1A\x03\x1B\x06' +
		'\x1B\xE1\n\x1B\r\x1B\x0E\x1B\xE2\x03\x1C\x03\x1C\x05\x1C\xE7\n\x1C\x03' +
		'\x1D\x03\x1D\x03\x1D\x07\x1D\xEC\n\x1D\f\x1D\x0E\x1D\xEF\v\x1D\x03\x1E' +
		'\x03\x1E\x03\x1F\x03\x1F\x03\x1F\x03A\x02\x02 \x02\x02\x04\x02\x06\x02' +
		'\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A' +
		'\x02\x1C\x02\x1E\x02 \x02"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x02' +
		'4\x026\x028\x02:\x02<\x02\x02\n\x03\x02\x0E\x13\x03\x02#$\x03\x02).\x03' +
		'\x02,.\x03\x02\x1D\x1F\x03\x02\x17\x19\x04\x02\x05\x05\x1E\x1F\x03\x02' +
		'\x1A\x1C\xFC\x02?\x03\x02\x02\x02\x04J\x03\x02\x02\x02\x06M\x03\x02\x02' +
		'\x02\bQ\x03\x02\x02\x02\nU\x03\x02\x02\x02\f`\x03\x02\x02\x02\x0Ec\x03' +
		'\x02\x02\x02\x10k\x03\x02\x02\x02\x12|\x03\x02\x02\x02\x14~\x03\x02\x02' +
		'\x02\x16\x8B\x03\x02\x02\x02\x18\x93\x03\x02\x02\x02\x1A\x99\x03\x02\x02' +
		'\x02\x1C\x9C\x03\x02\x02\x02\x1E\xA0\x03\x02\x02\x02 \xAB\x03\x02\x02' +
		'\x02"\xAF\x03\x02\x02\x02$\xB1\x03\x02\x02\x02&\xB4\x03\x02\x02\x02(' +
		'\xBA\x03\x02\x02\x02*\xBC\x03\x02\x02\x02,\xCA\x03\x02\x02\x02.\xCF\x03' +
		'\x02\x02\x020\xD3\x03\x02\x02\x022\xD7\x03\x02\x02\x024\xE0\x03\x02\x02' +
		'\x026\xE4\x03\x02\x02\x028\xE8\x03\x02\x02\x02:\xF0\x03\x02\x02\x02<\xF2' +
		'\x03\x02\x02\x02>@\x05\x04\x03\x02?>\x03\x02\x02\x02@A\x03\x02\x02\x02' +
		'AB\x03\x02\x02\x02A?\x03\x02\x02\x02BC\x03\x02\x02\x02CD\x07\x02\x02\x03' +
		'D\x03\x03\x02\x02\x02EK\x05\b\x05\x02FK\x05:\x1E\x02GK\x05<\x1F\x02HK' +
		'\x07\x02\x02\x03IK\x05\x06\x04\x02JE\x03\x02\x02\x02JF\x03\x02\x02\x02' +
		'JG\x03\x02\x02\x02JH\x03\x02\x02\x02JI\x03\x02\x02\x02K\x05\x03\x02\x02' +
		'\x02LN\x07\v\x02\x02ML\x03\x02\x02\x02NO\x03\x02\x02\x02OM\x03\x02\x02' +
		'\x02OP\x03\x02\x02\x02P\x07\x03\x02\x02\x02QS\x05\n\x06\x02RT\x05\x12' +
		'\n\x02SR\x03\x02\x02\x02ST\x03\x02\x02\x02T\t\x03\x02\x02\x02U[\x07\x07' +
		'\x02\x02VX\x05\x0E\b\x02WY\x05\x10\t\x02XW\x03\x02\x02\x02XY\x03\x02\x02' +
		'\x02Y\\\x03\x02\x02\x02Z\\\x05\f\x07\x02[V\x03\x02\x02\x02[Z\x03\x02\x02' +
		'\x02\\\v\x03\x02\x02\x02]_\t\x02\x02\x02^]\x03\x02\x02\x02_b\x03\x02\x02' +
		'\x02`^\x03\x02\x02\x02`a\x03\x02\x02\x02a\r\x03\x02\x02\x02b`\x03\x02' +
		'\x02\x02ch\x07\x0E\x02\x02de\x07\x0F\x02\x02eg\x07\x0E\x02\x02fd\x03\x02' +
		'\x02\x02gj\x03\x02\x02\x02hf\x03\x02\x02\x02hi\x03\x02\x02\x02i\x0F\x03' +
		'\x02\x02\x02jh\x03\x02\x02\x02kt\x07\x10\x02\x02lq\x07\x0E\x02\x02mn\x07' +
		'\x12\x02\x02np\x07\x0E\x02\x02om\x03\x02\x02\x02ps\x03\x02\x02\x02qo\x03' +
		'\x02\x02\x02qr\x03\x02\x02\x02ru\x03\x02\x02\x02sq\x03\x02\x02\x02tl\x03' +
		'\x02\x02\x02tu\x03\x02\x02\x02uv\x03\x02\x02\x02vw\x07\x11\x02\x02w\x11' +
		'\x03\x02\x02\x02x}\x05&\x14\x02y}\x05.\x18\x02z}\x054\x1B\x02{}\x05\x14' +
		'\v\x02|x\x03\x02\x02\x02|y\x03\x02\x02\x02|z\x03\x02\x02\x02|{\x03\x02' +
		'\x02\x02}\x13\x03\x02\x02\x02~\x86\x05\x16\f\x02\x7F\x80\x05\x1A\x0E\x02' +
		'\x80\x81\x07\'\x02\x02\x81\x83\x03\x02\x02\x02\x82\x7F\x03\x02\x02\x02' +
		'\x83\x84\x03\x02\x02\x02\x84\x82\x03\x02\x02\x02\x84\x85\x03\x02\x02\x02' +
		'\x85\x87\x03\x02\x02\x02\x86\x82\x03\x02\x02\x02\x86\x87\x03\x02\x02\x02' +
		'\x87\x89\x03\x02\x02\x02\x88\x8A\x05$\x13\x02\x89\x88\x03\x02\x02\x02' +
		'\x89\x8A\x03\x02\x02\x02\x8A\x15\x03\x02\x02\x02\x8B\x8E\x07\t\x02\x02' +
		'\x8C\x8F\x07#\x02\x02\x8D\x8F\x05\x18\r\x02\x8E\x8C\x03\x02\x02\x02\x8E' +
		'\x8D\x03\x02\x02\x02\x8F\x17\x03\x02\x02\x02\x90\x92\t\x03\x02\x02\x91' +
		'\x90\x03\x02\x02\x02\x92\x95\x03\x02\x02\x02\x93\x91\x03\x02\x02\x02\x93' +
		'\x94\x03\x02\x02\x02\x94\x19\x03\x02\x02\x02\x95\x93\x03\x02\x02\x02\x96' +
		'\x9A\x05\x1E\x10\x02\x97\x9A\x05"\x12\x02\x98\x9A\x05\x1C\x0F\x02\x99' +
		'\x96\x03\x02\x02\x02\x99\x97\x03\x02\x02\x02\x99\x98\x03\x02\x02\x02\x9A' +
		'\x1B\x03\x02\x02\x02\x9B\x9D\t\x04\x02\x02\x9C\x9B\x03\x02\x02\x02\x9D' +
		'\x9E\x03\x02\x02\x02\x9E\x9C\x03\x02\x02\x02\x9E\x9F\x03\x02\x02\x02\x9F' +
		'\x1D\x03\x02\x02\x02\xA0\xA1\x07)\x02\x02\xA1\xA2\x07*\x02\x02\xA2\xA7' +
		'\x05 \x11\x02\xA3\xA4\x07+\x02\x02\xA4\xA6\x05 \x11\x02\xA5\xA3\x03\x02' +
		'\x02\x02\xA6\xA9\x03\x02\x02\x02\xA7\xA5\x03\x02\x02\x02\xA7\xA8\x03\x02' +
		'\x02\x02\xA8\x1F\x03\x02\x02\x02\xA9\xA7\x03\x02\x02\x02\xAA\xAC\t\x05' +
		'\x02\x02\xAB\xAA\x03\x02\x02\x02\xAC\xAD\x03\x02\x02\x02\xAD\xAB\x03\x02' +
		'\x02\x02\xAD\xAE\x03\x02\x02\x02\xAE!\x03\x02\x02\x02\xAF\xB0\x07-\x02' +
		'\x02\xB0#\x03\x02\x02\x02\xB1\xB2\x07(\x02\x02\xB2%\x03\x02\x02\x02\xB3' +
		'\xB5\x05(\x15\x02\xB4\xB3\x03\x02\x02\x02\xB5\xB6\x03\x02\x02\x02\xB6' +
		'\xB4\x03\x02\x02\x02\xB6\xB7\x03\x02\x02\x02\xB7\'\x03\x02\x02\x02\xB8' +
		'\xBB\x05*\x16\x02\xB9\xBB\x05,\x17\x02\xBA\xB8\x03\x02\x02\x02\xBA\xB9' +
		'\x03\x02\x02\x02\xBB)\x03\x02\x02\x02\xBC\xBE\x07\b\x02\x02\xBD\xBF\x07' +
		'\x15\x02\x02\xBE\xBD\x03\x02\x02\x02\xBE\xBF\x03\x02\x02\x02\xBF\xC3\x03' +
		'\x02\x02\x02\xC0\xC2\t\x06\x02\x02\xC1\xC0\x03\x02\x02\x02\xC2\xC5\x03' +
		'\x02\x02\x02\xC3\xC1\x03\x02\x02\x02\xC3\xC4\x03\x02\x02\x02\xC4\xC7\x03' +
		'\x02\x02\x02\xC5\xC3\x03\x02\x02\x02\xC6\xC8\x07 \x02\x02\xC7\xC6\x03' +
		'\x02\x02\x02\xC7\xC8\x03\x02\x02\x02\xC8+\x03\x02\x02\x02\xC9\xCB\x07' +
		'\v\x02\x02\xCA\xC9\x03\x02\x02\x02\xCB\xCC\x03\x02\x02\x02\xCC\xCA\x03' +
		'\x02\x02\x02\xCC\xCD\x03\x02\x02\x02\xCD-\x03\x02\x02\x02\xCE\xD0\x05' +
		'0\x19\x02\xCF\xCE\x03\x02\x02\x02\xD0\xD1\x03\x02\x02\x02\xD1\xCF\x03' +
		'\x02\x02\x02\xD1\xD2\x03\x02\x02\x02\xD2/\x03\x02\x02\x02\xD3\xD5\x05' +
		'2\x1A\x02\xD4\xD6\x05&\x14\x02\xD5\xD4\x03\x02\x02\x02\xD5\xD6\x03\x02' +
		'\x02\x02\xD61\x03\x02\x02\x02\xD7\xD8\x07\b\x02\x02\xD8\xDC\t\x07\x02' +
		'\x02\xD9\xDB\t\b\x02\x02\xDA\xD9\x03\x02\x02\x02\xDB\xDE\x03\x02\x02\x02' +
		'\xDC\xDA\x03\x02\x02\x02\xDC\xDD\x03\x02\x02\x02\xDD3\x03\x02\x02\x02' +
		'\xDE\xDC\x03\x02\x02\x02\xDF\xE1\x056\x1C\x02\xE0\xDF\x03\x02\x02\x02' +
		'\xE1\xE2\x03\x02\x02\x02\xE2\xE0\x03\x02\x02\x02\xE2\xE3\x03\x02\x02\x02' +
		'\xE35\x03\x02\x02\x02\xE4\xE6\x058\x1D\x02\xE5\xE7\x05&\x14\x02\xE6\xE5' +
		'\x03\x02\x02\x02\xE6\xE7\x03\x02\x02\x02\xE77\x03\x02\x02\x02\xE8\xE9' +
		'\x07\b\x02\x02\xE9\xED\t\t\x02\x02\xEA\xEC\t\b\x02\x02\xEB\xEA\x03\x02' +
		'\x02\x02\xEC\xEF\x03\x02\x02\x02\xED\xEB\x03\x02\x02\x02\xED\xEE\x03\x02' +
		'\x02\x02\xEE9\x03\x02\x02\x02\xEF\xED\x03\x02\x02\x02\xF0\xF1\x07\n\x02' +
		'\x02\xF1;\x03\x02\x02\x02\xF2\xF3\x07\x03\x02\x02\xF3=\x03\x02\x02\x02' +
		'"AJOSX[`hqt|\x84\x86\x89\x8E\x93\x99\x9E\xA7\xAD\xB6\xBA\xBE\xC3\xC7' +
		'\xCC\xD1\xD5\xDC\xE2\xE6\xED';
    public static __ATN: ATN;
    public static get _ATN(): ATN {
        if (!LGFileParser.__ATN) {
            LGFileParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileParser._serializedATN));
        }

        return LGFileParser.__ATN;
    }

}

export class FileContext extends ParserRuleContext {
    public EOF(): TerminalNode { return this.getToken(LGFileParser.EOF, 0); }
    public paragraph(): ParagraphContext[];
    public paragraph(i: number): ParagraphContext;
    public paragraph(i?: number): ParagraphContext | ParagraphContext[] {
        if (i === undefined) {
            return this.getRuleContexts(ParagraphContext);
        } else {
            return this.getRuleContext(i, ParagraphContext);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_file; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterFile) {
            listener.enterFile(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitFile) {
            listener.exitFile(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitFile) {
            return visitor.visitFile(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ParagraphContext extends ParserRuleContext {
    public templateDefinition(): TemplateDefinitionContext | undefined {
        return this.tryGetRuleContext(0, TemplateDefinitionContext);
    }
    public importDefinition(): ImportDefinitionContext | undefined {
        return this.tryGetRuleContext(0, ImportDefinitionContext);
    }
    public optionsDefinition(): OptionsDefinitionContext | undefined {
        return this.tryGetRuleContext(0, OptionsDefinitionContext);
    }
    public EOF(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.EOF, 0); }
    public errorTemplate(): ErrorTemplateContext | undefined {
        return this.tryGetRuleContext(0, ErrorTemplateContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_paragraph; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterParagraph) {
            listener.enterParagraph(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitParagraph) {
            listener.exitParagraph(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitParagraph) {
            return visitor.visitParagraph(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ErrorTemplateContext extends ParserRuleContext {
    public INVALID_TOKEN(): TerminalNode[];
    public INVALID_TOKEN(i: number): TerminalNode;
    public INVALID_TOKEN(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.INVALID_TOKEN);
        } else {
            return this.getToken(LGFileParser.INVALID_TOKEN, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_errorTemplate; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterErrorTemplate) {
            listener.enterErrorTemplate(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitErrorTemplate) {
            listener.exitErrorTemplate(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitErrorTemplate) {
            return visitor.visitErrorTemplate(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TemplateDefinitionContext extends ParserRuleContext {
    public templateNameLine(): TemplateNameLineContext {
        return this.getRuleContext(0, TemplateNameLineContext);
    }
    public templateBody(): TemplateBodyContext | undefined {
        return this.tryGetRuleContext(0, TemplateBodyContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_templateDefinition; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterTemplateDefinition) {
            listener.enterTemplateDefinition(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitTemplateDefinition) {
            listener.exitTemplateDefinition(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitTemplateDefinition) {
            return visitor.visitTemplateDefinition(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TemplateNameLineContext extends ParserRuleContext {
    public HASH(): TerminalNode { return this.getToken(LGFileParser.HASH, 0); }
    public errorTemplateName(): ErrorTemplateNameContext | undefined {
        return this.tryGetRuleContext(0, ErrorTemplateNameContext);
    }
    public templateName(): TemplateNameContext | undefined {
        return this.tryGetRuleContext(0, TemplateNameContext);
    }
    public parameters(): ParametersContext | undefined {
        return this.tryGetRuleContext(0, ParametersContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_templateNameLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterTemplateNameLine) {
            listener.enterTemplateNameLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitTemplateNameLine) {
            listener.exitTemplateNameLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitTemplateNameLine) {
            return visitor.visitTemplateNameLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ErrorTemplateNameContext extends ParserRuleContext {
    public IDENTIFIER(): TerminalNode[];
    public IDENTIFIER(i: number): TerminalNode;
    public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.IDENTIFIER);
        } else {
            return this.getToken(LGFileParser.IDENTIFIER, i);
        }
    }
    public TEXT_IN_NAME(): TerminalNode[];
    public TEXT_IN_NAME(i: number): TerminalNode;
    public TEXT_IN_NAME(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT_IN_NAME);
        } else {
            return this.getToken(LGFileParser.TEXT_IN_NAME, i);
        }
    }
    public OPEN_PARENTHESIS(): TerminalNode[];
    public OPEN_PARENTHESIS(i: number): TerminalNode;
    public OPEN_PARENTHESIS(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.OPEN_PARENTHESIS);
        } else {
            return this.getToken(LGFileParser.OPEN_PARENTHESIS, i);
        }
    }
    public COMMA(): TerminalNode[];
    public COMMA(i: number): TerminalNode;
    public COMMA(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.COMMA);
        } else {
            return this.getToken(LGFileParser.COMMA, i);
        }
    }
    public CLOSE_PARENTHESIS(): TerminalNode[];
    public CLOSE_PARENTHESIS(i: number): TerminalNode;
    public CLOSE_PARENTHESIS(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.CLOSE_PARENTHESIS);
        } else {
            return this.getToken(LGFileParser.CLOSE_PARENTHESIS, i);
        }
    }
    public DOT(): TerminalNode[];
    public DOT(i: number): TerminalNode;
    public DOT(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.DOT);
        } else {
            return this.getToken(LGFileParser.DOT, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_errorTemplateName; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterErrorTemplateName) {
            listener.enterErrorTemplateName(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitErrorTemplateName) {
            listener.exitErrorTemplateName(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitErrorTemplateName) {
            return visitor.visitErrorTemplateName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TemplateNameContext extends ParserRuleContext {
    public IDENTIFIER(): TerminalNode[];
    public IDENTIFIER(i: number): TerminalNode;
    public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.IDENTIFIER);
        } else {
            return this.getToken(LGFileParser.IDENTIFIER, i);
        }
    }
    public DOT(): TerminalNode[];
    public DOT(i: number): TerminalNode;
    public DOT(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.DOT);
        } else {
            return this.getToken(LGFileParser.DOT, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_templateName; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterTemplateName) {
            listener.enterTemplateName(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitTemplateName) {
            listener.exitTemplateName(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitTemplateName) {
            return visitor.visitTemplateName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ParametersContext extends ParserRuleContext {
    public OPEN_PARENTHESIS(): TerminalNode { return this.getToken(LGFileParser.OPEN_PARENTHESIS, 0); }
    public CLOSE_PARENTHESIS(): TerminalNode { return this.getToken(LGFileParser.CLOSE_PARENTHESIS, 0); }
    public IDENTIFIER(): TerminalNode[];
    public IDENTIFIER(i: number): TerminalNode;
    public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.IDENTIFIER);
        } else {
            return this.getToken(LGFileParser.IDENTIFIER, i);
        }
    }
    public COMMA(): TerminalNode[];
    public COMMA(i: number): TerminalNode;
    public COMMA(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.COMMA);
        } else {
            return this.getToken(LGFileParser.COMMA, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_parameters; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterParameters) {
            listener.enterParameters(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitParameters) {
            listener.exitParameters(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitParameters) {
            return visitor.visitParameters(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TemplateBodyContext extends ParserRuleContext {
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_templateBody; }
    public copyFrom(ctx: TemplateBodyContext): void {
        super.copyFrom(ctx);
    }
}
export class SwitchCaseBodyContext extends TemplateBodyContext {
    public switchCaseTemplateBody(): SwitchCaseTemplateBodyContext {
        return this.getRuleContext(0, SwitchCaseTemplateBodyContext);
    }
    constructor(ctx: TemplateBodyContext) {
        super(ctx.parent, ctx.invokingState);
        this.copyFrom(ctx);
    }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterSwitchCaseBody) {
            listener.enterSwitchCaseBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitSwitchCaseBody) {
            listener.exitSwitchCaseBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitSwitchCaseBody) {
            return visitor.visitSwitchCaseBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class NormalBodyContext extends TemplateBodyContext {
    public normalTemplateBody(): NormalTemplateBodyContext {
        return this.getRuleContext(0, NormalTemplateBodyContext);
    }
    constructor(ctx: TemplateBodyContext) {
        super(ctx.parent, ctx.invokingState);
        this.copyFrom(ctx);
    }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterNormalBody) {
            listener.enterNormalBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitNormalBody) {
            listener.exitNormalBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitNormalBody) {
            return visitor.visitNormalBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class StructuredBodyContext extends TemplateBodyContext {
    public structuredTemplateBody(): StructuredTemplateBodyContext {
        return this.getRuleContext(0, StructuredTemplateBodyContext);
    }
    constructor(ctx: TemplateBodyContext) {
        super(ctx.parent, ctx.invokingState);
        this.copyFrom(ctx);
    }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterStructuredBody) {
            listener.enterStructuredBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitStructuredBody) {
            listener.exitStructuredBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitStructuredBody) {
            return visitor.visitStructuredBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class IfElseBodyContext extends TemplateBodyContext {
    public ifElseTemplateBody(): IfElseTemplateBodyContext {
        return this.getRuleContext(0, IfElseTemplateBodyContext);
    }
    constructor(ctx: TemplateBodyContext) {
        super(ctx.parent, ctx.invokingState);
        this.copyFrom(ctx);
    }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterIfElseBody) {
            listener.enterIfElseBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitIfElseBody) {
            listener.exitIfElseBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitIfElseBody) {
            return visitor.visitIfElseBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StructuredTemplateBodyContext extends ParserRuleContext {
    public structuredBodyNameLine(): StructuredBodyNameLineContext {
        return this.getRuleContext(0, StructuredBodyNameLineContext);
    }
    public structuredBodyEndLine(): StructuredBodyEndLineContext | undefined {
        return this.tryGetRuleContext(0, StructuredBodyEndLineContext);
    }
    public structuredBodyContentLine(): StructuredBodyContentLineContext[];
    public structuredBodyContentLine(i: number): StructuredBodyContentLineContext;
    public structuredBodyContentLine(i?: number): StructuredBodyContentLineContext | StructuredBodyContentLineContext[] {
        if (i === undefined) {
            return this.getRuleContexts(StructuredBodyContentLineContext);
        } else {
            return this.getRuleContext(i, StructuredBodyContentLineContext);
        }
    }
    public STRUCTURED_NEWLINE(): TerminalNode[];
    public STRUCTURED_NEWLINE(i: number): TerminalNode;
    public STRUCTURED_NEWLINE(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.STRUCTURED_NEWLINE);
        } else {
            return this.getToken(LGFileParser.STRUCTURED_NEWLINE, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_structuredTemplateBody; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterStructuredTemplateBody) {
            listener.enterStructuredTemplateBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitStructuredTemplateBody) {
            listener.exitStructuredTemplateBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitStructuredTemplateBody) {
            return visitor.visitStructuredTemplateBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StructuredBodyNameLineContext extends ParserRuleContext {
    public LEFT_SQUARE_BRACKET(): TerminalNode { return this.getToken(LGFileParser.LEFT_SQUARE_BRACKET, 0); }
    public STRUCTURE_NAME(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.STRUCTURE_NAME, 0); }
    public errorStructuredName(): ErrorStructuredNameContext | undefined {
        return this.tryGetRuleContext(0, ErrorStructuredNameContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_structuredBodyNameLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterStructuredBodyNameLine) {
            listener.enterStructuredBodyNameLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitStructuredBodyNameLine) {
            listener.exitStructuredBodyNameLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitStructuredBodyNameLine) {
            return visitor.visitStructuredBodyNameLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ErrorStructuredNameContext extends ParserRuleContext {
    public STRUCTURE_NAME(): TerminalNode[];
    public STRUCTURE_NAME(i: number): TerminalNode;
    public STRUCTURE_NAME(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.STRUCTURE_NAME);
        } else {
            return this.getToken(LGFileParser.STRUCTURE_NAME, i);
        }
    }
    public TEXT_IN_STRUCTURE_NAME(): TerminalNode[];
    public TEXT_IN_STRUCTURE_NAME(i: number): TerminalNode;
    public TEXT_IN_STRUCTURE_NAME(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT_IN_STRUCTURE_NAME);
        } else {
            return this.getToken(LGFileParser.TEXT_IN_STRUCTURE_NAME, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_errorStructuredName; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterErrorStructuredName) {
            listener.enterErrorStructuredName(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitErrorStructuredName) {
            listener.exitErrorStructuredName(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitErrorStructuredName) {
            return visitor.visitErrorStructuredName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StructuredBodyContentLineContext extends ParserRuleContext {
    public keyValueStructureLine(): KeyValueStructureLineContext | undefined {
        return this.tryGetRuleContext(0, KeyValueStructureLineContext);
    }
    public objectStructureLine(): ObjectStructureLineContext | undefined {
        return this.tryGetRuleContext(0, ObjectStructureLineContext);
    }
    public errorStructureLine(): ErrorStructureLineContext | undefined {
        return this.tryGetRuleContext(0, ErrorStructureLineContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_structuredBodyContentLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterStructuredBodyContentLine) {
            listener.enterStructuredBodyContentLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitStructuredBodyContentLine) {
            listener.exitStructuredBodyContentLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitStructuredBodyContentLine) {
            return visitor.visitStructuredBodyContentLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ErrorStructureLineContext extends ParserRuleContext {
    public STRUCTURE_IDENTIFIER(): TerminalNode[];
    public STRUCTURE_IDENTIFIER(i: number): TerminalNode;
    public STRUCTURE_IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.STRUCTURE_IDENTIFIER);
        } else {
            return this.getToken(LGFileParser.STRUCTURE_IDENTIFIER, i);
        }
    }
    public STRUCTURE_EQUALS(): TerminalNode[];
    public STRUCTURE_EQUALS(i: number): TerminalNode;
    public STRUCTURE_EQUALS(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.STRUCTURE_EQUALS);
        } else {
            return this.getToken(LGFileParser.STRUCTURE_EQUALS, i);
        }
    }
    public STRUCTURE_OR_MARK(): TerminalNode[];
    public STRUCTURE_OR_MARK(i: number): TerminalNode;
    public STRUCTURE_OR_MARK(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.STRUCTURE_OR_MARK);
        } else {
            return this.getToken(LGFileParser.STRUCTURE_OR_MARK, i);
        }
    }
    public TEXT_IN_STRUCTURE_BODY(): TerminalNode[];
    public TEXT_IN_STRUCTURE_BODY(i: number): TerminalNode;
    public TEXT_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT_IN_STRUCTURE_BODY);
        } else {
            return this.getToken(LGFileParser.TEXT_IN_STRUCTURE_BODY, i);
        }
    }
    public EXPRESSION_IN_STRUCTURE_BODY(): TerminalNode[];
    public EXPRESSION_IN_STRUCTURE_BODY(i: number): TerminalNode;
    public EXPRESSION_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.EXPRESSION_IN_STRUCTURE_BODY);
        } else {
            return this.getToken(LGFileParser.EXPRESSION_IN_STRUCTURE_BODY, i);
        }
    }
    public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(): TerminalNode[];
    public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i: number): TerminalNode;
    public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY);
        } else {
            return this.getToken(LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_errorStructureLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterErrorStructureLine) {
            listener.enterErrorStructureLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitErrorStructureLine) {
            listener.exitErrorStructureLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitErrorStructureLine) {
            return visitor.visitErrorStructureLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class KeyValueStructureLineContext extends ParserRuleContext {
    public STRUCTURE_IDENTIFIER(): TerminalNode { return this.getToken(LGFileParser.STRUCTURE_IDENTIFIER, 0); }
    public STRUCTURE_EQUALS(): TerminalNode { return this.getToken(LGFileParser.STRUCTURE_EQUALS, 0); }
    public keyValueStructureValue(): KeyValueStructureValueContext[];
    public keyValueStructureValue(i: number): KeyValueStructureValueContext;
    public keyValueStructureValue(i?: number): KeyValueStructureValueContext | KeyValueStructureValueContext[] {
        if (i === undefined) {
            return this.getRuleContexts(KeyValueStructureValueContext);
        } else {
            return this.getRuleContext(i, KeyValueStructureValueContext);
        }
    }
    public STRUCTURE_OR_MARK(): TerminalNode[];
    public STRUCTURE_OR_MARK(i: number): TerminalNode;
    public STRUCTURE_OR_MARK(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.STRUCTURE_OR_MARK);
        } else {
            return this.getToken(LGFileParser.STRUCTURE_OR_MARK, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_keyValueStructureLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterKeyValueStructureLine) {
            listener.enterKeyValueStructureLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitKeyValueStructureLine) {
            listener.exitKeyValueStructureLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitKeyValueStructureLine) {
            return visitor.visitKeyValueStructureLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class KeyValueStructureValueContext extends ParserRuleContext {
    public TEXT_IN_STRUCTURE_BODY(): TerminalNode[];
    public TEXT_IN_STRUCTURE_BODY(i: number): TerminalNode;
    public TEXT_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT_IN_STRUCTURE_BODY);
        } else {
            return this.getToken(LGFileParser.TEXT_IN_STRUCTURE_BODY, i);
        }
    }
    public EXPRESSION_IN_STRUCTURE_BODY(): TerminalNode[];
    public EXPRESSION_IN_STRUCTURE_BODY(i: number): TerminalNode;
    public EXPRESSION_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.EXPRESSION_IN_STRUCTURE_BODY);
        } else {
            return this.getToken(LGFileParser.EXPRESSION_IN_STRUCTURE_BODY, i);
        }
    }
    public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(): TerminalNode[];
    public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i: number): TerminalNode;
    public ESCAPE_CHARACTER_IN_STRUCTURE_BODY(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY);
        } else {
            return this.getToken(LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_keyValueStructureValue; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterKeyValueStructureValue) {
            listener.enterKeyValueStructureValue(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitKeyValueStructureValue) {
            listener.exitKeyValueStructureValue(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitKeyValueStructureValue) {
            return visitor.visitKeyValueStructureValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ObjectStructureLineContext extends ParserRuleContext {
    public EXPRESSION_IN_STRUCTURE_BODY(): TerminalNode { return this.getToken(LGFileParser.EXPRESSION_IN_STRUCTURE_BODY, 0); }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_objectStructureLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterObjectStructureLine) {
            listener.enterObjectStructureLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitObjectStructureLine) {
            listener.exitObjectStructureLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitObjectStructureLine) {
            return visitor.visitObjectStructureLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StructuredBodyEndLineContext extends ParserRuleContext {
    public STRUCTURED_BODY_END(): TerminalNode { return this.getToken(LGFileParser.STRUCTURED_BODY_END, 0); }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_structuredBodyEndLine; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterStructuredBodyEndLine) {
            listener.enterStructuredBodyEndLine(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitStructuredBodyEndLine) {
            listener.exitStructuredBodyEndLine(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitStructuredBodyEndLine) {
            return visitor.visitStructuredBodyEndLine(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NormalTemplateBodyContext extends ParserRuleContext {
    public templateString(): TemplateStringContext[];
    public templateString(i: number): TemplateStringContext;
    public templateString(i?: number): TemplateStringContext | TemplateStringContext[] {
        if (i === undefined) {
            return this.getRuleContexts(TemplateStringContext);
        } else {
            return this.getRuleContext(i, TemplateStringContext);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_normalTemplateBody; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterNormalTemplateBody) {
            listener.enterNormalTemplateBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitNormalTemplateBody) {
            listener.exitNormalTemplateBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitNormalTemplateBody) {
            return visitor.visitNormalTemplateBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TemplateStringContext extends ParserRuleContext {
    public normalTemplateString(): NormalTemplateStringContext | undefined {
        return this.tryGetRuleContext(0, NormalTemplateStringContext);
    }
    public errorTemplateString(): ErrorTemplateStringContext | undefined {
        return this.tryGetRuleContext(0, ErrorTemplateStringContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_templateString; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterTemplateString) {
            listener.enterTemplateString(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitTemplateString) {
            listener.exitTemplateString(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitTemplateString) {
            return visitor.visitTemplateString(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NormalTemplateStringContext extends ParserRuleContext {
    public DASH(): TerminalNode { return this.getToken(LGFileParser.DASH, 0); }
    public MULTILINE_PREFIX(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.MULTILINE_PREFIX, 0); }
    public MULTILINE_SUFFIX(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.MULTILINE_SUFFIX, 0); }
    public TEXT(): TerminalNode[];
    public TEXT(i: number): TerminalNode;
    public TEXT(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT);
        } else {
            return this.getToken(LGFileParser.TEXT, i);
        }
    }
    public EXPRESSION(): TerminalNode[];
    public EXPRESSION(i: number): TerminalNode;
    public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.EXPRESSION);
        } else {
            return this.getToken(LGFileParser.EXPRESSION, i);
        }
    }
    public ESCAPE_CHARACTER(): TerminalNode[];
    public ESCAPE_CHARACTER(i: number): TerminalNode;
    public ESCAPE_CHARACTER(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.ESCAPE_CHARACTER);
        } else {
            return this.getToken(LGFileParser.ESCAPE_CHARACTER, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_normalTemplateString; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterNormalTemplateString) {
            listener.enterNormalTemplateString(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitNormalTemplateString) {
            listener.exitNormalTemplateString(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitNormalTemplateString) {
            return visitor.visitNormalTemplateString(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ErrorTemplateStringContext extends ParserRuleContext {
    public INVALID_TOKEN(): TerminalNode[];
    public INVALID_TOKEN(i: number): TerminalNode;
    public INVALID_TOKEN(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.INVALID_TOKEN);
        } else {
            return this.getToken(LGFileParser.INVALID_TOKEN, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_errorTemplateString; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterErrorTemplateString) {
            listener.enterErrorTemplateString(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitErrorTemplateString) {
            listener.exitErrorTemplateString(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitErrorTemplateString) {
            return visitor.visitErrorTemplateString(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IfElseTemplateBodyContext extends ParserRuleContext {
    public ifConditionRule(): IfConditionRuleContext[];
    public ifConditionRule(i: number): IfConditionRuleContext;
    public ifConditionRule(i?: number): IfConditionRuleContext | IfConditionRuleContext[] {
        if (i === undefined) {
            return this.getRuleContexts(IfConditionRuleContext);
        } else {
            return this.getRuleContext(i, IfConditionRuleContext);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_ifElseTemplateBody; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterIfElseTemplateBody) {
            listener.enterIfElseTemplateBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitIfElseTemplateBody) {
            listener.exitIfElseTemplateBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitIfElseTemplateBody) {
            return visitor.visitIfElseTemplateBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IfConditionRuleContext extends ParserRuleContext {
    public ifCondition(): IfConditionContext {
        return this.getRuleContext(0, IfConditionContext);
    }
    public normalTemplateBody(): NormalTemplateBodyContext | undefined {
        return this.tryGetRuleContext(0, NormalTemplateBodyContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_ifConditionRule; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterIfConditionRule) {
            listener.enterIfConditionRule(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitIfConditionRule) {
            listener.exitIfConditionRule(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitIfConditionRule) {
            return visitor.visitIfConditionRule(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IfConditionContext extends ParserRuleContext {
    public DASH(): TerminalNode { return this.getToken(LGFileParser.DASH, 0); }
    public IF(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.IF, 0); }
    public ELSE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.ELSE, 0); }
    public ELSEIF(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.ELSEIF, 0); }
    public WS(): TerminalNode[];
    public WS(i: number): TerminalNode;
    public WS(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.WS);
        } else {
            return this.getToken(LGFileParser.WS, i);
        }
    }
    public TEXT(): TerminalNode[];
    public TEXT(i: number): TerminalNode;
    public TEXT(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT);
        } else {
            return this.getToken(LGFileParser.TEXT, i);
        }
    }
    public EXPRESSION(): TerminalNode[];
    public EXPRESSION(i: number): TerminalNode;
    public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.EXPRESSION);
        } else {
            return this.getToken(LGFileParser.EXPRESSION, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_ifCondition; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterIfCondition) {
            listener.enterIfCondition(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitIfCondition) {
            listener.exitIfCondition(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitIfCondition) {
            return visitor.visitIfCondition(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SwitchCaseTemplateBodyContext extends ParserRuleContext {
    public switchCaseRule(): SwitchCaseRuleContext[];
    public switchCaseRule(i: number): SwitchCaseRuleContext;
    public switchCaseRule(i?: number): SwitchCaseRuleContext | SwitchCaseRuleContext[] {
        if (i === undefined) {
            return this.getRuleContexts(SwitchCaseRuleContext);
        } else {
            return this.getRuleContext(i, SwitchCaseRuleContext);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_switchCaseTemplateBody; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterSwitchCaseTemplateBody) {
            listener.enterSwitchCaseTemplateBody(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitSwitchCaseTemplateBody) {
            listener.exitSwitchCaseTemplateBody(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitSwitchCaseTemplateBody) {
            return visitor.visitSwitchCaseTemplateBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SwitchCaseRuleContext extends ParserRuleContext {
    public switchCaseStat(): SwitchCaseStatContext {
        return this.getRuleContext(0, SwitchCaseStatContext);
    }
    public normalTemplateBody(): NormalTemplateBodyContext | undefined {
        return this.tryGetRuleContext(0, NormalTemplateBodyContext);
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_switchCaseRule; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterSwitchCaseRule) {
            listener.enterSwitchCaseRule(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitSwitchCaseRule) {
            listener.exitSwitchCaseRule(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitSwitchCaseRule) {
            return visitor.visitSwitchCaseRule(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SwitchCaseStatContext extends ParserRuleContext {
    public DASH(): TerminalNode { return this.getToken(LGFileParser.DASH, 0); }
    public SWITCH(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.SWITCH, 0); }
    public CASE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.CASE, 0); }
    public DEFAULT(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.DEFAULT, 0); }
    public WS(): TerminalNode[];
    public WS(i: number): TerminalNode;
    public WS(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.WS);
        } else {
            return this.getToken(LGFileParser.WS, i);
        }
    }
    public TEXT(): TerminalNode[];
    public TEXT(i: number): TerminalNode;
    public TEXT(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.TEXT);
        } else {
            return this.getToken(LGFileParser.TEXT, i);
        }
    }
    public EXPRESSION(): TerminalNode[];
    public EXPRESSION(i: number): TerminalNode;
    public EXPRESSION(i?: number): TerminalNode | TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(LGFileParser.EXPRESSION);
        } else {
            return this.getToken(LGFileParser.EXPRESSION, i);
        }
    }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_switchCaseStat; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterSwitchCaseStat) {
            listener.enterSwitchCaseStat(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitSwitchCaseStat) {
            listener.exitSwitchCaseStat(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitSwitchCaseStat) {
            return visitor.visitSwitchCaseStat(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ImportDefinitionContext extends ParserRuleContext {
    public IMPORT(): TerminalNode { return this.getToken(LGFileParser.IMPORT, 0); }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_importDefinition; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterImportDefinition) {
            listener.enterImportDefinition(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitImportDefinition) {
            listener.exitImportDefinition(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitImportDefinition) {
            return visitor.visitImportDefinition(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OptionsDefinitionContext extends ParserRuleContext {
    public OPTIONS(): TerminalNode { return this.getToken(LGFileParser.OPTIONS, 0); }
    constructor(parent: ParserRuleContext | undefined, invokingState: number) {
        super(parent, invokingState);
    }
    // @Override
    public get ruleIndex(): number { return LGFileParser.RULE_optionsDefinition; }
    // @Override
    public enterRule(listener: LGFileParserListener): void {
        if (listener.enterOptionsDefinition) {
            listener.enterOptionsDefinition(this);
        }
    }
    // @Override
    public exitRule(listener: LGFileParserListener): void {
        if (listener.exitOptionsDefinition) {
            listener.exitOptionsDefinition(this);
        }
    }
    // @Override
    public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
        if (visitor.visitOptionsDefinition) {
            return visitor.visitOptionsDefinition(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


