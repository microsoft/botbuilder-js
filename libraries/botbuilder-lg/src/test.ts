import { MSLGTool } from './mslgTool';
const fs = require('fs');

function GetErrors(mslgtool, fileName){
    const path = `${ __dirname }/../tests/testData/mslgTool/`+ fileName;
    const text = fs.readFileSync(path, 'utf-8');
    return mslgtool.ValidateFile(text, path);
}

const mslgTool = new MSLGTool();
let errors = GetErrors(mslgTool, 'StructuredLG.lg');
let expandedTemplate = mslgTool.ExpandTemplate('AskForAge.prompt', undefined);
console.log(expandedTemplate);
