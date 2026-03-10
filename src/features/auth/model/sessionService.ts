import { authApi } from '@entities/session';
import type { SignInRequest, SignUpRequest } from '@entities/session';
import { normalizeError } from '@shared/lib/network/normalizeError';
import { appStore } from '@app/model';

function resetChatState() {
  appStore.setState({
    chats: [],
    selectedChatId: null,
    selectedChatUsers: [],
    messagesByChatId: {},
    chatHistoryLoadingByChatId: {},
    socketStatusByChatId: {},
  });
  sessionStorage.removeItem('selectedChatId');
}

class SessionService {
  private cleanupHandler: () => void = () => undefined;

  public registerCleanupHandler(handler: () => void) {
    this.cleanupHandler = handler;
  }

  public expire(message = 'Session expired. Sign in again.') {
    this.cleanupHandler();
    resetChatState();
    appStore.setState({
      user: null,
      isAuthenticated: false,
      isAuthChecked: true,
      globalError: message,
    });
  }

  public async restore() {
    try {
      const user = await authApi.readUser();
      appStore.setState({
        user,
        isAuthenticated: true,
        globalError: null,
      });
    } catch {
      this.cleanupHandler();
      appStore.setState({
        user: null,
        isAuthenticated: false,
      });
      resetChatState();
    } finally {
      appStore.setState({
        isAuthChecked: true,
      });
    }
  }

  public async signIn(payload: SignInRequest) {
    try {
      await authApi.signIn(payload);
      const user = await authApi.readUser();

      appStore.setState({
        user,
        isAuthenticated: true,
        globalError: null,
      });
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async signUp(payload: SignUpRequest) {
    try {
      await authApi.signUp(payload);
      const user = await authApi.readUser();

      appStore.setState({
        user,
        isAuthenticated: true,
        globalError: null,
      });
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
    } finally {
      this.cleanupHandler();
      resetChatState();
      appStore.setState({
        user: null,
        isAuthenticated: false,
      });
    }
  }
}

export const sessionService = new SessionService();
