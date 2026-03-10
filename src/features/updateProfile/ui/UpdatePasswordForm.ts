import _template from '@shared/lib/components/_templator';
import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import {
  setValidationRules,
  updatePasswordInputs,
  type UpdatePasswordFormValues,
} from '../model/updatePasswordForm';
import { Button } from '@shared/ui/Button';
import { FormController } from '@shared/lib/form/formController';
import { profileService } from '@features/updateProfile/model/profileService';
import { normalizeError } from '@shared/lib/network/normalizeError';
import { appStore } from '@app/model';
import { Input } from '@shared/ui/Input';

interface UpdatePasswordFormProps extends ComponentProps {
  inputs: Input[];
  Button: Button;
  error: string;
}

export default class UpdatePasswordForm extends Component<UpdatePasswordFormProps> {
  private readonly controller: FormController<typeof updatePasswordInputs>;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    const controller = new FormController(updatePasswordInputs);
    controller.addRules(setValidationRules);

    super('form', {
      inputs: controller.inputs,
      error: '',
      Button: new Button({
        text: 'Save password',
        type: 'submit',
        events: {
          click: (event: Event) => {
            event.preventDefault();
            this.submit();
          },
        },
      }),
      attrs: {
        class: 'update-password-form',
        action: '#',
      },
    });

    this.controller = controller;
  }

  public override beforeMount() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.setProps({
        error: state.globalError ?? '',
      });
    });
  }

  public override beforeComponentUnmount() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private submit() {
    this.controller.submit((values) => {
      void this.handleSubmit(values);
    });
  }

  private async handleSubmit(values: UpdatePasswordFormValues) {
    try {
      await profileService.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      this.controller.clear();
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
    return _template(
      '{{{inputs}}}{{{Button}}}<p class="update-password-form__error">{{error}}</p>',
    );
  }
}
