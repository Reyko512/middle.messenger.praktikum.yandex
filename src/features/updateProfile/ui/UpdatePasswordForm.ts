import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import { updatePasswordInputs } from '../model/updatePasswordForm';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';

export default class UpdatePasswordForm extends Component {
  constructor() {
    super('form', {
      inputs: updatePasswordInputs.map((item) => new Input(item)),
      Button: new Button({ text: 'Save', type: 'submit' }),
      attrs: {
        class: 'update-password-form',
        action: '#',
      },
    });
  }

  public override render(): TemplateDelegate {
    return _template('{{{inputs}}} {{{Button}}}');
  }
}
