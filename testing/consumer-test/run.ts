import minimist from 'minimist';
import pmap from 'p-map';
import { exec } from 'child_process';
import { promisify } from 'util';

const execp = promisify(exec);

const versions = ['3.5', '3.6', '3.7', '3.8', '3.9', '4.0', '4.1', '4.2', '4.3'];

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
