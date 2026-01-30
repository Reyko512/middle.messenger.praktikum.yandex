import { Chats } from '@pages/Chats';
import Component from '@shared/lib/components/Component';
import Handlebars from 'handlebars';
class App extends Component {
  override render() {
    return this.compile(Handlebars.compile('{{{Chats}}}'), this.props);
  }
}

export default new App('div', { Chats });
