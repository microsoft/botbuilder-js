const OrchestratorRecognizer = require('botbuilder-ai-orchestrator').OrchestratorRecognizer;
const modelPath = "c:\\repos\\botbuilder-js\\samples\\dispatch\\model";
const snapshotPath = "c:\\repos\\botbuilder-js\\samples\\dispatch\\cognitiveModels\\orchestrator.blu";

OrchestratorRecognizer.createRecognizerAsync(modelPath, snapshotPath)
    .then(res => {
        let result = res.Score("hello")
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
        console.log('Error!');
        console.log(JSON.stringify(err, null, 2));
    })