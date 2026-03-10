import Component, { type ComponentProps } from '@shared/lib/components/Component';
import RegisterTemp from './Register.hbs';
import type { TemplateDelegate } from 'handlebars';
import { RegisterForm } from '@features/register';
import { sessionService } from '@features/auth';
import { Router } from '@shared/lib/router/router';
import { Routes } from '@shared/lib/router/routes';
import { appStore } from '@app/model';
import { sanitizeText } from '@shared/lib/security/sanitize';
import type { RegisterFormValues } from '@features/register/model/registerForm';

interface RegisterPageProps extends ComponentProps {
  header: string;
  RegisterForm: RegisterForm;
}

export default class Register extends Component<RegisterPageProps> {
  private readonly registerForm: RegisterForm;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    const router = new Router('#app');
    let registerForm: RegisterForm | null = null;

    const handleSubmit = async (values: RegisterFormValues) => {
      registerForm?.setProps({
        error: '',
      });

      try {
        await sessionService.signUp({
          first_name: sanitizeText(values.first_name),
          second_name: sanitizeText(values.second_name),
          login: sanitizeText(values.login),
          email: sanitizeText(values.email),
          password: values.password,
          phone: sanitizeText(values.phone),
        });
        router.go(Routes.Messenger, { replace: true });
      } catch {
        return;
      }
    };

    registerForm = new RegisterForm({
      error: appStore.getState().globalError ?? '',
      onSubmit: handleSubmit,
    });

    super('div', {
      attrs: {
        class: 'registration-page',
      },
      header: 'REGISTRATION',
      RegisterForm: registerForm,
    });

    this.registerForm = registerForm;
  }

  public override beforeMount() {
    this.syncError(appStore.getState().globalError);
    this.unsubscribe = appStore.subscribe((state) => {
      this.syncError(state.globalError);
    });
  }

  public override beforeComponentUnmount() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private syncError(error: string | null) {
    this.registerForm.setProps({
      error: error ?? '',
    });
  }

  public override render(): TemplateDelegate {
    return RegisterTemp;
  }
}
