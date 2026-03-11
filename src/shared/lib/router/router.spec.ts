import { expect } from 'chai';
import type { TemplateDelegate } from 'handlebars';
import { afterEach, beforeEach, describe, it } from 'mocha';
import Component, { type ComponentProps } from '../components/Component';
import type { DOMEnvironment } from '../test/setupDom';
import { setupDom } from '../test/setupDom';
import { Route } from './route';
import { Router } from './router';

interface TestPageProps extends ComponentProps {
  label?: string;
  onUnmount?: () => void;
}

class TestPage extends Component<TestPageProps> {
  constructor(props: TestPageProps = {}) {
    super('div', props);
  }

  public override render(): TemplateDelegate {
    return ((props: TestPageProps) => `<div class="page">${props.label ?? ''}</div>`) as TemplateDelegate;
  }

  public override componentDidUnmount() {
    this.props.onUnmount?.();
  }
}

class LoginPage extends TestPage {
  constructor(props: TestPageProps = {}) {
    super({
      ...props,
      label: 'Login page',
    });
  }
}

class PrivatePage extends TestPage {
  constructor(props: TestPageProps = {}) {
    super({
      ...props,
      label: 'Private page',
    });
  }
}

class SecondPage extends TestPage {
  constructor(props: TestPageProps = {}) {
    super({
      ...props,
      label: 'Second page',
    });
  }
}

function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function resetRouterSingleton() {
  Reflect.deleteProperty(Router, '__instance');
}

describe('Router', () => {
  let domEnvironment: DOMEnvironment;
  let restorePlayAnimation: (() => void) | null = null;

  beforeEach(() => {
    domEnvironment = setupDom();
    resetRouterSingleton();

    const routePrototype = Route.prototype as unknown as {
      playAnimation: (element: HTMLElement, className: string) => Promise<void>;
    };
    const originalPlayAnimation = routePrototype.playAnimation;

    routePrototype.playAnimation = async (element: HTMLElement, className: string) => {
      element.classList.add(className);
      element.classList.remove(className);
    };

    restorePlayAnimation = () => {
      routePrototype.playAnimation = originalPlayAnimation;
    };
  });

  afterEach(() => {
    restorePlayAnimation?.();
    domEnvironment.cleanup();
    resetRouterSingleton();
  });

  it('renders the matched route and emits start/end events', async () => {
    window.history.replaceState({}, '', '/login');

    const router = new Router('#app');
    const events: string[] = [];

    router.eventBus.on(Router.EVENTS.START, () => {
      events.push('start');
    });
    router.eventBus.on(Router.EVENTS.END, () => {
      events.push('end');
    });

    router.use('/login', LoginPage);
    router.start();

    await flushPromises();

    expect(document.querySelector('#app')?.textContent).to.contain('Login page');
    expect(events).to.deep.equal(['start', 'end']);
  });

  it('redirects to another route when a guard returns a pathname', async () => {
    const router = new Router('#app');

    router
      .use('/login', LoginPage)
      .use('/private', PrivatePage, {
        guard: () => '/login',
      });

    router.go('/private');

    await flushPromises();

    expect(window.location.pathname).to.equal('/login');
    expect(document.querySelector('#app')?.textContent).to.contain('Login page');
  });

  it('unmounts the previous page before rendering the next one', async () => {
    let didUnmountPreviousPage = false;

    class FirstPage extends TestPage {
      constructor(props: TestPageProps = {}) {
        super({
          ...props,
          label: 'First page',
          onUnmount: () => {
            didUnmountPreviousPage = true;
          },
        });
      }
    }

    window.history.replaceState({}, '', '/first');

    const router = new Router('#app');

    router.use('/first', FirstPage).use('/second', SecondPage);
    router.start();

    await flushPromises();

    router.go('/second');

    await flushPromises();

    expect(didUnmountPreviousPage).to.equal(true);
    expect(document.querySelector('#app')?.textContent).to.contain('Second page');
  });
});
