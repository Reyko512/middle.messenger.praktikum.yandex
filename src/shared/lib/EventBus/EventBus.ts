/* eslint-disable @typescript-eslint/no-unsafe-function-type */
type TFunction = Function;

export default class EventBus {
  private listeners: Record<string, TFunction[]>;

  constructor() {
    this.listeners = {};
  }

  on(event: string, callback: TFunction) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
  }

  off(event: string, callback: TFunction) {
    this.listeners[event] =
      this.listeners[event]?.filter((listener) => listener !== callback) ?? [];
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners[event]?.forEach((item) => {
      item(...args);
    });
  }

  clear() {
    this.listeners = {};
  }
}
