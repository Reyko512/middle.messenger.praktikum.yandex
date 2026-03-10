import Component, { type ComponentProps } from '@shared/lib/components/Component';
import { Button } from '@shared/ui/Button';
import { Link } from '@shared/ui/Link';
import {
  registerFormInputs,
  setValidationRules,
  type RegisterFormValues,
} from '../model/registerForm';
import RegisterFormTemp from './RegisterForm.hbs';
import type { TemplateDelegate } from 'handlebars';
import { FormController } from '@shared/lib/form/formController';
import { Routes } from '@shared/lib/router/routes';
import { Input } from '@shared/ui/Input';

export interface RegisterFormProps extends ComponentProps {
  inputs: Input[];
  Button: Button;
  Link: Link;
  error: string;
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
}

export default class RegisterForm extends Component<RegisterFormProps> {
  private readonly controller: FormController<typeof registerFormInputs>;
  private isSubmitting = false;

  constructor(props: Pick<RegisterFormProps, 'error' | 'onSubmit'>) {
    const controller = new FormController(registerFormInputs);
    controller.addRules(setValidationRules);

    super('form', {
      attrs: {
        class: 'registration-form',
        action: '#',
      },
      events: {
        submit: (event: Event) => {
          event.preventDefault();
          void this.submit();
        },
      },
      inputs: controller.inputs,
      error: props.error,
      onSubmit: props.onSubmit,
      Button: new Button({
        text: 'Sign up',
        type: 'submit',
        disabled: false,
      }),
      Link: new Link({
        text: 'Sign in',
        href: Routes.SignIn,
      }),
    });

    this.controller = controller;
  }

  private setSubmitting(isSubmitting: boolean) {
    this.isSubmitting = isSubmitting;
    const button = this.children['Button'] as Button | undefined;

    button?.setProps({
      text: isSubmitting ? 'Signing up...' : 'Sign up',
      disabled: isSubmitting,
    });
  }

  private async submit() {
    if (this.isSubmitting) {
      return;
    }

    const validationResult = this.controller.validate();
    if (!validationResult.isValid) {
      return;
    }

    this.setSubmitting(true);

    try {
      await this.props.onSubmit(this.controller.getValues());
    } finally {
      this.setSubmitting(false);
    }
  }

  public override render(): TemplateDelegate {
    return RegisterFormTemp;
  }
}
