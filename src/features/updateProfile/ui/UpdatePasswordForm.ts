import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import {
  setValidationRules,
  updatePasswordInputs,
} from '../model/updatePasswordForm';
import { Button } from '@shared/ui/Button';
import { FormController } from '@shared/lib/form/formController';

export default class UpdatePasswordForm extends Component {
  formController: FormController | undefined;
  controller: FormController;

  constructor() {
    const controller = new FormController(updatePasswordInputs);
    controller.addRules(setValidationRules);
    super('form', {
      inputs: controller.inputs,
      Button: new Button({
        text: 'Save',
        type: 'submit',
        events: {
          click: (e: Event) => {
            e.preventDefault();
            controller.submit((value) => {
              console.log({
                oldPassword: value['oldPassword'],
                newPassword: value['newPassword'],
              });
            });
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

  public override render(): TemplateDelegate {
    return _template('{{{inputs}}} {{{Button}}}');
  }
}
