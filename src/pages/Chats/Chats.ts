import Component from '@shared/lib/components/Component';
import Chats from './Chats.hbs';
import { Link } from '@shared/ui/Link';
import { Search } from '@shared/ui/Search';
import { SendMessageForm } from '@features/sendMessage';
import { ChatInfoBar } from '@widgets/ChatInfobar/';
import { ChatFeed } from '@widgets/ChatFeed/';
import { Routes } from '@shared/lib/router/routes';

export default class ChatsPage extends Component {
  constructor() {
    super('div', {
      SettingsLink: new Link({ href: Routes.UserData, text: 'settings' }),
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
}
