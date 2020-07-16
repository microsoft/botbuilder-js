const { Templates, LGTemplateParser } = require('../');
const assert = require('assert');

function GetExampleFilePath(fileName) {
    return `${ __dirname }/testData/examples/` + fileName;
}


describe('ParseTreeTest', function() {
    /**
     * Disk I/O is slow and variable, causing issues in pipeline tests, so we
     * preload all of the file reads here so that it doesn't count against individual test duration.
     */
    const preloaded = {
        ParseTreeTest: Templates.parseFile(GetExampleFilePath('ParseTreeTest.lg'))
    };

    it('ParseTreeTest', function() {
        const templates = preloaded.ParseTreeTest.toArray();
        assert.strictEqual(templates.length, 4);

        // Normal template body
        const normalTemplateBody = templates[0].templateBodyParseTree;

        // - ${welcomeword} ${name}
        assert.strictEqual(normalTemplateBody.text, '-${welcomeword} ${name}');
        const templateStrings = normalTemplateBody.normalTemplateBody().templateString();
        assert.strictEqual(templateStrings.length, 1);

        const expressions = templateStrings[0].normalTemplateString().expression();
        assert.strictEqual(expressions[0].text, '${welcomeword}');
        assert.strictEqual(expressions[1].text, '${name}');

        // Condition template body
        const conditionBody = templates[1].templateBodyParseTree;
        const rules = conditionBody.ifElseTemplateBody().ifConditionRule();
        assert.strictEqual(rules.length, 3);

        // - IF:${a > 0}
        // -positve
        const ifCondition = rules[0].ifCondition();
        assert.strictEqual(ifCondition.text, '-IF:${a > 0}');
        let expressionContext = ifCondition.expression()[0];
        assert.strictEqual(expressionContext.text, '${a > 0}');

        // -ELSEIF: ${ a == 0}
        // -equals to 0
        const elseIfCondition = rules[1].ifCondition();
        assert.strictEqual(elseIfCondition.text, '-ELSEIF:${a == 0}');
        expressionContext = elseIfCondition.expression()[0];
        assert.strictEqual(expressionContext.text, '${a == 0}');

        // - ELSE:
        // - negative
        const elseCondition = rules[2].ifCondition();
        assert.strictEqual(elseCondition.text, '-ELSE:');

        // switch/case templatebody
        const switchBody = templates[2].templateBodyParseTree;
        const caseRules = switchBody.switchCaseTemplateBody().switchCaseRule();
        assert.strictEqual(caseRules.length, 4);

        // -SWITCH:${day}
        const switchStat = caseRules[0].switchCaseStat();
        assert.strictEqual(switchStat.text, '-SWITCH:${day}');
        expressionContext = switchStat.expression()[0];
        assert.strictEqual(expressionContext.text, '${day}');

        // -CASE: ${'Saturday'}
        // -Happy Saturday!
        const caseStat = caseRules[1].switchCaseStat();
        assert.strictEqual(caseStat.text, '-CASE:${\'Saturday\'}');
        expressionContext = caseStat.expression()[0];
        assert.strictEqual(expressionContext.text, '${\'Saturday\'}');

        //-DEFAULT
        const defaultStat = caseRules[3].switchCaseStat();
        assert.strictEqual(defaultStat.text, '-DEFAULT:');

        //structure
        const structureBody = templates[3].templateBodyParseTree;
        const nameLine = structureBody.structuredTemplateBody().structuredBodyNameLine();
        assert.strictEqual(nameLine.STRUCTURE_NAME().text, 'MyStruct');
        const bodyLines = structureBody.structuredTemplateBody().structuredBodyContentLine();
        assert.strictEqual(bodyLines.length, 1);

        // body=${body}
        const contentLine = bodyLines[0].keyValueStructureLine();
        assert.strictEqual(contentLine.STRUCTURE_IDENTIFIER().text, 'body');
        assert.strictEqual(contentLine.keyValueStructureValue().length, 1);
        assert.strictEqual(contentLine.keyValueStructureValue()[0].expressionInStructure()[0].text, '${body}');
    });
});