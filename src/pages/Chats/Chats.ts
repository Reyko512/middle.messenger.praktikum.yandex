import Component from '@shared/lib/components/Component';
import Chats from './Chats.hbs';
import { Link } from '@shared/ui/Link';
import { Search } from '@shared/ui/Search';
import { SendMessageForm } from '@features/sendMessage';
import { ChatInfoBar } from '@widgets/ChatInfobar/';
import ChatFeed from '@widgets/ChatFeed/ChatFeed';

class ChatsPage extends Component {
  constructor() {
    super('div', {
      SettingsLink: new Link({ href: '/user-data', text: 'settings' }),
      Search: new Search(),
      SendMessageForm: new SendMessageForm(),
      ChatInfoBar: new ChatInfoBar({ name: 'asd', avatarUrl: null }),
      ChatFeed: new ChatFeed({
        chats: [
          {
            name: 'shit',
            avatarUrl: '',
            lastMessage: null,
            counter: 1,
            time: '12:30',
          },
        ],
      }),
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
