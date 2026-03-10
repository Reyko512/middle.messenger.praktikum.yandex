import EventBus from '../EventBus/EventBus';
import { type TemplateDelegate } from 'handlebars';
import { v4 as makeUID } from 'uuid';

type BivariantEventHandler<TEvent extends Event> = {
  bivarianceHack(event: TEvent): void;
}['bivarianceHack'];

export type ComponentEventHandler = BivariantEventHandler<Event>;
export type ComponentEvents = Partial<Record<string, ComponentEventHandler>>;

export interface ComponentProps {
  className?: string;
  attrs?: Record<string, string>;
  events?: ComponentEvents;
  _id?: string | null;
}

type Mutable<T extends object> = {
  -readonly [K in keyof T]: T[K];
};

type ChildComponent = Component<ComponentProps>;
type ListItem = ChildComponent | string | number | boolean;
type ComponentChildren = Record<string, ChildComponent>;
type ComponentLists = Record<string, ListItem[]>;
type TemplateValue = string | number | boolean | null | undefined;

interface ComponentMeta<TProps extends ComponentProps> {
  tagName: keyof HTMLElementTagNameMap;
  props: TProps;
}

export default abstract class Component<TProps extends ComponentProps = ComponentProps> {
  static EVENTS = {
    INIT: 'init',
    BEFORE_MOUNT: 'before-mount',
    MOUNT: 'mount',
    UPDATED: 'updated',
    UNMOUNTED: 'unmounted',
    RENDER: 'render',
  } as const;

  private elementNode: HTMLElement | null = null;
  private meta: ComponentMeta<TProps> | null = null;
  public props: TProps;
  public children: ComponentChildren = {};
  public readonly __id: string | null;
  private shouldUpdate = false;
  protected settings: {
    withInternalId: boolean;
  };
  private lists: ComponentLists = {};
  private activeEvents: Record<string, ComponentEventHandler> = {};
  private boundEventHandlers = new WeakMap<
    ComponentEventHandler,
    ComponentEventHandler
  >();
  private readonly eventBusRef: () => EventBus;

  constructor(
    tagName: keyof HTMLElementTagNameMap = 'div',
    propsAndChildren: TProps,
    settings: { withInternalId: boolean } = {
      withInternalId: true,
    },
  ) {
    const eventBus = new EventBus();
    const { children, props, lists } = this.splitProps(propsAndChildren);

    this.meta = {
      tagName,
      props,
    };

    this.settings = settings;
    this.children = this.makePropsProxy(children);
    this.lists = this.makePropsProxy(lists);
    this.__id = this.settings.withInternalId ? makeUID() : null;
    this.props = this.makePropsProxy({
      ...props,
      _id: this.__id,
    } as TProps);
    this.eventBusRef = () => eventBus;

    this.registerEvents(eventBus);
    eventBus.emit(Component.EVENTS.INIT);
  }

  private init() {
    this.createResources();
    this.applyAttributes();
    this.eventBus().emit(Component.EVENTS.RENDER);

    queueMicrotask(() => {
      this.eventBus().emit(Component.EVENTS.BEFORE_MOUNT);
      this.eventBus().emit(Component.EVENTS.MOUNT);
    });
  }

  private beforeMounted() {
    this.beforeMount();
  }

  private mounted(oldProps: TProps) {
    this.componentDidMount(oldProps);

    Object.values(this.children).forEach((child) => {
      child.dispatchComponentDidMount();
    });
  }

  private updated(oldProps: TProps, newProps: TProps) {
    const shouldRender = this.componentDidUpdate(oldProps, newProps);

    if (!shouldRender || oldProps === newProps) {
      return;
    }

    this.renderInternal();
  }

  private beforeUnmounted() {
    this.beforeComponentUnmount();
  }

  protected remove() {
    this.removeEvents();

    Object.values(this.children).forEach((child) => {
      child.dispatchComponentDidUnmount();
    });

    Object.values(this.lists).forEach((list) => {
      list.forEach((item) => {
        if (item instanceof Component) {
          item.dispatchComponentDidUnmount();
        }
      });
    });

    this.elementNode?.remove();
  }

  private unmounted() {
    this.beforeUnmounted();
    this.remove();
    this.componentDidUnmount();
    this.elementNode = null;
  }

  private renderInternal() {
    const block = this.render();
    const compiledBlock = this.compile(block, this.props);

    if (!this.elementNode) {
      throw new Error('No element to render');
    }

    this.removeEvents();
    this.elementNode.innerHTML = '';
    this.elementNode.appendChild(compiledBlock);
    this.addEvents();
  }

  private registerEvents(eventBus: EventBus) {
    eventBus.on(Component.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Component.EVENTS.BEFORE_MOUNT, this.beforeMounted.bind(this));
    eventBus.on(Component.EVENTS.MOUNT, this.mounted.bind(this));
    eventBus.on(Component.EVENTS.UPDATED, this.updated.bind(this));
    eventBus.on(Component.EVENTS.UNMOUNTED, this.unmounted.bind(this));
    eventBus.on(Component.EVENTS.RENDER, this.renderInternal.bind(this));
  }

  private createDocumentElement<TTag extends keyof HTMLElementTagNameMap>(
    tagName: TTag,
  ): HTMLElementTagNameMap[TTag] {
    const element = document.createElement(tagName);

    if (this.settings.withInternalId && this.__id) {
      element.setAttribute('data-id', this.__id);
    }

    return element;
  }

  private createResources() {
    if (!this.meta) {
      throw new Error('No component metadata');
    }

    this.elementNode = this.createDocumentElement(this.meta.tagName);
  }

  private makePropsProxy<TObject extends object>(props: TObject): TObject {
    return new Proxy(props as Mutable<TObject>, {
      set: (target, key, value) => {
        const property = key as keyof TObject;

        if (target[property] !== value) {
          target[property] = value as Mutable<TObject>[keyof TObject];
          this.shouldUpdate = true;
        }

        return true;
      },

      get: (target, key) => {
        const property = key as keyof TObject;
        const value = target[property];

        if (typeof value === 'function') {
          return value.bind(target);
        }

        return value;
      },

      deleteProperty() {
        throw new Error('No access');
      },
    });
  }

  private applyAttributes() {
    if (!this.elementNode) {
      return;
    }

    const { className, attrs } = this.props;

    if (className) {
      this.elementNode.className = className;
    }

    if (!attrs) {
      return;
    }

    Object.entries(attrs).forEach(([attribute, value]) => {
      this.elementNode?.setAttribute(attribute, value);
    });
  }

  private splitProps(propsAndChildren: TProps) {
    const children: ComponentChildren = {};
    const props: Partial<TProps> = {};
    const lists: ComponentLists = {};

    const assignProp = <TKey extends keyof TProps>(
      key: TKey,
      value: TProps[TKey],
    ) => {
      props[key] = value;
    };

    (Object.entries(propsAndChildren) as Array<[keyof TProps, TProps[keyof TProps]]>).forEach(
      ([key, value]) => {
        if (value instanceof Component) {
          children[String(key)] = value;
          return;
        }

        if (Array.isArray(value)) {
          lists[String(key)] = value as ListItem[];
          return;
        }

        assignProp(key, value);
      },
    );

    return {
      children,
      props: props as TProps,
      lists,
    };
  }

  private compile(template: TemplateDelegate, props: TProps): DocumentFragment {
    const propsAndStubs: Record<string, TemplateValue> = {};

    (Object.entries(props) as Array<[keyof TProps, TProps[keyof TProps]]>).forEach(
      ([key, value]) => {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          value === null ||
          value === undefined
        ) {
          propsAndStubs[String(key)] = value as TemplateValue;
        }
      },
    );

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<template data-id="${child.__id}"></template>`;
    });

    Object.keys(this.lists).forEach((key) => {
      propsAndStubs[key] = `<template data-id="__l_${key}"></template>`;
    });

    const fragment = this.createDocumentElement('template');
    fragment.innerHTML = template(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child.__id}"]`);
      const childContent = child.getContent();

      if (stub && childContent) {
        stub.replaceWith(childContent);
      }
    });

    Object.entries(this.lists).forEach(([key, list]) => {
      const stub = fragment.content.querySelector(`[data-id="__l_${key}"]`);
      if (!stub) {
        return;
      }

      const listContent = this.createDocumentElement('template');

      list.forEach((item) => {
        if (item instanceof Component) {
          const content = item.getContent();
          if (content) {
            listContent.content.append(content);
          }
          return;
        }

        listContent.content.append(String(item));
      });

      stub.replaceWith(listContent.content);
    });

    return fragment.content;
  }

  private removeEvents() {
    if (!this.elementNode) {
      return;
    }

    Object.entries(this.activeEvents).forEach(([event, handler]) => {
      this.elementNode?.removeEventListener(event, handler);
    });

    this.activeEvents = {};
  }

  private addEvents() {
    if (!this.elementNode) {
      return;
    }

    Object.entries(this.props.events ?? {}).forEach(([event, handler]) => {
      if (handler) {
        let boundHandler = this.boundEventHandlers.get(handler);

        if (!boundHandler) {
          boundHandler = handler.bind(this) as ComponentEventHandler;
          this.boundEventHandlers.set(handler, boundHandler);
        }

        this.activeEvents[event] = boundHandler;
        this.elementNode?.addEventListener(event, boundHandler);
      }
    });
  }

  public abstract render(): TemplateDelegate;

  public beforeMount() {}

  public componentDidMount(_oldProps: TProps) {}

  public componentDidUpdate(_oldProps: TProps, _newProps: TProps) {
    return true;
  }

  public dispatchComponentDidMount() {
    this.eventBus().emit(Component.EVENTS.MOUNT, this.props);
  }

  public dispatchComponentDidUnmount() {
    this.eventBus().emit(Component.EVENTS.UNMOUNTED);
  }

  public beforeComponentUnmount() {}

  public componentDidUnmount() {}

  public setProps(nextProps: Partial<TProps>) {
    this.shouldUpdate = false;

    const oldValue = { ...this.props };
    const { children, props, lists } = this.splitProps({
      ...this.props,
      ...nextProps,
    });

    if (Object.keys(children).length > 0) {
      Object.assign(this.children, children);
    }

    if (Object.keys(lists).length > 0) {
      Object.assign(this.lists, lists);
    }

    if (Object.keys(props).length > 0) {
      Object.assign(this.props, props);
    }

    if (this.shouldUpdate) {
      this.eventBus().emit(Component.EVENTS.UPDATED, oldValue, this.props);
    }
  }

  public get element() {
    return this.elementNode;
  }

  public getContent() {
    return this.element;
  }

  public show() {
    const content = this.getContent();
    if (content) {
      content.style.display = 'block';
    }
  }

  public hide() {
    if (this.elementNode) {
      this.elementNode.style.display = 'none';
    }
  }

  public destroy() {
    this.dispatchComponentDidUnmount();
  }

  protected eventBus() {
    return this.eventBusRef();
  }
}
