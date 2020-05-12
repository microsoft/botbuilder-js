lexer grammar LGFileLexer;

@lexer::members {
  startTemplate = false;
  inMultiline = false;
}

fragment WHITESPACE : ' '|'\t'|'\ufeff'|'\u00a0';

NEWLINE : '\r'? '\n';

OPTION : WHITESPACE* '>' WHITESPACE* '!#' ~('\r'|'\n')+ { !this.startTemplate }?;

COMMENT : WHITESPACE* '>' ~('\r'|'\n')* { !this.startTemplate }?;

IMPORT : WHITESPACE* '[' ~[\r\n[\]]*? ']' '(' ~[\r\n()]*? ')' WHITESPACE* { !this.startTemplate }?;

TEMPLATE_NAME_LINE : WHITESPACE* '#' ~('\r'|'\n')* { this.startTemplate = true; };

MULTILINE_PREFIX: WHITESPACE* '-' WHITESPACE* '```' { this.startTemplate && !this.inMultiline}? {this.inMultiline = true;} -> pushMode(MULTILINE_MODE);

TEMPLATE_BODY_LINE : ~('\r'|'\n')+ { this.startTemplate }?;

INVALID_LINE :  ~('\r'|'\n')+ { !this.startTemplate }?;


mode MULTILINE_MODE;
MULTILINE_SUFFIX
  : '```' { this.inMultiline = false; } -> popMode
  ;

MULTILINE_TEXT
  : .+?
  ;
