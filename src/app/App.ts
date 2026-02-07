import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import renderRoute from './config/router';

interface AppProps extends Record<string, unknown> {
  Page: Component;
}

class App extends Component<AppProps> {
  constructor() {
    super('div', { Page: renderRoute() });
  }

  override render() {
    return _template('{{{Page}}}');
  }
}

export default new App();
