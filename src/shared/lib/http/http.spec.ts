import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import HTTPTransport, { HTTPError } from './http';

type RequestHeaderMap = Record<string, string>;
type XHREventHandler = (() => void) | null;
type ResponsePayload = string | ArrayBuffer | Record<string, unknown> | undefined;

class FakeXMLHttpRequest {
  static lastInstance: FakeXMLHttpRequest | null = null;

  public method = '';
  public url = '';
  public timeout = 0;
  public withCredentials = false;
  public responseType: XMLHttpRequestResponseType = '';
  public status = 0;
  public responseText = '';
  public response: ResponsePayload = undefined;
  public requestBody: Document | XMLHttpRequestBodyInit | null = null;
  public readonly requestHeaders: RequestHeaderMap = {};
  public onload: XHREventHandler = null;
  public onerror: XHREventHandler = null;
  public onabort: XHREventHandler = null;
  public ontimeout: XHREventHandler = null;
  private readonly responseHeaders = new Map<string, string>();

  constructor() {
    FakeXMLHttpRequest.lastInstance = this;
  }

  public open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  public setRequestHeader(name: string, value: string) {
    this.requestHeaders[name] = value;
  }

  public getResponseHeader(name: string) {
    return this.responseHeaders.get(name.toLowerCase()) ?? null;
  }

  public send(body?: Document | XMLHttpRequestBodyInit | null) {
    this.requestBody = body ?? null;
  }

  public respond(status: number, body: ResponsePayload, headers: RequestHeaderMap = {}) {
    this.status = status;
    this.responseHeaders.clear();

    Object.entries(headers).forEach(([name, value]) => {
      this.responseHeaders.set(name.toLowerCase(), value);
    });

    if (this.responseType && this.responseType !== 'text') {
      this.response = body;
      this.responseText = '';
    } else if (typeof body === 'string') {
      this.response = body;
      this.responseText = body;
    } else if (body === undefined) {
      this.response = undefined;
      this.responseText = '';
    } else {
      this.response = body;
      this.responseText = JSON.stringify(body);
    }

    this.onload?.();
  }

  public failWithNetworkError() {
    this.onerror?.();
  }

  public failWithTimeout() {
    this.ontimeout?.();
  }
}

describe('HTTPTransport', () => {
  let originalXMLHttpRequestDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    FakeXMLHttpRequest.lastInstance = null;
    originalXMLHttpRequestDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'XMLHttpRequest');

    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: FakeXMLHttpRequest,
    });
  });

  afterEach(() => {
    if (originalXMLHttpRequestDescriptor) {
      Object.defineProperty(globalThis, 'XMLHttpRequest', originalXMLHttpRequestDescriptor);
      return;
    }

    Reflect.deleteProperty(globalThis, 'XMLHttpRequest');
  });

  it('serializes nested GET query parameters into the request URL', async () => {
    const transport = new HTTPTransport('https://api.test');
    const requestPromise = transport.get<{ ok: boolean }>('/messages', {
      data: {
        page: 2,
        filters: {
          unread: true,
        },
        labels: ['primary', 'social'],
      },
    });
    const request = FakeXMLHttpRequest.lastInstance as FakeXMLHttpRequest;

    expect(request.method).to.equal('GET');
    expect(request.url).to.equal(
      'https://api.test/messages?page=2&filters[unread]=true&labels[0]=primary&labels[1]=social',
    );
    expect(request.requestBody).to.equal(null);

    request.respond(200, { ok: true }, { 'Content-Type': 'application/json' });

    const response = await requestPromise;

    expect(response).to.deep.equal({ ok: true });
  });

  it('adds a JSON content type and stringifies request bodies for POST requests', async () => {
    const transport = new HTTPTransport('https://api.test');
    const requestPromise = transport.post<{ id: number }, { title: string }>('/messages', {
      data: {
        title: 'Hello',
      },
    });
    const request = FakeXMLHttpRequest.lastInstance as FakeXMLHttpRequest;

    expect(request.requestHeaders['Content-Type']).to.equal('application/json');
    expect(request.withCredentials).to.equal(true);
    expect(request.requestBody).to.equal(JSON.stringify({ title: 'Hello' }));

    request.respond(201, { id: 1 }, { 'Content-Type': 'application/json' });

    const response = await requestPromise;

    expect(response).to.deep.equal({ id: 1 });
  });

  it('does not override content type headers for FormData payloads', async () => {
    const formData = new FormData();
    formData.append('file', 'avatar');

    const transport = new HTTPTransport('https://api.test');
    const requestPromise = transport.post<string, FormData>('/resources', {
      data: formData,
      headers: {
        'X-Test': '1',
      },
    });
    const request = FakeXMLHttpRequest.lastInstance as FakeXMLHttpRequest;

    expect(request.requestHeaders).to.not.have.property('Content-Type');
    expect(request.requestHeaders['X-Test']).to.equal('1');
    expect(request.requestBody).to.equal(formData);

    request.respond(200, 'ok', { 'Content-Type': 'text/plain' });

    const response = await requestPromise;

    expect(response).to.equal('ok');
  });

  it('rejects with HTTPError when the server responds with a non-2xx status', async () => {
    const transport = new HTTPTransport('https://api.test');
    const requestPromise = transport.delete('/messages/1', {
      data: {
        permanent: true,
      },
    });
    const request = FakeXMLHttpRequest.lastInstance as FakeXMLHttpRequest;

    request.respond(400, { reason: 'Bad request' }, { 'Content-Type': 'application/json' });

    try {
      await requestPromise;
      expect.fail('Expected HTTPTransport to reject with HTTPError');
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPError);
      expect((error as HTTPError).status).to.equal(400);
      expect((error as HTTPError).reason).to.deep.equal({ reason: 'Bad request' });
    }
  });

  it('rejects with a timeout error when the request exceeds the timeout', async () => {
    const transport = new HTTPTransport('https://api.test');
    const requestPromise = transport.get('/messages');
    const request = FakeXMLHttpRequest.lastInstance as FakeXMLHttpRequest;

    request.failWithTimeout();

    try {
      await requestPromise;
      expect.fail('Expected HTTPTransport to reject on timeout');
    } catch (error) {
      expect((error as Error).message).to.equal('Request timeout');
    }
  });
});
