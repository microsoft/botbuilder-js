import { MSLGTool } from './mslgTool';
const fs = require('fs');

function GetExampleFile(fileName) {
    const text = fs.readFileSync(`${__dirname}/../tests/testData/examples/` + fileName, 'utf-8');
    return text;
}

function GetExampleFilePath(fileName) {
    const text = `${__dirname}/../tests/testData/mslgTool/` + fileName;
    return text;
}

function GetErrors(mslgtool, fileName){
    const path = `${ __dirname }/../tests/testData/mslgTool/`+ fileName;
    const text = fs.readFileSync(path, 'utf-8');
    return mslgtool.ValidateFile(text, path);
  
}

const mslgTool = new MSLGTool();
let errors = GetErrors(mslgTool, 'StructuredLG.lg');
var evaled = mslgTool.ExpandTemplate('ExpanderT1')
console.log(evaled);