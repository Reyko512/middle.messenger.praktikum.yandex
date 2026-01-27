import EventBus from './EventBus';
export default abstract class Component {
  static EVENTS = {
    INIT: 'init',
    BEFORE_MOUNT: 'before-mount',
    MOUNT: 'mount',
    BEFORE_UPDATE: 'before-update',
    UPDATED: 'updated',
    BEFORE_UNMOUNTED: 'before-unmounted',
    UNMOUNTED: 'unmounted',
    RENDER: 'render',
  };

  _element: HTMLElement | null = null;
  _meta: {
    tagName: string;
    props: object;
  } | null = null;

  eventBus;

  constructor() {
    const eventBus = new EventBus();

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
    this.eventBus().emit(Component.EVENTS.MOUNT);
    this.componentDidMount();
  }

  _beforeUpdated() {
    this.componentDidUpdate();
  }

  _updated(_oldProps: object) {
    this.componentDidUpdate();
  }

  _beforeUnmounted() {}

  _unmounted() {
    this.componentDidUnmount();
  }

  _render() {
    const block = this.render();

    if (!this._element) throw new Error('no element to render!');

    this._element.innerHTML = '';

    this._element.innerHTML = block;
  }

  //utils

  _registerEvents(eventBus: EventBus) {
    eventBus.on(Component.EVENTS.INIT, this._init.bind(this));
    eventBus.on(Component.EVENTS.BEFORE_MOUNT, this._beforeMounted.bind(this));
    eventBus.on(Component.EVENTS.MOUNT, this._mounted.bind(this));
    eventBus.on(Component.EVENTS.BEFORE_UPDATE, this._beforeUpdated.bind(this));
    eventBus.on(Component.EVENTS.UPDATED, this._updated.bind(this));
    eventBus.on(Component.EVENTS.BEFORE_UNMOUNTED, this._beforeUnmounted.bind(this));
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

  _makePropsProxy(props: object) {
    return props;
  }

  //user overrides
  abstract render(): string;

  beforeMount() {}
  componentDidMount(_oldProps: object) {}
  componentDidUpdate(_oldProps: object, _newProps: object) {
    return true;
  }
  beforeComponentUnmount() {}
  componentDidUnmount() {}

  //public

  set props(newProps: object) {
    if (!newProps) return;

    Object.assign(this.props, newProps);
  }

  get element() {
    return this._element;
  }
}
