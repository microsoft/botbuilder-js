const {TemplateEngine} = require('../');
const assert = require('assert');

function GetExampleFilePath(fileName){
    return `${ __dirname }/testData/examples/`+ fileName;
}


describe('LG', function () {
    it('TestBasic', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('2.lg'));
        let evaled = engine.evaluateTemplate("wPhrase", undefined);
        const options = ['Hi','Hello','Hiya'];
        assert.strictEqual(options.includes(evaled), true, `The result ${evaled} is not in those options [${options.join(",")}]`);
    });

    it('TestBasicTemplateReference', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('3.lg'));
        let evaled = engine.evaluateTemplate("welcome-user", undefined);
        const options = ["Hi", "Hello", "Hiya", "Hi :)", "Hello :)", "Hiya :)"];
        assert.strictEqual(options.includes(evaled), true, `The result ${evaled} is not in those options [${options.join(",")}]`);
    });

    it('TestBasicTemplateRefAndEntityRef', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('4.lg'));
        let userName = 'DL';
        let evaled = engine.evaluateTemplate("welcome-user", {userName:userName});
        const options = ["Hi", "Hello", "Hiya ", "Hi :)", "Hello :)", "Hiya :)"];
        assert.strictEqual(evaled.includes(userName), true, `The result ${evaled} does not contiain ${userName}`);
    });

    it('TestBaicConditionalTemplate', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('5.lg'));

        let evaled = engine.evaluateTemplate("time-of-day-readout", { timeOfDay : "morning" });
        assert.strictEqual(evaled === "Good morning" || evaled === "Morning! ", true, `Evaled is ${evaled}`);

        evaled = engine.evaluateTemplate("time-of-day-readout", { timeOfDay : "evening" });
        assert.strictEqual(evaled === "Good evening" || evaled === "Evening! ", true, `Evaled is ${evaled}`);
    });

    it('TestBasicConditionalTemplateWithoutDefault', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('5.lg'));

        let evaled = engine.evaluateTemplate("time-of-day-readout-without-default", { timeOfDay : "morning" });
        assert.strictEqual(evaled === "Good morning" || evaled === "Morning! ", true, `Evaled is ${evaled}`);

        evaled = engine.evaluateTemplate("time-of-day-readout-without-default2", { timeOfDay : "morning" });
        assert.strictEqual(evaled === "Good morning" || evaled === "Morning! ", true, `Evaled is ${evaled}`);

        evaled = engine.evaluateTemplate("time-of-day-readout-without-default2", { timeOfDay : "evening" });
        assert.strictEqual(evaled, undefined, `Evaled is ${evaled} which should be undefined.`);
    });

    it('TestBasicTemplateRefWithParameters', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('6.lg'));

        let evaled = engine.evaluateTemplate("welcome", undefined);
        const options1 = ["Hi DongLei :)","Hey DongLei :)","Hello DongLei :)"]
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${evaled}`);

        const options2 = ["Hi DL :)","Hey DL :)","Hello DL :)"]
        evaled = engine.evaluateTemplate("welcome",{userName : "DL"});
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${evaled}`);
    });

    it('TestBasicListSupport',function(){
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('BasicList.lg'));

        let evaled = engine.evaluateTemplate("BasicJoin", {items : ["1","2"]});
        assert.strictEqual(evaled, "1, 2", `Evaled is ${evaled}`);
    });

    it('TestBasicExtendedFunctions', function () {
        let engine = TemplateEngine.fromFiles(GetExampleFilePath('6.lg'));
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

       //let evaled = engine.evaluate('ShowAlarmsWithForeach',{alarms:alarms});
        //assert.strictEqual(evaled === "You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow", true, `Evaled is ${evaled}`);

        let evaled = engine.evaluateTemplate('ShowAlarmsWithMemberHumanize',{alarms:alarms});
        assert.strictEqual(evaled === "You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow", true, `Evaled is ${evaled}`);
    });

    

    it('TestBasicLoopRef',function(){
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("7.lg"));
        let evaled = "";
            try
            {
                evaled = engine.evaluateTemplate("wPhrase", "");
                assert.strictEqual(evaled, "你好");
            }
            catch (e)
            {
                // Randomly this will detect a loop which is OK.
                assert.strictEqual(e.message.startsWith('Loop'), true);
            }
    });

    it('TestListWithOnlyOneElement',function(){
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("8.lg"));
        var evaled = engine.evaluateTemplate("RecentTasks", {recentTasks:['Task1']});
        assert.strictEqual(evaled === "Your most recent task is Task1. You can let me know if you want to add or complete a task.", true,`Evaled is ${evaled}`);
    });

    it('TestTemplateNameWithDotIn',function(){
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("TemplateNameWithDot.lg"));
        var evaled1 = engine.evaluateTemplate("Hello.World", "");
        assert.strictEqual(evaled1 === "Hello World", true, `Evaled is ${evaled1}`);

        var evaled2 = engine.evaluateTemplate("Hello", "");
        assert.strictEqual(evaled2 === "Hello World", true, `Evaled is ${evaled2}`);
    });

    it('TestBasicInlineTemplate',function(){
        var emptyEngine = TemplateEngine.fromText("");
        assert.strictEqual(emptyEngine.evaluate("Hi", "") , "Hi",emptyEngine.evaluate("Hi", ""));

        assert.strictEqual(emptyEngine.evaluate("Hi {name}", {name:'DL'}) , "Hi DL");
        
        assert.strictEqual(emptyEngine.evaluate("Hi {name.FirstName}{name.LastName}", {name:{FirstName:"D",LastName:"L"}}) , "Hi DL");
        assert.strictEqual(new TemplateEngine().evaluate("Hi", "") ,  "Hi");
    });

    it('TestInlineTemplateWithTemplateFile',function(){
        var emptyEngine = TemplateEngine.fromFiles(GetExampleFilePath("8.lg"));
        assert.strictEqual(emptyEngine.evaluate("Hi", "") , "Hi",emptyEngine.evaluate("Hi", ""));

        assert.strictEqual(emptyEngine.evaluate("Hi {name}", {name:'DL'}) , "Hi DL",emptyEngine.evaluate("Hi {name}", {name:'DL'}));
        
        assert.strictEqual(emptyEngine.evaluate("Hi {name.FirstName}{name.LastName} [RecentTasks]", {name:{FirstName:"D",LastName:"L"}}) , "Hi DL You don't have any tasks.",emptyEngine.evaluate("Hi {name.FirstName}{name.LastName} [RecentTasks]", {name:{FirstName:"D",LastName:"L"}}));

        assert.strictEqual(emptyEngine.evaluate("Hi {name.FirstName}{name.LastName} [RecentTasks]", {name:{FirstName:"D",LastName:"L"},recentTasks:["task1"]}) , "Hi DL Your most recent task is task1. You can let me know if you want to add or complete a task.",emptyEngine.evaluate("Hi {name.FirstName}{name.LastName} [RecentTasks]", {name:{FirstName:"D",LastName:"L"},recentTasks:["task1"]}));

    });

    it('TestMultiLine',function(){
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("MultilineTextForAdaptiveCard.lg"));
        var evaled1 = engine.evaluateTemplate("wPhrase", "");
        var options1 = ["\r\ncardContent\r\n","hello","\ncardContent\n"];
        assert.strictEqual(options1.includes(evaled1), true, `1.Evaled is ${evaled1}`);

         var evaled2 = engine.evaluateTemplate("nameTemplate", {name:"N"});
        var options2 = ["\r\nN\r\n","N","\nN\n"];
        assert.strictEqual(options2.includes(evaled2), true, `2.Evaled is ${evaled2}`);

        var evaled3 = engine.evaluateTemplate("adaptivecardsTemplate", "");
        console.log(evaled3);

        var evaled4 = engine.evaluateTemplate("refTemplate", "");
        var options4 = ["\r\nhi\r\n","\nhi\n"];
        assert.strictEqual(options4.includes(evaled4), true, `4.Evaled is ${evaled4}`);
    });

    it('TestTemplateRef',function(){
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("TemplateRef.lg"));
        var scope = {time:"morning",name:"Dong Lei"};
        var evaled = engine.evaluateTemplate("Hello", scope);
        assert.strictEqual(evaled, "Good morning Dong Lei", `Evaled is ${evaled}`);
    });

    it('TestEscapeCharacter', function() {
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("EscapeCharacter.lg"));
        var evaled = engine.evaluateTemplate("wPhrase", null);
        assert.strictEqual(evaled, "Hi \r\n\t[]{}\\", "Happy path failed.");
    });

    it('TestAnalyzer', function() {
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("Analyzer.lg"));
        var evaled1 = engine.analyzeTemplate("orderReadOut");
        var evaled1Options = ["orderType","userName","base","topping","bread","meat"];
        console.log(evaled1[0]);
        assert.strictEqual(evaled1.length, evaled1Options.length);
        evaled1Options.forEach(element => assert.strictEqual(evaled1.includes(element), true));

        var evaled2 = engine.analyzeTemplate("sandwichOrderConfirmation");
        var evaled2Options = ["bread","meat"];
        assert.strictEqual(evaled2.length, evaled2Options.length);
        evaled2Options.forEach(element => assert.strictEqual(evaled2.includes(element), true));

        var evaled3 = engine.analyzeTemplate("template1");
        // TODO: input.property should really be: customer.property but analyzer needs to be 
        var evaled3Options = ["alarms", "customer", "tasks[0]","age"];
        assert.strictEqual(evaled3.length, evaled3Options.length);
        evaled3Options.forEach(element => assert.strictEqual(evaled3.includes(element), true));
    });

    it('TestlgTemplateFunction', function() {
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("lgTemplate.lg"));
        var evaled = engine.evaluateTemplate('TemplateC', '');
        var options = ['Hi', 'Hello'];
        assert.strictEqual(options.includes(evaled), true);

        evaled = engine.evaluateTemplate('TemplateD', {b: "morning"});
        options = ['Hi morning', 'Hello morning'];
        assert.strictEqual(options.includes(evaled), true);
    });

    it('TestAnalyzelgTemplateFunction', function() {
        var engine = TemplateEngine.fromFiles(GetExampleFilePath("lgTemplate.lg"));
        var evaled = engine.analyzeTemplate('TemplateD');
        var options = ['b'];
        assert.strictEqual(evaled.length, options.length);
        options.forEach(e => assert.strictEqual(evaled.includes(e), true));
    });
});