const { FolderResourceProvider, ResourceExplorer, FileResource } = require('../lib');
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const Validator = require('jsonschema').Validator;
const util = require('util');
// eslint-disable-next-line security/detect-child-process
const exec = util.promisify(require('child_process').exec);

// Note: This file is intentionally not named *.test.js to ensure it isn't run
// via `yarn run test` or `npm run test`.

async function runCommand(command) {
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        throw new Error(stderr);
    }

    return stdout;
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
    // This will install the latest version of botframework-cli if the schema changed and npm is present.
    // This only runs on Windows platforms.
    it('should merge dialog schemas', async function () {
        this.timeout(150000);
        fs.unlinkSync(testsSchemaPath);

        // Merge all schema files.
        const mergeCommand = [
            'bf dialog:merge ./libraries/**/*.schema',
            './libraries/**/*.uischema',
            '"!"**/testbot.schema',
            '"!"**/botbuilder-dialogs-adaptive/tests/schema/*.*',
            `-o "${testsSchemaPath}"`,
        ];
        try {
            await runCommand(mergeCommand.join(' '));
        } catch (err) {
            // We may get there because there was an error running bf dialog:merge.
            // Try installing latest bf if the schema changed to make sure the
            // discrepancy is not because we are using a different version of the CLI
            // and we ensure it is installed while on it.
            try {
                // Rerun merge command.
                await runCommand(
                    [
                        'npx -p @microsoft/botframework-cli@next', // invoke with npx to not alter repo dependencies
                        ...mergeCommand,
                    ].join(' ')
                );
            } catch (err2) {
                assert.fail(`Unable to merge schemas.\nFirst error:\n${err}\nSecond error:\n${err2}`);
            }
        }

        if (process.env.CI) {
            // Check that newly-generated schema matches the schema from before the `dialog:merge`
            // command was run. We only test for this in CI because these files are expected to differ
            // when this test is run locally.
            const newSchema = fs.existsSync(testsSchemaPath) && JSON.parse(testsSchemaFileResource.readText());
            assert.deepStrictEqual(
                newSchema,
                testsSchema,
                [
                    'Generated schema differs from committed schema.',
                    'Run this test locally and commit the tests.*schema files to upload the correct and updated schema.',
                ].join('\n')
            );
        }

        assert.ok(JSON.parse(testsSchemaFileResource.readText()));
    });

    it('dialog resources are valid for schema', function () {
        this.timeout(100000);

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
