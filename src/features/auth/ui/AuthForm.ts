import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import AuthFormTemp from './AuthForm.hbs';
import { inputs } from '../model/authForm';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { Link } from '@shared/ui/Link';

export default class AuthForm extends Component {
  constructor() {
    super('form', {
      attrs: {
        class: 'auth-form',
        action: '#',
      },

      inputs: inputs.map((item) => new Input(item)),
      Button: new Button({ text: 'Sign in', type: 'submit' }),
      Link: new Link({ text: 'Create account', href: '/sign-up' }),
    });
  }

  public override render(): TemplateDelegate {
    return AuthFormTemp;
  }
}
