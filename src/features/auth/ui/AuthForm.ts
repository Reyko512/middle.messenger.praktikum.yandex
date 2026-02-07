import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import AuthFormTemp from './AuthForm.hbs';
import { inputs, setValidationRules } from '../model/authForm';
import { Button } from '@shared/ui/Button';
import { Link } from '@shared/ui/Link';
import { FormController } from '@shared/lib/form/formController';
import { Routes } from '@shared/lib/router/routes';

export default class AuthForm extends Component {
  formController: FormController | undefined;
  controller: FormController;
  constructor() {
    const controller = new FormController(inputs);
    controller.addRules(setValidationRules);

    super('form', {
      attrs: {
        class: 'auth-form',
        action: '#',
      },

      inputs: controller.inputs,
      Button: new Button({
        text: 'Sign in',
        type: 'submit',
        events: {
          click: (e: SubmitEvent) => {
            e.preventDefault();
            this.controller.submit((values) => {
              console.log(values);
            });
          },
        },
      }),
      Link: new Link({
        text: 'Create account',
        href: `/${Routes.SignUp}`,
      }),
    });

    this.controller = controller;
  }

  public override render(): TemplateDelegate {
    return AuthFormTemp;
  }
}
