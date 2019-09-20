import {TemplateEngine} from './templateEngine';
var engine = new TemplateEngine().addFile('D:/projects/BotFramework/botbuilder-dotnet/tests/Microsoft.Bot.Builder.LanguageGeneration.Tests/Examples/StructuredTemplate.lg');

var evaled = engine.evaluateTemplate('AskForAge.prompt3');
console.log(evaled);