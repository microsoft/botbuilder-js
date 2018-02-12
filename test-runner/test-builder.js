const klaw = require('klaw');
const path = require('path');
const webpack = require('webpack');
const {exec} = require('child_process');
const outDir = path.join(__dirname, '/out/');
const chalk = require('chalk');

function getNormalizedWebpackConfig() {
    return {
        entry: {main: [path.join(__dirname, 'bootstrap.js')]},
        devtool: 'source-map',
        module: {
            noParse: /mocha|chai/,
            rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
        ],
        output: {
            filename: 'tests.bundle.js',
            path: outDir
        }
    };
}


async function buildTestFilesInPackage(testsPath) {
    const config = getNormalizedWebpackConfig();
    try {
        const testSuites = await findTestSuites(testsPath);
        config.entry.main.push(...testSuites);
    }
    catch (e) {
        return; //  not an error, we just did not find tests in this path
    }
    return new Promise((resolve, reject) => {
        webpack(config, (error, stats) => {
            error ? reject(error) : resolve(stats);
        });
    });
}

function findTestSuites(testsPath) {
    const testSuites = [];
    return new Promise((resolve, reject) => {
        klaw(testsPath, {filter: file => path.parse(file).ext === '.js'})
            .on('data', file => file.stats.size !== 0 ? testSuites.push(file.path) : null)
            .on('end', () => resolve(testSuites))
            .on('error', () => reject());
    });
}

async function runTests() {
    let failed = 0;
    const packages = await getPackages();
    for (let packagePath of packages) {
        const testsPath = path.join(packagePath, '/tests');
        process.stdout.write(chalk.bold.gray.bgGreen(`Webpacking test suites in ${packagePath}\n`));
        const buildStats = await buildTestFilesInPackage(testsPath);
        if (!buildStats) {
            process.stdout.write(chalk.bold.gray.bgRedBright(`Nothing to webpack ${testsPath}\n\n`));
            continue;
        }
        const {errors} = buildStats.compilation;
        if (errors && errors.length) {
            errors.forEach(error => console.log(chalk `{bold.black.bgRedBright Webpack Error: } {blue ${error.message}}`));
            console.log(chalk `{red.bold Webpack errors encountered when transpiling dependencies for ${packagePath}}`);
            failed = true;
            continue;
        }

        let results;
        try {
            process.stdout.write(chalk.bold.blue(`Webpacked successfully. Running tests for ${testsPath}...`));
            results = await runTest();
        } catch (error) {
            // break on runTest() for specifics on errors
            results = error;
            failed = true;
        }
        finally {
            process.stdout.write(results);
        }
    }
    return failed;
}

function runTest() {
    return new Promise((resolve, reject) => {
        exec(path.join(__dirname, '../node_modules/.bin/mocha-chrome index.html'), {
            cwd: __dirname,
            timeout: 30000
        }, (error, stdout, stderr) => {
            error || stderr ? reject(stdout) : resolve(stdout);
        });
    });

}

function getPackages() {
    return new Promise((resolve, reject) => {
        const packages = [];
        try {
            const packageName = /(?::)([\w-]+)/.exec(process.env.npm_lifecycle_event)[1];
            resolve([path.join(__dirname, '../libraries', packageName)]);
        } catch (error) {
            // run all tests within the libraries
            klaw(path.join(__dirname, '../libraries'), {depthLimit: 0})
                .on('data', data => data.stats.size === 0 ? packages.push(data.path) : null)
                .on('end', () => resolve(packages))
                .on('error', () => reject());
        }
    });
}

runTests().then(failed => process.exit(failed));