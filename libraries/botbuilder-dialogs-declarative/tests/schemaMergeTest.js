const { FolderResourceProvider, ResourceExplorer, FileResource } = require('../lib');
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const Validator = require('jsonschema').Validator;
// eslint-disable-next-line security/detect-child-process
const { exec } = require('child_process');

// Note: This file is intentionally not named *.test.js to ensure it isn't run
// any time somebody calls `mocha` in this directory.

async function runCommand(command) {
    return new Promise((resolve, _reject) => {
        exec(command, (err, stdout, stderr) => {
            resolve({ error: err && stderr, log: stdout });
        });
    });
}

describe('Schema Merge Tests', function () {
    const resourceExplorer = new ResourceExplorer();
    const resourceProvider = new FolderResourceProvider(
        resourceExplorer,
        path.join(__dirname, '..', '..'),
        true,
        false
    );
    const dialogResources = resourceProvider.getResources('dialog');
    const dialogs = dialogResources
        .filter((r) => !r.id.endsWith('.schema.dialog'))
        .map((resource) => {
            return {
                id: resource.id,
                fullName: resource.fullName,
            };
        });

    const testsSchemaPath = path.join(__dirname, '..', '..', 'tests.schema');
    const testsSchemaFileResource = new FileResource(testsSchemaPath);
    const testsSchema = JSON.parse(testsSchemaFileResource.readText());

    // This fixture creates or updates test.schema by calling bf dialog:merge on all the schema files in the solution.
    // This will install the latest version of botframewrork-cli if the schema changed and npm is present.
    it('should generate a new tests.schema file, if necessary', async function () {
        this.timeout(50000);
        // This only runs on Windows platforms.
        if (process.platform === 'win32') {
            fs.unlinkSync(testsSchemaPath);

            // Merge all schema files.
            const sdkRoot = path.join(__dirname, '..', '..', '..');
            const mergeCommand = `bf dialog:merge ${sdkRoot}/libraries/**/*.schema ${sdkRoot}/libraries/**/*.uischema !**/testbot.schema !${sdkRoot}/libraries/botbuilder-dialogs-adaptive/tests/schema/*.* -o ${testsSchemaPath}`;
            let result = await runCommand(mergeCommand);

            // Check if there were any errors or if the new schema file has changed.
            const newTestsSchemaFileResource = new FileResource(testsSchemaPath);
            const newSchema = JSON.parse(newTestsSchemaFileResource.readText());
            if (result.error || newSchema !== testsSchema) {
                // We may get there because there was an error running bf dialog:merge or because 
                // the generated file is different than the one that is in source control.
                // In either case we try installing latest bf if the schema changed to make sure the
                // discrepancy is not because we are using a different version of the CLI
                // and we ensure it is installed while on it.
                const installCommand = 'npm i -g @microsoft/botframework-cli@next --force';
                result = await runCommand(installCommand);
                if (result.error) {
                    assert.fail(`Unable to install bf-cli: ${result.error}`);
                }

                // Rerun merge command.
                result = await runCommand(mergeCommand);
                if (result.error) {
                    assert.fail(`Unable to merge schema: ${result.error}`);
                }
            }
        }

        assert.ok(JSON.parse(testsSchemaFileResource.readText()));
    });

    it('dialog resources are valid for schema', function () {
        this.timeout(50000);

        for (const resource of dialogs) {
            const fileResource = new FileResource(resource.fullName);
            const json = JSON.parse(fileResource.readText());
            const schema = json.$schema;

            // Everything should have $schema
            assert(schema);

            if (schema.startsWith('http')) {
                // NOTE: Some schemas are not local.  We don't validate against those because they often depend on the SDK itself.
                return;
            }

            const folder = path.dirname(fileResource.fullName);
            assert(fs.existsSync(path.join(folder, path.normalize(schema))), `$schema: ${schema}`);

            const omit = [
                'Action_SendActivity.test.dialog',
                'Action_BeginSkill.test.dialog',
                'Action_BeginSkillEndDialog.test.dialog',
                'Action_SendTabAuthResponseErrorWithAdapter.test.dialog',
                'Action_SendTaskModuleCardResponseError.test.dialog',
                'Action_SendAppBasedLinkQueryResponseError.test.dialog',
                'Action_SendTabCardResponseError.test.dialog',
                'Action_SendMEAuthResponseError.test.dialog',
                'Action_SendMESelectItemResponseError.test.dialog',
                'Action_SendMEAuthResponseErrorWithAdapter.test.dialog',
                'Action_SendMEMessageResponseError.test.dialog',
                'Action_SendMEBotMessagePreviewResponseError.test.dialog',
                'Action_SendMEConfigQuerySettingUrlResponseError.test.dialog',
                'Action_SendTabAuthResponseError.test.dialog',
                'TestScriptTests_OAuthInputLG.test.dialog',
            ];

            if (omit.some((e) => fileResource.fullName.includes(e))) {
                // Schema is in the omit list, end the test.
                return;
            }

            const v = new Validator();
            v.validate(json, testsSchema);
        }
    });
});
