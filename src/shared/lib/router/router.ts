import { Route } from './route';
import type Component from '@shared/lib/components/Component';
import { Routes } from './routes';

export class Router {
  static __instance: Router;
  routes: Route[] = [];
  history: History = window.history;
  _currentRoute: Route | null = null;
  _currentModal: Route | null = null;
  _rootQuery: string = '#app';

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this.routes = [];
    this.history = window.history;
    this._currentRoute = null;
    this._rootQuery = rootQuery;

    Router.__instance = this;
  }

  use(
    pathname: string,
    block: new (props: unknown) => Component,
    props: Record<string, unknown> = {},
  ) {
    const route = new Route(pathname, block, {
      rootQuery: this._rootQuery,
      ...props,
    });

    this.routes.push(route);
    return this;
  }

  start() {
    window.addEventListener('popstate', () => {
      this._onRoute(window.location.pathname);
    });

    this._onRoute(window.location.pathname);
  }

  private _isRouting = false;

  async _onRoute(pathname: string) {
    if (this._isRouting) return;
    this._isRouting = true;

    document.body.classList.add('router-animating');

    try {
      const route = this.getRoute(pathname);

      if (!route) {
        const notFoundRoute = this.routes.find((r) => r.pathname === '*');
        if (notFoundRoute) {
          if (this._currentRoute && this._currentRoute !== notFoundRoute) {
            await this._currentRoute.leave();
          }
          this._currentRoute = notFoundRoute;
          await notFoundRoute.render();
        }
        return;
      }

      if (route.guard) {
        const guardResult = route.guard();

        if (typeof guardResult === 'string') {
          this._isRouting = false;
          this.go(guardResult);
          return;
        }

        if (guardResult === false) {
          return;
        }
      }

      if (route.isModal) {
        if (this._currentModal === route) return;

        if (!this._currentRoute) {
          this.history.replaceState({}, '', Routes.Messenger);
          this.history.pushState({}, '', pathname);

          const backgroundRoute = this.getRoute(Routes.Messenger);
          if (backgroundRoute) {
            this._currentRoute = backgroundRoute;
            await backgroundRoute.render();
          }
        }

        if (this._currentModal) {
          await this._currentModal.leave();
        }

        this._currentModal = route;
        await route.render();
        return;
      }

      if (this._currentModal) {
        await this._currentModal.leave();
        this._currentModal = null;
      }

      if (this._currentRoute === route) {
        return;
      }

      if (this._currentRoute) {
        await this._currentRoute.leave();
      }

      this._currentRoute = route;
      await route.render();
    } finally {
      this._isRouting = false;

      document.body.classList.remove('router-animating');
    }
  }

  go(pathname: string) {
    const nextRoute = this.getRoute(pathname);

    if (this._currentModal && nextRoute && nextRoute.isModal) {
      this.history.replaceState({}, '', pathname);
    } else {
      this.history.pushState({}, '', pathname);
    }

    this._onRoute(pathname);
  }

  back() {
    this.history.back();
  }

  forward() {
    this.history.forward();
  }

  getRoute(pathname: string) {
    return this.routes.find((route) => route.match(pathname));
  }
}
