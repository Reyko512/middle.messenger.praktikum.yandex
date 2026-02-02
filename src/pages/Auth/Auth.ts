import Component from '@shared/lib/components/Component';
import AuthTemp from './Auth.hbs';
import type { TemplateDelegate } from 'handlebars';
import { AuthForm } from '@features/auth';

export default class Auth extends Component {
  constructor() {
    super('div', {
      attrs: {
        class: 'auth-page',
      },

      title: 'Byte',
      AuthForm: new AuthForm(),
    });
  }

  public override render(): TemplateDelegate {
    return AuthTemp;
  }
}
