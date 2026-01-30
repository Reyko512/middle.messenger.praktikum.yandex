import Component from '@shared/lib/components/Component';
import Chats from './Chats.hbs';
import { Link } from '@shared/ui/Link';

class ChatsPage extends Component {
  constructor(props: Record<string, unknown>) {
    super('div', {
      SettingsLink: new Link('div', { text: 'settings', href: '/user-data' }),
    });
  }

  override render() {
    return this.compile(Chats, this.props); // props автоматически + children подставятся
  }

  // обновление props родителя можно оставить
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

export default new ChatsPage({ linkText: 'settings' });
