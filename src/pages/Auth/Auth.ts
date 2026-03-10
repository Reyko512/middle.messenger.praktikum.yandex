import Component, { type ComponentProps } from '@shared/lib/components/Component';
import AuthTemp from './Auth.hbs';
import type { TemplateDelegate } from 'handlebars';
import { AuthForm } from '@features/auth';
import { appStore } from '@app/model';
import { sessionService } from '@features/auth';
import { sanitizeText } from '@shared/lib/security/sanitize';
import { Router } from '@shared/lib/router/router';
import { Routes } from '@shared/lib/router/routes';
import type { AuthFormValues } from '@features/auth/model/authForm';

interface AuthPageProps extends ComponentProps {
  title: string;
  AuthForm: AuthForm;
}

export default class Auth extends Component<AuthPageProps> {
  private readonly authForm: AuthForm;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    const router = new Router('#app');
    let authForm: AuthForm | null = null;

    const handleSubmit = async (values: AuthFormValues) => {
      authForm?.setProps({
        error: '',
      });

      try {
        await sessionService.signIn({
          login: sanitizeText(values.login),
          password: values.password,
        });
        router.go(Routes.Messenger, { replace: true });
      } catch {
        return;
      }
    };

    authForm = new AuthForm({
      error: appStore.getState().globalError ?? '',
      onSubmit: handleSubmit,
    });

    super('div', {
      attrs: {
        class: 'auth-page',
      },
      title: 'Byte',
      AuthForm: authForm,
    });

    this.authForm = authForm;
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
    this.authForm.setProps({
      error: error ?? '',
    });
  }

  public override render(): TemplateDelegate {
    return AuthTemp;
  }
}
