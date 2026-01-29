import Component from '@shared/lib/components/Component';
import LinkTemp from './Link.hbs';

class Link extends Component {
  override render(): Handlebars.TemplateDelegate {
    return LinkTemp;
  }
}

export default Link;
