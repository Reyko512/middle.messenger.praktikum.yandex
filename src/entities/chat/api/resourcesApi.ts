import { HTTPTransport } from '@shared/lib/http';
import { API_BASE } from '@shared/config/api';
import type { ChatFileResource } from '../model/types';

class ResourcesApi {
  private readonly http = new HTTPTransport(`${API_BASE}/resources`);

  public upload(data: FormData) {
    return this.http.post<ChatFileResource, FormData>('/', {
      data,
    });
  }
}

export const resourcesApi = new ResourcesApi();
