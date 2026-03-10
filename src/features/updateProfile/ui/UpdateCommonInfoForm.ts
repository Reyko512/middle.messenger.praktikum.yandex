import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import { Button } from '@shared/ui/Button';
import {
  inputsUpdateCommonInfo,
  setValidationRules,
  type UpdateCommonInfoFormValues,
} from '../model/updateCommonInfoForm';
import templator from '@shared/lib/components/Templator';
import { FormController } from '@shared/lib/form/formController';
import { profileService } from '@features/updateProfile/model/profileService';
import { sanitizeText } from '@shared/lib/security/sanitize';
import { normalizeError } from '@shared/lib/network/normalizeError';
import { appStore } from '@app/model';
import { Input } from '@shared/ui/Input';

interface UpdateCommonInfoFormProps extends ComponentProps {
  inputs: Input[];
  Button: Button;
  error: string;
}

export default class UpdateCommonInfoForm extends Component<UpdateCommonInfoFormProps> {
  private readonly controller: FormController<typeof inputsUpdateCommonInfo>;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    const controller = new FormController(inputsUpdateCommonInfo);
    controller.addRules(setValidationRules);

    super('form', {
      attrs: {
        action: '#',
        class: 'update-info-form',
      },
      inputs: controller.inputs,
      error: '',
      Button: new Button({
        text: 'Save profile',
        type: 'submit',
        events: {
          click: (event: Event) => {
            event.preventDefault();
            this.submit();
          },
        },
      }),
    });

    this.controller = controller;
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
    const user = state.user;

    if (user) {
      this.controller.setValues({
        first_name: user.first_name,
        second_name: user.second_name,
        login: user.login,
        email: user.email,
        phone: user.phone,
        display_name: user.display_name ?? '',
      });
    }

    this.setProps({
      error: state.globalError ?? '',
    });
  }

  private submit() {
    this.controller.submit((values) => {
      void this.handleSubmit(values);
    });
  }

  private async handleSubmit(values: UpdateCommonInfoFormValues) {
    try {
      await profileService.updateProfile({
        first_name: sanitizeText(values.first_name),
        second_name: sanitizeText(values.second_name),
        display_name: sanitizeText(values.display_name),
        login: sanitizeText(values.login),
        email: sanitizeText(values.email),
        phone: sanitizeText(values.phone),
      });

      this.setProps({
        error: '',
      });
    } catch (error) {
      this.setProps({
        error: normalizeError(error),
      });
    }
  }

  public override render(): TemplateDelegate {
    return templator(
      '{{{inputs}}}{{{Button}}}<p class="update-info-form__error">{{error}}</p>',
    );
  }
}
