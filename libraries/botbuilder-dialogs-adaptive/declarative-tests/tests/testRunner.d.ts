export declare class TestRunner {
    private resourcePath;
    private typeLoader;
    constructor(resourcePath: string);
    runTestScript(testName: string): Promise<void>;
    static readPackageJson(path: string): Promise<string>;
}
