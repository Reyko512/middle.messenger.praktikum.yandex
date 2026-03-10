import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import AuthFormTemp from './AuthForm.hbs';
import {
  inputs,
  setValidationRules,
  type AuthFormValues,
} from '../model/authForm';
import { Button } from '@shared/ui/Button';
import { Link } from '@shared/ui/Link';
import { FormController } from '@shared/lib/form/formController';
import { Routes } from '@shared/lib/router/routes';
import { Input } from '@shared/ui/Input';

export interface AuthFormProps extends ComponentProps {
  inputs: Input[];
  Button: Button;
  Link: Link;
  error: string;
  onSubmit: (values: AuthFormValues) => Promise<void> | void;
}

export default class AuthForm extends Component<AuthFormProps> {
  private readonly controller: FormController<typeof inputs>;

  constructor(props: Pick<AuthFormProps, 'error' | 'onSubmit'>) {
    const controller = new FormController(inputs);
    controller.addRules(setValidationRules);

    super('form', {
      attrs: {
        class: 'auth-form',
        action: '#',
      },
      events: {
        submit: (event: Event) => {
          event.preventDefault();
          this.submit();
        },
      },
      inputs: controller.inputs,
      error: props.error,
      onSubmit: props.onSubmit,
      Button: new Button({
        text: 'Sign in',
        type: 'submit',
      }),
      Link: new Link({
        text: 'Create account',
        href: Routes.SignUp,
      }),
    });

    this.controller = controller;
  }

  private submit() {
    this.controller.submit((values) => {
      void this.props.onSubmit(values);
    });
  }

  public override render(): TemplateDelegate {
    return AuthFormTemp;
  }
}
