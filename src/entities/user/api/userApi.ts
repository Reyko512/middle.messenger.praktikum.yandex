import { HTTPTransport } from '@shared/lib/http';
import { API_BASE } from '@shared/config/api';
import type {
  SearchUserRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  User,
} from '../model/types';

class UserApi {
  private readonly http = new HTTPTransport(`${API_BASE}/user`);

  public updateProfile(data: UpdateProfileRequest) {
    return this.http.put<User, UpdateProfileRequest>('/profile', { data });
  }

  public updatePassword(data: UpdatePasswordRequest) {
    return this.http.put<void, UpdatePasswordRequest>('/password', { data });
  }

  public updateAvatar(data: FormData) {
    return this.http.put<User, FormData>('/profile/avatar', { data });
  }

  public searchByLogin(data: SearchUserRequest) {
    return this.http.post<User[], SearchUserRequest>('/search', { data });
  }
}

export const userApi = new UserApi();
