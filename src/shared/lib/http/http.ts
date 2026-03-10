enum METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type QueryParamPrimitive = string | number | boolean | null | undefined;
type QueryParamValue =
  | QueryParamPrimitive
  | QueryParamValue[]
  | { [key: string]: QueryParamValue };
type QueryParams = Record<string, QueryParamValue>;

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };
type JSONObject = { [key: string]: JSONValue };
type HTTPErrorReason = JSONValue | undefined;

type RequestData = object | FormData | undefined;

type RequestOptions<TData extends RequestData = undefined> = {
  method: METHOD;
  data?: TData;
  timeout?: number;
  headers?: Record<string, string>;
  responseType?: XMLHttpRequestResponseType;
};

type MethodOptions<TData extends RequestData> = Omit<
  RequestOptions<TData>,
  'method'
>;

const DEFAULT_TIMEOUT = 5000;

function hasBody(method: METHOD) {
  return method !== METHOD.GET;
}

function hasHeader(headers: Record<string, string>, headerName: string) {
  const normalizedHeaderName = headerName.toLowerCase();

  return Object.keys(headers).some(
    (key) => key.toLowerCase() === normalizedHeaderName,
  );
}

function isQueryParamValue(value: RequestData | QueryParamValue): value is QueryParamValue {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isQueryParamValue(item));
  }

  if (value instanceof FormData || typeof value !== 'object') {
    return false;
  }

  return Object.values(value).every((item) => isQueryParamValue(item));
}

function isQueryParams(data: RequestData): data is QueryParams {
  if (!data || data instanceof FormData || Array.isArray(data)) {
    return false;
  }

  return isQueryParamValue(data);
}

function queryStringify(data: QueryParams) {
  const query: string[] = [];

  const encodeKey = (key: string) => encodeURIComponent(key);

  const visit = (key: string, value: QueryParamValue) => {
    if (value === null || value === undefined) {
      return;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      query.push(`${key}=${encodeURIComponent(String(value))}`);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        visit(`${key}[${index}]`, item);
      });
      return;
    }

    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      visit(`${key}[${encodeKey(nestedKey)}]`, nestedValue);
    });
  };

  Object.entries(data).forEach(([key, value]) => {
    visit(encodeKey(key), value);
  });

  if (!query.length) {
    return '';
  }

  return `?${query.join('&')}`;
}

function buildRequestUrl(
  baseUrl: string,
  url: string,
  method: METHOD,
  data: RequestData,
) {
  if (method === METHOD.GET && isQueryParams(data)) {
    return `${baseUrl}${url}${queryStringify(data)}`;
  }

  return `${baseUrl}${url}`;
}

function buildHeaders(
  method: METHOD,
  data: RequestData,
  headers: Record<string, string> = {},
) {
  if (
    !hasBody(method) ||
    data === undefined ||
    data instanceof FormData ||
    hasHeader(headers, 'Content-Type')
  ) {
    return headers;
  }

  return {
    ...headers,
    'Content-Type': 'application/json',
  };
}

function buildRequestBody(data: RequestData) {
  if (data === undefined) {
    return undefined;
  }

  if (data instanceof FormData) {
    return data;
  }

  return JSON.stringify(data);
}

function parseResponseBody<TResponse>(
  xhr: XMLHttpRequest,
  responseType: XMLHttpRequestResponseType,
): TResponse {
  if (responseType && responseType !== 'text') {
    return xhr.response as TResponse;
  }

  const responseText = xhr.responseText;

  if (!responseText) {
    return undefined as TResponse;
  }

  const contentType = xhr.getResponseHeader('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return JSON.parse(responseText) as TResponse;
  }

  return responseText as TResponse;
}

export class HTTPError extends Error {
  public readonly status: number;
  public readonly reason: HTTPErrorReason;

  constructor(status: number, reason: HTTPErrorReason) {
    super(`HTTP ${status}`);
    this.status = status;
    this.reason = reason;
  }
}

export default class HTTPTransport {
  private readonly baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  public get<TResponse, TData extends object = QueryParams>(
    url: string,
    options?: MethodOptions<TData>,
  ) {
    return this.request<TResponse, TData>(url, {
      ...options,
      method: METHOD.GET,
    });
  }

  public post<TResponse, TData extends RequestData = JSONObject>(
    url: string,
    options?: MethodOptions<TData>,
  ) {
    return this.request<TResponse, TData>(url, {
      ...options,
      method: METHOD.POST,
    });
  }

  public put<TResponse, TData extends RequestData = JSONObject>(
    url: string,
    options?: MethodOptions<TData>,
  ) {
    return this.request<TResponse, TData>(url, {
      ...options,
      method: METHOD.PUT,
    });
  }

  public delete<TResponse, TData extends RequestData = JSONObject>(
    url: string,
    options?: MethodOptions<TData>,
  ) {
    return this.request<TResponse, TData>(url, {
      ...options,
      method: METHOD.DELETE,
    });
  }

  public request<TResponse, TData extends RequestData = undefined>(
    url: string,
    options: RequestOptions<TData>,
  ): Promise<TResponse> {
    const {
      method,
      data,
      headers = {},
      timeout = DEFAULT_TIMEOUT,
      responseType = '',
    } = options;

    return new Promise<TResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const requestUrl = buildRequestUrl(this.baseUrl, url, method, data);
      const requestHeaders = buildHeaders(method, data, headers);

      xhr.open(method, requestUrl);
      xhr.timeout = timeout;
      xhr.withCredentials = true;
      xhr.responseType = responseType;

      Object.entries(requestHeaders).forEach(([headerName, headerValue]) => {
        xhr.setRequestHeader(headerName, headerValue);
      });

      xhr.onload = () => {
        const payload = parseResponseBody<TResponse | HTTPErrorReason>(
          xhr,
          responseType,
        );

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload as TResponse);
          return;
        }

        reject(new HTTPError(xhr.status, payload as HTTPErrorReason));
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.onabort = () => {
        reject(new Error('Request aborted'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      if (!hasBody(method) || data === undefined) {
        xhr.send();
        return;
      }

      xhr.send(buildRequestBody(data));
    });
  }
}
