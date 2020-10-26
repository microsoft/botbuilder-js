import pmap from 'p-map';
import { exec } from 'child_process';
import { promisify } from 'util';

const execp = promisify(exec);

// TODO: ANTLR breaks 3.1
const versions = [/*'3.1',*/ '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '4.0'];

(async () => {
    try {
        console.log(`Running typescript consumer test against ["${versions.join('", "')}"]`);

        await pmap(
            versions,
            async (version) => {
                try {
                    await execp(`npx -p typescript@${version} tsc -p tsconfig-test.json`);
                } catch (error) {
                    throw new Error(`Copmilation failed for typescript@${version}`);
                }

                try {
                    await execp(`npx -p typescript@${version} tsc -p tsconfig-test.json --lib es2018`);
                } catch (error) {
                    throw new Error(`Copmilation failed for typescript@${version} --lib es2018`);
                }
            },
            { concurrency: 3 }
        );

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
