const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const {spawn} = require('child_process');
const qnamaker = path.resolve('../bin/qnamaker');
const txtfile = require('read-text-file');

describe('The LUIS cli --init argument', () => {
    const rcPath = path.resolve('.qnamakerrc');
    beforeEach(async () => {
        try {
            const rc = await fs.stat(rcPath);
            if (rc) {
                await fs.unlink(path.resolve('.qnamakerrc'));
            }
        } catch (e) {
            // do noting
        }
    });

    it('should prompt the user though the creation of the .qnamakerrc and write the file', async () => {
        const qnamakerProcess = spawn('node', [qnamaker, '--init'], {stdio: ['pipe', 'pipe', process.stderr]});
        let msgCt = 0;
        const subscriptionKey = Math.floor(Math.random() * 9999999);
        const knowledgeBaseId = Math.floor(Math.random() * 111111);
        const location = 'westus';

        await new Promise(resolve => {
            qnamakerProcess.stdout.on('data', data => {
                const message = (msgCt++, data.toString().toLowerCase());

                switch (msgCt) {
                    case 1:
                        assert(message === '\nthis util will walk you through creating a .qnamakerrc file\n\npress ^c at any time to quit.\n\n');
                        break;

                    case 2:
                        assert(message.includes('knowledge'));
                        qnamakerProcess.stdin.write(`${knowledgeBaseId}\r`);
                        break;
                    
                    case 3:
                        assert(message.includes('key'));
                        qnamakerProcess.stdin.write(`${subscriptionKey}\r`);
                        break;

                    case 4:
                        assert(message.includes('region'));
                        qnamakerProcess.stdin.write(`${location}\r`);
                        break;

                    case 5:
                        assert(message.includes('does this look ok?'));
                        qnamakerProcess.stdin.write('yes\r');
                        break;

                    case 6:
                        assert(fs.statSync(rcPath));
                        resolve();
                        break;
                }
            });
        });

        const rc = JSON.parse(await txtfile.read(rcPath));
        assert(rc.subscriptionKey === '' + subscriptionKey);
        assert(rc.knowledgeBaseID === '' + knowledgeBaseId);
        assert(rc.endpoint === `https://${location}.api.cognitive.microsoft.com/qnamaker/v2.0`);
    });
});
