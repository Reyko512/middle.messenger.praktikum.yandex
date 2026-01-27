import Component from '@shared/lib/components/Component';
import Chats from './Chats.hbs';

class ChatsPage extends Component {}

export default new ChatsPage({ tagName: 'div', template: Chats({}) });
