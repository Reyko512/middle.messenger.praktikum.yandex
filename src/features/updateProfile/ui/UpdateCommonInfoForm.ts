import Component from '@shared/lib/components/Component';

import type { TemplateDelegate } from 'handlebars';
import { Button } from '@shared/ui/Button';
import {
  inputsUpdateCommonInfo,
  setValidationRules,
} from '../model/updateCommonInfoForm';
import _template from '@shared/lib/components/_templator';
import { FormController } from '@shared/lib/form/formController';

export default class UpdateCommonInfoForm extends Component {
  formController: FormController | undefined;
  controller: FormController;

  constructor() {
    const controller = new FormController(inputsUpdateCommonInfo);
    controller.addRules(setValidationRules);
    super('form', {
      attrs: {
        action: '#',
        class: 'update-info-form',
      },
      inputs: controller.inputs,
      Button: new Button({
        text: 'Save',
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
    });

    this.controller = controller;
  }

  public override render(): TemplateDelegate {
    return _template('{{{inputs}}}{{{Button}}}');
  }
}
