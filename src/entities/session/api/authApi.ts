import { HTTPTransport } from '@shared/lib/http';
import { API_BASE } from '@shared/config/api';
import type { SignInRequest, SignUpRequest } from '../model/types';
import type { User } from '@entities/user';

class AuthApi {
  private readonly http = new HTTPTransport(`${API_BASE}/auth`);

  public signUp(data: SignUpRequest) {
    return this.http.post<void, SignUpRequest>('/signup', { data });
  }

  public signIn(data: SignInRequest) {
    return this.http.post<void, SignInRequest>('/signin', { data });
  }

  public logout() {
    return this.http.post<void, undefined>('/logout');
  }

  public readUser() {
    return this.http.get<User>('/user');
  }
}

export const authApi = new AuthApi();
