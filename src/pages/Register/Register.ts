import Component from '@shared/lib/components/Component';
import RegisterTemp from './Register.hbs';
import type { TemplateDelegate } from 'handlebars';
import { RegisterForm } from '@features/register';

export default class Register extends Component {
  constructor() {
    super('div', {
      attrs: {
        class: 'registration-page',
      },

      header: 'REGISTRATION',
      RegisterForm: new RegisterForm(),
    });
  }

  public override render(): TemplateDelegate {
    return RegisterTemp;
  }
}
