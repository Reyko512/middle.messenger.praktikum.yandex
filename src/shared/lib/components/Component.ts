import EventBus from './EventBus';
import Handlebars from 'handlebars';
import { v4 as makeUID } from 'uuid';

interface IProps {
  [key: string]: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  events?: { [key: string]: Function };
}
export default abstract class Component<TProps extends IProps = Record<string, unknown>> {
  static EVENTS = {
    INIT: 'init',
    MOUNT: 'mount',
    UPDATED: 'updated',
    UNMOUNTED: 'unmounted',
    RENDER: 'render',
  };

  _element: HTMLElement | null = null;
  _meta: {
    tagName: string;
    props: TProps;
  } | null = null;
  props: TProps = {} as TProps;
  children: Record<string, Component> = {};
  __id: string | null;

  settings: {
    withInternalId: boolean;
  };

  private eventBus: () => EventBus;

  constructor(
    tagName = 'div',
    propsAndChildren = {} as TProps,
    settings = {
      withInternalId: true,
    } as typeof this.settings,
  ) {
    const eventBus = new EventBus();
    const { children, props } = this._getChildren(propsAndChildren);

    this._meta = {
      tagName,
      props,
    };

    this.settings = settings;

    this.children = children;
    this.__id = this.settings.withInternalId ? makeUID() : null;

    this.props = this._makePropsProxy({ ...props, _id: this.__id });

    this.eventBus = () => eventBus;

    this._registerEvents(eventBus);
    eventBus.emit(Component.EVENTS.INIT);
  }

  //system
  _init() {
    this._createResources();

    this.eventBus().emit(Component.EVENTS.RENDER);
  }

  _beforeMounted() {}

  _mounted() {
    this.componentDidMount({});
    if (!this.children) return;

    Object.values(this.children).forEach((child) => child.dispatchComponentDidMount());
  }

  _updated(_oldProps: TProps, newProps: TProps) {
    const response = this.componentDidUpdate(_oldProps, newProps);

    if (!response) {
      return;
    }

    this._render();
  }

  _beforeUnmounted() {}

  _unmounted() {
    this.componentDidUnmount();
  }

  _render() {
    const block = this.render();

    if (!this._element) throw new Error('no element to render!');

    this._removeEvents();

    this._element.innerHTML = '';

    this._element.appendChild(block);

    this._addEvents();
  }

  //utils

  _registerEvents(eventBus: EventBus) {
    eventBus.on(Component.EVENTS.INIT, this._init.bind(this));
    eventBus.on(Component.EVENTS.MOUNT, this._mounted.bind(this));
    eventBus.on(Component.EVENTS.UPDATED, this._updated.bind(this));
    eventBus.on(Component.EVENTS.UNMOUNTED, this._unmounted.bind(this));
    eventBus.on(Component.EVENTS.RENDER, this._render.bind(this));
  }

  _createDocumentElement(tagName: string) {
    const element = document.createElement(tagName);

    if (this.settings.withInternalId) {
      element.setAttribute('data-id', this.__id as string);
    }

    return element;
  }

  _createResources() {
    if (!this._meta) throw new Error('no meta');

    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  _makePropsProxy(props: TProps) {
    return new Proxy(props, {
      set: (target, key, newValue: unknown) => {
        target[key] = newValue;

        this.eventBus().emit(Component.EVENTS.UPDATED, { ...target }, target);
        return true;
      },

      get: (target, key) => {
        const value = target[key.toString()];
        return typeof value === 'function' ? value.bind(target) : value;
      },

      deleteProperty() {
        throw new Error('Нет доступа');
      },
    });
  }

  _getChildren(propsAndChildren: Record<string, unknown>) {
    const children = {} as Record<string, Component>;
    const props = {} as TProps;

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Component) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props };
  }

  compile(template: Handlebars.TemplateDelegate, props: Record<string, unknown>): DocumentFragment {
    const propsAndStubs = { ...props };

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<template data-id="${child.__id}"></template>`;
    });

    const fragment = document.createElement('template');

    fragment.innerHTML = template(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child.__id}"]`);

      if (stub) {
        stub.replaceWith(child.getContent() as HTMLElement);
      }
    });

    return fragment.content;
  }

  _removeEvents() {
    if (!this.props['events']) return;

    Object.entries(this.props['events']).forEach(([event, handler]) => {
      this._element!.removeEventListener(event, handler);
    });
  }

  _addEvents() {
    if (!this.props['events']) return;

    Object.entries(this.props['events']).forEach(([event, handler]) => {
      this._element!.addEventListener(event, handler);
    });
  }

  //user overrides
  abstract render(): DocumentFragment | HTMLElement;

  beforeMount() {}

  componentDidMount(_oldProps: TProps) {}

  componentDidUpdate(_oldProps: TProps, _newProps: TProps) {
    return true;
  }

  dispatchComponentDidMount() {
    this.eventBus().emit(Component.EVENTS.MOUNT);
  }

  beforeComponentUnmount() {}
  componentDidUnmount() {}

  //public
  setProps = (nextProps: Record<string, unknown>) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  get element() {
    return this._element;
  }

  getContent() {
    return this.element;
  }
}
