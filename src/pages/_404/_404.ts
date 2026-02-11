import Component from '@shared/lib/components/Component';
import { Link } from '@shared/ui/Link';
import _404temp from './404.hbs';
import type { TemplateDelegate } from 'handlebars';

export default class _404 extends Component {
  constructor() {
    super('div', {
      attrs: {
        class: 'not-found-page',
      },

      Link: new Link({ text: 'your way back =>', href: '/' }),
    });
  }

  public override render(): TemplateDelegate {
    return _404temp;
  }
}
