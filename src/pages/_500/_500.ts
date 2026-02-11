import Component from '@shared/lib/components/Component';
import { Link } from '@shared/ui/Link';
import Temp500 from './500.hbs';
import type { TemplateDelegate } from 'handlebars';

export default class Page_500 extends Component {
  constructor() {
    super('div', {
      attrs: {
        class: 'error-page',
      },

      Link: new Link({
        text: 'your way back =>',
        href: '/',
      }),
    });
  }

  public override render(): TemplateDelegate {
    return Temp500;
  }
}
