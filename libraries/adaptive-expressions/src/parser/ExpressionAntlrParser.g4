parser grammar ExpressionAntlrParser;

options { tokenVocab=ExpressionAntlrLexer; }

file: expression EOF;

expression
    : (NON|SUBSTRACT|PLUS) expression                                         #unaryOpExp
    | <assoc=right> expression XOR expression                                 #binaryOpExp 
    | expression (ASTERISK|SLASH|PERCENT) expression                          #binaryOpExp
    | expression (PLUS|SUBSTRACT) expression                                  #binaryOpExp
    | expression (DOUBLE_EQUAL|NOT_EQUAL) expression                          #binaryOpExp
    | expression (SINGLE_AND) expression                                      #binaryOpExp
    | expression (LESS_THAN|LESS_OR_EQUAl|MORE_THAN|MORE_OR_EQUAL) expression #binaryOpExp
    | expression DOUBLE_AND expression                                        #binaryOpExp
    | expression DOUBLE_VERTICAL_CYLINDER expression                          #binaryOpExp
    | primaryExpression                                                       #primaryExp
    ;
 
primaryExpression 
    : OPEN_BRACKET expression CLOSE_BRACKET                                  #parenthesisExp
    | OPEN_SQUARE_BRACKET argsList? CLOSE_SQUARE_BRACKET                     #arrayCreationExp
    | OPEN_CURLY_BRACKET keyValuePairList? CLOSE_CURLY_BRACKET               #jsonCreationExp
    | NUMBER                                                                 #numericAtom
    | STRING                                                                 #stringAtom
    | IDENTIFIER                                                             #idAtom
    | STRING_INTERPOLATION                                                   #stringInterpolationAtom
    | primaryExpression DOT IDENTIFIER                                       #memberAccessExp
    | primaryExpression NON? OPEN_BRACKET argsList? CLOSE_BRACKET            #funcInvokeExp
    | primaryExpression OPEN_SQUARE_BRACKET expression CLOSE_SQUARE_BRACKET  #indexAccessExp
    ;

objectDefinition
    : OPEN_CURLY_BRACKET keyValuePairList? CLOSE_CURLY_BRACKET
    ;

argsList
    : expression (COMMA expression)*
    ;

keyValuePairList
    : keyValuePair (COMMA keyValuePair)*
    ;

keyValuePair
    : STRING COLON expression
    ;
