import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import ToastTemplate from './GlobalToast.hbs';
import { appStore } from '@app/model';

interface GlobalToastProps extends ComponentProps {
  isVisible: boolean;
  message: string;
}

const TOAST_LIFETIME_MS = 4500;

export default class GlobalToast extends Component<GlobalToastProps> {
  private unsubscribe: (() => void) | null = null;
  private hideTimeoutId: number | null = null;

  constructor() {
    super('div', {
      attrs: {
        class: 'global-toast-host',
      },
      isVisible: false,
      message: '',
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          if (!target.closest('[data-role="global-toast-close"]')) {
            return;
          }

          this.hideToast();
        },
      },
    });
  }

  public override beforeMount() {
    this.unsubscribe = appStore.subscribe((state, prevState) => {
      const nextError = state.globalError?.trim();

      if (!nextError || nextError === prevState.globalError) {
        return;
      }

      this.showToast(nextError);

      window.setTimeout(() => {
        if (appStore.getState().globalError === nextError) {
          appStore.setState({
            globalError: null,
          });
        }
      }, 0);
    });
  }

  public override beforeComponentUnmount() {
    this.unsubscribe?.();
    this.unsubscribe = null;

    if (this.hideTimeoutId !== null) {
      window.clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }

  private showToast(message: string) {
    if (this.hideTimeoutId !== null) {
      window.clearTimeout(this.hideTimeoutId);
    }

    this.setProps({
      isVisible: true,
      message,
    });

    this.hideTimeoutId = window.setTimeout(() => {
      this.hideToast();
    }, TOAST_LIFETIME_MS);
  }

  private hideToast() {
    if (this.hideTimeoutId !== null) {
      window.clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }

    this.setProps({
      isVisible: false,
      message: '',
    });
  }

  public override render(): TemplateDelegate {
    return ToastTemplate;
  }
}
