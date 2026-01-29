import EventBus from './EventBus';
export default abstract class Component {
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
    props: object;
  } | null = null;
  props: object;

  eventBus;

  constructor(tagName = 'div', props = {}) {
    const eventBus = new EventBus();

    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy(props);

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
  }

  _updated(_oldProps: object) {
    const response = this.componentDidUpdate(_oldProps, this.props);

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

    this._element.innerHTML = '';

    this._element.innerHTML = block(this.props);
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
    return document.createElement(tagName);
  }

  _createResources() {
    if (!this._meta) throw new Error('no meta');

    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  _makePropsProxy(props: Record<string, object>) {
    return new Proxy(props, {
      set: (target, key, newValue) => {
        target[key.toString()] = newValue;

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

  //user overrides
  abstract render(): Handlebars.TemplateDelegate;

  beforeMount() {}
  componentDidMount(_oldProps: object) {
    this.componentDidMount(_oldProps);
  }
  componentDidUpdate(_oldProps: object, _newProps: object) {
    return true;
  }
  dispatchComponentDidMount() {
    this.eventBus().emit(Component.EVENTS.MOUNT);
  }
  beforeComponentUnmount() {}
  componentDidUnmount() {}

  //public
  setProps = (nextProps: object) => {
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
