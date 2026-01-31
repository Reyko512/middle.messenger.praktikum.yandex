import { Chats } from '@pages/Chats';
import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';

class App extends Component {
  override render() {
    return _template('{{{Chats}}}');
  }
}

export default new App('div', { Chats });
