import EventBus from './EventBus';

export default class Component {
  private static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_RENDER: 'flow:render',
  };

  private _element: HTMLElement | null = null;
  private _meta: null | { tagName: string; props: object } = null;

  props = {};
  _eventBus;

  constructor(tagName: string = 'div', props: object = {}) {
    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy(props);
    this._eventBus = new EventBus();
  }

  init() {}

  protected _registerEvents(eventBus: EventBus) {
    eventBus.on(Component.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Component.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Component.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  protected _createResources() {
    if (!this._meta) throw Error('No meta');

    const { tagName } = this._meta;

    this._element = this._createDocumentElement(tagName);
  }

  protected _makePropsProxy(_props: object) {
    const props = new Proxy(_props, {});

    return props;
  }

  protected _createDocumentElement(tagName: string, children?: string[]) {
    const childCortage = children?.map((item) => document.createElement(item));

    const createdElement = document.createElement(tagName);

    if (childCortage) {
      childCortage.forEach((item) => createdElement.appendChild(item));
    }

    return createdElement;
  }

  setProps = (nextProps: object | undefined) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  _componentDidMount() {}

  componentDidMount(_oldProps: object) {}

  dispatchComponentDidMount() {
    this._eventBus.emit(Component.EVENTS.FLOW_CDM);
  }

  _componentDidUpdate(_oldProps: object, _newProps: object) {}

  render() {}

  _render() {
    const block = this.render();
    this._element.innerHTML = block;
  }

  get element() {
    return this._element;
  }

  getContent() {
    return this.element;
  }
}
