import type Component from '@shared/lib/components/Component';
import { render } from '@shared/lib/components/renderDom';

export class Route {
  public readonly isModal: boolean;
  public readonly guard?: () => boolean | string;
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
    props: {
      rootQuery?: string;
      isModal?: boolean;
      guard?: () => boolean | string;
      [key: string]: unknown;
    },
  ) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;

    this.isModal = props.isModal ?? false;
    this.guard = props.guard ?? (() => true);
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

  async leave() {
    if (this._block) {
      const element = this._block.getContent();

      if (element) {
        const animClass = this.isModal ? 'modal-exit' : 'page-exit';
        await this._playAnimation(element, animClass);
      }

      this._block.dispatchComponentDidUnmount();
      this._block = null;
    }
  }

  match(pathname: string) {
    return pathname === this._pathname;
  }
  private async _playAnimation(
    element: HTMLElement,
    className: string,
  ): Promise<void> {
    return new Promise((resolve) => {
      element.classList.add(className);

      element.addEventListener(
        'animationend',
        () => {
          element.classList.remove(className);
          resolve();
        },
        { once: true },
      );
    });
  }

  async render() {
    if (!this._block) {
      this._block = new this._blockClass(this._props);
      render(this._props.rootQuery ?? '#app', this._block);

      const element = this._block.getContent();
      if (element) {
        const animClass = this.isModal ? 'modal-enter' : 'page-enter';
        await this._playAnimation(element, animClass);
      }
      return;
    }

    this._block.show();
  }
}
