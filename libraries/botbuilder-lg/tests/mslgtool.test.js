const { MSLGTool } = require('../');
const assert = require('assert');
const fs = require('fs');

function GetErrors(mslgtool, fileName){
    const path = `${ __dirname }/testData/mslgTool/`+ fileName;
    const text = fs.readFileSync(path, 'utf-8');
    return mslgtool.ValidateFile(text, path);
  
}

describe('MSLGTool', function () {
    it('TestValidateReturnStaticCheckerErrors', function () {
        let errors = GetErrors(new MSLGTool(),'StaticCheckerErrors.lg');
        assert.strictEqual(errors.length,6)
        assert(errors[0].includes("There is no template body in template template"));
        assert(errors[1].includes("condition is not end with else"))
        assert(errors[2].includes("control flow is not starting with switch"))
        assert(errors[3].includes("control flow is not ending with default statement"))
        assert(errors[4].includes("control flow should have at least one case statement"))
        assert(errors[5].includes("Not a valid template name line"))
    });

    it('TestValidateReturnNoErrors', function () {
        let errors = GetErrors(new MSLGTool(),'ValidFile.lg');
        assert.strictEqual(errors.length, 0);
    });

    it('TestCollateTemplates', function () {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'CollateFile1.lg');
        assert.strictEqual(errors.length, 0);
        errors = GetErrors(mslgTool, 'CollateFile2.lg');
        assert.strictEqual(errors.length, 0);
        errors = GetErrors(mslgTool, 'CollateFile3.lg');
        assert.strictEqual(errors.length, 0);
        errors = GetErrors(mslgTool, 'CollateFile4.lg'); 
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(mslgTool.CollationMessages.length, 0);
        assert.strictEqual(mslgTool.NameCollisions.length, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.size, 6);
        assert.strictEqual(mslgTool.CollatedTemplates.get('Greeting').length, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.get('TimeOfDayWithCondition').size, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.get('TimeOfDay').length, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.get('ST2')[0].replace("\r\n", "\n"), '[MyStruct\n    Speak = bar\n    Text = zoo\n]');
    });

    it('TestExpandTemplate', function () {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'CollateFile1.lg');
        assert.strictEqual(errors.length, 0);
        let expandedTemplate = mslgTool.ExpandTemplate('FinalGreeting', undefined);
        assert.strictEqual(expandedTemplate.length, 4);
        let expectedResults = ['Hi Morning', 'Hi Evening', 'Hello Morning', 'Hello Evening'];
        expectedResults.forEach(element => {
            assert.strictEqual(expandedTemplate.includes(element), true);
        });
    })

    it('TestExpandTemplateWithScope', function() {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'CollateFile3.lg');
        assert.strictEqual(errors.length, 0);
        let expandedTemplate = mslgTool.ExpandTemplate('TimeOfDayWithCondition', { time: 'evening' });
        assert.strictEqual(expandedTemplate.length, 2);
        let expectedResults = ['Hi Evening', 'Hey Evening'];
        expectedResults.forEach(element => {
            assert.strictEqual(expandedTemplate.includes(element), true);
        });
        let expandedTemplate2 = mslgTool.ExpandTemplate('greetInAWeek', { day: 'Sunday' });
        assert.strictEqual(expandedTemplate.length, 2);
        let expected2Results = ['Nice Sunday!', 'Happy Sunday!'];
        expected2Results.forEach(element => {
            assert.strictEqual(expandedTemplate2.includes(element), true);
        });

    })

    it('TestExpandTemplateWithRef', function() {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'ValidFile.lg');
        assert.strictEqual(errors.length, 0);
        const alarms = [
            {
                time: "7 am",
                date : "tomorrow"
            },
            {
                time:"8 pm",
                date :"tomorrow"
            }
        ];
        let expandedTemplate = mslgTool.ExpandTemplate('ShowAlarmsWithLgTemplate', {alarms: alarms});
        assert.strictEqual(expandedTemplate.length, 2);
        assert.strictEqual(expandedTemplate[0], "You have 2 alarms, they are 8 pm at tomorrow");
        assert.strictEqual(expandedTemplate[1], "You have 2 alarms, they are 8 pm of tomorrow");
    })

    it('TestExpandTemplateWithFunction', function() {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'ValidFile.lg');
        assert.strictEqual(errors.length, 0);
        const alarms = [
            {
                time: "7 am",
                date : "tomorrow"
            },
            {
                time:"8 pm",
                date :"tomorrow"
            }
        ];
        let evaled = mslgTool.ExpandTemplate('ShowAlarmsWithForeach', {alarms: alarms});
        const evalOptions = [
            "You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow",
            "You have 2 alarms, 7 am at tomorrow and 8 pm of tomorrow",
            "You have 2 alarms, 7 am of tomorrow and 8 pm at tomorrow",
            "You have 2 alarms, 7 am of tomorrow and 8 pm of tomorrow"
        ];

        assert.strictEqual(evaled.length, 1);
        assert.strictEqual(evalOptions.includes(evaled[0]), true);

        evaled = mslgTool.ExpandTemplate('T2');
        assert.strictEqual(evaled.length, 1);
        assert.strictEqual(evaled[0] === "3" || evaled[0] === "5", true);

        evaled = mslgTool.ExpandTemplate('T3');
        assert.strictEqual(evaled.length, 1);
        assert.strictEqual(evaled[0] === "3" || evaled[0] === "5", true);

        evaled = mslgTool.ExpandTemplate('T4');
        assert.strictEqual(evaled.length, 1);
        assert.strictEqual(evaled[0] === "ey" || evaled[0] === "el", true);
    })

    it('TestExpandTemplateWithRefInMultiLine', function() {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'ValidFile.lg');
        assert.strictEqual(errors.length, 0);
        const alarms = [
            {
                time: "7 am",
                date : "tomorrow"
            },
            {
                time:"8 pm",
                date :"tomorrow"
            }
        ];
        let expandedTemplate = mslgTool.ExpandTemplate('ShowAlarmsWithMultiLine', {alarms: alarms});
        assert.strictEqual(expandedTemplate.length, 2);
        const eval1Options = ["\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n", "\nYou have 2 alarms.\nThey are 8 pm at tomorrow\n"];
        const eval2Options = ["\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n", "\nYou have 2 alarms.\nThey are 8 pm of tomorrow\n"]
        assert(eval1Options.includes(expandedTemplate[0]));
        assert(eval2Options.includes(expandedTemplate[1]));
    })

    it('TestExpandTemplateWithStructuredLG', function() {
        const mslgTool = new MSLGTool();
        let errors = GetErrors(mslgTool, 'StructuredLG.lg');
        assert.strictEqual(errors.length, 0);
        let expandedTemplate = mslgTool.ExpandTemplate('AskForAge.prompt', undefined);
        assert.strictEqual(expandedTemplate.length, 4);
        const evalOptions = [
            '{"$type":"Activity","text":"how old are you?","speak":"how old are you?"}',
            '{"$type":"Activity","text":"how old are you?","speak":"what\'s your age?"}',
            '{"$type":"Activity","text":"what\'s your age?","speak":"how old are you?"}',
            '{"$type":"Activity","text":"what\'s your age?","speak":"what\'s your age?"}'
        ]
        
        evalOptions.forEach(evalOption => assert(expandedTemplate.includes(evalOption)));
    })
})