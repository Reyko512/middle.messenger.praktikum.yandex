import type { AppState } from './types';

type StoreListener = (
  nextState: AppState,
  prevState: AppState,
) => void;

const initialState: AppState = {
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
  chats: [],
  selectedChatId: null,
  selectedChatUsers: [],
  messagesByChatId: {},
  chatHistoryLoadingByChatId: {},
  socketStatusByChatId: {},
  globalError: null,
  isChatsLoading: false,
};

class AppStore {
  private state: AppState = { ...initialState };
  private listeners = new Set<StoreListener>();

  public getState() {
    return this.state;
  }

  public setState(patch: Partial<AppState>) {
    const prevState = this.state;
    this.state = {
      ...this.state,
      ...patch,
    };

    for (const listener of this.listeners) {
      listener(this.state, prevState);
    }
  }

  public subscribe(listener: StoreListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public reset() {
    this.state = { ...initialState };
    for (const listener of this.listeners) {
      listener(this.state, this.state);
    }
  }
}

export const appStore = new AppStore();
