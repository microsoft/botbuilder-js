const assert = require('assert');
const { AzureBlobTranscriptStore, checkedCollectionsKey } = require('../');
const azure = require('azure-storage');
const expectedCalls = require('./TestData/expectedCalls');

// Mocks
class MockBlobService {
	constructor(storageAccount, storageAccessKey, host) {
		this.timeStamp = {getTime: () => 1546214400000};
		this.mockFunctionCalls = [ { constructor: { storageAccount, storageAccessKey, host } } ];
	}

	createBlockBlobFromText(container, blob, text, options, cb) {
		this.mockFunctionCalls.push({ createBlockBlobFromTextAsync: [ container, blob, text, options ] });
		return cb();
	}

	createContainerIfNotExists(container, cb) {
		this.mockFunctionCalls.push({ createContainerIfNotExistsAsync: [ container ] });
		return cb(null, { name: container });
	}

	deleteBlobIfExists(container, blob, cb) {
		this.mockFunctionCalls.push({ deleteBlobIfExistsAsync: [ container, blob ] });
		return cb();
	}

	deleteContainerIfExists(container, cb) {
		this.mockFunctionCalls.push({ deleteContainerIfExistsAsync: [ container ] });
		return cb();
	}

	getBlobMetadata(container, blob, cb) {
		this.mockFunctionCalls.push({ getBlobMetadataAsync: [ container, blob ] });
		return cb();
	}

	getBlobProperties(container, blob, cb) {
		this.mockFunctionCalls.push({ getBlobPropertiesAsync: [ container, blob ] });
		return cb();
	}

	getBlobToText(container, blob, cb) {
		this.mockFunctionCalls.push({ getBlobToTextAsync: [ container, blob ] });
		return cb(null, JSON.stringify(createActivity('123432', this.timeStamp)));
	}

	listBlobDirectoriesSegmentedWithPrefix(container, prefix, currentToken, cb) {
		this.mockFunctionCalls.push({ listBlobDirectoriesSegmentedWithPrefixAsync: [ container, prefix, currentToken ] });
		return cb(null, { entries: [ { name: 'blob1' }, { name: 'blob2' } ] });
	}

	listBlobsSegmentedWithPrefix(container, prefix, currentToken, options, cb) {
		this.mockFunctionCalls.push({ listBlobsSegmentedWithPrefixAsync: [ container, prefix, currentToken, options ] });
		return cb(null, {
			entries: [
				{ metadata: { timestamp: this.timeStamp.getTime() } },
				{ metadata: { timestamp: this.timeStamp.getTime() } },
				{ metadata: { timestamp: this.timeStamp.getTime() } }
			]
		});
	}

	setBlobMetadata(container, blob, metadata, cb) {
		this.mockFunctionCalls.push({ setBlobMetadataAsync: [ container, blob, metadata ] });
		return cb();
	}

	setBlobProperties(container, blob, propertiesAndOptions, cb) {
		this.mockFunctionCalls.push({ setBlobPropertiesAsync: [ container, blob, propertiesAndOptions ] });
		return cb();
	}

	withFilter(...args) {
		this.mockFunctionCalls.push({ withFilter: args });
		return this;
	}
}

const getSettings = (container = null) => ( {
	storageAccountOrConnectionString: 'UseDevelopmentStorage=true;',
	containerName: container || 'test-transcript',
	storageAccount: 'myAccount',
	storageAccessKey: '*(^&%*',
	host: 'none'
} );
const { createBlobService } = azure;
describe('The AzureBlobTranscriptStore', () => {
	let storage;
	let mockService;
	beforeEach(() => {
		for (let key of Reflect.ownKeys(AzureBlobTranscriptStore[ checkedCollectionsKey ])) {
			delete AzureBlobTranscriptStore[ checkedCollectionsKey ][ key ];
		}
		azure.createBlobService = (storageAccount, storageAccessKey, host) => {
			return ( mockService = new MockBlobService(storageAccount, storageAccessKey, host) );
		};
		storage = new AzureBlobTranscriptStore(getSettings());
	});
	after(() => {
		// reset mock
		azure.createBlobService = createBlobService;
	});

	describe('should throw when', () => {

		it('is constructed with null settings', () => {
			try {
				new AzureBlobTranscriptStore(null);
				assert.fail('Expected to throw but did not');
			} catch (e) {
				assert.ok(e.message === 'The settings parameter is required.', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('it is constructed with no container name', () => {
			try {
				new AzureBlobTranscriptStore({});
				assert.fail('Expected to throw but did not');
			} catch (e) {
				assert.ok(e.message === 'The containerName is required.', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('it is constructed with an invalid container name', () => {
			try {
				new AzureBlobTranscriptStore({ containerName: '$%^$@' });
				assert.fail('Expected to throw but did not');
			} catch (e) {
				assert.ok(e.message === 'Invalid container name.', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('it is constructed without the storageAccountOrConnectionString in the settings', () => {
			try {
				new AzureBlobTranscriptStore({ ...getSettings(), storageAccountOrConnectionString: '' });
				assert.fail('Expected to throw but did not');
			} catch (e) {
				assert.ok(e.message === 'The storageAccountOrConnectionString parameter is required.', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('no activity is passed to the "logActivity" function', async () => {
			try {
				await storage.logActivity(null);
				assert.fail('logActivity did not throw when a null activity was passed in');
			} catch (e) {
				assert.ok(e.message === 'Missing activity.', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('no channelId is passed to the "getTranscriptActivities" function', async () => {
			try {
				await storage.getTranscriptActivities(null, '123456');
				assert.fail('getTranscriptActivities did not throw when a null channelId was passed in');
			} catch (e) {
				assert.ok(e.message === 'Missing channelId', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('no conversationId is passed to the "getTranscriptActivities" function', async () => {
			try {
				await storage.getTranscriptActivities({});
				assert.fail('getTranscriptActivities did not throw when a null conversationId was passed in');
			} catch (e) {
				assert.ok(e.message === 'Missing conversationId', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('no channelId is passed to the "listTranscripts" function', async () => {
			try {
				await storage.listTranscripts();
				assert.fail('listTranscripts did not throw when a null channelId was passed in');
			} catch (e) {
				assert.ok(e.message === 'Missing channelId', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('no channelId is passed to the "deleteTranscript" function', async () => {
			try {
				await storage.deleteTranscript();
				assert.fail('deleteTranscript did not throw when a null channelId was passed in');
			} catch (e) {
				assert.ok(e.message === 'Missing channelId', `The error was: ${ e.message }, which was not expected`);
			}
		});

		it('no conversationId is passed to the "deleteTranscript" function', async () => {
			try {
				await storage.deleteTranscript({});
				assert.fail('deleteTranscript did not throw when a null conversationId was passed in');
			} catch (e) {
				assert.ok(e.message === 'Missing conversationId', `The error was: ${ e.message }, which was not expected`);
			}
		});
	});

	it('should log an activity', async () => {
		const date = new Date(1546214400000);
		const activity = createActivity('logActivityTest', date);
		await storage.logActivity(activity);
		const { mockFunctionCalls } = mockService;
		const { logActivity } = expectedCalls;
		assert.ok(mockFunctionCalls.length === 6, `Expected 6 function calls but received ${ mockService.mockFunctionCalls.length }`);
		mockFunctionCalls.forEach((call, index) => {
			assert.ok(JSON.stringify(call) === JSON.stringify(logActivity[ index ]), `Expected: ${ JSON.stringify(logActivity[ index ]) } but got: ${ JSON.stringify(call) }`);
		});
	});

	it('should delete a transcript', async () => {
		await storage.deleteTranscript('deleteTranscript', '1234');
		const { mockFunctionCalls } = mockService;
		const { deleteTranscript } = expectedCalls;
		mockFunctionCalls.forEach((call, index) => {
			assert.ok(JSON.stringify(call) === JSON.stringify(deleteTranscript[ index ]));
		});
	});

	it('get transcript activities', async () => {
		await storage.getTranscriptActivities('getTranscriptActivities', '1234', null, mockService.timeStamp);
		const { mockFunctionCalls } = mockService;
		const { getTranscriptActivities } = expectedCalls;
		mockFunctionCalls.forEach((call, index) => {
			assert.ok(JSON.stringify(call) === JSON.stringify(getTranscriptActivities[ index ]));
		});
	});

	it('should list transcripts', async () => {
		const result = await storage.listTranscripts('listTranscripts');
		const { mockFunctionCalls } = mockService;
		const { listTranscripts } = expectedCalls;
		mockFunctionCalls.forEach((call, index) => {
			assert.ok(JSON.stringify(call) === JSON.stringify(listTranscripts[ index ]));
		});
		assert.ok(JSON.stringify(result) === JSON.stringify(expectedCalls.listTranscriptResult));
	});
});

function createActivity(conversationId, ts) {
	return {
		type: 'message',
		timestamp: ts,
		id: 1,
		text: "testMessage",
		channelId: 'test',
		from: { id: `User1` },
		conversation: { id: conversationId },
		recipient: { id: 'Bot1', name: '2' },
		serviceUrl: 'http://foo.com/api/messages'
	};
}
