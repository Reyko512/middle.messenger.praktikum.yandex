import type Component from '@shared/lib/components/Component';
import { render } from '@shared/lib/components/renderDom';

export class Route {
  _pathname: string;
  _blockClass: new (props: unknown) => Component;
  _block: Component | null;
  _props: {
    rootQuery?: string;
    [key: string]: unknown;
  };

  constructor(
    pathname: string,
    view: new (props: unknown) => Component,
    props: { [key: string]: unknown },
  ) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;
  }

  get pathname() {
    return this._pathname;
  }

  navigate(pathname: string) {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render();
    }
  }

  leave() {
    if (this._block) {
      this._block.hide();
    }
  }

  match(pathname: string) {
    return pathname === this._pathname;
  }

  render() {
    if (!this._block) {
      this._block = new this._blockClass(this._props);

      render(this._props.rootQuery ?? '#app', this._block);
      return;
    }

    this._block.show();
  }
}
