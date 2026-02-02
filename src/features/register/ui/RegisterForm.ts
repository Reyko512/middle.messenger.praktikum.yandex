import Component from '@shared/lib/components/Component';
import { Button } from '@shared/ui/Button';
import { Link } from '@shared/ui/Link';
import { registerFormInputs } from '../model/registerForm';
import { Input } from '@shared/ui/Input';
import RegisterFormTemp from './RegisterForm.hbs';
import type { TemplateDelegate } from 'handlebars';

export default class RegisterForm extends Component {
  constructor() {
    super('form', {
      attrs: {
        class: 'registration-form',
        action: '#',
      },

      inputs: registerFormInputs.map((item) => new Input(item)),
      Button: new Button({
        text: 'Sign up',
        type: 'submit',
        events: {
          click: (e: Event) => {
            e.preventDefault();
          },
        },
      }),
      Link: new Link({
        text: 'Sign in',
        href: '/sign-in',
      }),
    });
  }

  public override render(): TemplateDelegate {
    return RegisterFormTemp;
  }
}
