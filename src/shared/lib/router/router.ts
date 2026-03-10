import { Route } from './route';
import Component from '@shared/lib/components/Component';
import type { ComponentProps } from '@shared/lib/components/Component';
import EventBus from '../EventBus/EventBus';

interface RouteOptions {
  guard?: () => boolean | string;
}

export class Router {
  static __instance: Router;
  private routes: Route[] = [];
  private readonly history: History = window.history;
  private currentRoute: Route | null = null;
  private readonly rootQuery: string = '#app';
  public readonly eventBus: EventBus = new EventBus();

  static EVENTS = {
    START: 'routing:start',
    END: 'routing:end',
  } as const;

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this.rootQuery = rootQuery;
    Router.__instance = this;
  }

  public use(
    pathname: string,
    block: new (props: ComponentProps & RouteOptions) => Component<ComponentProps>,
    props: RouteOptions = {},
  ) {
    const route = new Route(pathname, block, {
      rootQuery: this.rootQuery,
      ...props,
    });
    this.routes.push(route);
    return this;
  }

  public start() {
    window.addEventListener('popstate', () => {
      void this.onRoute(window.location.pathname);
    });

    void this.onRoute(window.location.pathname);
  }

  private async onRoute(pathname: string) {
    this.eventBus.emit(Router.EVENTS.START);

    try {
      let nextPathname = pathname;
      let route = this.getRoute(nextPathname) ?? this.getRoute('*');
      let redirectCount = 0;

      if (!route) {
        return;
      }

      while (route) {
        const guardResult = route.guard?.() ?? true;

        if (typeof guardResult === 'string') {
          if (guardResult === nextPathname || redirectCount >= this.routes.length) {
            return;
          }

          this.history.replaceState({}, '', guardResult);
          nextPathname = guardResult;
          route = this.getRoute(nextPathname) ?? this.getRoute('*');
          redirectCount += 1;
          continue;
        }

        if (guardResult === false) {
          return;
        }

        break;
      }

      if (!route) {
        return;
      }

      if (this.currentRoute === route) {
        return;
      }

      if (this.currentRoute) {
        await this.currentRoute.leave();
      }

      this.currentRoute = route;
      await route.render();
    } finally {
      this.eventBus.emit(Router.EVENTS.END);
    }
  }

  public go(pathname: string, options: { replace?: boolean } = {}) {
    if (options.replace) {
      this.history.replaceState({}, '', pathname);
    } else {
      this.history.pushState({}, '', pathname);
    }

    void this.onRoute(pathname);
  }

  public back() {
    this.history.back();
  }

  public forward() {
    this.history.forward();
  }

  public getRoute(pathname: string) {
    return this.routes.find((route) => route.match(pathname));
  }
}
