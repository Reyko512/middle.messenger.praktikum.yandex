import Component from '@shared/lib/components/Component';
import { Button } from '@shared/ui/Button';
import { Link } from '@shared/ui/Link';
import {
  registerFormInputs,
  setValidationRules,
} from '../model/registerForm';
import RegisterFormTemp from './RegisterForm.hbs';
import type { TemplateDelegate } from 'handlebars';
import { FormController } from '@shared/lib/form/formController';

export default class RegisterForm extends Component {
  formController: FormController | undefined;
  controller: FormController;

  constructor() {
    const controller = new FormController(registerFormInputs);
    controller.addRules(setValidationRules);

    super('form', {
      attrs: {
        class: 'registration-form',
        action: '#',
      },
      inputs: controller.inputs,
      Button: new Button({
        text: 'Sign up',
        type: 'submit',
        events: {
          click: (e: Event) => {
            e.preventDefault();
            this.controller.submit((values) => {
              console.log(values);
            });
          },
        },
      }),
      Link: new Link({
        text: 'Sign in',
        href: '/sign-in',
      }),
    });

    this.controller = controller;
  }

  public override render(): TemplateDelegate {
    return RegisterFormTemp;
  }
}
