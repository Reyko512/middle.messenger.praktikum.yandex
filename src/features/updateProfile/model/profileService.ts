import { userApi } from '@entities/user';
import type {
  UpdatePasswordRequest,
  UpdateProfileRequest,
  User,
} from '@entities/user';
import { normalizeError } from '@shared/lib/network/normalizeError';
import { appStore } from '@app/model';

class ProfileService {
  public async updateProfile(payload: UpdateProfileRequest) {
    try {
      const user = await userApi.updateProfile(payload);
      appStore.setState({
        user,
        globalError: null,
      });
      return user;
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async updatePassword(payload: UpdatePasswordRequest) {
    try {
      await userApi.updatePassword(payload);
      appStore.setState({
        globalError: null,
      });
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const user = await userApi.updateAvatar(formData);
      appStore.setState({
        user,
        globalError: null,
      });
      return user;
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async findUsersByLogin(login: string) {
    try {
      const users = await userApi.searchByLogin({ login });
      appStore.setState({
        globalError: null,
      });
      return users;
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async findFirstUserByLogin(login: string): Promise<User | null> {
    const users = await this.findUsersByLogin(login);
    return users[0] ?? null;
  }
}

export const profileService = new ProfileService();
