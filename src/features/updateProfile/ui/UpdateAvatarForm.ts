import Component, { type ComponentProps } from '@shared/lib/components/Component';
import UpdateAvatarTemp from './UpdateAvatarForm.hbs';
import type { TemplateDelegate } from 'handlebars';
import { profileService } from '@features/updateProfile/model/profileService';
import { normalizeError } from '@shared/lib/network/normalizeError';
import { appStore } from '@app/model';
import { buildAvatarURL } from '@entities/user';

interface UpdateAvatarFormProps extends ComponentProps {
  avatarUrl: string | null;
  error: string;
}

export default class UpdateAvatarForm extends Component<UpdateAvatarFormProps> {
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super('form', {
      avatarUrl: null,
      error: '',
      attrs: {
        class: 'update-avatar-form',
        action: '#',
      },
      events: {
        change: (event: Event) => {
          event.preventDefault();
          const input = event.target as HTMLInputElement;
          const file = input.files?.[0];

          if (!file) {
            return;
          }

          void this.handleFileSelect(file, input);
        },
      },
    });
  }

  public override beforeMount() {
    this.syncWithState();
    this.unsubscribe = appStore.subscribe(() => {
      this.syncWithState();
    });
  }

  public override beforeComponentUnmount() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private syncWithState() {
    const state = appStore.getState();
    this.setProps({
      avatarUrl: buildAvatarURL(state.user?.avatar ?? null),
      error: state.globalError ?? '',
    });
  }

  private async handleFileSelect(file: File, input: HTMLInputElement) {
    try {
      await profileService.updateAvatar(file);
      this.setProps({
        error: '',
      });
    } catch (error) {
      this.setProps({
        error: normalizeError(error),
      });
    } finally {
      input.value = '';
    }
  }

  public override render(): TemplateDelegate {
    return UpdateAvatarTemp;
  }
}
