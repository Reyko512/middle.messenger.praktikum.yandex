import Component from '@shared/lib/components/Component';

import type { TemplateDelegate } from 'handlebars';
import { Button } from '@shared/ui/Button';
import { inputsUpdateCommonInfo } from '../model/updateCommonInfoForm';
import { Input } from '@shared/ui/Input';
import _template from '@shared/lib/components/_templator';

export default class UpdateCommonInfoForm extends Component {
  constructor() {
    super('form', {
      attrs: {
        action: '#',
        class: 'update-info-form',
      },
      inputs: inputsUpdateCommonInfo.map((item) => new Input(item)),
      Button: new Button({ text: 'Save', type: 'submit' }),
    });
  }

  public override render(): TemplateDelegate {
    return _template('{{{inputs}}}{{{Button}}}');
  }
}
