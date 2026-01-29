import { Chats } from '@pages/Chats';
import Component from '@shared/lib/components/Component';
import Handlebars from 'handlebars';

class App extends Component {
  override render() {
    return Handlebars.compile('');
  }

  override componentDidMount(_oldProps: object): void {
    this.element?.appendChild(Chats.getContent() as Node);
  }
}

export default new App('div', {});
