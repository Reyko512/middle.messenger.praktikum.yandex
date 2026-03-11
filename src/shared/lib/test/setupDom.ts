import { JSDOM } from 'jsdom';

type DOMGlobalKey =
  | 'window'
  | 'document'
  | 'HTMLElement'
  | 'Node'
  | 'Event'
  | 'CustomEvent'
  | 'History'
  | 'FormData'
  | 'AbortController';

export interface DOMEnvironment {
  window: Window;
  cleanup: () => void;
}

export function setupDom(
  markup = '<!doctype html><html><body><div id="app"></div></body></html>',
  url = 'https://example.test/',
): DOMEnvironment {
  const dom = new JSDOM(markup, { url });
  const globals: Record<DOMGlobalKey, unknown> = {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    Event: dom.window.Event,
    CustomEvent: dom.window.CustomEvent,
    History: dom.window.History,
    FormData: dom.window.FormData,
    AbortController: dom.window.AbortController,
  };
  const previousDescriptors = new Map<DOMGlobalKey, PropertyDescriptor | undefined>();

  (Object.entries(globals) as Array<[DOMGlobalKey, unknown]>).forEach(([key, value]) => {
    previousDescriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  });

  return {
    window: dom.window as unknown as Window,
    cleanup: () => {
      previousDescriptors.forEach((descriptor, key) => {
        if (descriptor) {
          Object.defineProperty(globalThis, key, descriptor);
          return;
        }

        Reflect.deleteProperty(globalThis, key);
      });

      dom.window.close();
    },
  };
}
