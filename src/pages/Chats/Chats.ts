import Component from '@shared/lib/components/Component';
import Chats from './Chats.hbs';
import { Link } from '@shared/ui/Link';

class ChatsPage extends Component {
  constructor() {
    super('div', {
      // SettingsLink: new Link({ text: 'settings', href: '/user-data' }),
      SettingsLink: new Link({ href: '/user-data', text: 'settings' }),
    });
  }

  override render() {
    return Chats;
  }

  override componentDidUpdate(
    _oldProps: Record<string, unknown>,
    _newProps: Record<string, unknown>,
  ): boolean {
    if (_oldProps['linkText'] !== _newProps['linkText']) {
      this.children['SettingsLink']?.setProps({ text: _newProps['linkText'] });
    }
    return true;
  }
}

export default new ChatsPage();
