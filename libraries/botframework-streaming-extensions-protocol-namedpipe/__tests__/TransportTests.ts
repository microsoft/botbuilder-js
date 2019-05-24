import { Transport } from '../src/Transport';
import { connect as netconnect, createServer, Server, Socket } from 'net';

class TestServer {
  private readonly _baseName: string;
  private _server: Server;
  public transport: Transport;

  constructor(baseName: string) {
    this._baseName = baseName;
  }

  public connect(): Promise<void> {
    let pipeName: string = Transport.PipePath + this._baseName;

    let connectResolve: () => void;

    let result = new Promise<void>((resolve, reject) => {
      connectResolve = resolve;
    });

    this._server = new Server((socket: Socket) => {
      this.transport = new Transport(socket, '');
      connectResolve();
    });
    this._server.listen(pipeName);

    return result;
  }

  public disconnect() {
    if (this.transport) {
      this.transport.close();
      this.transport = undefined;
    }

    if (this._server) {
      this._server.close();
      this._server = undefined;
    }
  }
}

class TestClient {
  private readonly _baseName: string;
  public transport: Transport;

  constructor(baseName: string) {
    this._baseName = baseName;
  }

  public connect(): Promise<void> {
    let pipeName: string = Transport.PipePath + this._baseName;

    let socket = netconnect(pipeName);
    this.transport = new Transport(socket, '');

    return Promise.resolve();
  }

  public disconnect() {
    if (this.transport) {
      this.transport.close();
      this.transport = undefined;
    }
  }
}

function connect(s: TestServer, c: TestClient): Promise<boolean> {
  var p = new Promise<boolean>((resolve, reject) => {
    var clientConnected = false;
    var serverConnected = false;

    s.connect().then(() => {
      serverConnected = true;
      if (clientConnected && serverConnected) {
        resolve(true);
      }
    });

    c.connect().then(() => {
      clientConnected = true;
      if (clientConnected && serverConnected) {
        resolve(true);
      }
    });
  });

  return p;
}

test('Client connect', () => {
  let pipeName = "t1";
  let c = new TestClient(pipeName);
  let t = c.connect();
  expect(t).toBeDefined();
  c.disconnect();
});

test('Client cannot send while connecting', async () => {
  let pipeName = "t1";
  let c = new TestClient(pipeName);
  await c.connect();

  var b = new Buffer("12345", "utf8");

  let count = c.transport.send(b);

  expect(count).toBe(0);

  c.disconnect();
});

test('End to end send and receive', async () => {
  let pipeName = "ex1";
  let s = new TestServer(pipeName);
  let c = new TestClient(pipeName);

  await connect(s, c);

  var b = new Buffer("12345", "utf8");

  // send client to server
  let count = c.transport.send(b);
  expect(count).toBe(b.length);

  // receive at server
  let received = await s.transport.receiveAsync(b.length);
  expect(received.length).toBe(b.length);
  expect(received.toString('utf8')).toBe('12345');

  c.disconnect();
  s.disconnect();
});
