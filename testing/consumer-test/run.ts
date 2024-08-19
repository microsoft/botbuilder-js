import minimist from 'minimist';
import pmap from 'p-map';
import { exec } from 'child_process';
import { promisify } from 'util';

const execp = promisify(exec);

const versions = ['4.5', '4.6', '4.7', '4.8', '4.9', '5.0', '5.1', '5.2', '5.3', '5.4', '5.5'];

(async () => {
    const flags = minimist(process.argv.slice(2), {
        boolean: ['versbose'],
        alias: { v: 'verbose' },
    });

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

        const initialValue: { success: string[]; failed: string[] } = {
            success: [],
            failed: [],
        };

        const { success, failed } = results.reduce((acc, result) => {
            if (result.success) {
                acc.success.push(result.version);
            } else {
                acc.failed.push(result.version);
            }

            return acc;
        }, initialValue);

        console.log('Success:', success);
        console.log('Failed:', failed);

        if (flags.verbose) {
            results
                .filter(({ success }) => success === false)
                .forEach(({ err, version }) => console.error(`typescript@${version}`, err));
        }

        process.exit(failed.length ? 1 : 0);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
})();
