import Component from '@shared/lib/components/Component';
import type { ComponentProps } from '@shared/lib/components/Component';
import { render } from '@shared/lib/components/renderDom';

interface RouteProps {
  rootQuery?: string;
  guard?: () => boolean | string;
}

type RouteViewProps = ComponentProps & RouteProps;

export class Route {
  public readonly guard?: () => boolean | string;
  private pathnameValue: string;
  private readonly blockClass: new (props: RouteViewProps) => Component<ComponentProps>;
  private block: Component<ComponentProps> | null = null;
  private readonly props: RouteViewProps;
  private animationController: AbortController | null = null;

  constructor(
    pathname: string,
    view: new (props: RouteViewProps) => Component<ComponentProps>,
    props: RouteViewProps,
  ) {
    this.pathnameValue = pathname;
    this.blockClass = view;
    this.props = props;
    this.guard = props.guard ?? (() => true);
  }

  get pathname() {
    return this.pathnameValue;
  }

  public match(pathname: string) {
    return pathname === this.pathnameValue;
  }

  private abortActiveAnimation() {
    this.animationController?.abort();
    this.animationController = null;
  }

  private async playAnimation(
    element: HTMLElement,
    className: string,
  ): Promise<void> {
    this.abortActiveAnimation();

    const controller = new AbortController();
    const { signal } = controller;
    this.animationController = controller;

    return new Promise((resolve) => {
      let isSettled = false;

      const finish = () => {
        if (isSettled) {
          return;
        }

        isSettled = true;
        element.classList.remove(className);
        signal.removeEventListener('abort', finish);

        if (this.animationController === controller) {
          this.animationController = null;
        }

        resolve();
      };

      signal.addEventListener('abort', finish, { once: true });
      element.classList.add(className);
      element.addEventListener(
        'animationend',
        finish,
        { once: true, signal },
      );
    });
  }

  public async leave() {
    if (!this.block) {
      this.abortActiveAnimation();
      return;
    }

    const element = this.block.getContent();
    if (element) {
      await this.playAnimation(element, 'page-exit');
    }

    this.block.dispatchComponentDidUnmount();
    this.block = null;
    this.abortActiveAnimation();
  }

  public async render() {
    if (!this.block) {
      this.block = new this.blockClass(this.props);

      await Promise.resolve();

      const element = this.block.getContent();
      if (!element) {
        throw new Error('Route render failed: component has no root element');
      }

      render(this.props.rootQuery ?? '#app', this.block);

      if (element) {
        await this.playAnimation(element, 'page-enter');
      }
      return;
    }

    this.block.show();
  }
}
