import Component from '@shared/lib/components/Component';
import UpdateAvatarTemp from './UpdateAvatarForm.hbs';

import type { TemplateDelegate } from 'handlebars';

export default class UpdateAvatarForm extends Component {
  constructor() {
    super('form', {
      attrs: {
        class: 'update-avatar-form',
        action: '#',
      },
    });
  }
  public override render(): TemplateDelegate {
    return UpdateAvatarTemp;
  }
}
