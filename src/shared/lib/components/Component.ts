import EventBus from './EventBus';
import Handlebars, { type TemplateDelegate } from 'handlebars';
import { v4 as makeUID } from 'uuid';

type EventsMap = Record<string, EventListener>;
interface IProps extends Record<string, unknown> {
  className?: string;
  attrs?: Record<string, string>;
  events?: EventsMap;
}
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
export default abstract class Component<
  TProps extends IProps = Record<string, unknown>,
> {
  static EVENTS = {
    BEFORE_INIT: 'before-init',
    INIT: 'init',
    BEFORE_MOUNT: 'before-mount',
    MOUNT: 'mount',
    UPDATED: 'updated',
    UNMOUNTED: 'unmounted',
    RENDER: 'render',
  } as const;

  private _element: HTMLElement | null = null;
  private _meta: {
    tagName: string;
    props: TProps;
  } | null = null;
  props: TProps = {} as TProps;
  children: Record<string, Component> = {};
  __id: string | null;
  private _setUpdate: boolean = false;
  settings: {
    withInternalId: boolean;
  };
  private _lists: Record<string, Component[]>;

  private eventBus: () => EventBus;

  constructor(
    tagName = 'div',
    propsAndChildren = {} as TProps,
    settings = {
      withInternalId: true,
    } as typeof this.settings,
  ) {
    const eventBus = new EventBus();

    const { children, props, lists } = this._getChildren(propsAndChildren);

    this._meta = {
      tagName,
      props,
    };

    this.settings = settings;

    this.children = this._makePropsProxy(children) as Record<
      string,
      Component
    >;
    this._lists = this._makePropsProxy(lists) as Record<
      string,
      Component[]
    >;

    this.__id = this.settings.withInternalId ? makeUID() : null;

    this.props = this._makePropsProxy({
      ...props,
      _id: this.__id,
    }) as TProps;

    this.eventBus = () => eventBus;

    this._registerEvents(eventBus);

    eventBus.emit(Component.EVENTS.BEFORE_INIT);
    eventBus.emit(Component.EVENTS.INIT);
  }

  //system
  _beforeInit() {}

  private _init() {
    this._createResources();

    this._applyAttributes();

    this.eventBus().emit(Component.EVENTS.RENDER);
    this.eventBus().emit(Component.EVENTS.BEFORE_MOUNT);
    this.eventBus().emit(Component.EVENTS.MOUNT);
  }

  private _beforeMounted() {
    this.beforeMount();
  }

  private _mounted(oldProps: TProps) {
    this.componentDidMount(oldProps);
    if (!this.children) return;

    Object.values(this.children).forEach((child) =>
      child.dispatchComponentDidMount(),
    );
  }

  private _updated(_oldProps: TProps, newProps: TProps) {
    const response = this.componentDidUpdate(_oldProps, newProps);

    if (!response || _oldProps === newProps) {
      return;
    }

    this._render();
  }

  // private _beforeUnmounted() {}

  private _unmounted() {
    this.componentDidUnmount();
  }

  private _render() {
    const block = this.render();

    const compiledBlock = this.compile(block, this.props);

    if (!this._element) throw new Error('no element to render!');

    this._removeEvents();

    this._element.innerHTML = '';

    this._element.appendChild(compiledBlock);

    this._addEvents();
  }

  //utils

  private _registerEvents(eventBus: EventBus) {
    eventBus.on(Component.EVENTS.INIT, this._init.bind(this));
    eventBus.on(Component.EVENTS.BEFORE_INIT, this._beforeInit.bind(this));
    eventBus.on(
      Component.EVENTS.BEFORE_MOUNT,
      this._beforeMounted.bind(this),
    );
    eventBus.on(Component.EVENTS.MOUNT, this._mounted.bind(this));
    eventBus.on(Component.EVENTS.UPDATED, this._updated.bind(this));
    eventBus.on(Component.EVENTS.UNMOUNTED, this._unmounted.bind(this));
    eventBus.on(Component.EVENTS.RENDER, this._render.bind(this));
  }

  private _createDocumentElement(tagName: string) {
    const element = document.createElement(tagName);

    if (this.settings.withInternalId) {
      element.setAttribute('data-id', this.__id as string);
    }

    return element;
  }

  private _createResources() {
    if (!this._meta) throw new Error('no meta');

    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  private _makePropsProxy(
    props:
      | TProps
      | Record<string, Component>
      | Record<string, Component[]>,
  ) {
    return new Proxy(
      props as Mutable<TProps> | Record<string, Component>,
      {
        set: (target, key, newValue: unknown) => {
          if (target[key.toString()] !== newValue) {
            (target as Record<string, unknown>)[key.toString()] = newValue;
            this._setUpdate = true;
          }

          return true;
        },

        get: (target, key) => {
          const store = target as Record<string | symbol, unknown>;

          const value = store[key.toString()];
          return typeof value === 'function' ? value.bind(target) : value;
        },

        deleteProperty() {
          throw new Error('Нет доступа');
        },
      },
    );
  }

  private _applyAttributes() {
    const { className, attrs } = this.props;

    if (className) {
      this._element!.className = className;
    }

    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) =>
        this._element!.setAttribute(k, String(v)),
      );
    }
  }

  private _getChildren(propsAndChildren: IProps) {
    const children = {} as Record<string, Component>;
    const props = {} as Record<string, unknown>;
    const lists: Record<string, Component[]> = {};
    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Component) {
        children[key] = value;
      } else if (Array.isArray(value)) {
        lists[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props: props as TProps, lists };
  }

  private compile(
    template: Handlebars.TemplateDelegate,
    props: Record<string, unknown>,
  ): DocumentFragment {
    if (typeof props === 'undefined') {
      props = this.props;
    }

    const propsAndStubs = { ...props };

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<template data-id="${child.__id}"></template>`;
    });

    Object.entries(this._lists).forEach(([key, _child]) => {
      propsAndStubs[key] = `<template data-id="__l_${key}"></template>`;
    });

    const fragment = this._createDocumentElement(
      'template',
    ) as HTMLTemplateElement;
    fragment.innerHTML = template(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(
        `[data-id="${child.__id}"]`,
      );

      if (stub) {
        stub.replaceWith(child.getContent() as HTMLElement);
      }
    });

    Object.entries(this._lists).forEach(([key, child]) => {
      const stub = fragment.content.querySelector(
        `[data-id="__l_${key}"]`,
      );

      if (!stub) return;

      const listContent = this._createDocumentElement(
        'template',
      ) as HTMLTemplateElement;

      child.forEach((item) => {
        if (item instanceof Component) {
          listContent.content.append(item.getContent() as Node);
        } else {
          listContent.content.append(`${item}`);
        }
      });

      stub.replaceWith(listContent.content);
    });

    return fragment.content;
  }

  private _removeEvents() {
    if (!this.props['events']) return;

    Object.entries(this.props['events']).forEach(([event, handler]) => {
      this._element!.removeEventListener(event, handler);
    });
  }

  private _addEvents() {
    const { events = {} } = this.props;

    Object.entries(events).forEach(([event, handler]) => {
      this._element!.addEventListener(event, handler);
    });
  }

  //user overrides
  public abstract render(): TemplateDelegate;

  public beforeMount() {}

  public componentDidMount(_oldProps: TProps) {}

  public componentDidUpdate(_oldProps: TProps, _newProps: TProps) {
    return true;
  }

  public dispatchComponentDidMount() {
    this.eventBus().emit(Component.EVENTS.MOUNT, this.props);
  }

  public beforeComponentUnmount() {}
  public componentDidUnmount() {}

  //public
  public setProps = (nextProps: Record<string, unknown>) => {
    if (!nextProps) {
      return;
    }

    this._setUpdate = false;

    const oldValue = { ...this.props };

    const { children, props } = this._getChildren(nextProps);

    if (Object.values(children).length)
      Object.assign(this.children, children);

    if (Object.values(props).length) {
      Object.assign(this.props, props);
    }

    if (this._setUpdate)
      this.eventBus().emit(Component.EVENTS.UPDATED, oldValue, this.props);
  };

  public get element() {
    return this._element;
  }

  public getContent() {
    return this.element;
  }

  public show() {
    this.getContent()!.style.display = 'block';
  }

  public hide() {
    this.getContent()!.style.display = 'none';
  }
}
