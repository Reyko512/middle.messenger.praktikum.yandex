enum METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type Options<T> = {
  method: METHOD;
  data?: T;
  timeout?: number;
  headers?: Record<string, string>;
};

function queryStringify(data: Record<string, unknown>) {
  if (typeof data !== 'object' || !data) {
    throw new Error('Data must be object');
  }

  const keys = Object.keys(data);

  const encodeDataValue = (value: unknown) => {
    if (value === undefined || Object.is(value, null)) return value;

    if (value === Object) return value;

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return encodeURIComponent(value);
    }

    return value;
  };

  return keys.reduce((result, key, index) => {
    return `${result}${key}=${encodeDataValue(data[key])}${index < keys.length - 1 ? '&' : ''}`;
  }, '?');
}

type HTTPMethod<TData = unknown> = (
  url: string,
  options?: Omit<Options<TData>, 'method'>,
) => Promise<XMLHttpRequest>;

export default class HTTPTransport {
  private createMethod<TData = unknown>(
    method: METHOD,
  ): HTTPMethod<TData> {
    return (url, options = {}) =>
      this.request(url, { ...options, method });
  }

  get = this.createMethod(METHOD.GET);

  post = this.createMethod(METHOD.POST);

  put = this.createMethod(METHOD.PUT);

  delete = this.createMethod(METHOD.DELETE);

  request = (
    url: string,
    options: Options<unknown>,
  ): Promise<XMLHttpRequest> => {
    const { headers = {}, method, data } = options;

    return new Promise(function (resolve, reject) {
      if (!method) {
        reject('No method');
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHOD.GET;

      xhr.open(
        method,
        isGet && !!data
          ? `${url}${queryStringify(data as Record<string, unknown>)}`
          : url,
      );

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key] as string);
      });

      xhr.onload = function () {
        resolve(xhr);
      };

      xhr.onabort = reject;
      xhr.onerror = reject;

      xhr.timeout = options.timeout ?? 0;
      xhr.ontimeout = reject;

      if (isGet || !data) {
        xhr.send();
      } else {
        xhr.send(data as Document | XMLHttpRequestBodyInit);
      }
    });
  };
}
