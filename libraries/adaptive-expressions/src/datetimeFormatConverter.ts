/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

enum State {
    None,
    LowerD1,
    LowerD2,
    LowerD3,
    LowerD4,
    LowerF1,
    LowerF2,
    LowerF3,
    LowerF4,
    LowerF5,
    LowerF6,
    LowerF7,
    CapitalF1,
    CapitalF2,
    CapitalF3,
    CapitalF4,
    CapitalF5,
    CapitalF6,
    CapitalF7,
    LowerG,
    LowerH1,
    LowerH2,
    CapitalH1,
    CapitalH2,
    CapitalK,
    LowerM1,
    LowerM2,
    CapitalM1,
    CapitalM2,
    CapitalM3,
    CapitalM4,
    LowerS1,
    LowerS2,
    LowerT1,
    LowerT2,
    LowerY1,
    LowerY2,
    LowerY3,
    LowerY4,
    LowerY5,
    LowerZ1,
    LowerZ2,
    LowerZ3,
    InSingleQuoteLiteral,
    InDoubleQuoteLiteral,
    EscapeSequence,
}

/**
 * Convert a CSharp style datetime format string to a Moment.js style datetime format string. Ref: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
 * @param fmtString A CSharp style datetime format string. Ref: https://devhints.io/moment
 * @returns A Momengt.js style datetime format string.
 */
export function convertCSharpDateTimeToMomentJS(fmtString: string): string {
    let fmtResult = '';
    let fmtState: any = State.None;
    let lTokenBuffer = '';
    if (fmtString.length === 0) {
        return fmtResult;
    }
    if (fmtString.length === 1) {
        switch (fmtString) {
            case 'R':
            case 'r':
                throw Error(`RFC 1123 not supported  in MomentJS`);
            case 'O':
            case 'o':
                fmtString = 'YYYY-MM-DDTHH:mm:ss.SSSSSSSZ';
                break;
            case 'U':
                throw new Error(`Universal Fulll Format not supported in MomentJS`);
            case 'u':
                throw new Error(`Universal Sortable Format not supported in MomentJS`);
        }
    }
    
    const changeState = (newState): void => {
        switch (fmtState)
        {
            case State.LowerD1:
                fmtResult += 'D';
                break;
            case State.LowerD2:
                fmtResult += 'DD';
                break;
            case State.LowerD3:
                fmtResult += 'ddd';
                break;
            case State.LowerD4:
                fmtResult += 'dddd';
                break;
            case State.LowerF1:
            case State.CapitalF1:
                fmtResult += 'S';
                break;
            case State.LowerF2:
            case State.CapitalF2:
                fmtResult += 'SS';
                break;
            case State.LowerF3:
            case State.CapitalF3:
                fmtResult += 'SSS';
                break;
            case State.LowerF4:
            case State.CapitalF4:
                fmtResult += 'SSSS';
                break;
            case State.LowerF5:
            case State.CapitalF5:
                fmtResult += 'SSSSS';
                break;
            case State.LowerF6:
            case State.CapitalF6:
                fmtResult += 'SSSSSS';
                break;
            case State.LowerF7:
            case State.CapitalF7:
                fmtResult += 'SSSSSSS';
                break;
            case State.LowerG:
                throw Error('Era not supported in MomentJS');
            case State.LowerH1:
                fmtResult += 'h';
                break;
            case State.LowerH2:
                fmtResult += 'hh';
                break;
            case State.CapitalH1:
                fmtResult += 'H';
                break;
            case State.CapitalH2:
                fmtResult += 'HH';
                break;
            case State.LowerM1:
                fmtResult += 'm';
                break;
            case State.LowerM2:
                fmtResult += 'mm';
                break;
            case State.CapitalM1:
                fmtResult += 'M';
                break;
            case State.CapitalM2:
                fmtResult += 'MM';
                break;
            case State.CapitalM3:
                fmtResult += 'MMM';
                break;
            case State.CapitalM4:
                fmtResult += 'MMMM';
                break;
            case State.LowerS1:
                fmtResult += 's';
                break;
            case State.LowerS2:
                fmtResult += 'ss';
                break;
            case State.LowerT1:
                fmtResult += 'A';
                break;
            case State.LowerT2:
                fmtResult += 'A';
                break;
            case State.LowerY1:
                fmtResult += 'YY';
                break;
            case State.LowerY2:
                fmtResult += 'YY';
                break;
            case State.LowerY3:
                fmtResult += 'YYYY';
                break;
            case State.LowerY4:
                fmtResult += 'YYYY';
                break;
            case State.LowerY5:
                fmtResult += 'Y';
                break;
            case State.LowerZ1:
            case State.LowerZ2:
                fmtResult += 'ZZ';
                break;
            case State.LowerZ3:
                fmtResult += 'Z';
                break;
            case State.InSingleQuoteLiteral:
            case State.InDoubleQuoteLiteral:
            case State.EscapeSequence:
                for (const lCharacter of lTokenBuffer)
                {
                    fmtResult += lCharacter;
                }
                break;
        }

        lTokenBuffer = '';
        fmtState = newState;
    };

    for(const character of fmtString) {
        if (fmtState === State.EscapeSequence)
        {
            lTokenBuffer += character;
            changeState(State.None);
        }
        else if (fmtState === State.InDoubleQuoteLiteral)
        {
            if (character == '\`')
            {
                changeState(State.None);
            }
            else
            {
                lTokenBuffer += character;
            }
        }
        else if (fmtState == State.InSingleQuoteLiteral)
        {
            if (character == '\'')
            {
                changeState(State.None);
            }
            else
            {
                lTokenBuffer += character;
            }
        }
        else
        {
            switch (character)
            {
                case 'd':
                    switch (fmtState)
                    {
                        case State.LowerD1:
                            fmtState = State.LowerD2;
                            break;
                        case State.LowerD2:
                            fmtState = State.LowerD3;
                            break;
                        case State.LowerD3:
                            fmtState = State.LowerD4;
                            break;
                        case State.LowerD4:
                            break;
                        default:
                            changeState(State.LowerD1);
                            break;
                    }
                    break;
                case 'f':
                    switch (fmtState)
                    {
                        case State.LowerF1:
                            fmtState = State.LowerF2;
                            break;
                        case State.LowerF2:
                            fmtState = State.LowerF3;
                            break;
                        case State.LowerF3:
                            fmtState = State.LowerF4;
                            break;
                        case State.LowerF4:
                            fmtState = State.LowerF5;
                            break;
                        case State.LowerF5:
                            fmtState = State.LowerF6;
                            break;
                        case State.LowerF6:
                            fmtState = State.LowerF7;
                            break;
                        case State.LowerF7:
                            break;
                        default:
                            changeState(State.LowerF1);
                            break;
                    }
                    break;
                case 'F':
                    switch (fmtState)
                    {
                        case State.CapitalF1:
                            fmtState = State.CapitalF2;
                            break;
                        case State.CapitalF2:
                            fmtState = State.CapitalF3;
                            break;
                        case State.CapitalF3:
                            fmtState = State.CapitalF4;
                            break;
                        case State.CapitalF4:
                            fmtState = State.CapitalF5;
                            break;
                        case State.CapitalF5:
                            fmtState = State.CapitalF6;
                            break;
                        case State.CapitalF6:
                            fmtState = State.CapitalF7;
                            break;
                        case State.CapitalF7:
                            break;
                        default:
                            changeState(State.CapitalF1);
                            break;
                    }
                    break;
                case 'g':
                    switch (fmtState)
                    {
                        case State.LowerG:
                            break;
                        default:
                            changeState(State.LowerG);
                            break;
                    }
                    break;
                case 'h':
                    switch (fmtState)
                    {
                        case State.LowerH1:
                            fmtState = State.LowerH2;
                            break;
                        case State.LowerH2:
                            break;
                        default:
                            changeState(State.LowerH1);
                            break;
                    }
                    break;
                case 'H':
                    switch (fmtState)
                    {
                        case State.CapitalH1:
                            fmtState = State.CapitalH2;
                            break;
                        case State.CapitalH2:
                            break;
                        default:
                            changeState(State.CapitalH1);
                            break;
                    }
                    break;
                case 'K':
                    changeState(State.None);
                    fmtResult += 'Z';
                    break;
                case 'm':
                    switch (fmtState)
                    {
                        case State.LowerM1:
                            fmtState = State.LowerM2;
                            break;
                        case State.LowerM2:
                            break;
                        default:
                            changeState(State.LowerM1);
                            break;
                    }
                    break;
                case 'M':
                    switch (fmtState)
                    {
                        case State.CapitalM1:
                            fmtState = State.CapitalM2;
                            break;
                        case State.CapitalM2:
                            fmtState = State.CapitalM3;
                            break;
                        case State.CapitalM3:
                            fmtState = State.CapitalM4;
                            break;
                        case State.CapitalM4:
                            break;
                        default:
                            changeState(State.CapitalM1);
                            break;
                    }
                    break;
                case 's':
                    switch (fmtState)
                    {
                        case State.LowerS1:
                            fmtState = State.LowerS2;
                            break;
                        case State.LowerS2:
                            break;
                        default:
                            changeState(State.LowerS1);
                            break;
                    }
                    break;
                case 't':
                    switch (fmtState)
                    {
                        case State.LowerT1:
                            fmtState = State.LowerT2;
                            break;
                        case State.LowerT2:
                            break;
                        default:
                            changeState(State.LowerT1);
                            break;
                    }
                    break;
                case 'y':
                    switch (fmtState)
                    {
                        case State.LowerY1:
                            fmtState = State.LowerY2;
                            break;
                        case State.LowerY2:
                            fmtState = State.LowerY3;
                            break;
                        case State.LowerY3:
                            fmtState = State.LowerY4;
                            break;
                        case State.LowerY4:
                            fmtState = State.LowerY5;
                            break;
                        case State.LowerY5:
                            break;
                        default:
                            changeState(State.LowerY1);
                            break;
                    }
                    break;
                case 'z':
                    switch (fmtState)
                    {
                        case State.LowerZ1:
                            fmtState = State.LowerZ2;
                            break;
                        case State.LowerZ2:
                            fmtState = State.LowerZ3;
                            break;
                        case State.LowerZ3:
                            break;
                        default:
                            changeState(State.LowerZ1);
                            break;
                    }
                    break;
                case ':':
                    changeState(State.None);
                    fmtResult += ':';
                    break;
                case '/':
                    changeState(State.None);
                    fmtResult += ':';
                    break;
                case '\`':
                    changeState(State.InDoubleQuoteLiteral);
                    break;
                case '\'':
                    changeState(State.InSingleQuoteLiteral);
                    break;
                case '%':
                    changeState(State.None);
                    break;
                case '\\':
                    changeState(State.EscapeSequence);
                    break;
                default:
                    changeState(State.None);
                    fmtResult += character;
                    break;
            }
        }
    }

    if (fmtState == State.EscapeSequence || fmtState == State.InDoubleQuoteLiteral || fmtState == State.InSingleQuoteLiteral){
        throw Error(`Invalid Format String`);
    }

    changeState(State.None);
    return fmtResult;
}