import { NamedPipeServer } from '../src/NamedPipeServer';
import { NamedPipeClient } from '../src/NamedPipeClient';
import {
  CancellationToken,
  ReceiveRequest,
  ReceiveResponse,
  Request,
  RequestHandler,
  Response,
  ContentStream,
  Stream
} from 'botframework-streaming-extensions-protocol';
const uuidv4 = require('uuid/v4');

class MockRequestHandler implements RequestHandler {
  private _callback: (ReceiveRequest) => any;

  public constructor(callback: (request: ReceiveRequest) => any) {
    this._callback = callback;
  }

  public async processRequestAsync(request: ReceiveRequest, logger?): Promise<Response> {
    return this._callback(request);
  }
}

class PendingResponse {
  public validate: (request: ReceiveRequest) => Promise<void>;
  public response: Response;
}

class MockFlow {
  private _pipeName: string;
  private _client: NamedPipeClient;
  private _server: NamedPipeServer;
  private _pendingResponses = {};
  private _requestHandler: MockRequestHandler;

  public constructor(pipeName?: string) {
    if (!pipeName) {
      pipeName = uuidv4();
    }
    this._pipeName = pipeName;

    this._requestHandler = new MockRequestHandler((request: ReceiveRequest) => this.onReceive(request));
    this._client = new NamedPipeClient(this._pipeName, this._requestHandler, false);
    this._server = new NamedPipeServer(this._pipeName, this._requestHandler, false);
  }

  public connect(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let clientConnected = false;
      let serverConnected = false;

      this._server.startAsync().then(msg => {
        serverConnected = true;
        if (clientConnected && serverConnected) {
          resolve(true);
        }
      });

      this._client.connectAsync().then(() => {
        clientConnected = true;
        if (clientConnected && serverConnected) {
          resolve(true);
        }
      });
    });
  }

  public clientSend(request: Request, serverResponse: Response, validate?: (request: ReceiveRequest) => Promise<void>): Promise<ReceiveResponse> {
    this._pendingResponses[this.getKey(request.Verb, request.Path)] = { response: serverResponse, validate: validate };
    return this._client.sendAsync(request, undefined);
  }

  public serverSend(request: Request, clientResponse: Response, validate?: (request: ReceiveRequest) => Promise<void>): Promise<ReceiveResponse> {
    this._pendingResponses[this.getKey(request.Verb, request.Path)] = { response: clientResponse, validate: validate };
    return this._server.sendAsync(request, undefined);
  }

  public disconnect() {
    this._client.disconnect();
    this._server.disconnect();
  }

  private async onReceive(request: ReceiveRequest): Promise<Response> {
    var pendingResponse: PendingResponse = this._pendingResponses[this.getKey(request.Verb, request.Path)];
    if (pendingResponse.validate) {
      await pendingResponse.validate(request);
    }
    return pendingResponse.response;
  }

  private getKey(verb: string, path: string): string {
    return verb + ":" + path;
  }
}


test('send from client to server', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var request = Request.create('GET', '/.bot/conversations');
    var response = Response.create(200);

    var receiveResponse = await mock.clientSend(request, response);

    expect(receiveResponse.StatusCode).toBe(200);
  }
  finally {
    mock.disconnect();
  }
});

test('send from server to client', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var request = Request.create('POST', '/.bot/conversations/activities');
    var response = Response.create(201);

    var receiveResponse = await mock.serverSend(request, response);

    expect(receiveResponse.StatusCode).toBe(201);
  }
  finally {
    mock.disconnect();
  }
});


test('send both', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {

    var r1 = await mock.serverSend(
      Request.create('POST', '/.bot/conversations/activities'),
      Response.create(201));

    var r2 = await mock.clientSend(
      Request.create('GET', '/.bot/conversations'),
      Response.create(200));


    expect(r1.StatusCode).toBe(201);
    expect(r2.StatusCode).toBe(200);
  }
  finally {
    mock.disconnect();
  }
});

test('send string body from client to server', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var content = "Streaming FTW!";
    var request = Request.create('GET', '/.bot/conversations');
    request.setBody(JSON.stringify(content));
    var response = Response.create(200);

    var receiveResponse = await mock.clientSend(request, response, async (rr: ReceiveRequest): Promise<void> => {
      expect(rr.Streams).toBeDefined();
      expect(rr.Streams.length).toBe(1);
      let resultBody = await rr.Streams[0].readAsJson<string>();

      expect(resultBody).toBe(content);
    });

    expect(receiveResponse.StatusCode).toBe(200);
  }
  finally {
    mock.disconnect();
  }
});

test('send object body from client to server', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var content = { message: "Streaming FTW!" };
    var request = Request.create('GET', '/.bot/conversations');
    request.setBody(JSON.stringify(content));
    var response = Response.create(200);

    var receiveResponse = await mock.clientSend(request, response, async (rr: ReceiveRequest): Promise<void> => {
      expect(rr.Streams).toBeDefined();
      expect(rr.Streams.length).toBe(1);
      let resultObj = await rr.Streams[0].readAsJson<any>();

      expect(resultObj.message).toBe(content.message);
    });

    expect(receiveResponse.StatusCode).toBe(200);
  }
  finally {
    mock.disconnect();
  }
});

test('send object body from server to client', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var content = { message: "Streaming FTW!" };
    var request = Request.create('POST', '/.bot/conversations');
    request.setBody(JSON.stringify(content));
    var response = Response.create(200);

    var receiveResponse = await mock.serverSend(request, response, async (rr: ReceiveRequest): Promise<void> => {
      expect(rr.Streams).toBeDefined();
      expect(rr.Streams.length).toBe(1);
      let resultObj = await rr.Streams[0].readAsJson<any>();

      expect(resultObj.message).toBe(content.message);
    });

    expect(receiveResponse.StatusCode).toBe(200);
  }
  finally {
    mock.disconnect();
  }
});

test('reply with object body from server to client', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var content = { message: "Streaming FTW!" };
    var request = Request.create('GET', '/.bot/conversations');
    var response = Response.create(200);
    response.setBody(content);

    var rr = await mock.serverSend(request, response);

    expect(rr.StatusCode).toBe(200);
    expect(rr.Streams).toBeDefined();
    expect(rr.Streams.length).toBe(1);
    let resultObj = await rr.Streams[0].readAsJson<any>();

    expect(resultObj.message).toBe(content.message);
  }
  finally {
    mock.disconnect();
  }
});

test('send and receive both with bodies', async () => {
  var mock = new MockFlow();

  await mock.connect();

  try {
    var requestBody = { message: "Yo! Yo! I am the request body!!" };
    var request = Request.create('GET', '/.bot/conversations');
    request.setBody(JSON.stringify(requestBody));
    var response = Response.create(200);
    var responseBody = { message: "I am the reply body. Hear my meow!" };
    response.setBody(responseBody);

    var rr = await mock.serverSend(request, response, async (rr: ReceiveRequest): Promise<void> => {
      expect(rr.Streams).toBeDefined();
      expect(rr.Streams.length).toBe(1);
      let resultObj = await rr.Streams[0].readAsJson<any>();

      expect(resultObj.message).toBe(requestBody.message);
    });

    expect(rr.StatusCode).toBe(200);
    expect(rr.Streams).toBeDefined();
    expect(rr.Streams.length).toBe(1);
    let resultObj = await rr.Streams[0].readAsJson<any>();

    expect(resultObj.message).toBe(responseBody.message);
  }
  finally {
    mock.disconnect();
  }
});
