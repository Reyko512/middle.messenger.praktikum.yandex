import Component, { type ComponentProps } from '@shared/lib/components/Component';
import { Link } from '@shared/ui/Link';
import Temp500 from './500.hbs';
import type { TemplateDelegate } from 'handlebars';

interface ErrorPageProps extends ComponentProps {
  Link: Link;
}

export default class Page_500 extends Component<ErrorPageProps> {
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
