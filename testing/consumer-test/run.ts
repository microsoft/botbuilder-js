import pmap from 'p-map';
import { exec } from 'child_process';
import { promisify } from 'util';

const execp = promisify(exec);

// TODO: ANTLR breaks 3.1
const versions = [/*'3.1', '3.2',*/ '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '4.0'];

(async () => {
    try {
        console.log(`Running typescript consumer test against ["${versions.join('", "')}"]`);

        const results = await pmap(
            versions,
            (version) =>
                Promise.all([
                    execp(`npx -p typescript@${version} tsc -p tsconfig-test.json`),
                    execp(`npx -p typescript@${version} tsc -p tsconfig-test.json --lib es2018`),
                ])
                    .then(() => ({ err: null, version, success: true }))
                    .catch((err) => ({ err, version, success: false })),
            { concurrency: 2 }
        );

        const failed = results.filter(({ success }) => success === false);
        if (failed.length) {
            failed.map(({ err, version }) => console.error(`typescript@${version} failed`, err));
            return process.exit(1);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
})();
