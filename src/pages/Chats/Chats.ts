import Component from '@shared/lib/components/Component';
import Chats from './Chats.hbs';
class ChatsPage extends Component {
  override render() {
    return Chats;
  }
}

export default new ChatsPage('div');
