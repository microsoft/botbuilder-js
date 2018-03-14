const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const {spawn} = require('child_process');
const luis = path.resolve('../bin/luis');

describe('The LUIS cli --init argument', () => {
    const rcPath = path.resolve('.luisrc');
    beforeEach(async () => {
        try {
            const rc = await fs.stat(rcPath);
            if (rc) {
                await fs.unlink(path.resolve('.luisrc'));
            }
        } catch (e) {
            // do noting
        }
    });

    it('should prompt the user though the creation of the .luisrc and write the file', async () => {
        const luisProcess = spawn('node', [luis, '--init'], {stdio: ['pipe', 'pipe', process.stderr]});
        let msgCt = 0;
        const appId = Math.floor(Math.random() * 9999999);
        const versionId = Math.floor(Math.random() * 111111);
        const location = Math.floor(Math.random() * 8888888);

        await new Promise(resolve => {
            luisProcess.stdout.on('data', data => {
                const message = (msgCt++, data.toString());

                switch (msgCt) {
                    case 1:
                        assert(message === '\nThis util will walk you through creating a .luisrc file\n\nPress ^C at any time to quit.\n\n');
                        break;

                    case 2:
                        assert(message === 'Subscription key: ');
                        luisProcess.stdin.write('abc123\r');
                        break;

                    case 3:
                        assert(message === 'Region: ');
                        luisProcess.stdin.write(`${location}\r`);
                        break;

                    case 4:
                        assert(message === 'App ID: ');
                        luisProcess.stdin.write(`${appId}\r`);
                        break;

                    case 5:
                        assert(message === 'Version ID: ');
                        luisProcess.stdin.write(`${versionId}\r`);
                        break;

                    case 6:
                        assert(message.includes('Does this look ok?'));
                        luisProcess.stdin.write('yes\r');
                        break;

                    case 7:
                        assert(fs.statSync(rcPath));
                        resolve();
                        break;
                }
            });
        });

        const rc = await fs.readJson(rcPath);
        assert(rc.appId === '' + appId);
        assert(rc.versionId === '' + versionId);
        assert(rc.endpointBasePath === `https://${location}.api.cognitive.microsoft.com/luis/api/v2.0`);
    });
});