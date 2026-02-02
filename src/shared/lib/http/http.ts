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

type OptionsWithoutMethod<T> = Omit<Options<T>, 'method'>;

function queryStringify(data: Record<string, unknown>) {
  if (typeof data !== 'object' || !data) {
    throw new Error('Data must be object');
  }

  const keys = Object.keys(data);
  return keys.reduce((result, key, index) => {
    return `${result}${key}=${data[key]}${index < keys.length - 1 ? '&' : ''}`;
  }, '?');
}

export default class HTTPTransport {
  get = (url: string, options: OptionsWithoutMethod<undefined> = {}) => {
    return this.request(
      url,
      { ...options, method: METHOD.GET },
      options.timeout,
    );
  };

  post = <TData>(
    url: string,
    options: OptionsWithoutMethod<TData> = {},
  ) => {
    return this.request<TData>(
      url,
      { ...options, method: METHOD.POST },
      options.timeout,
    );
  };

  put = <TData>(
    url: string,
    options: OptionsWithoutMethod<TData> = {},
  ) => {
    return this.request<TData>(
      url,
      { ...options, method: METHOD.PUT },
      options.timeout,
    );
  };

  delete = (
    url: string,
    options: OptionsWithoutMethod<undefined> = {},
  ) => {
    return this.request(
      url,
      { ...options, method: METHOD.DELETE },
      options.timeout,
    );
  };

  request = <TData>(
    url: string,
    options: Options<TData> = {} as Options<TData>,
    timeout = 5000,
  ) => {
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
        isGet && !!data ? `${url}${queryStringify(data)}` : url,
      );

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key] as string);
      });

      xhr.onload = function () {
        resolve(xhr);
      };

      xhr.onabort = reject;
      xhr.onerror = reject;

      xhr.timeout = timeout;
      xhr.ontimeout = reject;

      if (isGet || !data) {
        xhr.send();
      } else {
        xhr.send(data as Document | XMLHttpRequestBodyInit);
      }
    });
  };
}
